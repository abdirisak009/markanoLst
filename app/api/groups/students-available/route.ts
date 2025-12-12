import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const class_id = searchParams.get("class_id")

    if (!class_id) {
      return NextResponse.json({ error: "class_id is required" }, { status: 400 })
    }

    // Get students who are not yet in any group for this class
    const students = await sql`
      SELECT us.*
      FROM university_students us
      WHERE us.class_id = ${class_id}
        AND us.status = 'Active'
        AND us.student_id NOT IN (
          SELECT student_id FROM group_members WHERE class_id = ${class_id}
        )
      ORDER BY us.full_name
    `

    return NextResponse.json(students)
  } catch (error) {
    console.error("[v0] Error fetching available students:", error)
    return NextResponse.json({ error: "Failed to fetch available students" }, { status: 500 })
  }
}
