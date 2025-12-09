import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const analytics = await sql`
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

    const skipEvents = await sql`
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

    // Add skip events to analytics
    const analyticsWithSkips = analytics.map((record: any) => ({
      ...record,
      skip_events: skipEvents.filter(
        (skip: any) => skip.video_id === record.video_id && skip.student_id === record.student_id,
      ),
    }))

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
