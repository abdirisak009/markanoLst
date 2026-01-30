import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/image?url=...
 * Proxies image from MinIO or external URL so the browser loads it same-origin (no CORS).
 * Use for profile images and any object stored in MinIO.
 */
export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url")
  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  let imageUrl: string
  try {
    imageUrl = decodeURIComponent(urlParam)
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Markano-Image-Proxy/1.0" },
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }
    const contentType = res.headers.get("content-type") || "image/jpeg"
    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (e) {
    console.error("Image proxy error:", e)
    return NextResponse.json({ error: "Failed to load image" }, { status: 502 })
  }
}
