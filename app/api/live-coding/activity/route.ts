import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { participantId, action, focusViolations } = body

    if (action === "editor_locked") {
      await sql`
        UPDATE live_coding_participants 
        SET focus_violations = ${focusViolations || 0},
            is_active = true,
            last_active_at = CURRENT_TIMESTAMP
        WHERE id = ${participantId}
      `

      return NextResponse.json({ success: true, editorLocked: true })
    }

    if (action === "disqualified") {
      await sql`
        UPDATE live_coding_participants 
        SET is_active = false, 
            is_locked = true,
            focus_violations = ${focusViolations || 0},
            last_active_at = CURRENT_TIMESTAMP
        WHERE id = ${participantId}
      `

      // Save final submission with disqualified status
      await sql`
        UPDATE live_coding_submissions
        SET is_final = true
        WHERE participant_id = ${participantId}
      `

      return NextResponse.json({ success: true, disqualified: true })
    }

    // Regular activity update
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
