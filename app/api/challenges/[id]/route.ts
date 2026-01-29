import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// GET - Fetch single challenge with participants
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: challengeId } = await params

    const [challenge] = await sql`
      SELECT * FROM challenges WHERE id = ${challengeId}
    `

    if (!challenge) {
      return Response.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Get participants
    const participants = await sql`
      SELECT 
        cp.*,
        CASE 
          WHEN cp.participant_type = 'class' THEN c.name
          WHEN cp.participant_type = 'group' THEN g.name
        END as participant_name
      FROM challenge_participants cp
      LEFT JOIN classes c ON cp.participant_type = 'class' AND cp.participant_id = c.id
      LEFT JOIN groups g ON cp.participant_type = 'group' AND cp.participant_id = g.id
      WHERE cp.challenge_id = ${challengeId}
    `

    return Response.json({ challenge, participants })
  } catch (error) {
    console.error("[v0] Error fetching challenge:", error)
    return Response.json({ error: "Failed to fetch challenge" }, { status: 500 })
  }
}

// PATCH - Update challenge
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: challengeId } = await params
    const body = await request.json()
    const { status, current_round } = body

    let challenge

    if (status && current_round) {
      ;[challenge] = await sql`
        UPDATE challenges 
        SET status = ${status}, current_round = ${current_round}
        WHERE id = ${challengeId} 
        RETURNING *
      `
    } else if (status) {
      ;[challenge] = await sql`
        UPDATE challenges 
        SET status = ${status}
        WHERE id = ${challengeId} 
        RETURNING *
      `
    } else if (current_round) {
      ;[challenge] = await sql`
        UPDATE challenges 
        SET current_round = ${current_round}
        WHERE id = ${challengeId} 
        RETURNING *
      `
    } else {
      return Response.json({ error: "No updates provided" }, { status: 400 })
    }

    return Response.json({ challenge })
  } catch (error) {
    console.error("[v0] Error updating challenge:", error)
    return Response.json({ error: "Failed to update challenge" }, { status: 500 })
  }
}
