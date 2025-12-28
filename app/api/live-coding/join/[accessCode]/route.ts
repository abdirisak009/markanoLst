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

    const participantId = cookieStore.get(`live_coding_participant_${challenge.id}`)?.value

    if (participantId) {
      // Already joined - get their data
      const participants = await sql`
        SELECT 
          p.*,
          t.name as team_name,
          t.color as team_color
        FROM live_coding_participants p
        JOIN live_coding_teams t ON t.id = p.team_id
        WHERE p.id = ${participantId}
      `

      if (participants.length > 0) {
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
          joined: true,
        })
      }
    }

    const teams = await sql`
      SELECT 
        t.id, 
        t.name, 
        t.color,
        COALESCE(t.is_locked, false) as is_locked,
        COUNT(p.id)::int as member_count
      FROM live_coding_teams t
      LEFT JOIN live_coding_participants p ON p.team_id = t.id
      WHERE t.challenge_id = ${challenge.id}
      GROUP BY t.id, t.name, t.color, t.is_locked
      ORDER BY t.name
    `

    return NextResponse.json({
      challenge,
      teams,
      joined: false,
    })
  } catch (error) {
    console.error("Error fetching challenge:", error)
    return NextResponse.json({ error: "Failed to load challenge" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ accessCode: string }> }) {
  try {
    const { accessCode } = await params
    const body = await request.json()
    const { teamId } = body

    if (!teamId) {
      return NextResponse.json({ error: "Fadlan dooro team-kaaga" }, { status: 400 })
    }

    // Find challenge by access code
    const challenges = await sql`
      SELECT * FROM live_coding_challenges WHERE access_code = ${accessCode}
    `

    if (challenges.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    const challenge = challenges[0]

    // Check if challenge is accepting participants
    if (challenge.status === "ended") {
      return NextResponse.json({ error: "Challenge-kan wuu dhamaaday" }, { status: 400 })
    }

    const teams = await sql`
      SELECT * FROM live_coding_teams WHERE id = ${teamId} AND challenge_id = ${challenge.id}
    `

    if (teams.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const team = teams[0]

    if (team.is_locked) {
      return NextResponse.json(
        {
          error: "Team-kan waa la doortay! Fadlan dooro team kale.",
          teamLocked: true,
        },
        { status: 400 },
      )
    }

    // Check if user already joined via cookie
    const cookieStore = await cookies()
    const existingParticipantId = cookieStore.get(`live_coding_participant_${challenge.id}`)?.value

    if (existingParticipantId) {
      // Already joined - return existing participant
      const existingParticipants = await sql`
        SELECT 
          p.*,
          t.name as team_name,
          t.color as team_color
        FROM live_coding_participants p
        JOIN live_coding_teams t ON t.id = p.team_id
        WHERE p.id = ${existingParticipantId}
      `

      if (existingParticipants.length > 0) {
        const submissions = await sql`
          SELECT * FROM live_coding_submissions 
          WHERE challenge_id = ${challenge.id} AND participant_id = ${existingParticipantId}
          LIMIT 1
        `

        return NextResponse.json({
          challenge,
          participant: existingParticipants[0],
          submission: submissions[0] || null,
          joined: true,
          rejoined: true,
        })
      }
    }

    const generatedName = team.name

    // Create new participant with team name
    const uniqueStudentId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newParticipants = await sql`
      INSERT INTO live_coding_participants (challenge_id, team_id, student_id, student_name)
      VALUES (${challenge.id}, ${teamId}, ${uniqueStudentId}, ${generatedName})
      RETURNING *
    `

    const newParticipant = newParticipants[0]

    await sql`
      UPDATE live_coding_teams SET is_locked = true WHERE id = ${teamId}
    `

    // Get full participant with team info
    const fullParticipant = await sql`
      SELECT 
        p.*,
        t.name as team_name,
        t.color as team_color
      FROM live_coding_participants p
      JOIN live_coding_teams t ON t.id = p.team_id
      WHERE p.id = ${newParticipant.id}
    `

    // Set cookie to remember this participant
    cookieStore.set(`live_coding_participant_${challenge.id}`, newParticipant.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({
      challenge,
      participant: fullParticipant[0],
      submission: null,
      joined: true,
    })
  } catch (error) {
    console.error("Error joining challenge:", error)
    return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 })
  }
}
