import postgres from "postgres"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("class_id")

    if (!classId) {
      return NextResponse.json({ error: "class_id is required" }, { status: 400 })
    }

    // and fixed student_id comparison (it's a string/varchar, not integer)
    const students = await sql`
      SELECT s.id, s.student_id, s.full_name, c.name as class_name
      FROM university_students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.class_id = ${Number.parseInt(classId)}
      AND s.student_id NOT IN (
        SELECT gm.student_id FROM group_members gm WHERE gm.student_id IS NOT NULL
      )
      ORDER BY s.full_name ASC
    `

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching available students:", error)
    return NextResponse.json({ error: "Failed to fetch available students" }, { status: 500 })
  }
}
