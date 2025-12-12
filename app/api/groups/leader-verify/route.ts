import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    console.log("[v0] ====== Leader Verification Start ======")

    const body = await request.json()
    const { university_id, class_id, student_id } = body

    console.log("[v0] Request body:", { university_id, class_id, student_id })

    if (!university_id || !class_id || !student_id) {
      console.error("[v0] Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields: university_id, class_id, student_id" },
        { status: 400 },
      )
    }

    console.log("[v0] Querying database for leader verification...")

    const student = await sql`
      SELECT us.*, g.id as group_id, g.name as group_name
      FROM university_students us
      INNER JOIN groups g ON g.leader_student_id = us.student_id AND g.class_id = us.class_id
      WHERE us.university_id = ${Number(university_id)}
        AND us.class_id = ${Number(class_id)}
        AND us.student_id = ${student_id}
        AND us.status = 'Active'
    `

    console.log("[v0] Query result count:", student.length)

    if (student.length === 0) {
      console.log("[v0] Leader not found or not assigned to any group")
      return NextResponse.json(
        {
          error:
            "Leaderkan ma jiro ama aan loo xilsaarin group. / Leader not found or not assigned to any group in this class.",
        },
        { status: 404 },
      )
    }

    console.log("[v0] Leader verified successfully:", student[0])
    console.log("[v0] ====== Leader Verification Success ======")

    return NextResponse.json(student[0])
  } catch (error) {
    console.error("[v0] ====== Leader Verification Error ======")
    console.error("[v0] Error verifying leader:", error)
    console.error("[v0] Error details:", error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        error: "Failed to verify leader",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
