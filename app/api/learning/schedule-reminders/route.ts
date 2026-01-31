import { NextResponse } from "next/server"
import postgres from "postgres"
import { sendScheduleReminder1h } from "@/lib/whatsapp"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const

/**
 * GET: info. POST: run reminder job (cron).
 * 1 saac kahor cashirka: find schedules where today + (scheduled_time - 1h) is now, send WhatsApp.
 */
export async function GET() {
  return NextResponse.json({
    message: "Use POST to send 1h-before-lesson WhatsApp reminders. Run every 15 min via cron.",
  })
}

export async function POST() {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Mogadishu", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
    const parts = formatter.formatToParts(now)
    let weekdayShort = "Sun"
    let hour = 0
    let minute = 0
    for (const p of parts) {
      if (p.type === "weekday") weekdayShort = p.value
      if (p.type === "hour") hour = parseInt(p.value, 10)
      if (p.type === "minute") minute = parseInt(p.value, 10)
    }
    const todayKey = weekdayShort.toLowerCase().slice(0, 3) as (typeof DAY_KEYS)[number]
    const nowMinutes = hour * 60 + minute

    const allSchedules = await sql`
      SELECT scs.id, scs.student_id, scs.course_id, scs.schedule, c.title as course_title,
             gs.full_name, gs.whatsapp_number
      FROM student_course_schedule scs
      JOIN learning_courses c ON c.id = scs.course_id
      JOIN gold_students gs ON gs.id = scs.student_id
      WHERE gs.whatsapp_number IS NOT NULL AND gs.whatsapp_number != ''
    `
    const sent: string[] = []
    for (const row of allSchedules) {
      const schedule = (row.schedule as Record<string, string | null>) || {}
      const timeStr = schedule[todayKey]
      if (!timeStr || !timeStr.trim()) continue

      const [h, m] = timeStr.trim().split(":").map((x) => parseInt(x, 10) || 0)
      const scheduledMinutes = h * 60 + m
      const reminderWindowStart = scheduledMinutes - 60
      const reminderWindowEnd = reminderWindowStart + 15
      if (nowMinutes < reminderWindowStart || nowMinutes >= reminderWindowEnd) continue

      const already = await sql`
        SELECT 1 FROM schedule_reminder_sent
        WHERE student_id = ${row.student_id} AND course_id = ${row.course_id}
          AND scheduled_date = CURRENT_DATE
          AND scheduled_time = ${timeStr}
        LIMIT 1
      `
      if (already.length > 0) continue

      const phone = (row.whatsapp_number as string).trim().replace(/\D/g, "")
      if (phone.length < 8) continue

      const result = await sendScheduleReminder1h(
        row.whatsapp_number as string,
        row.full_name as string,
        row.course_title as string,
        timeStr.trim()
      )
      if (result.success) {
        await sql`
          INSERT INTO schedule_reminder_sent (student_id, course_id, scheduled_date, scheduled_time)
          VALUES (${row.student_id}, ${row.course_id}, CURRENT_DATE, ${timeStr})
          ON CONFLICT (student_id, course_id, scheduled_date, scheduled_time) DO NOTHING
        `
        sent.push(`${row.student_id}-${row.course_id}-${timeStr}`)
      }
    }

    return NextResponse.json({ success: true, sent: sent.length, ids: sent })
  } catch (error) {
    console.error("Schedule reminders error:", error)
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 })
  }
}
