import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("studentId")

  if (!studentId) {
    return Response.json({ error: "Student ID is required" }, { status: 400 })
  }

  try {
    // Count completed videos (completion >= 80%)
    const completedVideos = await sql`
      SELECT COUNT(*) as count
      FROM video_watch_history
      WHERE student_id = ${studentId}
      AND completion_percentage >= 80
    `

    const videosCount = Number.parseInt(completedVideos[0].count)
    const eligibleBonusMarks = Math.floor(videosCount / 2)

    // Get current awarded marks
    const currentAwards = await sql`
      SELECT 
        COALESCE(SUM(bonus_marks), 0) as total_awarded,
        COALESCE(MAX(videos_completed), 0) as last_videos_count
      FROM video_watch_awards
      WHERE student_id = ${studentId}
    `

    const totalAwarded = Number.parseInt(currentAwards[0].total_awarded)
    const lastVideosCount = Number.parseInt(currentAwards[0].last_videos_count)

    // Calculate new bonus marks to award
    const newBonusMarks = eligibleBonusMarks - totalAwarded

    return Response.json({
      studentId,
      videosCompleted: videosCount,
      eligibleBonusMarks,
      totalAwarded,
      newBonusMarks,
      lastVideosCount,
    })
  } catch (error) {
    console.error("Error fetching video awards:", error)
    return Response.json({ error: "Failed to fetch video awards" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json()

    if (!studentId) {
      return Response.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Count completed videos (completion >= 80%)
    const completedVideos = await sql`
      SELECT COUNT(*) as count
      FROM video_watch_history
      WHERE student_id = ${studentId}
      AND completion_percentage >= 80
    `

    const videosCount = Number.parseInt(completedVideos[0].count)
    const eligibleBonusMarks = Math.floor(videosCount / 2)

    // Get current awarded marks
    const currentAwards = await sql`
      SELECT COALESCE(SUM(bonus_marks), 0) as total_awarded
      FROM video_watch_awards
      WHERE student_id = ${studentId}
    `

    const totalAwarded = Number.parseInt(currentAwards[0].total_awarded)
    const newBonusMarks = eligibleBonusMarks - totalAwarded

    if (newBonusMarks <= 0) {
      return Response.json({
        message: "No new bonus marks to award",
        videosCompleted: videosCount,
        bonusMarks: 0,
      })
    }

    // Award new bonus marks
    await sql`
      INSERT INTO video_watch_awards (student_id, videos_completed, bonus_marks)
      VALUES (${studentId}, ${videosCount}, ${newBonusMarks})
    `

    return Response.json({
      success: true,
      message: `Awarded ${newBonusMarks} bonus mark(s) for completing ${videosCount} videos`,
      videosCompleted: videosCount,
      bonusMarks: newBonusMarks,
      totalBonusMarks: totalAwarded + newBonusMarks,
    })
  } catch (error) {
    console.error("Error awarding video bonus marks:", error)
    return Response.json({ error: "Failed to award bonus marks" }, { status: 500 })
  }
}
