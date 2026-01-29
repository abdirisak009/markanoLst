import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const challenges = await sql`
      SELECT * FROM live_coding_challenges WHERE id = ${id}
    `

    if (challenges.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    return NextResponse.json(challenges[0])
  } catch (error) {
    console.error("Error fetching challenge:", error)
    return NextResponse.json({ error: "Failed to fetch challenge" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, instructions, duration_minutes } = body

    const result = await sql`
      UPDATE live_coding_challenges 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        instructions = COALESCE(${instructions}, instructions),
        duration_minutes = COALESCE(${duration_minutes}, duration_minutes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating challenge:", error)
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await sql`DELETE FROM live_coding_challenges WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting challenge:", error)
    return NextResponse.json({ error: "Failed to delete challenge" }, { status: 500 })
  }
}
