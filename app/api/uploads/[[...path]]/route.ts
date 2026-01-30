import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
}

/**
 * GET /api/uploads/[...path]
 * Serves files from public/uploads so /uploads/... URLs always work (e.g. course thumbnails, student profile images).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const pathSegments = (await params).path
  if (!pathSegments?.length) {
    return NextResponse.json({ error: "Path required" }, { status: 400 })
  }

  const relativePath = pathSegments.join(path.sep)
  if (relativePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), "public", "uploads", relativePath)
  try {
    const stat = await fs.stat(filePath)
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Not a file" }, { status: 404 })
    }
    const buf = await fs.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream"
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (e) {
    if ((e as NodeJS.ErrnoException)?.code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("Uploads serve error:", e)
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 })
  }
}
