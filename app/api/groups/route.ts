import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const groups = await sql`
      SELECT 
        g.*,
        u.name as university_name,
        c.name as class_name,
        us.full_name as leader_name,
        COUNT(gm.id) as member_count
      FROM groups g
      LEFT JOIN universities u ON g.university_id = u.id
      LEFT JOIN classes c ON g.class_id = c.id
      LEFT JOIN university_students us ON g.leader_student_id = us.student_id AND g.class_id = us.class_id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      GROUP BY g.id, u.name, c.name, us.full_name
      ORDER BY g.created_at DESC
    `
    return NextResponse.json(groups)
  } catch (error) {
    console.error("[v0] Error fetching groups:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, university_id, class_id, leader_student_id } = body

    const result = await sql`
      INSERT INTO groups (name, university_id, class_id, leader_student_id)
      VALUES (${name}, ${university_id}, ${class_id}, ${leader_student_id})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating group:", error)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM groups WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting group:", error)
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 })
  }
}
