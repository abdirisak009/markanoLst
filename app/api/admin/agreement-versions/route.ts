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
 * GET /api/admin/agreement-versions
 * Admin only: list all agreement versions.
 */
export async function GET() {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let rows: Array<Record<string, unknown>>
    try {
      rows = await sql`
        SELECT id, version, content_html, content_text, content_html_so, content_html_ar, pdf_url, pdf_name, is_active, force_reaccept, created_at, updated_at
        FROM instructor_agreement_versions
        ORDER BY id DESC
      `
    } catch {
      rows = await sql`
        SELECT id, version, content_html, content_text, pdf_url, pdf_name, is_active, force_reaccept, created_at, updated_at
        FROM instructor_agreement_versions
        ORDER BY id DESC
      `
    }
    return NextResponse.json(rows.map((r) => ({
      id: r.id,
      version: r.version,
      content_html: r.content_html,
      content_text: r.content_text,
      content_html_so: (r as { content_html_so?: string | null }).content_html_so ?? null,
      content_html_ar: (r as { content_html_ar?: string | null }).content_html_ar ?? null,
      pdf_url: r.pdf_url,
      pdf_name: r.pdf_name,
      is_active: r.is_active,
      force_reaccept: r.force_reaccept,
      created_at: r.created_at,
      updated_at: r.updated_at,
    })))
  } catch (e) {
    console.error("Admin agreement versions list error:", e)
    return NextResponse.json({ error: "Failed to list versions" }, { status: 500 })
  }
}

/**
 * POST /api/admin/agreement-versions
 * Admin only: create new agreement version. If is_active=true, deactivate others.
 */
export async function POST(request: Request) {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const version = typeof body.version === "string" ? body.version.trim() : ""
    const content_html = typeof body.content_html === "string" ? body.content_html : null
    const content_text = typeof body.content_text === "string" ? body.content_text : null
    const pdf_url = typeof body.pdf_url === "string" ? body.pdf_url : null
    const pdf_name = typeof body.pdf_name === "string" ? body.pdf_name : null
    const is_active = body.is_active === true
    const force_reaccept = body.force_reaccept === true

    if (!version) {
      return NextResponse.json({ error: "version is required" }, { status: 400 })
    }

    if (is_active) {
      await sql`UPDATE instructor_agreement_versions SET is_active = false, updated_at = NOW()`
    }

    const [row] = await sql`
      INSERT INTO instructor_agreement_versions (version, content_html, content_text, pdf_url, pdf_name, is_active, force_reaccept)
      VALUES (${version}, ${content_html}, ${content_text}, ${pdf_url}, ${pdf_name}, ${is_active}, ${force_reaccept})
      RETURNING id, version, content_html, content_text, pdf_url, pdf_name, is_active, force_reaccept, created_at, updated_at
    `
    return NextResponse.json(row, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (/unique|duplicate/i.test(msg)) {
      return NextResponse.json({ error: "Version already exists" }, { status: 400 })
    }
    console.error("Admin agreement versions create error:", e)
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 })
  }
}
