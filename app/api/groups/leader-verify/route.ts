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
      return NextResponse.json({ error: "Fadlan buuxi dhammaan meelaha loo baahan yahay" }, { status: 400 })
    }

    const universityIdNum = Number(university_id)
    const classIdNum = Number(class_id)
    const studentIdStr = String(student_id).trim()

    console.log("[v0] Parsed values:", { universityIdNum, classIdNum, studentIdStr })

    const studentCheck = await sql`
      SELECT * FROM university_students 
      WHERE student_id = ${studentIdStr}
        AND university_id = ${universityIdNum}
        AND class_id = ${classIdNum}
        AND status = 'Active'
    `

    console.log("[v0] Student check result:", studentCheck.length, "records")

    if (studentCheck.length === 0) {
      return NextResponse.json({ error: "Ardaygan ma jiro ama status-kiisu ma ahan Active" }, { status: 404 })
    }

    const leaderCheck = await sql`
      SELECT g.id as group_id, g.name as group_name, g.capacity, g.class_id
      FROM groups g
      WHERE g.leader_student_id = ${studentIdStr}
        AND g.class_id = ${classIdNum}
    `

    console.log("[v0] Leader check result:", leaderCheck.length, "records")

    if (leaderCheck.length === 0) {
      return NextResponse.json(
        { error: "Ardaygan looma xilsaarin leader group kasta. Fadlan la xiriir admin-ka." },
        { status: 404 },
      )
    }

    // Combine student info with group info
    const result = {
      ...studentCheck[0],
      group_id: leaderCheck[0].group_id,
      group_name: leaderCheck[0].group_name,
      capacity: leaderCheck[0].capacity,
    }

    console.log("[v0] Leader verified successfully:", result)
    console.log("[v0] ====== Leader Verification Success ======")

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] ====== Leader Verification Error ======")
    console.error("[v0] Error:", error)

    return NextResponse.json(
      {
        error: "Khalad ayaa dhacay. Fadlan isku day mar kale.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
