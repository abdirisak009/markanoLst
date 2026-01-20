import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * POST /api/learning/enroll
 * Enroll a student in a course
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, course_id } = body

    if (!user_id || !course_id) {
      return NextResponse.json({ error: "user_id and course_id are required" }, { status: 400 })
    }

    // Check if already enrolled
    const existing = await sql`
      SELECT * FROM user_course_progress
      WHERE user_id = ${user_id} AND course_id = ${course_id}
    `

    if (existing.length > 0) {
      return NextResponse.json({ message: "Already enrolled in this course" }, { status: 200 })
    }

    // Get course details to calculate total lessons
    const course = await sql`
      SELECT COUNT(DISTINCT l.id) as total_lessons
      FROM learning_courses c
      LEFT JOIN learning_modules m ON c.id = m.course_id AND m.is_active = true
      LEFT JOIN learning_lessons l ON m.id = l.module_id AND l.is_active = true
      WHERE c.id = ${course_id} AND c.is_active = true
      GROUP BY c.id
    `

    const totalLessons = course[0]?.total_lessons || 0

    // Get first lesson ID to unlock
    const firstLesson = await sql`
      SELECT l.id
      FROM learning_lessons l
      JOIN learning_modules m ON l.module_id = m.id
      WHERE m.course_id = ${course_id} AND m.is_active = true AND l.is_active = true
      ORDER BY m.order_index ASC, l.order_index ASC
      LIMIT 1
    `

    const firstLessonId = firstLesson[0]?.id || null

    // Create course progress record
    const progress = await sql`
      INSERT INTO user_course_progress (
        user_id, course_id, progress_percentage, lessons_completed,
        total_lessons, current_lesson_id, enrolled_at, started_at, last_accessed_at
      )
      VALUES (
        ${user_id}, ${course_id}, 0, 0, ${totalLessons}, ${firstLessonId},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    // Unlock first lesson
    if (firstLessonId) {
      await sql`
        INSERT INTO user_lesson_progress (
          user_id, lesson_id, status, last_accessed_at
        )
        VALUES (
          ${user_id}, ${firstLessonId}, 'not_started', CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id, lesson_id) DO NOTHING
      `
    }

    return NextResponse.json({ success: true, progress: progress[0] }, { status: 201 })
  } catch (error: any) {
    console.error("Error enrolling in course:", error)
    return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 })
  }
}
