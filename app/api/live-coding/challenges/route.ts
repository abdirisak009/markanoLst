import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// Generate random access code
function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  try {
    const challenges = await sql`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM live_coding_teams WHERE challenge_id = c.id) as teams_count,
        (SELECT COUNT(*) FROM live_coding_participants WHERE challenge_id = c.id) as participants_count
      FROM live_coding_challenges c
      ORDER BY c.created_at DESC
    `
    return NextResponse.json(challenges)
  } catch (error) {
    console.error("Error fetching challenges:", error)
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, instructions, duration_minutes } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const accessCode = generateAccessCode()

    const result = await sql`
      INSERT INTO live_coding_challenges (title, description, instructions, duration_minutes, access_code, status)
      VALUES (${title}, ${description || ""}, ${instructions || ""}, ${duration_minutes || 30}, ${accessCode}, 'draft')
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating challenge:", error)
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
  }
}
