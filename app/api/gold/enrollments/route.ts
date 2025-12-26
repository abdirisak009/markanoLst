import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET enrollments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    let enrollments
    if (studentId) {
      enrollments = await sql`
        SELECT 
          e.*,
          t.name as track_name,
          t.slug as track_slug,
          t.icon as track_icon,
          t.color as track_color,
          t.description as track_description,
          l.name as current_level_name,
          l.order_index as current_level_order,
          (SELECT COUNT(*) FROM gold_levels WHERE track_id = t.id) as total_levels,
          (SELECT COUNT(*) FROM gold_lesson_progress lp 
           JOIN gold_lessons ls ON lp.lesson_id = ls.id 
           JOIN gold_levels lvl ON ls.level_id = lvl.id 
           WHERE lp.student_id = e.student_id AND lvl.track_id = t.id AND lp.status = 'completed') as completed_lessons,
          (SELECT COUNT(*) FROM gold_lessons ls 
           JOIN gold_levels lvl ON ls.level_id = lvl.id 
           WHERE lvl.track_id = t.id) as total_lessons
        FROM gold_enrollments e
        LEFT JOIN gold_tracks t ON e.track_id = t.id
        LEFT JOIN gold_levels l ON e.current_level_id = l.id
        WHERE e.student_id = ${studentId}
        ORDER BY e.enrolled_at DESC
      `
    } else {
      enrollments = await sql`
        SELECT 
          e.*,
          s.full_name as student_name,
          s.email as student_email,
          t.name as track_name
        FROM gold_enrollments e
        LEFT JOIN gold_students s ON e.student_id = s.id
        LEFT JOIN gold_tracks t ON e.track_id = t.id
        ORDER BY e.enrolled_at DESC
      `
    }
    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}

// POST enroll student in track
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, track_id } = body

    // Get first level of track
    const firstLevel = await sql`
      SELECT id FROM gold_levels WHERE track_id = ${track_id} ORDER BY order_index ASC LIMIT 1
    `

    const currentLevelId = firstLevel.length > 0 ? firstLevel[0].id : null

    // Create enrollment
    const result = await sql`
      INSERT INTO gold_enrollments (student_id, track_id, current_level_id)
      VALUES (${student_id}, ${track_id}, ${currentLevelId})
      ON CONFLICT (student_id, track_id) DO UPDATE SET enrollment_status = 'active'
      RETURNING *
    `

    // Create level progress for first level
    if (currentLevelId) {
      await sql`
        INSERT INTO gold_level_progress (student_id, level_id, status, started_at)
        VALUES (${student_id}, ${currentLevelId}, 'in_progress', CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, level_id) DO NOTHING
      `
    }

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error enrolling student:", error)
    return NextResponse.json({ error: "Failed to enroll student" }, { status: 500 })
  }
}
