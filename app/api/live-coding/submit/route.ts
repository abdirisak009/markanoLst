import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { participantId, challengeId, htmlCode, cssCode } = body

    // Check if challenge allows editing
    const challenges = await sql`
      SELECT editing_enabled, status FROM live_coding_challenges WHERE id = ${challengeId}
    `

    if (challenges.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    const challenge = challenges[0]

    if (!challenge.editing_enabled || challenge.status !== "active") {
      return NextResponse.json({ error: "Editing is disabled" }, { status: 403 })
    }

    // Upsert submission
    const result = await sql`
      INSERT INTO live_coding_submissions (challenge_id, participant_id, html_code, css_code)
      VALUES (${challengeId}, ${participantId}, ${htmlCode}, ${cssCode})
      ON CONFLICT (participant_id) 
      DO UPDATE SET 
        html_code = ${htmlCode},
        css_code = ${cssCode},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error submitting code:", error)
    return NextResponse.json({ error: "Failed to submit code" }, { status: 500 })
  }
}
