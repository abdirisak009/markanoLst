import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/dashboard
 * Instructor only: dashboard stats (courses, enrollments, recent activity).
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

    const [coursesCount] = await sql`
      SELECT COUNT(*)::int AS c FROM learning_courses
      WHERE instructor_id = ${instructor.id}
    `
    const [enrollmentsCount] = await sql`
      SELECT COUNT(*)::int AS c FROM user_course_progress ucp
      JOIN learning_courses lc ON lc.id = ucp.course_id AND lc.instructor_id = ${instructor.id}
    `
    const [studentsCount] = await sql`
      SELECT COUNT(DISTINCT ucp.user_id)::int AS c FROM user_course_progress ucp
      JOIN learning_courses lc ON lc.id = ucp.course_id AND lc.instructor_id = ${instructor.id}
    `

    const recentCourses = await sql`
      SELECT id, title, slug, created_at
      FROM learning_courses
      WHERE instructor_id = ${instructor.id}
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
      LIMIT 5
    `

    const recent_activity = recentCourses.map((c) => ({
      type: "course",
      title: c.title,
      at: c.created_at,
    }))

    return NextResponse.json({
      courses_count: coursesCount?.c ?? 0,
      enrollments_count: enrollmentsCount?.c ?? 0,
      students_count: studentsCount?.c ?? 0,
      recent_activity,
    })
  } catch (e) {
    console.error("Instructor dashboard error:", e)
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    )
  }
}
