import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const videoDetails = await sql`
      SELECT 
        v.title as video_title,
        v.category as video_category,
        v.duration as video_duration,
        vwh.watch_duration,
        vwh.completion_percentage,
        vwh.speed_attempts,
        vwh.skipped_count,
        vwh.watched_at as last_watched_at
      FROM video_watch_history vwh
      JOIN videos v ON vwh.video_id = v.id
      WHERE vwh.student_id = ${studentId}
      ORDER BY vwh.watched_at DESC
    `

    return NextResponse.json(videoDetails)
  } catch (error) {
    console.error("Error fetching video details:", error)
    return NextResponse.json({ error: "Failed to fetch video details" }, { status: 500 })
  }
}
