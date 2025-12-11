import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const members = await sql`
      SELECT 
        gm.*,
        us.full_name as student_name,
        us.gender,
        leader.full_name as added_by_name
      FROM group_members gm
      LEFT JOIN university_students us ON gm.student_id = us.student_id AND gm.class_id = us.class_id
      LEFT JOIN university_students leader ON gm.added_by_leader = leader.student_id AND gm.class_id = leader.class_id
      WHERE gm.group_id = ${id}
      ORDER BY gm.added_at DESC
    `

    return NextResponse.json(members)
  } catch (error) {
    console.error("[v0] Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { student_ids, class_id, leader_student_id } = body

    console.log("[v0] ============ MEMBER SUBMISSION START ============")
    console.log("[v0] Group ID:", id)
    console.log("[v0] Student IDs:", student_ids)
    console.log("[v0] Class ID:", class_id)
    console.log("[v0] Leader ID:", leader_student_id)
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      console.error("[v0] Invalid student_ids:", student_ids)
      return NextResponse.json({ error: "Invalid student_ids" }, { status: 400 })
    }

    if (!class_id || !leader_student_id) {
      console.error("[v0] Missing required fields:", { class_id, leader_student_id })
      return NextResponse.json({ error: "Missing class_id or leader_student_id" }, { status: 400 })
    }

    const groupCheck = await sql`SELECT id, name FROM groups WHERE id = ${id}`
    console.log("[v0] Group exists:", groupCheck.length > 0, groupCheck)

    if (groupCheck.length === 0) {
      console.error("[v0] Group not found:", id)
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if any students are already in a group for this class
    console.log("[v0] Checking for existing members...")
    const existing = await sql`
      SELECT student_id FROM group_members WHERE student_id = ANY(${student_ids}) AND class_id = ${class_id}
    `

    if (existing.length > 0) {
      console.log("[v0] Some students already in groups:", existing)
      return NextResponse.json(
        { error: "Some students are already in a group", existing: existing.map((e: any) => e.student_id) },
        { status: 400 },
      )
    }

    const groupId = Number.parseInt(id)
    const classIdNum = Number.parseInt(class_id)

    console.log("[v0] Inserting members into database...")
    let insertedCount = 0
    for (const studentId of student_ids) {
      try {
        console.log("[v0] Inserting student:", studentId)
        await sql`
          INSERT INTO group_members (group_id, student_id, class_id, added_by_leader)
          VALUES (${groupId}, ${studentId}, ${classIdNum}, ${leader_student_id})
        `
        insertedCount++
        console.log("[v0] Successfully inserted student:", studentId)
      } catch (insertError) {
        console.error("[v0] Failed to insert student:", studentId, insertError)
        throw insertError
      }
    }

    console.log("[v0] Successfully added", insertedCount, "members to group", id)
    console.log("[v0] ============ MEMBER SUBMISSION END ============")

    return NextResponse.json({ success: true, count: insertedCount }, { status: 201 })
  } catch (error) {
    console.error("[v0] ============ ERROR ============")
    console.error("[v0] Error adding members:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] ==================================")
    return NextResponse.json({ error: "Failed to add members", details: String(error) }, { status: 500 })
  }
}
