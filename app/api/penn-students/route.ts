import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const students = await sql`
      SELECT * FROM penn_students 
      ORDER BY registered_at DESC
    `
    return NextResponse.json(students)
  } catch (error) {
    console.error("[v0] Error fetching Penn students:", error)
    return NextResponse.json({ error: "Failed to fetch Penn students" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, full_name, email, username, phone, selected_course, status } = body

    const result = await sql`
      INSERT INTO penn_students (student_id, full_name, email, username, phone, selected_course, status)
      VALUES (${student_id}, ${full_name}, ${email}, ${username}, ${phone}, ${selected_course}, ${status || "pending"})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating Penn student:", error)
    return NextResponse.json({ error: "Failed to create Penn student" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, student_id, full_name, email, username, phone, selected_course, status } = body

    const result = await sql`
      UPDATE penn_students
      SET 
        student_id = ${student_id},
        full_name = ${full_name},
        email = ${email},
        username = ${username},
        phone = ${phone},
        selected_course = ${selected_course},
        status = ${status}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating Penn student:", error)
    return NextResponse.json({ error: "Failed to update Penn student" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM penn_students WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting Penn student:", error)
    return NextResponse.json({ error: "Failed to delete Penn student" }, { status: 500 })
  }
}
