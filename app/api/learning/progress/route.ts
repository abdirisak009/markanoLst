import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { checkMilestoneBadges } from "@/lib/learning/badge-service"
import {
  sendLessonCompletionMessage,
  sendModuleCompletionMessage,
  sendCourseCompletionMessage,
} from "@/lib/whatsapp"

const sql = neon(process.env.DATABASE_URL!)

/**
 * POST /api/learning/progress
 * Update lesson progress (video watched, quiz completed, task completed)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      user_id,
      lesson_id,
      video_watched,
      video_progress_percentage,
      quiz_completed,
      quiz_score,
      task_completed,
    } = body

    if (!user_id || !lesson_id) {
      return NextResponse.json({ error: "user_id and lesson_id are required" }, { status: 400 })
    }

    // Get lesson details
    const lesson = await sql`
      SELECT l.*, m.course_id
      FROM learning_lessons l
      JOIN learning_modules m ON l.module_id = m.id
      WHERE l.id = ${lesson_id}
    `

    if (lesson.length === 0) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const courseId = lesson[0].course_id

    // Get or create lesson progress
    let progress = await sql`
      SELECT * FROM user_lesson_progress
      WHERE user_id = ${user_id} AND lesson_id = ${lesson_id}
    `

    const now = new Date()
    const status =
      video_watched && quiz_completed && task_completed
        ? "completed"
        : video_watched || quiz_completed || task_completed
          ? "in_progress"
          : "not_started"

    if (progress.length === 0) {
      // Create new progress
      progress = await sql`
        INSERT INTO user_lesson_progress (
          user_id, lesson_id, status, video_watched, video_progress_percentage,
          quiz_completed, quiz_score, task_completed, started_at
        )
        VALUES (
          ${user_id}, ${lesson_id}, ${status},
          ${video_watched || false}, ${video_progress_percentage || 0},
          ${quiz_completed || false}, ${quiz_score || 0},
          ${task_completed || false}, ${now}
        )
        RETURNING *
      `
    } else {
      // Update existing progress
      progress = await sql`
        UPDATE user_lesson_progress
        SET
          status = ${status},
          video_watched = COALESCE(${video_watched}, video_watched),
          video_progress_percentage = COALESCE(${video_progress_percentage}, video_progress_percentage),
          quiz_completed = COALESCE(${quiz_completed}, quiz_completed),
          quiz_score = COALESCE(${quiz_score}, quiz_score),
          task_completed = COALESCE(${task_completed}, task_completed),
          completed_at = CASE WHEN ${status} = 'completed' AND completed_at IS NULL THEN ${now} ELSE completed_at END,
          last_accessed_at = ${now}
        WHERE user_id = ${user_id} AND lesson_id = ${lesson_id}
        RETURNING *
      `
    }

    // If lesson completed, award XP and update course progress
    if (status === "completed" && progress[0].completed_at) {
      // Award XP
      await sql`
        INSERT INTO user_xp (user_id, xp_amount, source_type, source_id, description)
        VALUES (
          ${user_id},
          ${lesson[0].xp_reward},
          'lesson_completion',
          ${lesson_id},
          'Completed lesson: ' || ${lesson[0].title}
        )
      `

      // Update XP summary
      await sql`
        INSERT INTO user_xp_summary (user_id, total_xp)
        VALUES (${user_id}, ${lesson[0].xp_reward})
        ON CONFLICT (user_id) DO UPDATE
        SET total_xp = user_xp_summary.total_xp + ${lesson[0].xp_reward}
      `

      // Recalculate level
      await recalculateLevel(user_id)

      // Check and award milestone badges
      try {
        const awardedBadges = await checkMilestoneBadges(user_id)
        // Badges are automatically awarded by the service
      } catch (error) {
        console.error("Error checking badges:", error)
        // Don't fail the request if badge check fails
      }

      // Send WhatsApp notification for lesson completion
      try {
        const student = await sql`
          SELECT full_name, whatsapp_number FROM gold_students WHERE id = ${user_id}
        `
        const course = await sql`
          SELECT title FROM learning_courses WHERE id = ${courseId}
        `
        
        if (student.length > 0 && student[0].whatsapp_number && course.length > 0) {
          await sendLessonCompletionMessage(
            student[0].whatsapp_number,
            student[0].full_name || "Arday",
            lesson[0].title,
            course[0].title
          )
        }
      } catch (error) {
        console.error("Error sending lesson completion WhatsApp:", error)
        // Don't fail the request if WhatsApp fails
      }
    }

    // Update course progress
    const courseProgressResult = await updateCourseProgress(user_id, courseId)
    
    // Check for module completion
    if (status === "completed" && progress[0].completed_at) {
      await checkModuleCompletion(user_id, lesson[0].module_id, courseId)
    }
    
    // Check for course completion
    if (courseProgressResult.isCourseCompleted) {
      try {
        const student = await sql`
          SELECT full_name, whatsapp_number FROM gold_students WHERE id = ${user_id}
        `
        const course = await sql`
          SELECT title FROM learning_courses WHERE id = ${courseId}
        `
        
        if (student.length > 0 && student[0].whatsapp_number && course.length > 0) {
          await sendCourseCompletionMessage(
            student[0].whatsapp_number,
            student[0].full_name || "Arday",
            course[0].title
          )
        }
      } catch (error) {
        console.error("Error sending course completion WhatsApp:", error)
        // Don't fail the request if WhatsApp fails
      }
    }

    return NextResponse.json(progress[0])
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}

/**
 * Helper: Recalculate user level based on total XP
 */
