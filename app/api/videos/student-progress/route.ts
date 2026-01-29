import postgres from "postgres"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("student_id")

  if (!studentId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 })
  }

  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    const progress = await sql`
      SELECT 
        video_id,
        completion_percentage,
        last_position,
        watch_duration,
        total_duration
      FROM video_watch_history
      WHERE student_id = ${studentId}
    `

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching student progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
