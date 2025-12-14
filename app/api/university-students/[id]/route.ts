import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const studentId = params.id

  console.log("[v0] Looking for student with ID:", studentId)

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

    console.log("[v0] Query returned:", students.length, "students")

    if (students.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    console.log("[v0] Found student:", students[0].name)
    return Response.json(students[0])
  } catch (error: any) {
    console.error("[v0] Error fetching student:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
