import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
}

/**
 * GET /api/gold/students/profile/image
 * Returns the current gold student's profile image. Always serves from DB so it displays after upload.
 */
export async function GET(request: Request) {
  try {
    const userId =
      request.headers.get("x-user-id") || request.cookies.get("goldStudentId")?.value
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [row] = await sql`
      SELECT profile_image FROM gold_students WHERE id = ${parseInt(userId)}
    `
    const url = row?.profile_image
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
        console.error("Student profile image read error:", e)
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
    console.error("Student profile image API error:", e)
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 })
  }
}
