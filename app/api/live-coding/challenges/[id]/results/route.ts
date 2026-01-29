import postgres from "postgres"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    // Get teams with their participants and submissions
    const teams = await sql`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        t.color as team_color
      FROM live_coding_teams t
      WHERE t.challenge_id = ${id}
      ORDER BY t.name
    `

    // Get participants and their submissions for each team
    const results = await Promise.all(
      teams.map(async (team) => {
        const participants = await sql`
          SELECT 
            p.id,
            p.student_name,
            p.focus_violations,
            p.is_locked,
            s.html_code,
            s.css_code,
            s.submitted_at
          FROM live_coding_participants p
          LEFT JOIN live_coding_submissions s ON s.participant_id = p.id AND s.is_final = true
          WHERE p.team_id = ${team.team_id}
          ORDER BY s.submitted_at DESC NULLS LAST
        `

        return {
          team_id: team.team_id,
          team_name: team.team_name,
          team_color: team.team_color,
          participants: participants.map((p) => ({
            id: p.id,
            student_name: p.student_name,
            html_code: p.html_code || "",
            css_code: p.css_code || "",
            focus_violations: p.focus_violations || 0,
            is_locked: p.is_locked || false,
            submitted_at: p.submitted_at,
          })),
        }
      }),
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
