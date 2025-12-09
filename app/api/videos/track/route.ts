import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      video_id,
      student_id,
      watch_duration,
      total_duration,
      completion_percentage,
      last_position,
      skipped_count = 0,
    } = body

    console.log("[v0] Tracking video progress:", {
      video_id,
      student_id,
      watch_duration,
      completion_percentage,
      skipped_count,
    })

    const result = await sql`
      INSERT INTO video_watch_history 
        (video_id, student_id, watch_duration, total_duration, completion_percentage, last_position, skipped_count, watched_at)
      VALUES 
        (${video_id}, ${student_id}, ${watch_duration}, ${total_duration}, ${completion_percentage}, ${last_position}, ${skipped_count}, CURRENT_TIMESTAMP)
      ON CONFLICT (video_id, student_id)
      DO UPDATE SET
        watch_duration = GREATEST(video_watch_history.watch_duration, ${watch_duration}),
        total_duration = ${total_duration},
        completion_percentage = GREATEST(video_watch_history.completion_percentage, ${completion_percentage}),
        last_position = GREATEST(video_watch_history.last_position, ${last_position}),
        skipped_count = video_watch_history.skipped_count + ${skipped_count},
        watched_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    console.log("[v0] Progress saved successfully")
    return NextResponse.json(
      { success: true, data: result[0] },
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("[v0] Error tracking video:", error)
    return NextResponse.json(
      { error: "Failed to track video progress" },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
