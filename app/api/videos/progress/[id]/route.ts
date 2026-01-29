import { type NextRequest, NextResponse } from "next/server"
import postgres from "postgres"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("student_id")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 })
    }

    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    const result = await sql`
      SELECT 
        watch_duration,
        total_duration,
        completion_percentage,
        last_position,
        watched_at
      FROM video_watch_history
      WHERE video_id = ${Number.parseInt(id)}
        AND student_id = ${studentId}
      ORDER BY watched_at DESC
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({
        last_position: 0,
        completion_percentage: 0,
      })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
