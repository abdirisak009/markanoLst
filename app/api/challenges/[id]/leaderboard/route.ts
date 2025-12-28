import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: challengeId } = await params

    // Calculate rankings from submissions
    const leaderboard = await sql`
      SELECT 
        cs.student_id,
        us.full_name as student_name,
        us.class_id,
        c.name as class_name,
        SUM(cs.score) as total_score,
        COUNT(cs.id) as submission_count,
        MAX(cs.submitted_at) as last_submission,
        RANK() OVER (ORDER BY SUM(cs.score) DESC) as rank
      FROM challenge_submissions cs
      JOIN university_students us ON cs.student_id = us.student_id
      LEFT JOIN classes c ON us.class_id = c.id
      WHERE cs.challenge_id = ${challengeId}
      GROUP BY cs.student_id, us.full_name, us.class_id, c.name
      ORDER BY total_score DESC
    `

    // Update rankings table
    for (const entry of leaderboard) {
      await sql`
        INSERT INTO challenge_rankings (
          challenge_id, student_id, total_score, rank
        ) VALUES (
          ${challengeId}, ${entry.student_id}, ${entry.total_score}, ${entry.rank}
        )
        ON CONFLICT (challenge_id, student_id)
        DO UPDATE SET 
          total_score = ${entry.total_score},
          rank = ${entry.rank},
          last_updated = CURRENT_TIMESTAMP
      `
    }

    return Response.json({ leaderboard })
  } catch (error) {
    console.error("[v0] Error fetching leaderboard:", error)
    return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
