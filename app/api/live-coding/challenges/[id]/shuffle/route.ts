import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get all participants
    const participants = await sql`
      SELECT id FROM live_coding_participants WHERE challenge_id = ${id}
    `

    // Get teams
    const teams = await sql`
      SELECT id FROM live_coding_teams WHERE challenge_id = ${id}
    `

    if (teams.length < 2) {
      return NextResponse.json({ error: "Need at least 2 teams" }, { status: 400 })
    }

    // Shuffle participants array
    const shuffled = [...participants].sort(() => Math.random() - 0.5)

    // Assign to teams evenly
    for (let i = 0; i < shuffled.length; i++) {
      const teamId = teams[i % teams.length].id
      await sql`
        UPDATE live_coding_participants SET team_id = ${teamId} WHERE id = ${shuffled[i].id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error shuffling participants:", error)
    return NextResponse.json({ error: "Failed to shuffle" }, { status: 500 })
  }
}
