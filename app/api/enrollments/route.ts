import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// Get student enrollments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 })
    }

    const enrollments = await sql`
      SELECT 
        ce.*, 
        c.title, 
        c.description, 
        c.instructor,
        c.thumbnail,
        COUNT(DISTINCT m.id) as modules_count,
        COUNT(DISTINCT l.id) as lessons_count,
        COUNT(DISTINCT lp.id) FILTER (WHERE lp.completed = true) as completed_lessons
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      LEFT JOIN modules m ON m.course_id = c.id
      LEFT JOIN lessons l ON l.module_id = m.id
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = ce.student_id
      WHERE ce.student_id = ${studentId}
      GROUP BY ce.id, c.id
      ORDER BY ce.enrolled_at DESC
    `

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("[v0] Error fetching enrollments:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}

// Enroll in course
export async function POST(request: Request) {
  try {
    const { studentId, courseId } = await request.json()

    // Check if already enrolled
    const existing =
      await sql`SELECT * FROM course_enrollments WHERE student_id = ${studentId} AND course_id = ${courseId}`

    if (existing.length > 0) {
      return NextResponse.json({ message: "Already enrolled" }, { status: 400 })
    }

    await sql`INSERT INTO course_enrollments (student_id, course_id) VALUES (${studentId}, ${courseId})`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error enrolling:", error)
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 })
  }
}
