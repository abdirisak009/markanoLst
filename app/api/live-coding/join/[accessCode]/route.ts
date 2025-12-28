import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ accessCode: string }> }) {
  try {
    const { accessCode } = await params
    const cookieStore = await cookies()

    // Find challenge by access code
    const challenges = await sql`
      SELECT * FROM live_coding_challenges WHERE access_code = ${accessCode}
    `

    if (challenges.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    const challenge = challenges[0]

    // Get student ID from various cookie sources
    const studentId =
      cookieStore.get("studentId")?.value ||
      cookieStore.get("goldStudentId")?.value ||
      cookieStore.get("pennStudentId")?.value

    if (!studentId) {
      return NextResponse.json({ error: "Fadlan soo gal account-kaaga" }, { status: 401 })
    }

    // Find participant
    const participants = await sql`
      SELECT 
        p.*,
        t.name as team_name,
        t.color as team_color
      FROM live_coding_participants p
      JOIN live_coding_teams t ON t.id = p.team_id
      WHERE p.challenge_id = ${challenge.id} AND p.student_id = ${studentId}
    `

    if (participants.length === 0) {
      return NextResponse.json({ error: "Laguma darin challenge-kan" }, { status: 403 })
    }

    const participant = participants[0]

    // Get existing submission if any
    const submissions = await sql`
      SELECT * FROM live_coding_submissions 
      WHERE challenge_id = ${challenge.id} AND participant_id = ${participant.id}
      LIMIT 1
    `

    return NextResponse.json({
      challenge,
      participant,
      submission: submissions[0] || null,
    })
  } catch (error) {
    console.error("Error joining challenge:", error)
    return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 })
  }
}
