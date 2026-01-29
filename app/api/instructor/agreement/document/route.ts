import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/agreement/document
 * Instructor only: returns the contract PDF (from DB file_content or redirects to MinIO URL).
 */
export async function GET() {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const [doc] = await sql`
      SELECT file_url, file_name, file_content
      FROM instructor_documents
      WHERE instructor_id = ${instructor.id} AND document_type = 'agreement'
      ORDER BY created_at DESC LIMIT 1
    `

    if (!doc) {
      return NextResponse.json({ error: "No agreement document found" }, { status: 404 })
    }

    if (doc.file_url === "data:db" && doc.file_content) {
      const buffer = Buffer.from(doc.file_content)
      const filename = doc.file_name || "contract.pdf"
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename.replace(/"/g, "%22")}"`,
          "Content-Length": String(buffer.length),
        },
      })
    }

    if (doc.file_url && doc.file_url !== "data:db") {
      return NextResponse.redirect(doc.file_url)
    }

    return NextResponse.json({ error: "Document not available" }, { status: 404 })
  } catch (e) {
    console.error("Instructor agreement document get error:", e)
    return NextResponse.json(
      { error: "Failed to load document" },
      { status: 500 }
    )
  }
}
