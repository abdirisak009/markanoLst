import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"
import { getCurrentAgreementVersion, getInstructorAgreementStatus } from "@/lib/agreement"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/agreement
 * Instructor only: current agreement (digital version + legacy PDF), acceptance status.
 * Returns digital content (HTML), PDF url, revenue_share_percent, must_accept, etc.
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
    try {
      const [row] = await sql`
        SELECT i.revenue_share_percent
        FROM instructors i
        WHERE i.id = ${instructor.id} AND i.deleted_at IS NULL
      `
      if (!row) {
        return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
      }
      revenueSharePercent = row.revenue_share_percent ?? null
    } catch (colErr: unknown) {
      const msg = colErr instanceof Error ? colErr.message : String(colErr)
      if (!/column.*does not exist|revenue_share_percent/i.test(msg)) throw colErr
    }

    const status = await getInstructorAgreementStatus(sql, instructor.id)
    const currentVersion = await getCurrentAgreementVersion(sql)

    let agreementDocument: { id: number; file_url: string; file_name: string | null; created_at: string } | null = null
    const [agreementDoc] = await sql`
      SELECT id, file_url, file_name, created_at
      FROM instructor_documents
      WHERE instructor_id = ${instructor.id} AND document_type = 'agreement'
      ORDER BY created_at DESC LIMIT 1
    `
    if (agreementDoc) {
      const docUrl =
        agreementDoc.file_url === "data:db"
          ? "/api/instructor/agreement/document"
          : agreementDoc.file_url ?? null
      agreementDocument = {
        id: agreementDoc.id,
        file_url: docUrl,
        file_name: agreementDoc.file_name,
        created_at: agreementDoc.created_at,
      }
    }

    const pdf_url = currentVersion?.pdf_url ?? null
    const pdf_name = currentVersion?.pdf_name ?? null

    let content_html_so: string | null = null
    let content_html_ar: string | null = null
    if (currentVersion?.id) {
      try {
        const [langRow] = await sql`
          SELECT content_html_so, content_html_ar
          FROM instructor_agreement_versions
          WHERE id = ${currentVersion.id}
        `
        if (langRow) {
          content_html_so = (langRow as { content_html_so?: string | null }).content_html_so ?? null
          content_html_ar = (langRow as { content_html_ar?: string | null }).content_html_ar ?? null
        }
      } catch {
        // columns may not exist yet (migration 069 not run)
      }
    }

    return NextResponse.json({
      revenue_share_percent: revenueSharePercent,
      agreement_accepted_at: status.agreementAcceptedAt,
      must_accept: status.mustAccept,
      accepted: status.accepted,
      use_digital: !!currentVersion && !status.useLegacy,
      agreement_version: currentVersion
        ? {
            id: currentVersion.id,
            version: currentVersion.version,
            content_html: currentVersion.content_html,
            content_text: currentVersion.content_text,
            content_html_so: content_html_so ?? undefined,
            content_html_ar: content_html_ar ?? undefined,
            pdf_url: pdf_url || undefined,
            pdf_name: pdf_name || undefined,
            force_reaccept: currentVersion.force_reaccept,
          }
        : null,
      agreement_document: agreementDocument,
      accepted_version: status.acceptedVersionId ? { id: status.acceptedVersionId, version: status.currentVersion } : null,
    })
  } catch (e) {
    console.error("Instructor agreement get error:", e)
    return NextResponse.json(
      { error: "Failed to load agreement" },
      { status: 500 }
    )
  }
}
