import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

let sql: ReturnType<typeof neon>
try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined")
  }
  sql = neon(process.env.DATABASE_URL)
} catch (error) {
  console.error("[v0] Failed to initialize database connection:", error)
  throw error
}

export async function GET() {
  try {
    console.log("[v0] Fetching groups from database...")

    const groups = await sql`
      SELECT 
        g.id,
        g.name,
        g.university_id,
        g.class_id,
        g.leader_student_id,
        g.capacity,
        g.project_name,
        g.is_paid,
        g.cost_per_member,
        g.created_at,
        u.name as university_name,
        c.name as class_name,
        us.full_name as leader_name,
        COALESCE(COUNT(DISTINCT gm.id), 0)::integer as member_count,
        COALESCE(COUNT(DISTINCT CASE WHEN gp.id IS NOT NULL THEN gm.student_id END), 0)::integer as paid_count,
        GREATEST(0, COALESCE(COUNT(DISTINCT gm.id), 0)::integer - COALESCE(COUNT(DISTINCT CASE WHEN gp.id IS NOT NULL THEN gm.student_id END), 0)::integer) as unpaid_count
      FROM groups g
      LEFT JOIN universities u ON g.university_id = u.id
      LEFT JOIN classes c ON g.class_id = c.id
      LEFT JOIN university_students us ON g.leader_student_id = us.student_id AND g.class_id = us.class_id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN group_payments gp ON gm.group_id = gp.group_id AND gm.student_id = gp.student_id
      GROUP BY g.id, g.name, g.university_id, g.class_id, g.leader_student_id, 
               g.capacity, g.project_name, g.is_paid, g.cost_per_member, g.created_at,
               u.name, c.name, us.full_name
      ORDER BY g.created_at DESC
    `

    const groupsArray = Array.isArray(groups) ? groups : []
    console.log(`[v0] Successfully fetched ${groupsArray.length} groups`)

    return NextResponse.json(groupsArray)
  } catch (error) {
    console.error("[v0] Error fetching groups:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch groups",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, university_id, class_id, leader_student_id, capacity, project_name, is_paid, cost_per_member } = body

    const existing = await sql`
      SELECT id FROM groups 
      WHERE LOWER(name) = LOWER(${name}) 
      AND class_id = ${class_id}
    `

    const existingArray = Array.isArray(existing) ? existing : []
    if (existingArray.length > 0) {
      return NextResponse.json({ error: "A group with this name already exists in this class" }, { status: 409 })
    }

    const result = await sql`
      INSERT INTO groups (name, university_id, class_id, leader_student_id, capacity, project_name, is_paid, cost_per_member)
      VALUES (${name}, ${university_id}, ${class_id}, ${leader_student_id}, ${capacity || 10}, ${project_name || null}, ${is_paid || false}, ${cost_per_member || 0})
      RETURNING *
    `

    const resultArray = Array.isArray(result) ? result : []
    return NextResponse.json(resultArray[0], { status: 201 })
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
