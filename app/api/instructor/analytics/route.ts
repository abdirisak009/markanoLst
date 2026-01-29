import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/analytics
 * Instructor only: enrollments, completion rate, revenue (if applicable).
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

    const [enrollmentsCount] = await sql`
      SELECT COUNT(*)::int AS c
      FROM user_course_progress ucp
      JOIN learning_courses lc ON lc.id = ucp.course_id AND lc.instructor_id = ${instructor.id}
    `

    const [studentsCount] = await sql`
      SELECT COUNT(DISTINCT ucp.user_id)::int AS c
      FROM user_course_progress ucp
      JOIN learning_courses lc ON lc.id = ucp.course_id AND lc.instructor_id = ${instructor.id}
    `

    const [completedCount] = await sql`
      SELECT COUNT(*)::int AS c
      FROM user_course_progress ucp
      JOIN learning_courses lc ON lc.id = ucp.course_id AND lc.instructor_id = ${instructor.id}
      WHERE ucp.progress_percentage >= 100
    `

    const totalEnrollments = enrollmentsCount?.c ?? 0
    const completionRate = totalEnrollments > 0
      ? Math.round(((completedCount?.c ?? 0) / totalEnrollments) * 100)
      : 0

    // Revenue: sum of course_payments for my courses (if table exists and has course_id)
    let revenue = 0
    try {
      const [revRow] = await sql`
        SELECT COALESCE(SUM(cp.amount), 0)::float AS total
        FROM course_payments cp
        JOIN learning_courses lc ON lc.id = cp.course_id AND lc.instructor_id = ${instructor.id}
        WHERE cp.status IN ('completed', 'approved')
      `
      revenue = Number(revRow?.total ?? 0)
    } catch {
      // course_payments might not exist or have different schema
    }

    const byCourse = await sql`
      SELECT lc.id, lc.title, lc.slug,
             COUNT(ucp.user_id)::int AS enrollments,
             COUNT(CASE WHEN ucp.progress_percentage >= 100 THEN 1 END)::int AS completed
      FROM learning_courses lc
      LEFT JOIN user_course_progress ucp ON ucp.course_id = lc.id
      WHERE lc.instructor_id = ${instructor.id}
      GROUP BY lc.id, lc.title, lc.slug
      ORDER BY enrollments DESC
    `

    return NextResponse.json({
      enrollments_count: totalEnrollments,
      students_count: studentsCount?.c ?? 0,
      completed_count: completedCount?.c ?? 0,
      completion_rate_percent: completionRate,
      revenue,
      by_course: byCourse.map((r) => ({
        course_id: r.id,
        title: r.title,
        slug: r.slug,
        enrollments: r.enrollments,
        completed: r.completed,
      })),
    })
  } catch (e) {
    console.error("Instructor analytics error:", e)
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    )
  }
}
