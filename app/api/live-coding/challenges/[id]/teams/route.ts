import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const teams = await sql`
      SELECT 
        t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'student_id', p.student_id,
              'student_name', p.student_name,
              'student_type', p.student_type,
              'is_active', p.is_active
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as participants
      FROM live_coding_teams t
      LEFT JOIN live_coding_participants p ON p.team_id = t.id
      WHERE t.challenge_id = ${id}
      GROUP BY t.id
      ORDER BY t.name
    `

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.createDefault) {
      // Create Team A and Team B
      await sql`
        INSERT INTO live_coding_teams (challenge_id, name, color)
        VALUES 
          (${id}, 'Team A', '#3b82f6'),
          (${id}, 'Team B', '#ef4444')
      `
      return NextResponse.json({ success: true })
    }

    const { name, color } = body
    const result = await sql`
      INSERT INTO live_coding_teams (challenge_id, name, color)
      VALUES (${id}, ${name}, ${color || "#3b82f6"})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}
