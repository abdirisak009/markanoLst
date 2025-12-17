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

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      console.error("[v0] Invalid student_ids:", student_ids)
      return NextResponse.json({ error: "Invalid student_ids" }, { status: 400 })
    }

    if (!class_id || !leader_student_id) {
      console.error("[v0] Missing required fields:", { class_id, leader_student_id })
      return NextResponse.json({ error: "Missing class_id or leader_student_id" }, { status: 400 })
    }

    const groupId = Number(id)
    const classIdNum = Number(class_id)

    const groupCheck = await sql`SELECT id, name, capacity FROM groups WHERE id = ${groupId}`
    console.log("[v0] Group check result:", groupCheck)

    if (groupCheck.length === 0) {
      console.error("[v0] Group not found:", groupId)
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const group = groupCheck[0]

    const currentCountResult = await sql`SELECT COUNT(*)::int as count FROM group_members WHERE group_id = ${groupId}`
    const currentMemberCount = currentCountResult[0].count

    console.log("[v0] Current member count:", currentMemberCount, "Capacity:", group.capacity)

    if (currentMemberCount + student_ids.length > group.capacity) {
      return NextResponse.json(
        {
          error: `Tirada xubnaha waa ka badan tahay capacity-ga. Group-ku wuxuu qaadi karaa ${group.capacity} xubnood. Hadda waa ${currentMemberCount}, waxaad isku dayaysaa inaad ku darto ${student_ids.length}`,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Checking for existing members...")
    const existingMembers = []
    for (const studentId of student_ids) {
      const check = await sql`
        SELECT student_id FROM group_members 
        WHERE student_id = ${studentId} AND class_id = ${classIdNum}
      `
      if (check.length > 0) {
        existingMembers.push(studentId)
      }
    }

    if (existingMembers.length > 0) {
      console.log("[v0] Some students already in groups:", existingMembers)
      return NextResponse.json(
        {
          error: `Ardaydan qaar horay ayay group ugu jireen: ${existingMembers.join(", ")}`,
          existing: existingMembers,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Inserting members...")
    let insertedCount = 0

    for (const studentId of student_ids) {
      try {
        await sql`
          INSERT INTO group_members (group_id, student_id, class_id, added_by_leader, added_at)
          VALUES (${groupId}, ${studentId}, ${classIdNum}, ${leader_student_id}, NOW())
        `
        insertedCount++
        console.log("[v0] Inserted student:", studentId)
      } catch (insertError) {
        console.error("[v0] Failed to insert student:", studentId, insertError)
        // Continue with other students
      }
    }

    console.log("[v0] Successfully added", insertedCount, "members")
    console.log("[v0] ============ MEMBER SUBMISSION SUCCESS ============")

    return NextResponse.json(
      {
        success: true,
        count: insertedCount,
        message: `Si guul leh ${insertedCount} xubnood ayaa lagu daray group-ka`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] ============ MEMBER SUBMISSION ERROR ============")
    console.error("[v0] Error:", error)
    return NextResponse.json(
      {
        error: "Khalad ayaa dhacay markii la darayay xubnaha",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
