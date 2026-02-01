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
 * GET /api/admin/agreement-acceptances
 * Admin only: list acceptance logs. Query: instructor_id, version_id, limit.
 * ?export=csv returns CSV.
 */
export async function GET(request: Request) {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get("instructor_id")
    const versionId = searchParams.get("version_id")
    const limit = Math.min(parseInt(searchParams.get("limit") || "500", 10) || 500, 2000)
    const exportCsv = searchParams.get("export") === "csv"

    let rows = await sql`
      SELECT a.id, a.instructor_id, i.full_name AS instructor_name, i.email AS instructor_email,
             a.agreement_version_id, v.version AS version_string,
             a.source, a.accepted_at_utc, a.ip_address, a.user_agent, a.created_at
      FROM instructor_agreement_acceptances a
      JOIN instructors i ON i.id = a.instructor_id AND i.deleted_at IS NULL
      JOIN instructor_agreement_versions v ON v.id = a.agreement_version_id
      WHERE 1=1
        ${instructorId ? sql`AND a.instructor_id = ${parseInt(instructorId, 10)}` : sql``}
        ${versionId ? sql`AND a.agreement_version_id = ${parseInt(versionId, 10)}` : sql``}
      ORDER BY a.accepted_at_utc DESC
      LIMIT ${limit}
    `

    if (exportCsv) {
      const header = "id,instructor_id,instructor_name,instructor_email,agreement_version_id,version_string,source,accepted_at_utc,ip_address,user_agent,created_at"
      const escape = (v: unknown) => (v == null ? "" : String(v).replace(/"/g, '""'))
      const lines = [header, ...rows.map((r) =>
        [r.id, r.instructor_id, escape(r.instructor_name), escape(r.instructor_email), r.agreement_version_id, escape(r.version_string), escape(r.source), r.accepted_at_utc, escape(r.ip_address), escape(r.user_agent), r.created_at].join(",")
      )]
      return new NextResponse(lines.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=agreement-acceptances.csv",
        },
      })
    }

    return NextResponse.json(rows.map((r) => ({
      id: r.id,
      instructor_id: r.instructor_id,
      instructor_name: r.instructor_name,
      instructor_email: r.instructor_email,
      agreement_version_id: r.agreement_version_id,
      version_string: r.version_string,
      source: r.source,
      accepted_at_utc: r.accepted_at_utc,
      ip_address: r.ip_address,
      user_agent: r.user_agent,
      created_at: r.created_at,
    })))
  } catch (e) {
    console.error("Admin agreement acceptances list error:", e)
    return NextResponse.json({ error: "Failed to list acceptances" }, { status: 500 })
  }
}
