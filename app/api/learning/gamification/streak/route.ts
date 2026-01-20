import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * GET /api/learning/gamification/streak
 * Get user's daily learning streak
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Get today's streak
    const today = new Date().toISOString().split("T")[0]
    const todayStreak = await sql`
      SELECT * FROM daily_streaks
      WHERE user_id = ${userId} AND streak_date = ${today}
    `

    // Get last 30 days of streaks
    const recentStreaks = await sql`
      SELECT * FROM daily_streaks
      WHERE user_id = ${userId}
      AND streak_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY streak_date DESC
    `

    // Calculate current streak (consecutive days)
    let currentStreak = 0
    const sortedStreaks = recentStreaks.sort((a: any, b: any) => 
      new Date(b.streak_date).getTime() - new Date(a.streak_date).getTime()
    )

    let checkDate = new Date()
    for (const streak of sortedStreaks) {
      const streakDate = new Date(streak.streak_date)
      const daysDiff = Math.floor((checkDate.getTime() - streakDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === currentStreak) {
        currentStreak++
        checkDate = streakDate
      } else {
        break
      }
    }

    return NextResponse.json({
      today_completed: todayStreak.length > 0,
      current_streak: currentStreak,
      recent_streaks: recentStreaks,
      today_data: todayStreak[0] || null,
    })
  } catch (error) {
    console.error("Error fetching streak:", error)
    return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 })
  }
}

/**
 * POST /api/learning/gamification/streak
 * Update daily streak (called when lesson is completed)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, xp_earned } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Get or create today's streak
    let streak = await sql`
      SELECT * FROM daily_streaks
      WHERE user_id = ${user_id} AND streak_date = ${today}
    `

    if (streak.length === 0) {
      streak = await sql`
        INSERT INTO daily_streaks (user_id, streak_date, lessons_completed, xp_earned)
        VALUES (${user_id}, ${today}, 1, ${xp_earned || 0})
        RETURNING *
      `
    } else {
      streak = await sql`
        UPDATE daily_streaks
        SET
          lessons_completed = lessons_completed + 1,
          xp_earned = xp_earned + ${xp_earned || 0}
        WHERE user_id = ${user_id} AND streak_date = ${today}
        RETURNING *
      `
    }

    // Check for streak badges
    const recentStreaks = await sql`
      SELECT COUNT(*) as count FROM daily_streaks
      WHERE user_id = ${user_id}
      AND streak_date >= CURRENT_DATE - INTERVAL '7 days'
    `

    if (parseInt(recentStreaks[0].count) === 7) {
      // Award week streak badge
      await sql`
        INSERT INTO user_badges (user_id, badge_id)
        SELECT ${user_id}, id FROM learning_badges WHERE badge_key = 'week_streak'
        ON CONFLICT (user_id, badge_id) DO NOTHING
      `
    }

    const monthStreaks = await sql`
      SELECT COUNT(*) as count FROM daily_streaks
      WHERE user_id = ${user_id}
      AND streak_date >= CURRENT_DATE - INTERVAL '30 days'
    `

    if (parseInt(monthStreaks[0].count) === 30) {
      // Award month streak badge
      await sql`
        INSERT INTO user_badges (user_id, badge_id)
        SELECT ${user_id}, id FROM learning_badges WHERE badge_key = 'month_streak'
        ON CONFLICT (user_id, badge_id) DO NOTHING
      `
    }

    return NextResponse.json(streak[0])
  } catch (error) {
    console.error("Error updating streak:", error)
    return NextResponse.json({ error: "Failed to update streak" }, { status: 500 })
  }
}
