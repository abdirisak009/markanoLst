import { NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const

/**
 * GET /api/learning/schedule?userId=1&courseId=2
 * Returns schedule for user (all courses if no courseId, else one course).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const courseId = searchParams.get("courseId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const studentId = parseInt(userId, 10)
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
    }

    if (courseId) {
      const cid = parseInt(courseId, 10)
      if (Number.isNaN(cid)) {
        return NextResponse.json({ error: "Invalid courseId" }, { status: 400 })
      }
      const rows = await sql`
        SELECT id, student_id, course_id, hours_per_week, schedule, start_date, end_date, created_at, updated_at
        FROM student_course_schedule
        WHERE student_id = ${studentId} AND course_id = ${cid}
        LIMIT 1
      `
      if (rows.length === 0) {
        return NextResponse.json(null)
      }
      const row = rows[0] as { schedule: Record<string, unknown>; start_date: string | null; end_date: string | null }
      return NextResponse.json({
        id: row.id,
        student_id: row.student_id,
        course_id: row.course_id,
        hours_per_week: row.hours_per_week,
        schedule: row.schedule || {},
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })
    }

    const rows = await sql`
      SELECT id, student_id, course_id, hours_per_week, schedule, start_date, end_date, created_at, updated_at
      FROM student_course_schedule
      WHERE student_id = ${studentId}
      ORDER BY updated_at DESC
    `
    return NextResponse.json(
      rows.map((row: any) => ({
        id: row.id,
        student_id: row.student_id,
        course_id: row.course_id,
        hours_per_week: row.hours_per_week,
        schedule: row.schedule || {},
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }))
    )
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}

/**
 * POST /api/learning/schedule
 * Body: { userId, courseId, hours_per_week, schedule: { mon: "09:00", tue: "14:00", ... } }
 * Creates or updates schedule for a course.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, courseId, start_date, end_date, hours_per_week, schedule } = body

    if (!userId || courseId == null) {
      return NextResponse.json({ error: "userId and courseId required" }, { status: 400 })
    }

    const studentId = parseInt(String(userId), 10)
    const cid = parseInt(String(courseId), 10)
    if (Number.isNaN(studentId) || Number.isNaN(cid)) {
      return NextResponse.json({ error: "Invalid userId or courseId" }, { status: 400 })
    }

    const hours = hours_per_week != null ? parseInt(String(hours_per_week), 10) : 0
    const validHours = !Number.isNaN(hours) && hours >= 1 && hours <= 168 ? hours : 10

    const scheduleObj = typeof schedule === "object" && schedule !== null ? schedule : {}
    const normalized: Record<string, { start: string; end: string } | null> = {}
    for (const day of DAY_KEYS) {
      const v = scheduleObj[day]
      if (v === null || v === undefined) {
        normalized[day] = null
      } else if (typeof v === "object" && v !== null && "start" in v && "end" in v) {
        const start = String((v as { start?: string }).start ?? "").trim()
        const end = String((v as { end?: string }).end ?? "").trim()
        if (start && end) normalized[day] = { start, end }
        else normalized[day] = null
      } else {
        const s = String(v).trim()
        if (s) normalized[day] = { start: s, end: s }
        else normalized[day] = null
      }
    }

    const startDateStr = start_date ? String(start_date).trim() || null : null
    const endDateStr = end_date ? String(end_date).trim() || null : null

    const existing = await sql`
      SELECT id FROM student_course_schedule
      WHERE student_id = ${studentId} AND course_id = ${cid}
      LIMIT 1
    `

    if (existing.length > 0) {
      await sql`
        UPDATE student_course_schedule
        SET hours_per_week = ${validHours}, schedule = ${JSON.stringify(normalized)}::jsonb,
            start_date = ${startDateStr}, end_date = ${endDateStr}, updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ${studentId} AND course_id = ${cid}
      `
    } else {
      await sql`
        INSERT INTO student_course_schedule (student_id, course_id, hours_per_week, schedule, start_date, end_date)
        VALUES (${studentId}, ${cid}, ${validHours}, ${JSON.stringify(normalized)}::jsonb, ${startDateStr}, ${endDateStr})
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving schedule:", error)
    return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 })
  }
}
