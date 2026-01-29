import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// GET progress for student
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const levelId = searchParams.get("levelId")

    if (levelId && studentId) {
      // Get lesson progress for specific level
      const progress = await sql`
        SELECT 
          ls.*,
          COALESCE(lp.status, 'not_started') as progress_status,
          COALESCE(lp.progress_percentage, 0) as progress_percentage,
          lp.watch_time,
          lp.last_position,
          lp.completed_at
        FROM gold_lessons ls
        LEFT JOIN gold_lesson_progress lp ON ls.id = lp.lesson_id AND lp.student_id = ${studentId}
        WHERE ls.level_id = ${levelId}
        ORDER BY ls.order_index ASC
      `
      return NextResponse.json(progress)
    }

    if (studentId) {
      // Get overall progress
      const progress = await sql`
        SELECT 
          t.id as track_id,
          t.name as track_name,
          e.enrollment_status,
          l.id as current_level_id,
          l.name as current_level_name,
          (SELECT COUNT(*) FROM gold_levels WHERE track_id = t.id) as total_levels,
          (SELECT COUNT(*) FROM gold_level_progress WHERE student_id = ${studentId} AND status = 'completed' 
           AND level_id IN (SELECT id FROM gold_levels WHERE track_id = t.id)) as completed_levels,
          (SELECT COUNT(*) FROM gold_lesson_progress lp 
           JOIN gold_lessons ls ON lp.lesson_id = ls.id 
           JOIN gold_levels lvl ON ls.level_id = lvl.id 
           WHERE lp.student_id = ${studentId} AND lvl.track_id = t.id AND lp.status = 'completed') as completed_lessons,
          (SELECT COUNT(*) FROM gold_lessons ls 
           JOIN gold_levels lvl ON ls.level_id = lvl.id 
           WHERE lvl.track_id = t.id) as total_lessons
        FROM gold_enrollments e
        JOIN gold_tracks t ON e.track_id = t.id
        LEFT JOIN gold_levels l ON e.current_level_id = l.id
        WHERE e.student_id = ${studentId}
      `
      return NextResponse.json(progress)
    }

    return NextResponse.json({ error: "Student ID required" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}

// POST update lesson progress
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, lesson_id, status, progress_percentage, watch_time, last_position } = body

    const result = await sql`
      INSERT INTO gold_lesson_progress (student_id, lesson_id, status, progress_percentage, watch_time, last_position, last_accessed_at)
      VALUES (${student_id}, ${lesson_id}, ${status}, ${progress_percentage || 0}, ${watch_time || 0}, ${last_position || 0}, CURRENT_TIMESTAMP)
      ON CONFLICT (student_id, lesson_id) 
      DO UPDATE SET 
        status = ${status},
        progress_percentage = GREATEST(gold_lesson_progress.progress_percentage, ${progress_percentage || 0}),
        watch_time = gold_lesson_progress.watch_time + COALESCE(${watch_time}, 0),
        last_position = ${last_position || 0},
        last_accessed_at = CURRENT_TIMESTAMP,
        completed_at = CASE WHEN ${status} = 'completed' THEN CURRENT_TIMESTAMP ELSE gold_lesson_progress.completed_at END
      RETURNING *
    `

    // Check if level is completed
    if (status === "completed") {
      const lesson = await sql`SELECT level_id FROM gold_lessons WHERE id = ${lesson_id}`
      if (lesson.length > 0) {
        const levelId = lesson[0].level_id

        // Check if all required lessons in level are completed
        const levelStatus = await sql`
          SELECT 
            COUNT(*) FILTER (WHERE ls.is_required = true) as required_lessons,
            COUNT(*) FILTER (WHERE ls.is_required = true AND lp.status = 'completed') as completed_required
          FROM gold_lessons ls
          LEFT JOIN gold_lesson_progress lp ON ls.id = lp.lesson_id AND lp.student_id = ${student_id}
          WHERE ls.level_id = ${levelId}
        `

        if (levelStatus[0].required_lessons === levelStatus[0].completed_required) {
          // Mark level as completed
          await sql`
            UPDATE gold_level_progress 
            SET status = 'completed', completed_at = CURRENT_TIMESTAMP
            WHERE student_id = ${student_id} AND level_id = ${levelId}
          `
        }
      }
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
