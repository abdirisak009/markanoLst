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

    const students = await sql`
      SELECT us.*
      FROM university_students us
      LEFT JOIN group_members gm ON gm.student_id = us.student_id AND gm.class_id = us.class_id
      WHERE us.class_id = ${classIdNum}
        AND us.status = 'Active'
        AND gm.id IS NULL
      ORDER BY us.full_name
    `

    console.log("[v0] Found", students.length, "available students")
    console.log("[v0] ====== Available Students Fetched ======")

    return NextResponse.json(students)
  } catch (error) {
    console.error("[v0] Error fetching available students:", error)
    return NextResponse.json({ error: "Failed to fetch available students", details: String(error) }, { status: 500 })
  }
}
