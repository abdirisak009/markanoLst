import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function GET() {
  try {
    const assignments = await sql`
      SELECT 
        a.*,
        c.name as class_name
      FROM assignments a
      LEFT JOIN classes c ON a.class_id = c.id
      ORDER BY a.created_at DESC
    `
    return NextResponse.json(assignments)
  } catch (error) {
    console.error("[v0] Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, class_id, period, max_marks, due_date } = body

    const result = await sql`
      INSERT INTO assignments (title, description, class_id, period, max_marks, due_date)
      VALUES (${title}, ${description}, ${class_id}, ${period}, ${max_marks}, ${due_date})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, description, class_id, period, max_marks, due_date } = body

    const result = await sql`
      UPDATE assignments
      SET 
        title = ${title},
        description = ${description},
        class_id = ${class_id},
        period = ${period},
        max_marks = ${max_marks},
        due_date = ${due_date}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating assignment:", error)
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM assignments WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting assignment:", error)
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 })
  }
}
