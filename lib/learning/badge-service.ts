/**
 * Badge Service
 * Automatically awards badges based on user achievements
 * Call this after significant events (lesson completion, course completion, etc.)
 */

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

interface BadgeAwardResult {
  awarded: boolean
  badge_key: string
  badge_name: string
  xp_reward: number
}

/**
 * Check and award milestone badges
 */
export async function checkMilestoneBadges(userId: number): Promise<BadgeAwardResult[]> {
  const awarded: BadgeAwardResult[] = []

  // Check first lesson badge
  const firstLesson = await sql`
    SELECT COUNT(*) as count FROM user_lesson_progress
    WHERE user_id = ${userId} AND status = 'completed'
  `
  if (parseInt(firstLesson[0].count) === 1) {
    const result = await awardBadge(userId, "first_lesson")
    if (result) awarded.push(result)
  }

  // Check first module badge (completed all lessons in a module)
  const modulesCompleted = await sql`
    SELECT m.id, COUNT(DISTINCT l.id) as total_lessons,
           COUNT(DISTINCT ulp.lesson_id) as completed_lessons
    FROM learning_modules m
    JOIN learning_lessons l ON m.id = l.module_id
    LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = ${userId} AND ulp.status = 'completed'
    GROUP BY m.id
    HAVING COUNT(DISTINCT l.id) = COUNT(DISTINCT ulp.lesson_id)
    LIMIT 1
  `
  if (modulesCompleted.length > 0) {
    const result = await awardBadge(userId, "first_module")
    if (result) awarded.push(result)
  }

  // Check first course badge
  const coursesCompleted = await sql`
    SELECT COUNT(*) as count FROM user_course_progress
    WHERE user_id = ${userId} AND progress_percentage = 100
  `
  if (parseInt(coursesCompleted[0].count) === 1) {
    const result = await awardBadge(userId, "first_course")
    if (result) awarded.push(result)
  }

  // Check quiz master badge (all quizzes perfect)
  const perfectQuizzes = await sql`
    SELECT COUNT(DISTINCT q.lesson_id) as perfect_lessons
    FROM lesson_quizzes q
    JOIN quiz_submissions qs ON q.id = qs.quiz_id
    WHERE qs.user_id = ${userId} AND qs.is_correct = true
    GROUP BY q.lesson_id
    HAVING COUNT(q.id) = COUNT(CASE WHEN qs.is_correct THEN 1 END)
  `
  if (perfectQuizzes.length >= 10) {
    const result = await awardBadge(userId, "quiz_master")
    if (result) awarded.push(result)
  }

  // Check speed learner badge (10 lessons in one day)
  const todayLessons = await sql`
    SELECT COUNT(*) as count FROM user_lesson_progress
    WHERE user_id = ${userId}
    AND completed_at::date = CURRENT_DATE
    AND status = 'completed'
  `
  if (parseInt(todayLessons[0].count) >= 10) {
    const result = await awardBadge(userId, "speed_learner")
    if (result) awarded.push(result)
  }

  return awarded
}

/**
 * Award a specific badge to a user
 */
async function awardBadge(
  userId: number,
  badgeKey: string
): Promise<BadgeAwardResult | null> {
  try {
    // Get badge
    const badge = await sql`
      SELECT * FROM learning_badges WHERE badge_key = ${badgeKey}
    `

    if (badge.length === 0) return null

    // Check if already earned
    const existing = await sql`
      SELECT * FROM user_badges
      WHERE user_id = ${userId} AND badge_id = ${badge[0].id}
    `

    if (existing.length > 0) return null

    // Award badge
    await sql`
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (${userId}, ${badge[0].id})
    `

    // Award XP if badge has reward
    if (badge[0].xp_reward > 0) {
      await sql`
        INSERT INTO user_xp (user_id, xp_amount, source_type, source_id, description)
        VALUES (
          ${userId},
          ${badge[0].xp_reward},
          'badge',
          ${badge[0].id},
          'Earned badge: ' || ${badge[0].badge_name}
        )
      `

      // Update XP summary
      await sql`
        INSERT INTO user_xp_summary (user_id, total_xp)
        VALUES (${userId}, ${badge[0].xp_reward})
        ON CONFLICT (user_id) DO UPDATE
        SET total_xp = user_xp_summary.total_xp + ${badge[0].xp_reward}
      `
    }

    return {
      awarded: true,
      badge_key: badge[0].badge_key,
      badge_name: badge[0].badge_name,
      xp_reward: badge[0].xp_reward,
    }
  } catch (error) {
    console.error(`Error awarding badge ${badgeKey}:`, error)
    return null
  }
}
