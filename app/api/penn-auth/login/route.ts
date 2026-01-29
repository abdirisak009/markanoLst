import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: Request) {
  try {
    const { studentId, password } = await request.json()

    // Query penn_students table
    const students = await sql`SELECT * FROM penn_students WHERE student_id = ${studentId} AND password = ${password}`

    if (students.length > 0) {
      const student = students[0]
      return NextResponse.json({
        success: true,
        student: {
          id: student.student_id,
          name: student.name,
          class: student.class,
        },
      })
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Penn login error:", error)
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 })
  }
}
