import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    let result

    switch (action) {
      case "start":
        result = await sql`
          UPDATE live_coding_challenges 
          SET status = 'active', editing_enabled = true, started_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
        break

      case "pause":
        result = await sql`
          UPDATE live_coding_challenges 
          SET editing_enabled = false
          WHERE id = ${id}
          RETURNING *
        `
        break

      case "resume":
        result = await sql`
          UPDATE live_coding_challenges 
          SET editing_enabled = true
          WHERE id = ${id}
          RETURNING *
        `
        break

      case "end":
        result = await sql`
          UPDATE live_coding_challenges 
          SET status = 'completed', editing_enabled = false, ended_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
        // Mark all submissions as final
        await sql`
          UPDATE live_coding_submissions 
          SET is_final = true 
          WHERE challenge_id = ${id}
        `
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error controlling challenge:", error)
    return NextResponse.json({ error: "Failed to control challenge" }, { status: 500 })
  }
}
