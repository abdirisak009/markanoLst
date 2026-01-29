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
 * GET /api/admin/instructors
 * Admin only: list approved instructors.
 */
export async function GET() {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const instructors = await sql`
      SELECT i.id, i.application_id, i.full_name, i.email, i.phone, i.profile_image_url, i.bio, i.status, i.created_at,
             u.name AS university_name
      FROM instructors i
      LEFT JOIN instructor_university_links iul ON iul.instructor_id = i.id AND iul.is_primary = true
      LEFT JOIN universities u ON u.id = iul.university_id
      WHERE i.deleted_at IS NULL
      ORDER BY i.created_at DESC
    `

    return NextResponse.json(instructors)
  } catch (e) {
    console.error("Admin instructors list error:", e)
    return NextResponse.json(
      { error: "Failed to list instructors" },
      { status: 500 }
    )
  }
}
