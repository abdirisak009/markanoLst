import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"
import {
  uploadToStorage,
  uploadToLocal,
  deleteFromStorage,
  deleteFromLocal,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/storage"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

const PROFILE_IMAGE_MAX = 5 * 1024 * 1024 // 5MB

/**
 * POST /api/instructor/profile/upload
 * Instructor only: upload profile image to MinIO. Updates instructors.profile_image_url.
 */
export async function POST(request: Request) {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > PROFILE_IMAGE_MAX) {
      return NextResponse.json({ error: "Image must be less than 5MB" }, { status: 400 })
    }

    let contentType = file.type
    if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
      const ext = (file.name || "").split(".").pop()?.toLowerCase()
      const typeByExt: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        svg: "image/svg+xml",
      }
      contentType = typeByExt[ext || ""] || "image/jpeg"
      if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
        return NextResponse.json(
          { error: "Invalid image type. Use JPEG, PNG, GIF, WebP or SVG" },
          { status: 400 }
        )
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_") || "profile.jpg"

    let result = await uploadToStorage(buffer, safeName, contentType, "instructor-profiles")
    if (!result.success || !result.url) {
      result = await uploadToLocal(buffer, safeName, "instructor-profiles")
    }
    if (!result.success || !result.url) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 }
      )
    }

    const [current] = await sql`
      SELECT profile_image_url FROM instructors WHERE id = ${instructor.id} AND deleted_at IS NULL
    `

    if (current?.profile_image_url) {
      const isLocal = current.profile_image_url.startsWith("/uploads/")
      const deleted = isLocal
        ? await deleteFromLocal(current.profile_image_url)
        : await deleteFromStorage(current.profile_image_url)
      if (!deleted.success) {
        console.warn("Could not delete old instructor profile image:", deleted.error)
      }
    }

    await sql`
      UPDATE instructors
      SET profile_image_url = ${result.url}, updated_at = NOW()
      WHERE id = ${instructor.id} AND deleted_at IS NULL
    `

    return NextResponse.json({
      success: true,
      url: result.url,
    })
  } catch (e) {
    console.error("Instructor profile upload error:", e)
    return NextResponse.json(
      { error: "Failed to upload profile image" },
      { status: 500 }
    )
  }
}
