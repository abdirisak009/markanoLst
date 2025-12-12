import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("[v0] Fetching group:", id)
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("[v0] DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 20))

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

    console.log("[v0] Group query returned", group.length, "results")

    if (group.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    console.log("[v0] Group found:", group[0].name)
    return NextResponse.json(group[0])
  } catch (error) {
    console.error("[v0] Error fetching group:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch group",
        details: error instanceof Error ? error.message : String(error),
        dbConfigured: !!process.env.DATABASE_URL,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    console.log("[v0] Updating group:", id, body)

    const { name, class_id, leader_student_id, project_name, capacity, is_paid, cost_per_member } = body

    // Build update query with only provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(name)
    }
    if (class_id !== undefined) {
      updates.push(`class_id = $${paramIndex++}`)
      values.push(class_id)
    }
    if (leader_student_id !== undefined) {
      updates.push(`leader_student_id = $${paramIndex++}`)
      values.push(leader_student_id)
    }
    if (project_name !== undefined) {
      updates.push(`project_name = $${paramIndex++}`)
      values.push(project_name)
    }
    if (capacity !== undefined) {
      updates.push(`capacity = $${paramIndex++}`)
      values.push(capacity)
    }
    if (is_paid !== undefined) {
      updates.push(`is_paid = $${paramIndex++}`)
      values.push(is_paid)

      if (is_paid && cost_per_member !== undefined) {
        updates.push(`cost_per_member = $${paramIndex++}`)
        values.push(cost_per_member)
      } else if (!is_paid) {
        updates.push(`cost_per_member = NULL`)
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Add the ID as the last parameter
    values.push(id)

    const query = `
      UPDATE groups 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    console.log("[v0] Update query:", query)
    console.log("[v0] Update values:", values)

    const result = await sql(query, values)

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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
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
