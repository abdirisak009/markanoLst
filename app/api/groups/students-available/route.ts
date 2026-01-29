import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const class_id = searchParams.get("class_id")

    console.log("[v0] ====== Fetching Available Students ======")
    console.log("[v0] Class ID:", class_id)

    if (!class_id) {
      return NextResponse.json({ error: "class_id is required" }, { status: 400 })
    }

    const classIdNum = Number(class_id)

    const students = await sql`
      SELECT us.*
      FROM university_students us
      WHERE us.class_id = ${classIdNum}
        AND us.status = 'Active'
        AND us.student_id NOT IN (
          SELECT gm.student_id 
          FROM group_members gm 
          WHERE gm.class_id = ${classIdNum}
        )
        AND us.student_id NOT IN (
          SELECT g.leader_student_id 
          FROM groups g 
          WHERE g.class_id = ${classIdNum}
          AND g.leader_student_id IS NOT NULL
        )
      ORDER BY us.full_name
    `

    console.log("[v0] Available students (not in groups and not leaders):", students.length)
    console.log("[v0] ====== Available Students Fetched ======")

    return NextResponse.json(students)
  } catch (error) {
    console.error("[v0] Error fetching available students:", error)
    return NextResponse.json({ error: "Failed to fetch available students", details: String(error) }, { status: 500 })
  }
}
