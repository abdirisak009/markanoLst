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
 * GET /api/admin/instructor-applications
 * Admin only: list instructor applications (filter by status).
 */
export async function GET(request: Request) {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const applications = await sql`
      SELECT
        id, full_name, email, phone, cv_url, cv_file_name,
        proposed_courses, bio, experience_years, status,
        rejection_reason, changes_requested_message,
        reviewed_at, reviewed_by, created_at, updated_at
      FROM instructor_applications
      WHERE deleted_at IS NULL
      ${status ? sql`AND status = ${status}` : sql``}
      ORDER BY created_at DESC
    `

    return NextResponse.json(applications)
  } catch (e) {
    console.error("Admin instructor-applications list error:", e)
    return NextResponse.json(
      { error: "Failed to list applications" },
      { status: 500 }
    )
  }
}
