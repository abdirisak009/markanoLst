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
 * GET /api/admin/learning-revenue
 * Admin only: revenue from Learning Courses (course_payments completed).
 * Per course: course_id, title, total_amount, payment_count. Plus total.
 */
export async function GET() {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const byCourse = await sql`
      SELECT
        lc.id AS course_id,
        lc.title AS course_title,
        lc.slug,
        lc.instructor_id,
        i.full_name AS instructor_name,
        COALESCE(SUM(cp.amount), 0)::float AS total_amount,
        COUNT(cp.id)::int AS payment_count
      FROM learning_courses lc
      LEFT JOIN course_payments cp ON cp.course_id = lc.id AND cp.status IN ('completed', 'approved')
      LEFT JOIN instructors i ON i.id = lc.instructor_id AND i.deleted_at IS NULL
      GROUP BY lc.id, lc.title, lc.slug, lc.instructor_id, i.full_name
      ORDER BY total_amount DESC, lc.title ASC
    `

    const [totalRow] = await sql`
      SELECT COALESCE(SUM(amount), 0)::float AS total
      FROM course_payments
      WHERE status IN ('completed', 'approved')
    `
    const total = Number(totalRow?.total ?? 0)

    return NextResponse.json({
      by_course: byCourse.map((r) => ({
        course_id: r.course_id,
        course_title: r.course_title,
        slug: r.slug,
        instructor_id: r.instructor_id,
        instructor_name: r.instructor_name,
        total_amount: Number(r.total_amount),
        payment_count: r.payment_count,
      })),
      total_amount: total,
    })
  } catch (e) {
    console.error("Admin learning revenue error:", e)
    return NextResponse.json(
      { error: "Failed to load learning revenue" },
      { status: 500 }
    )
  }
}
