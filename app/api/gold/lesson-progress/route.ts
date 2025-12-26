import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET lesson progress for a student
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const lessonId = searchParams.get("lessonId")

    if (lessonId && studentId) {
      // Get specific lesson progress
      const progress = await sql`
        SELECT * FROM gold_lesson_progress 
        WHERE student_id = ${studentId} AND lesson_id = ${lessonId}
      `
      return NextResponse.json(progress[0] || null)
    }

    if (studentId) {
      // Get all lesson progress for student
      const progress = await sql`
        SELECT lp.*, l.title as lesson_title, l.lesson_type
        FROM gold_lesson_progress lp
        JOIN gold_lessons l ON lp.lesson_id = l.id
        WHERE lp.student_id = ${studentId}
      `
      return NextResponse.json(progress)
    }

    return NextResponse.json({ error: "studentId required" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching lesson progress:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// POST/PUT update lesson progress
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, lesson_id, status, progress_percentage, watch_time, last_position } = body

    // Upsert progress
    const result = await sql`
      INSERT INTO gold_lesson_progress (student_id, lesson_id, status, progress_percentage, watch_time, last_position, last_accessed_at)
      VALUES (${student_id}, ${lesson_id}, ${status || "in_progress"}, ${progress_percentage || 0}, ${watch_time || 0}, ${last_position || 0}, CURRENT_TIMESTAMP)
      ON CONFLICT (student_id, lesson_id) 
      DO UPDATE SET 
        status = COALESCE(${status}, gold_lesson_progress.status),
        progress_percentage = GREATEST(gold_lesson_progress.progress_percentage, ${progress_percentage || 0}),
        watch_time = gold_lesson_progress.watch_time + COALESCE(${watch_time}, 0),
        last_position = COALESCE(${last_position}, gold_lesson_progress.last_position),
        last_accessed_at = CURRENT_TIMESTAMP,
        completed_at = CASE WHEN ${status} = 'completed' THEN CURRENT_TIMESTAMP ELSE gold_lesson_progress.completed_at END
      RETURNING *
    `

    // Log activity
    await sql`
      INSERT INTO gold_student_activity (student_id, activity_type, entity_type, entity_id, metadata)
      VALUES (${student_id}, 'lesson_progress', 'lesson', ${lesson_id}, ${JSON.stringify({ status, progress_percentage })}::jsonb)
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating lesson progress:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
