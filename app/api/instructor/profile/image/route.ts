import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
}

/**
 * GET /api/instructor/profile/image
 * Returns the current instructor's profile image (stream). Always serves the image from DB so it displays after upload.
 */
export async function GET() {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [row] = await sql`
      SELECT profile_image_url FROM instructors WHERE id = ${instructor.id} AND deleted_at IS NULL
    `
    const url = row?.profile_image_url
    if (!url) {
      return NextResponse.json({ error: "No profile image" }, { status: 404 })
    }

    if (url.startsWith("/uploads/")) {
      const relativePath = url.slice("/uploads/".length)
      const filePath = path.join(process.cwd(), "public", "uploads", relativePath)
      try {
        const buf = await fs.readFile(filePath)
        const ext = path.extname(filePath).toLowerCase()
        const contentType = CONTENT_TYPES[ext] || "image/jpeg"
        return new NextResponse(buf, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "private, max-age=60",
          },
        })
      } catch (e) {
        console.error("Profile image read error:", e)
        return NextResponse.json({ error: "Image not found" }, { status: 404 })
      }
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      const res = await fetch(url, { headers: { "User-Agent": "Markano/1.0" } })
      if (!res.ok) return NextResponse.json({ error: "Image not found" }, { status: 404 })
      const contentType = res.headers.get("content-type") || "image/jpeg"
      const buf = await res.arrayBuffer()
      return new NextResponse(buf, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "private, max-age=60",
        },
      })
    }

    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
  } catch (e) {
    console.error("Profile image API error:", e)
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 })
  }
}
