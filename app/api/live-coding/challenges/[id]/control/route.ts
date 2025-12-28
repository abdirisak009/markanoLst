import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, minutes } = body

    let result

    switch (action) {
      case "start":
        const challenges = await sql`
          SELECT duration_minutes FROM live_coding_challenges WHERE id = ${id}
        `
        if (challenges.length === 0) {
          return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
        }
        const durationMinutes = challenges[0].duration_minutes || 30

        result = await sql`
          UPDATE live_coding_challenges 
          SET 
            status = 'active', 
            editing_enabled = true, 
            started_at = CURRENT_TIMESTAMP,
            end_time = CURRENT_TIMESTAMP + (${durationMinutes} || ' minutes')::interval
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

      case "reset":
        result = await sql`
          UPDATE live_coding_challenges 
          SET status = 'draft', editing_enabled = false, started_at = NULL, ended_at = NULL, end_time = NULL
          WHERE id = ${id}
          RETURNING *
        `
        // Reset submissions
        await sql`
          UPDATE live_coding_submissions 
          SET is_final = false 
          WHERE challenge_id = ${id}
        `
        // Reset participants lock status
        await sql`
          UPDATE live_coding_participants 
          SET is_locked = false, focus_violations = 0
          WHERE challenge_id = ${id}
        `
        break

      case "adjust_time":
        if (typeof minutes !== "number") {
          return NextResponse.json({ error: "Minutes required" }, { status: 400 })
        }
        result = await sql`
          UPDATE live_coding_challenges 
          SET 
            duration_minutes = GREATEST(1, duration_minutes + ${minutes}),
            end_time = CASE 
              WHEN end_time IS NOT NULL THEN end_time + (${minutes} || ' minutes')::interval 
              ELSE NULL 
            END
          WHERE id = ${id}
          RETURNING *
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
