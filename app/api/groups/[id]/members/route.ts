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

    // Check if any students are already in a group for this class
    const existing = await sql`
      SELECT student_id FROM group_members WHERE student_id = ANY(${student_ids}) AND class_id = ${class_id}
    `

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Some students are already in a group", existing: existing.map((e: any) => e.student_id) },
        { status: 400 },
      )
    }

    // Add members
    const values = student_ids
      .map((student_id: string) => `(${id}, '${student_id}', ${class_id}, '${leader_student_id}')`)
      .join(", ")

    await sql.unsafe(`
      INSERT INTO group_members (group_id, student_id, class_id, added_by_leader)
      VALUES ${values}
    `)

    return NextResponse.json({ success: true, count: student_ids.length }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error adding members:", error)
    return NextResponse.json({ error: "Failed to add members" }, { status: 500 })
  }
}
