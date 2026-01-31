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
 * GET /api/admin/reviews
 * Admin: list all reviews (any status).
 */
export async function GET() {
  try {
    const admin = await getAdminFromCookies()
    const session = (await cookies()).get("adminSession")?.value
    if (!admin && session !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rows = await sql`
      SELECT id, reviewer_name, company, avatar_url, message, course_id, course_title, rating, reviewer_type, status, created_at, updated_at
      FROM reviews
      ORDER BY created_at DESC
    `

    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
