import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("class_id")

    if (!classId) {
      return NextResponse.json({ error: "class_id is required" }, { status: 400 })
    }

    // Get all students in the class who are NOT in any group
    const ungroupedStudents = await sql`
      SELECT 
        us.student_id,
        us.full_name,
        us.gender,
        c.name as class_name,
        u.name as university_name
      FROM university_students us
      LEFT JOIN classes c ON us.class_id = c.id
      LEFT JOIN universities u ON c.university_id = u.id
      LEFT JOIN group_members gm ON us.student_id = gm.student_id AND us.class_id = gm.class_id
      WHERE us.class_id = ${classId} AND gm.id IS NULL
      ORDER BY us.full_name ASC
    `

    return NextResponse.json(ungroupedStudents)
  } catch (error) {
    console.error("Error fetching ungrouped students:", error)
    return NextResponse.json({ error: "Failed to fetch ungrouped students" }, { status: 500 })
  }
}
