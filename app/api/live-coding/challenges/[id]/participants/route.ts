import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeCode = searchParams.get("includeCode") === "true"

    let participants

    if (includeCode) {
      participants = await sql`
        SELECT 
          p.*,
          t.name as team_name,
          t.color as team_color,
          s.html_code,
          s.css_code
        FROM live_coding_participants p
        JOIN live_coding_teams t ON t.id = p.team_id
        LEFT JOIN live_coding_submissions s ON s.participant_id = p.id
        WHERE p.challenge_id = ${id}
        ORDER BY t.name, p.student_name
      `
    } else {
      participants = await sql`
        SELECT 
          p.*,
          t.name as team_name,
          t.color as team_color
        FROM live_coding_participants p
        JOIN live_coding_teams t ON t.id = p.team_id
        WHERE p.challenge_id = ${id}
        ORDER BY t.name, p.student_name
      `
    }

    return NextResponse.json(participants)
  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { teamId, students } = body

    if (!teamId || !students || !Array.isArray(students)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    for (const student of students) {
      await sql`
        INSERT INTO live_coding_participants (challenge_id, team_id, student_id, student_name, student_type)
        VALUES (${id}, ${teamId}, ${student.student_id}, ${student.student_name}, ${student.student_type || "university"})
        ON CONFLICT DO NOTHING
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding participants:", error)
    return NextResponse.json({ error: "Failed to add participants" }, { status: 500 })
  }
}
