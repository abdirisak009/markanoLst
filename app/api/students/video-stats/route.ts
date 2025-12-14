import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Get video watch history statistics
    const videoWatchStats = await sql`
      SELECT 
        COUNT(DISTINCT video_id) as total_videos_watched,
        COALESCE(AVG(completion_percentage), 0) as average_completion,
        COALESCE(SUM(watch_duration), 0) as total_watch_time
      FROM video_watch_history
      WHERE student_id = ${studentId}
    `

    // Get courses in progress
    const coursesInProgress = await sql`
      SELECT COUNT(DISTINCT course_id) as courses_count
      FROM course_enrollments
      WHERE student_id = ${studentId}
      AND completed = false
    `

    // Get lesson progress statistics
    const lessonStats = await sql`
      SELECT 
        COUNT(*) as completed_lessons,
        COALESCE(SUM(watched_duration), 0) as lesson_watch_time
      FROM lesson_progress
      WHERE student_id = ${studentId}
      AND completed = true
    `

    const groupInfo = await sql`
      SELECT 
        g.name as group_name,
        g.id as group_id,
        g.cost_per_member,
        CASE 
          WHEN gp.id IS NOT NULL THEN true
          ELSE false
        END as has_paid
      FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      LEFT JOIN group_payments gp ON gp.group_id = g.id AND gp.student_id = ${studentId}
      WHERE gm.student_id = ${studentId}
      LIMIT 1
    `

    const stats = {
      totalVideosWatched: Number.parseInt(videoWatchStats[0].total_videos_watched) || 0,
      averageCompletion: Number.parseFloat(videoWatchStats[0].average_completion) || 0,
      totalWatchTime:
        Number.parseInt(videoWatchStats[0].total_watch_time) + Number.parseInt(lessonStats[0].lesson_watch_time) || 0,
      coursesInProgress: Number.parseInt(coursesInProgress[0].courses_count) || 0,
      groupName: groupInfo[0]?.group_name || null,
      groupId: groupInfo[0]?.group_id || null,
      costPerMember: groupInfo[0]?.cost_per_member || null,
      hasPaid: groupInfo[0]?.has_paid || false,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching video stats:", error)
    return NextResponse.json({ error: "Failed to fetch video statistics" }, { status: 500 })
  }
}
