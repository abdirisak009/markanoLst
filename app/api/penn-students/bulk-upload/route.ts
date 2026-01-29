import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { students } = body

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const student of students) {
      try {
        const result = await sql`
          INSERT INTO penn_students (student_id, full_name, email, username, phone, selected_course, status)
          VALUES (
            ${student.student_id},
            ${student.full_name},
            ${student.email},
            ${student.username || null},
            ${student.phone || null},
            ${student.selected_course || null},
            ${student.status || "pending"}
          )
          ON CONFLICT (student_id) DO UPDATE
          SET 
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            username = EXCLUDED.username,
            phone = EXCLUDED.phone,
            selected_course = EXCLUDED.selected_course,
            status = EXCLUDED.status
          RETURNING *
        `
        results.push(result[0])
      } catch (error) {
        errors.push({ student_id: student.student_id, error: String(error) })
      }
    }

    return NextResponse.json({
      success: true,
      inserted: results.length,
      errors: errors.length,
      errorDetails: errors,
    })
  } catch (error) {
    console.error("[v0] Bulk upload error:", error)
    return NextResponse.json({ error: "Failed to upload Penn students" }, { status: 500 })
  }
}
