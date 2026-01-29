import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/agreement
 * Instructor only: get current contract document (PDF) and revenue share.
 * Returns agreement PDF url, revenue_share_percent, agreement_accepted_at.
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

    let revenueSharePercent: number | null = null
    let agreementAcceptedAt: string | null = null
    try {
      const [row] = await sql`
        SELECT i.revenue_share_percent, i.agreement_accepted_at
        FROM instructors i
        WHERE i.id = ${instructor.id} AND i.deleted_at IS NULL
      `
      if (!row) {
        return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
      }
      revenueSharePercent = row.revenue_share_percent ?? null
      agreementAcceptedAt = row.agreement_accepted_at ?? null
    } catch (colErr: unknown) {
      const msg = colErr instanceof Error ? colErr.message : String(colErr)
      if (!/column.*does not exist|revenue_share_percent|agreement_accepted_at/i.test(msg)) throw colErr
      const [exists] = await sql`
        SELECT 1 FROM instructors WHERE id = ${instructor.id} AND deleted_at IS NULL
      `
      if (!exists) {
        return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
      }
    }

    const [agreementDoc] = await sql`
      SELECT id, file_url, file_name, created_at
      FROM instructor_documents
      WHERE instructor_id = ${instructor.id} AND document_type = 'agreement'
      ORDER BY created_at DESC LIMIT 1
    `

    return NextResponse.json({
      revenue_share_percent: revenueSharePercent,
      agreement_accepted_at: agreementAcceptedAt,
      agreement_document: agreementDoc
        ? {
            id: agreementDoc.id,
            file_url: agreementDoc.file_url,
            file_name: agreementDoc.file_name,
            created_at: agreementDoc.created_at,
          }
        : null,
    })
  } catch (e) {
    console.error("Instructor agreement get error:", e)
    return NextResponse.json(
      { error: "Failed to load agreement" },
      { status: 500 }
    )
  }
}
