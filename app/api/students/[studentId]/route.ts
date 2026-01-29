import { type NextRequest, NextResponse } from "next/server"
import postgres from "postgres"

export async function GET(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await params
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    // Fetch student with class and university names
    const result = await sql`
      SELECT 
        us.student_id,
        us.full_name,
        c.name as class_name,
        u.name as university_name
      FROM university_students us
      LEFT JOIN classes c ON us.class_id = c.id
      LEFT JOIN universities u ON us.university_id = u.id
      WHERE us.student_id = ${studentId}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching student details:", error)
    return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 })
  }
}
