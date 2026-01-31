import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/courses
 * Instructor only: list my courses (learning_courses where instructor_id = me).
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

    const courses = await sql`
      SELECT c.id, c.title, c.slug, c.description, c.thumbnail_url, c.instructor_name,
             c.estimated_duration_minutes, c.difficulty_level, c.price, c.is_active, c.is_featured,
             c.order_index, c.created_at, c.updated_at,
             COUNT(DISTINCT m.id)::int AS modules_count,
             COUNT(DISTINCT l.id)::int AS lessons_count
      FROM learning_courses c
      LEFT JOIN learning_modules m ON m.course_id = c.id AND m.is_active = true
      LEFT JOIN learning_lessons l ON l.module_id = m.id AND l.is_active = true
      WHERE c.instructor_id = ${instructor.id}
      GROUP BY c.id
      ORDER BY c.order_index ASC NULLS LAST, c.created_at DESC
    `

    return NextResponse.json(courses)
  } catch (e) {
    console.error("Instructor courses list error:", e)
    return NextResponse.json(
      { error: "Failed to list courses" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/instructor/courses
 * Disabled: only admin creates learning courses. Instructors see courses assigned to them.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Only admin can create learning courses. Admin creates courses and assigns you as instructor. You can add modules and lessons to your assigned courses.",
    },
    { status: 403 }
  )
}
