import { type NextRequest, NextResponse } from "next/server"
import { uploadToR2, ALLOWED_IMAGE_TYPES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/r2-client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "uploads"
    const type = (formData.get("type") as string) || "file" // "image" or "file"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}` },
        { status: 400 },
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate safe filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")

    // Upload to R2
    const result = await uploadToR2(buffer, safeName, file.type, folder)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: safeName,
      fileType: file.type,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Upload API Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
