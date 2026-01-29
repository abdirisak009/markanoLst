import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/students
 * Instructor only: list students.
 * - If university-linked: university_students for my university.
 * - Else: distinct users enrolled in my courses (user_course_progress + learning_courses where instructor_id = me).
 */
export async function GET(request: Request) {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    // Check if instructor is linked to a university
    const [link] = await sql`
      SELECT university_id FROM instructor_university_links
      WHERE instructor_id = ${instructor.id} AND is_primary = true
    `

    if (link?.university_id) {
      // University mode: return university_students for this university
      const students = await sql`
        SELECT us.id, us.university_id, us.full_name, us.email, us.phone, us.student_id AS student_number, us.created_at
        FROM university_students us
        WHERE us.university_id = ${link.university_id}
        ORDER BY us.full_name ASC
      `
      return NextResponse.json({ source: "university", students })
    }

    // Platform mode: students enrolled in my courses (from user_course_progress)
    const rows = await sql`
      SELECT ucp.user_id AS id, ucp.user_id, ucp.course_id, lc.title AS course_title,
             ucp.progress_percentage, ucp.lessons_completed, ucp.total_lessons, ucp.last_accessed_at
      FROM user_course_progress ucp
      JOIN learning_courses lc ON lc.id = ucp.course_id AND lc.instructor_id = ${instructor.id}
      ${courseId ? sql`WHERE ucp.course_id = ${parseInt(courseId, 10)}` : sql``}
      ORDER BY ucp.last_accessed_at DESC NULLS LAST
    `

    // Dedupe by user_id for list view when no courseId
    const byUser = new Map<
      number,
      { id: number; user_id: number; course_title?: string; progress_percentage: number; lessons_completed: number; total_lessons: number; last_accessed_at: string | null; courses: Array<{ course_id: number; course_title: string; progress_percentage: number }> }
    >()
    for (const r of rows) {
      const uid = r.user_id
      if (!byUser.has(uid)) {
        byUser.set(uid, {
          id: uid,
          user_id: uid,
          course_title: r.course_title,
          progress_percentage: Number(r.progress_percentage) || 0,
          lessons_completed: Number(r.lessons_completed) || 0,
          total_lessons: Number(r.total_lessons) || 0,
          last_accessed_at: r.last_accessed_at,
          courses: [],
        })
      }
      const entry = byUser.get(uid)!
      entry.courses.push({
        course_id: r.course_id,
        course_title: r.course_title,
        progress_percentage: Number(r.progress_percentage) || 0,
      })
    }

    const students = Array.from(byUser.values())
    return NextResponse.json({ source: "enrollments", students })
  } catch (e) {
    console.error("Instructor students list error:", e)
    return NextResponse.json(
      { error: "Failed to list students" },
      { status: 500 }
    )
  }
}