async function recalculateLevel(userId: number) {
  const summary = await sql`
    SELECT total_xp FROM user_xp_summary WHERE user_id = ${userId}
  `

  if (summary.length === 0) return

  const totalXp = summary[0].total_xp

  // Find current level
  const level = await sql`
    SELECT * FROM learning_levels
    WHERE xp_required <= ${totalXp}
    ORDER BY xp_required DESC
    LIMIT 1
  `

  if (level.length > 0) {
    const currentLevel = level[0].level_number

    // Get next level XP requirement
    const nextLevel = await sql`
      SELECT xp_required FROM learning_levels
      WHERE level_number = ${currentLevel + 1}
    `

    const xpToNext = nextLevel.length > 0
      ? nextLevel[0].xp_required - totalXp
      : 0

    await sql`
      UPDATE user_xp_summary
      SET
        current_level = ${currentLevel},
        xp_to_next_level = ${xpToNext},
        last_calculated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `
  }
}

/**
 * Helper: Update course progress
 */
async function updateCourseProgress(userId: number, courseId: number): Promise<{ isCourseCompleted: boolean }> {
  // Count completed lessons
  const completed = await sql`
    SELECT COUNT(*) as count
    FROM user_lesson_progress ulp
    JOIN learning_lessons l ON ulp.lesson_id = l.id
    JOIN learning_modules m ON l.module_id = m.id
    WHERE ulp.user_id = ${userId}
    AND m.course_id = ${courseId}
    AND ulp.status = 'completed'
  `

  // Count total lessons
  const total = await sql`
    SELECT COUNT(*) as count
    FROM learning_lessons l
    JOIN learning_modules m ON l.module_id = m.id
    WHERE m.course_id = ${courseId} AND l.is_active = true
  `

  const completedCount = parseInt(completed[0].count)
  const totalCount = parseInt(total[0].count)
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const isCourseCompleted = progressPercentage === 100

  // Find next lesson to continue
  const nextLesson = await sql`
    SELECT l.id
    FROM learning_lessons l
    JOIN learning_modules m ON l.module_id = m.id
    LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = ${userId}
    WHERE m.course_id = ${courseId}
    AND l.is_active = true
    AND (ulp.status IS NULL OR ulp.status != 'completed')
    ORDER BY m.order_index, l.order_index
    LIMIT 1
  `

  const currentLessonId = nextLesson.length > 0 ? nextLesson[0].id : null

  // Check if course was just completed (wasn't completed before)
  const existingProgress = await sql`
    SELECT completed_at FROM user_course_progress
    WHERE user_id = ${userId} AND course_id = ${courseId}
  `
  const wasAlreadyCompleted = existingProgress.length > 0 && existingProgress[0].completed_at !== null

  // Update or create course progress
  await sql`
    INSERT INTO user_course_progress (
      user_id, course_id, progress_percentage, lessons_completed,
      total_lessons, current_lesson_id, last_accessed_at
    )
    VALUES (
      ${userId}, ${courseId}, ${progressPercentage}, ${completedCount},
      ${totalCount}, ${currentLessonId}, CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id, course_id) DO UPDATE
    SET
      progress_percentage = ${progressPercentage},
      lessons_completed = ${completedCount},
      total_lessons = ${totalCount},
      current_lesson_id = ${currentLessonId},
      last_accessed_at = CURRENT_TIMESTAMP,
      started_at = COALESCE(user_course_progress.started_at, CURRENT_TIMESTAMP),
      completed_at = CASE WHEN ${progressPercentage} = 100 THEN CURRENT_TIMESTAMP ELSE user_course_progress.completed_at END
  `

  return { isCourseCompleted: isCourseCompleted && !wasAlreadyCompleted }
}

/**
 * Helper: Check if module is completed and send notification
 */
async function checkModuleCompletion(userId: number, moduleId: number, courseId: number) {
  try {
    // Count completed lessons in module
    const completed = await sql`
      SELECT COUNT(*) as count
      FROM user_lesson_progress ulp
      JOIN learning_lessons l ON ulp.lesson_id = l.id
      WHERE ulp.user_id = ${userId}
      AND l.module_id = ${moduleId}
      AND ulp.status = 'completed'
    `

    // Count total lessons in module
    const total = await sql`
      SELECT COUNT(*) as count
      FROM learning_lessons l
      WHERE l.module_id = ${moduleId} AND l.is_active = true
    `

    const completedCount = parseInt(completed[0].count)
    const totalCount = parseInt(total[0].count)

    // If all lessons in module are completed
    if (completedCount === totalCount && totalCount > 0) {
      // Get module and course details
      const module = await sql`
        SELECT title FROM learning_modules WHERE id = ${moduleId}
      `
      const course = await sql`
        SELECT title FROM learning_courses WHERE id = ${courseId}
      `
      const student = await sql`
        SELECT full_name, whatsapp_number FROM gold_students WHERE id = ${userId}
      `

      if (
        module.length > 0 &&
        course.length > 0 &&
        student.length > 0 &&
        student[0].whatsapp_number
      ) {
        await sendModuleCompletionMessage(
          student[0].whatsapp_number,
          student[0].full_name || "Arday",
          module[0].title,
          course[0].title
        )
      }
    }
  } catch (error) {
    console.error("Error checking module completion:", error)
    // Don't fail the request if module check fails
  }
}
