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
      speed_changes = 0,
      is_valid_watch = true,
    } = body

    console.log("[v0] Tracking video progress:", {
      video_id,
      student_id,
      watch_duration,
      completion_percentage,
      skipped_count,
      speed_changes,
      is_valid_watch,
    })

    // First ensure columns exist
    try {
      await sql`ALTER TABLE video_watch_history ADD COLUMN IF NOT EXISTS speed_changes INTEGER DEFAULT 0`
      await sql`ALTER TABLE video_watch_history ADD COLUMN IF NOT EXISTS is_valid_watch BOOLEAN DEFAULT true`
    } catch (e) {
      // Columns may already exist
    }

    const result = await sql`
      INSERT INTO video_watch_history 
        (video_id, student_id, watch_duration, total_duration, completion_percentage, last_position, skipped_count, speed_changes, is_valid_watch, watched_at)
      VALUES 
        (${video_id}, ${student_id}, ${watch_duration}, ${total_duration}, ${completion_percentage}, ${last_position}, ${skipped_count}, ${speed_changes}, ${is_valid_watch}, CURRENT_TIMESTAMP)
      ON CONFLICT (video_id, student_id)
      DO UPDATE SET
        watch_duration = GREATEST(video_watch_history.watch_duration, ${watch_duration}),
        total_duration = ${total_duration},
        completion_percentage = GREATEST(video_watch_history.completion_percentage, ${completion_percentage}),
        last_position = GREATEST(video_watch_history.last_position, ${last_position}),
        skipped_count = video_watch_history.skipped_count + ${skipped_count},
        speed_changes = video_watch_history.speed_changes + ${speed_changes},
        is_valid_watch = ${is_valid_watch},
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
