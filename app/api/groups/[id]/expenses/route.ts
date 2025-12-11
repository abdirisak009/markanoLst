import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const groupId = params.id

    const expenses = await sql`
      SELECT *
      FROM group_expenses
      WHERE group_id = ${groupId}
      ORDER BY expense_date DESC
    `

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("[v0] Error fetching expenses:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const groupId = params.id
    const body = await request.json()
    const { description, amount, category, notes, recorded_by } = body

    const result = await sql`
      INSERT INTO group_expenses (group_id, description, amount, category, notes, recorded_by)
      VALUES (${groupId}, ${description}, ${amount}, ${category || null}, ${notes || null}, ${recorded_by || "admin"})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error recording expense:", error)
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const expenseId = searchParams.get("expense_id")

    await sql`DELETE FROM group_expenses WHERE id = ${expenseId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting expense:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
