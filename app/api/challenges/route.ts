import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET - Fetch all challenges
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const scope = searchParams.get("scope")

    let challenges

    if (!status && !scope) {
      // No filters
      challenges = await sql`
        SELECT 
          c.*,
          COUNT(DISTINCT cp.id) as participant_count,
          COUNT(DISTINCT cs.student_id) as submission_count
        FROM challenges c
        LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
        LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
        GROUP BY c.id 
        ORDER BY c.created_at DESC
      `
    } else if (status && scope) {
      // Both filters
      challenges = await sql`
        SELECT 
          c.*,
          COUNT(DISTINCT cp.id) as participant_count,
          COUNT(DISTINCT cs.student_id) as submission_count
        FROM challenges c
        LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
        LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
        WHERE c.status = ${status} AND c.scope = ${scope}
        GROUP BY c.id 
        ORDER BY c.created_at DESC
      `
    } else if (status) {
      // Status filter only
      challenges = await sql`
        SELECT 
          c.*,
          COUNT(DISTINCT cp.id) as participant_count,
          COUNT(DISTINCT cs.student_id) as submission_count
        FROM challenges c
        LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
        LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
        WHERE c.status = ${status}
        GROUP BY c.id 
        ORDER BY c.created_at DESC
      `
    } else {
      // Scope filter only
      challenges = await sql`
        SELECT 
          c.*,
          COUNT(DISTINCT cp.id) as participant_count,
          COUNT(DISTINCT cs.student_id) as submission_count
        FROM challenges c
        LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
        LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
        WHERE c.scope = ${scope}
        GROUP BY c.id 
        ORDER BY c.created_at DESC
      `
    }

    return Response.json({ challenges })
  } catch (error) {
    console.error("[v0] Error fetching challenges:", error)
    return Response.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}

// POST - Create new challenge
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      type,
      scope,
      start_date,
      end_date,
      max_score,
      total_rounds,
      participants, // array of {type: 'class'|'group', id: number}
      created_by,
    } = body

    // Insert challenge
    const [challenge] = await sql`
      INSERT INTO challenges (
        title, description, type, scope, start_date, end_date,
        max_score, total_rounds, created_by
      ) VALUES (
        ${title}, ${description}, ${type}, ${scope}, ${start_date}, ${end_date},
        ${max_score || 100}, ${total_rounds || 1}, ${created_by}
      )
      RETURNING *
    `

    // Insert participants
    if (participants && participants.length > 0) {
      for (const participant of participants) {
        await sql`
          INSERT INTO challenge_participants (
            challenge_id, participant_type, participant_id
          ) VALUES (
            ${challenge.id}, ${participant.type}, ${participant.id}
          )
        `
      }
    }

    return Response.json({ challenge }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating challenge:", error)
    return Response.json({ error: "Failed to create challenge" }, { status: 500 })
  }
}
