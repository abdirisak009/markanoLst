import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

// GET all students with progress
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get("trackId")

    let students
    if (trackId) {
      students = await sql`
        SELECT 
          s.*,
          e.enrollment_status,
          e.enrolled_at,
          t.name as track_name,
          l.name as current_level_name,
          COUNT(DISTINCT lp.id) FILTER (WHERE lp.status = 'completed') as completed_lessons,
          COUNT(DISTINCT les.id) as total_lessons
        FROM gold_students s
        LEFT JOIN gold_enrollments e ON s.id = e.student_id AND e.track_id = ${trackId}
        LEFT JOIN gold_tracks t ON e.track_id = t.id
        LEFT JOIN gold_levels l ON e.current_level_id = l.id
        LEFT JOIN gold_levels lvl ON t.id = lvl.track_id
        LEFT JOIN gold_lessons les ON lvl.id = les.level_id
        LEFT JOIN gold_lesson_progress lp ON s.id = lp.student_id AND les.id = lp.lesson_id
        WHERE e.track_id = ${trackId}
        GROUP BY s.id, e.enrollment_status, e.enrolled_at, t.name, l.name
        ORDER BY s.full_name ASC
      `
    } else {
      students = await sql`
        SELECT 
          s.*,
          COUNT(DISTINCT e.id) as enrolled_tracks,
          MAX(e.enrolled_at) as last_enrollment
        FROM gold_students s
        LEFT JOIN gold_enrollments e ON s.id = e.student_id
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `
    }
    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

// POST register new student
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, password, university, field_of_study } = body

    // Check if email exists
    const existing = await sql`SELECT id FROM gold_students WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    const result = await sql`
      INSERT INTO gold_students (full_name, email, password_hash, university, field_of_study, account_status)
      VALUES (${full_name}, ${email}, ${password_hash}, ${university}, ${field_of_study}, 'active')
      RETURNING id, full_name, email, university, field_of_study, account_status, created_at
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error registering student:", error)
    return NextResponse.json({ error: "Failed to register student" }, { status: 500 })
  }
}

// PUT update student
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, full_name, email, university, field_of_study, account_status } = body

    const result = await sql`
      UPDATE gold_students 
      SET full_name = ${full_name}, email = ${email}, university = ${university},
          field_of_study = ${field_of_study}, account_status = ${account_status}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
  }
}
