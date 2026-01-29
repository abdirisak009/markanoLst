import { NextResponse } from "next/server"
import postgres from "postgres"
import { getAdminFromCookies } from "@/lib/auth"
import { cookies } from "next/headers"
import { uploadToStorage, deleteFromStorage } from "@/lib/storage"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * POST /api/admin/instructors/[id]/agreement
 * Admin only: upload contract PDF and set revenue share % for an instructor.
 * Stores document in instructor_documents (type 'agreement'), updates instructors.revenue_share_percent.
 * Resets agreement_accepted_at so instructor must accept the new contract.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const instructorId = parseInt(id, 10)
    if (Number.isNaN(instructorId)) {
      return NextResponse.json({ error: "Invalid instructor id" }, { status: 400 })
    }

    const [instructor] = await sql`
      SELECT id FROM instructors WHERE id = ${instructorId} AND deleted_at IS NULL
    `
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const revenueShareRaw = formData.get("revenue_share_percent")

    if (!file) {
      return NextResponse.json({ error: "No file provided. Upload a contract PDF." }, { status: 400 })
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: "File must be less than 10MB" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed for the contract" }, { status: 400 })
    }

    const revenueSharePercent =
      revenueShareRaw != null && revenueShareRaw !== ""
        ? parseFloat(String(revenueShareRaw))
        : null
    if (revenueSharePercent != null && (Number.isNaN(revenueSharePercent) || revenueSharePercent < 0 || revenueSharePercent > 100)) {
      return NextResponse.json({ error: "Revenue share must be between 0 and 100" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_") || "contract.pdf"

    const result = await uploadToStorage(buffer, safeName, "application/pdf", "instructor-agreements")

    const minioUnavailable =
      !result.success &&
      result.error &&
      /ECONNREFUSED|MinIO|not running|127\.0\.0\.1:9000/i.test(result.error)

    if (!result.success || !result.url) {
      if (minioUnavailable) {
        // MinIO not running: still save revenue share % so admin can set terms; PDF can be uploaded later
        try {
          await sql`
            UPDATE instructors
            SET revenue_share_percent = ${revenueSharePercent},
                agreement_accepted_at = NULL,
                updated_at = NOW()
            WHERE id = ${instructorId} AND deleted_at IS NULL
          `
        } catch (updateErr: unknown) {
          const msg = updateErr instanceof Error ? updateErr.message : String(updateErr)
          if (/column.*does not exist|revenue_share_percent|agreement_accepted_at/i.test(msg)) {
            return NextResponse.json(
              {
                error:
                  "Database migration required. Run scripts/060-instructor-agreement-revenue.sql on your database, then try again.",
              },
              { status: 400 }
            )
          }
          throw updateErr
        }
        return NextResponse.json({
          success: true,
          revenue_share_percent: revenueSharePercent,
          message:
            "Revenue share saved. Contract PDF was not uploaded: MinIO storage is not running. Start MinIO (port 9000) then upload the contract again.",
        })
      }
      const errMsg = result.error || "Upload failed"
      return NextResponse.json({ error: errMsg }, { status: 503 })
    }

    // Optional: remove previous agreement document to avoid clutter (keep one per instructor)
    const [previous] = await sql`
      SELECT id, file_url FROM instructor_documents
      WHERE instructor_id = ${instructorId} AND document_type = 'agreement'
      ORDER BY created_at DESC LIMIT 1
    `
    if (previous?.file_url) {
      await deleteFromStorage(previous.file_url).catch(() => {})
      await sql`
        DELETE FROM instructor_documents WHERE id = ${previous.id}
      `
    }

    await sql`
      INSERT INTO instructor_documents (instructor_id, document_type, file_url, file_name)
      VALUES (${instructorId}, 'agreement', ${result.url}, ${file.name})
    `

    try {
      await sql`
        UPDATE instructors
        SET revenue_share_percent = ${revenueSharePercent},
            agreement_accepted_at = NULL,
            updated_at = NOW()
        WHERE id = ${instructorId} AND deleted_at IS NULL
      `
    } catch (updateErr: unknown) {
      const msg = updateErr instanceof Error ? updateErr.message : String(updateErr)
      if (/column.*does not exist|revenue_share_percent|agreement_accepted_at/i.test(msg)) {
        return NextResponse.json(
          {
            error:
              "Database migration required. Run scripts/060-instructor-agreement-revenue.sql on your database, then try again.",
          },
          { status: 400 }
        )
      }
      throw updateErr
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      revenue_share_percent: revenueSharePercent,
      message: "Contract uploaded and revenue share updated. Instructor must accept the new agreement.",
    })
  } catch (e) {
    console.error("Admin instructor agreement upload error:", e)
    const message = e instanceof Error ? e.message : "Failed to upload agreement"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
