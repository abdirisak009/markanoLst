import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { participantId } = body

    await sql`
      UPDATE live_coding_participants 
      SET is_active = true, last_active_at = CURRENT_TIMESTAMP
      WHERE id = ${participantId}
    `

    // Mark inactive participants (not active for 30 seconds)
    await sql`
      UPDATE live_coding_participants 
      SET is_active = false 
      WHERE last_active_at < NOW() - INTERVAL '30 seconds'
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating activity:", error)
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 })
  }
}
