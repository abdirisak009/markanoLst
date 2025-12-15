import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const expenses = await sql`
      SELECT * FROM general_expenses 
      ORDER BY expense_date DESC
    `

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error("[v0] Error fetching general expenses:", error)
    return NextResponse.json({ error: "Failed to fetch general expenses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, amount, category, recorded_by, notes } = body

    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql`
      INSERT INTO general_expenses (description, amount, category, recorded_by, notes)
      VALUES (${description}, ${amount}, ${category || null}, ${recorded_by || "Admin"}, ${notes || null})
      RETURNING *
    `

    return NextResponse.json({ expense: result[0] })
  } catch (error) {
    console.error("[v0] Error adding general expense:", error)
    return NextResponse.json({ error: "Failed to add general expense" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    await sql`DELETE FROM general_expenses WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting general expense:", error)
    return NextResponse.json({ error: "Failed to delete general expense" }, { status: 500 })
  }
}
