import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { studentId, password, name, classId } = await request.json()

    // Check if student already exists
    const existing = await sql`SELECT * FROM penn_students WHERE student_id = ${studentId}`

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Student ID already exists" }, { status: 400 })
    }

    // Insert new Penn student
    await sql`
      INSERT INTO penn_students (student_id, name, class, password) 
      VALUES (${studentId}, ${name}, ${classId}, ${password})
    `

    return NextResponse.json({
      success: true,
      student: {
        id: studentId,
        name,
        class: classId,
      },
    })
  } catch (error) {
    console.error("[v0] Penn register error:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 })
  }
}
