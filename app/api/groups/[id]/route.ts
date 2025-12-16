import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    console.log("[v0] Fetching group:", id)

    const group = await sql`
      SELECT 
        g.*,
        u.name as university_name,
        c.name as class_name,
        us.full_name as leader_name
      FROM groups g
      LEFT JOIN universities u ON g.university_id = u.id
      LEFT JOIN classes c ON g.class_id = c.id
      LEFT JOIN university_students us ON g.leader_student_id = us.student_id AND g.class_id = us.class_id
      WHERE g.id = ${id}
    `

    if (group.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    return NextResponse.json(group[0])
  } catch (error) {
    console.error("[v0] Error fetching group:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch group",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log("[v0] Updating group:", id, body)

    const { name, class_id, leader_student_id, project_name, capacity, is_paid, cost_per_member } = body

    const result = await sql`
      UPDATE groups 
      SET 
        name = COALESCE(${name || null}, name),
        class_id = COALESCE(${class_id || null}::integer, class_id),
        leader_student_id = COALESCE(${leader_student_id || null}, leader_student_id),
        project_name = COALESCE(${project_name || null}, project_name),
        capacity = COALESCE(${capacity || null}::integer, capacity),
        is_paid = COALESCE(${is_paid !== undefined ? is_paid : null}::boolean, is_paid),
        cost_per_member = CASE 
          WHEN ${is_paid === false} THEN NULL
          WHEN ${cost_per_member !== undefined && cost_per_member !== null} THEN ${cost_per_member}::decimal
          ELSE cost_per_member
        END
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    console.log("[v0] Group updated successfully:", result[0].name)
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating group:", error)
    return NextResponse.json(
      {
        error: "Failed to update group",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    console.log("[v0] Deleting group:", id)

    const result = await sql`
      DELETE FROM groups 
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    console.log("[v0] Group deleted successfully:", result[0].name)
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error deleting group:", error)
    return NextResponse.json(
      {
        error: "Failed to delete group",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
