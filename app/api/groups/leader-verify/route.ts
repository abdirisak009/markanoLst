import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { university_id, class_id, student_id } = body

    // Verify if student exists and is a leader
    const student = await sql`
      SELECT us.*, g.id as group_id, g.name as group_name
      FROM university_students us
      INNER JOIN groups g ON g.leader_student_id = us.student_id AND g.class_id = us.class_id
      WHERE us.university_id = ${university_id}
        AND us.class_id = ${class_id}
        AND us.student_id = ${student_id}
    `

    if (student.length === 0) {
      return NextResponse.json({ error: "Leader not found or not assigned to any group" }, { status: 404 })
    }

    return NextResponse.json(student[0])
  } catch (error) {
    console.error("[v0] Error verifying leader:", error)
    return NextResponse.json({ error: "Failed to verify leader" }, { status: 500 })
  }
}
