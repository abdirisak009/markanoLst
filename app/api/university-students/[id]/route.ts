import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const studentId = params.id

  try {
    const students = await sql`
      SELECT 
        us.*,
        c.name as class_name,
        u.name as university_name
      FROM university_students us
      LEFT JOIN classes c ON us.class_id = c.id
      LEFT JOIN universities u ON c.university_id = u.id
      WHERE us.student_id = ${studentId}
    `

    if (students.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    return Response.json(students[0])
  } catch (error: any) {
    console.error("[v0] Error fetching student:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
