import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get students from all sources
    const universityStudents = await sql`
      SELECT student_id, full_name, 'university' as type FROM university_students
    `

    const pennStudents = await sql`
      SELECT student_id, full_name, 'penn' as type FROM penn_students
    `

    const goldStudents = await sql`
      SELECT id::text as student_id, full_name, 'gold' as type FROM gold_students
    `

    const allStudents = [...universityStudents, ...pennStudents, ...goldStudents]

    return NextResponse.json(allStudents)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
