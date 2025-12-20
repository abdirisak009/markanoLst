import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { videoId, studentId, skipFrom, skipTo, eventType, speedFrom, speedTo } = body

    if (!videoId || !studentId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    if (eventType === "speed_change") {
      // Log speed change event
      await sql`
        INSERT INTO video_skip_events (video_id, student_id, event_type, speed_from, speed_to, created_at)
        VALUES (${videoId}, ${studentId}, 'speed_change', ${speedFrom}, ${speedTo}, CURRENT_TIMESTAMP)
      `
      console.log(`[v0] Speed change logged: ${speedFrom}x → ${speedTo}x`)
    } else {
      // Log skip event
      const skipAmount = (skipTo || 0) - (skipFrom || 0)
      await sql`
        INSERT INTO video_skip_events (video_id, student_id, event_type, skip_from, skip_to, skip_amount, created_at)
        VALUES (${videoId}, ${studentId}, 'skip', ${skipFrom}, ${skipTo}, ${skipAmount}, CURRENT_TIMESTAMP)
      `
      console.log(`[v0] Skip logged: ${skipFrom}s → ${skipTo}s (${skipAmount}s)`)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error logging event:", error)
    return Response.json({ error: "Failed to log event" }, { status: 500 })
  }
}
