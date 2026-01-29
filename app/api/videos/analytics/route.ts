import { NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("student_id")

    let analytics
    if (studentId) {
      // Filter by specific student
      analytics = await sql`
        SELECT 
          vwh.video_id,
          v.title as video_title,
          v.category,
          vwh.student_id,
          us.full_name as student_name,
          u.name as university_name,
          c.name as class_name,
          vwh.watch_duration,
          vwh.total_duration,
          vwh.completion_percentage,
          vwh.skipped_count,
          vwh.speed_attempts,
          vwh.watched_at,
          vwh.last_position
        FROM video_watch_history vwh
        LEFT JOIN videos v ON vwh.video_id = v.id
        LEFT JOIN university_students us ON vwh.student_id = us.student_id
        LEFT JOIN universities u ON us.university_id = u.id
        LEFT JOIN classes c ON us.class_id = c.id
        WHERE vwh.student_id = ${studentId}
        ORDER BY vwh.watched_at DESC
      `
    } else {
      // Return all analytics if no student_id specified
      analytics = await sql`
        SELECT 
          vwh.video_id,
          v.title as video_title,
          v.category,
          vwh.student_id,
          us.full_name as student_name,
          u.name as university_name,
          c.name as class_name,
          vwh.watch_duration,
          vwh.total_duration,
          vwh.completion_percentage,
          vwh.skipped_count,
          vwh.speed_attempts,
          vwh.watched_at,
          vwh.last_position
        FROM video_watch_history vwh
        LEFT JOIN videos v ON vwh.video_id = v.id
        LEFT JOIN university_students us ON vwh.student_id = us.student_id
        LEFT JOIN universities u ON us.university_id = u.id
        LEFT JOIN classes c ON us.class_id = c.id
        ORDER BY vwh.watched_at DESC
      `
    }

    let skipEvents
    if (studentId) {
      skipEvents = await sql`
        SELECT 
          video_id,
          student_id,
          skip_from,
          skip_to,
          skip_amount,
          skipped_at
        FROM video_skip_events
        WHERE student_id = ${studentId}
        ORDER BY skipped_at DESC
      `
    } else {
      skipEvents = await sql`
        SELECT 
          video_id,
          student_id,
          skip_from,
          skip_to,
          skip_amount,
          skipped_at
        FROM video_skip_events
        ORDER BY skipped_at DESC
      `
    }

    const analyticsWithSkips = analytics.map((record: any) => {
      const videoSkips = skipEvents.filter(
        (skip: any) => skip.video_id === record.video_id && skip.student_id === record.student_id,
      )

      // Calculate total skips and total skipped seconds
      const totalSkips = videoSkips.length
      const totalSkippedSeconds = videoSkips.reduce((sum: number, skip: any) => sum + (skip.skip_amount || 0), 0)

      return {
        ...record,
        skip_events: videoSkips,
        total_skips: totalSkips,
        total_skipped_seconds: totalSkippedSeconds,
      }
    })

    return NextResponse.json(analyticsWithSkips, {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
