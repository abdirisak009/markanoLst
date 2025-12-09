import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const { videoId, studentId, skipFrom, skipTo } = await request.json()

    if (!videoId || !studentId || skipFrom === undefined || skipTo === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)
    const skipAmount = skipTo - skipFrom

    await sql`
      INSERT INTO video_skip_events (video_id, student_id, skip_from, skip_to, skip_amount)
      VALUES (${videoId}, ${studentId}, ${skipFrom}, ${skipTo}, ${skipAmount})
    `

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error logging skip event:", error)
    return Response.json({ error: "Failed to log skip event" }, { status: 500 })
  }
}
