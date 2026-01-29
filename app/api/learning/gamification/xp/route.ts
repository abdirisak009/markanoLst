import { NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

/**
 * GET /api/learning/gamification/xp
 * Get user XP summary and level
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Get XP summary
    let summary = await sql`
      SELECT * FROM user_xp_summary WHERE user_id = ${userId}
    `

    if (summary.length === 0) {
      // Initialize if doesn't exist
      await sql`
        INSERT INTO user_xp_summary (user_id, total_xp, current_level, xp_to_next_level)
        VALUES (${userId}, 0, 1, 100)
      `
      summary = await sql`
        SELECT * FROM user_xp_summary WHERE user_id = ${userId}
      `
    }

    // Get current level details
    const level = await sql`
      SELECT * FROM learning_levels
      WHERE level_number = ${summary[0].current_level}
    `

    // Get recent XP history
    const recentXp = await sql`
      SELECT * FROM user_xp
      WHERE user_id = ${userId}
      ORDER BY earned_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      ...summary[0],
      level_info: level[0] || null,
      recent_xp: recentXp,
    })
  } catch (error) {
    console.error("Error fetching XP:", error)
    return NextResponse.json({ error: "Failed to fetch XP" }, { status: 500 })
  }
}
