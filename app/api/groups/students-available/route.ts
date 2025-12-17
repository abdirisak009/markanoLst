import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

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

    const allStudentsInClass = await sql`
      SELECT student_id, full_name, status, class_id
      FROM university_students
      WHERE class_id = ${classIdNum}
    `
    console.log("[v0] Total students in class", classIdNum, ":", allStudentsInClass.length)
    console.log("[v0] Sample students:", allStudentsInClass.slice(0, 3))

    const studentsInGroups = await sql`
      SELECT DISTINCT student_id, class_id, group_id
      FROM group_members
      WHERE class_id = ${classIdNum}
    `
    console.log("[v0] Students already in groups for class", classIdNum, ":", studentsInGroups.length)
    console.log("[v0] Sample group members:", studentsInGroups.slice(0, 3))

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
      ORDER BY us.full_name
    `

    console.log("[v0] Available students (not in groups):", students.length)
    console.log("[v0] ====== Available Students Fetched ======")

    return NextResponse.json(students)
  } catch (error) {
    console.error("[v0] Error fetching available students:", error)
    return NextResponse.json({ error: "Failed to fetch available students", details: String(error) }, { status: 500 })
  }
}
