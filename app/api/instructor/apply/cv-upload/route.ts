import { NextResponse } from "next/server"
import { uploadToStorage } from "@/lib/storage"

/** Allowed CV file types for instructor application */
const CV_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]

const MAX_CV_SIZE = 10 * 1024 * 1024 // 10MB
const FOLDER = "instructor-cvs"

/**
 * POST /api/instructor/apply/cv-upload
 * Public: upload CV for instructor application. File is stored in MinIO (instructor-cvs/).
 * Optional field — applicants can upload a CV or paste a URL or skip.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_CV_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      )
    }

    if (!CV_ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx).",
        },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")

    const result = await uploadToStorage(
      buffer,
      safeName,
      file.type,
      FOLDER,
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: safeName,
    })
  } catch (e) {
    console.error("Instructor CV upload error:", e)
    return NextResponse.json(
      { error: "Failed to upload CV" },
      { status: 500 },
    )
  }
}
