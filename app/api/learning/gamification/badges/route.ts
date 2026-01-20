import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * GET /api/learning/gamification/badges
 * Get user badges
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Get user badges
    const userBadges = await sql`
      SELECT 
        ub.*,
        b.badge_key,
        b.badge_name,
        b.badge_icon,
        b.description,
        b.badge_type,
        b.xp_reward
      FROM user_badges ub
      JOIN learning_badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ${userId}
      ORDER BY ub.earned_at DESC
    `

    // Get all available badges
    const allBadges = await sql`
      SELECT * FROM learning_badges
      ORDER BY badge_type, id
    `

    // Mark which badges user has earned
    const earnedBadgeIds = new Set(userBadges.map((b: any) => b.badge_id))
    const badgesWithStatus = allBadges.map((badge: any) => ({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
      earned_at: userBadges.find((ub: any) => ub.badge_id === badge.id)?.earned_at || null,
    }))

    return NextResponse.json({
      earned: userBadges,
      all_badges: badgesWithStatus,
    })
  } catch (error) {
    console.error("Error fetching badges:", error)
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 })
  }
}

/**
 * POST /api/learning/gamification/badges
 * Award badge to user (called automatically by system)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, badge_key } = body

    if (!user_id || !badge_key) {
      return NextResponse.json({ error: "user_id and badge_key are required" }, { status: 400 })
    }

    // Get badge
    const badge = await sql`
      SELECT * FROM learning_badges WHERE badge_key = ${badge_key}
    `

    if (badge.length === 0) {
      return NextResponse.json({ error: "Badge not found" }, { status: 404 })
    }

    // Check if already earned
    const existing = await sql`
      SELECT * FROM user_badges
      WHERE user_id = ${user_id} AND badge_id = ${badge[0].id}
    `

    if (existing.length > 0) {
      return NextResponse.json({ message: "Badge already earned", badge: existing[0] })
    }

    // Award badge
    const result = await sql`
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (${user_id}, ${badge[0].id})
      RETURNING *
    `

    // Award XP if badge has reward
    if (badge[0].xp_reward > 0) {
      await sql`
        INSERT INTO user_xp (user_id, xp_amount, source_type, source_id, description)
        VALUES (
          ${user_id},
          ${badge[0].xp_reward},
          'badge',
          ${badge[0].id},
          'Earned badge: ' || ${badge[0].badge_name}
        )
      `

      // Update XP summary
      await sql`
        INSERT INTO user_xp_summary (user_id, total_xp)
        VALUES (${user_id}, ${badge[0].xp_reward})
        ON CONFLICT (user_id) DO UPDATE
        SET total_xp = user_xp_summary.total_xp + ${badge[0].xp_reward}
      `
    }

    return NextResponse.json({
      success: true,
      badge: result[0],
      xp_awarded: badge[0].xp_reward,
    })
  } catch (error) {
    console.error("Error awarding badge:", error)
    return NextResponse.json({ error: "Failed to award badge" }, { status: 500 })
  }
}
