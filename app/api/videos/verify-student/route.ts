import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id } = body

    console.log("[v0] API: Verifying student ID:", student_id)

    if (!student_id) {
      return NextResponse.json(
        { verified: false, message: "Student ID is required" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Check if student exists in university_students table
    const result = await sql`
      SELECT id, student_id, full_name, university_id, status
      FROM university_students
      WHERE student_id = ${student_id} AND status = 'Active'
      LIMIT 1
    `

    console.log("[v0] API: Query result:", result)

    if (result.length > 0) {
      return NextResponse.json(
        {
          verified: true,
          student: result[0],
        },
        { headers: { "Content-Type": "application/json" } },
      )
    } else {
      return NextResponse.json(
        {
          verified: false,
          message: "Student ID not found or inactive",
        },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("[v0] API: Error verifying student:", error)
    return NextResponse.json(
      { verified: false, error: "Failed to verify student", message: String(error) },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
