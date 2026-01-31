import { NextResponse } from "next/server"
import postgres from "postgres"
import { sendMissedLessonMessage } from "@/lib/whatsapp"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const

/**
 * GET: info. POST: run missed-lesson job (cron, e.g. end of day).
 * For each schedule where today was a lesson day: if student did not log in / no activity today, send WhatsApp "maanta cashirkaad ka baaqday".
 */
export async function GET() {
  return NextResponse.json({
    message: "Use POST to send missed-lesson WhatsApp notifications. Run once per day (e.g. 22:00 Africa/Mogadishu).",
  })
}

export async function POST() {
  try {
    const now = new Date()
    const mogadishuDateStr = now.toLocaleDateString("en-CA", { timeZone: "Africa/Mogadishu" })
    const [year, month, day] = mogadishuDateStr.split("-").map(Number)
    const weekdayShort = now.toLocaleDateString("en-US", { timeZone: "Africa/Mogadishu", weekday: "short" }).toLowerCase().slice(0, 3) as (typeof DAY_KEYS)[number]
    const todayKey = weekdayShort
    const todayDate = mogadishuDateStr

    const allSchedules = await sql`
      SELECT scs.student_id, scs.course_id, scs.schedule, c.title as course_title,
             gs.full_name, gs.whatsapp_number
      FROM student_course_schedule scs
      JOIN learning_courses c ON c.id = scs.course_id
      JOIN gold_students gs ON gs.id = scs.student_id
      WHERE gs.whatsapp_number IS NOT NULL AND gs.whatsapp_number != ''
    `
    const sent: string[] = []
    for (const row of allSchedules) {
      const schedule = (row.schedule as Record<string, string | { start?: string; end?: string } | null>) || {}
      const dayVal = schedule[todayKey]
      const hasLessonToday =
        dayVal != null &&
        (typeof dayVal === "string" ? !!dayVal.trim() : typeof dayVal === "object" && !!(dayVal.start || dayVal.end))
      if (!hasLessonToday) continue

      const alreadySent = await sql`
        SELECT 1 FROM missed_lesson_whatsapp_sent
        WHERE student_id = ${row.student_id} AND course_id = ${row.course_id} AND lesson_date = ${todayDate}
        LIMIT 1
      `
      if (alreadySent.length > 0) continue

      const progress = await sql`
        SELECT last_accessed_at FROM user_course_progress
        WHERE user_id = ${row.student_id} AND course_id = ${row.course_id}
        LIMIT 1
      `
      const lastAccessed = progress[0]?.last_accessed_at
      const lastDate = lastAccessed ? new Date(lastAccessed).toISOString().slice(0, 10) : null
      if (lastDate === todayDate) continue

      const phone = (row.whatsapp_number as string).trim().replace(/\D/g, "")
      if (phone.length < 8) continue

      const lessonDateFormatted = new Date(todayDate + "T12:00:00").toLocaleDateString("so-SO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const result = await sendMissedLessonMessage(
        row.whatsapp_number as string,
        row.full_name as string,
        row.course_title as string,
        lessonDateFormatted
      )
      if (result.success) {
        await sql`
          INSERT INTO missed_lesson_whatsapp_sent (student_id, course_id, lesson_date)
          VALUES (${row.student_id}, ${row.course_id}, ${todayDate})
          ON CONFLICT (student_id, course_id, lesson_date) DO NOTHING
        `
        sent.push(`${row.student_id}-${row.course_id}`)
      }
    }

    return NextResponse.json({ success: true, sent: sent.length, ids: sent })
  } catch (error) {
    console.error("Missed lesson notifications error:", error)
    return NextResponse.json({ error: "Failed to send missed-lesson notifications" }, { status: 500 })
  }
}
