import { NextResponse } from "next/server"
import postgres from "postgres"
import { getAdminFromCookies } from "@/lib/auth"
import { cookies } from "next/headers"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * PATCH /api/admin/agreement-versions/[id]
 * Admin only: update agreement version (content, is_active, force_reaccept).
 * If setting is_active=true, deactivate others.
 */
export async function PATCH(
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
    const versionId = parseInt(id, 10)
    if (Number.isNaN(versionId)) {
      return NextResponse.json({ error: "Invalid version id" }, { status: 400 })
    }

    const [existing] = await sql`
      SELECT id, version, content_html, content_text, pdf_url, pdf_name, is_active, force_reaccept
      FROM instructor_agreement_versions WHERE id = ${versionId}
    `
    if (!existing) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const content_html = body.content_html !== undefined ? (typeof body.content_html === "string" ? body.content_html : null) : existing.content_html
    const content_text = body.content_text !== undefined ? (typeof body.content_text === "string" ? body.content_text : null) : existing.content_text
    const pdf_url = body.pdf_url !== undefined ? (typeof body.pdf_url === "string" ? body.pdf_url : null) : existing.pdf_url
    const pdf_name = body.pdf_name !== undefined ? (typeof body.pdf_name === "string" ? body.pdf_name : null) : existing.pdf_name
    const is_active = typeof body.is_active === "boolean" ? body.is_active : existing.is_active
    const force_reaccept = typeof body.force_reaccept === "boolean" ? body.force_reaccept : existing.force_reaccept

    if (is_active && !existing.is_active) {
      await sql`UPDATE instructor_agreement_versions SET is_active = false, updated_at = NOW() WHERE id != ${versionId}`
    }

    await sql`
      UPDATE instructor_agreement_versions
      SET content_html = ${content_html}, content_text = ${content_text}, pdf_url = ${pdf_url}, pdf_name = ${pdf_name},
          is_active = ${is_active}, force_reaccept = ${force_reaccept}, updated_at = NOW()
      WHERE id = ${versionId}
    `

    const [row] = await sql`
      SELECT id, version, content_html, content_text, pdf_url, pdf_name, is_active, force_reaccept, created_at, updated_at
      FROM instructor_agreement_versions WHERE id = ${versionId}
    `
    return NextResponse.json(row)
  } catch (e) {
    console.error("Admin agreement version update error:", e)
    return NextResponse.json({ error: "Failed to update version" }, { status: 500 })
  }
}
