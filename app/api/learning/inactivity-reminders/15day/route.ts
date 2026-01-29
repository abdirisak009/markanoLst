import { NextResponse } from "next/server"
import postgres from "postgres"
import { sendInactivity15DayWarning } from "@/lib/whatsapp"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

const INACTIVITY_DAYS = 15

/**
 * POST /api/learning/inactivity-reminders/15day
 * Find gold students with no lesson activity for 15+ days, send professional WhatsApp:
 * "Akoonkaaga waa la xirmi doonaa haduu sii wadan waayo waxbarashada."
 * Call from cron daily (e.g. same cron as inactivity-reminders).
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const expectedKey = process.env.CRON_SECRET_KEY
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let inactive15: { id: number; full_name: string; whatsapp_number: string; last_accessed: string | null }[]
    try {
      inactive15 = await sql`
      WITH last_activity AS (
        SELECT
          gs.id,
          gs.full_name,
          gs.whatsapp_number,
          MAX(ucp.last_accessed_at) AS last_accessed
        FROM gold_students gs
        LEFT JOIN user_course_progress ucp ON ucp.user_id = gs.id
        WHERE gs.account_status = 'active'
          AND gs.whatsapp_number IS NOT NULL
          AND gs.whatsapp_number != ''
        GROUP BY gs.id, gs.full_name, gs.whatsapp_number
      ),
      last_warning AS (
        SELECT student_id, MAX(sent_at) AS last_sent
        FROM inactivity_15day_warning_sent
        GROUP BY student_id
      )
      SELECT la.id, la.full_name, la.whatsapp_number, la.last_accessed
      FROM last_activity la
      LEFT JOIN last_warning lw ON lw.student_id = la.id
      WHERE (
        la.last_accessed IS NULL
        OR la.last_accessed < NOW() - INTERVAL '1 day' * ${INACTIVITY_DAYS}
      )
      AND (
        lw.last_sent IS NULL
        OR lw.last_sent <= COALESCE(la.last_accessed, '1970-01-01'::timestamptz)
      )
    `
    } catch (queryErr: unknown) {
      const msg = String(queryErr)
      if (msg.includes("does not exist") || msg.includes("relation")) {
        return NextResponse.json(
          { error: "Table inactivity_15day_warning_sent missing. Run scripts/057-inactivity-15day-warning.sql" },
          { status: 503 }
        )
      }
      throw queryErr
    }

    const results = {
      checked: inactive15.length,
      sent: 0,
      failed: 0,
      details: [] as Array<{ student: string; status: string; error?: string }>,
    }

    for (const student of inactive15) {
      try {
        let phone = (student.whatsapp_number as string).trim().replace(/\D/g, "")
        if (!phone.startsWith("252")) {
          if (phone.startsWith("0")) phone = phone.slice(1)
          phone = "252" + phone
        }

        const result = await sendInactivity15DayWarning(
          phone,
          (student.full_name as string) || "Arday"
        )

        if (result.success) {
          try {
            await sql`
              INSERT INTO inactivity_15day_warning_sent (student_id)
              VALUES (${student.id})
            `
          } catch (tableErr: unknown) {
            const msg = String(tableErr)
            if (!msg.includes("does not exist") && !msg.includes("relation")) {
              console.warn("inactivity_15day_warning_sent insert failed:", tableErr)
            }
          }
          results.sent += 1
          results.details.push({
            student: (student.full_name as string) || `Student #${student.id}`,
            status: "sent",
          })
        } else {
          results.failed += 1
          results.details.push({
            student: (student.full_name as string) || `Student #${student.id}`,
            status: "failed",
            error: result.error,
          })
        }

        await new Promise((r) => setTimeout(r, 2000))
      } catch (err: unknown) {
        results.failed += 1
        results.details.push({
          student: (student.full_name as string) || `Student #${student.id}`,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        })
        console.error(`15-day warning send error for student ${student.id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `15-day inactivity: processed ${inactive15.length} students`,
      results,
    })
  } catch (err: unknown) {
    console.error("15-day inactivity reminders error:", err)
    return NextResponse.json(
      { error: "Failed to process 15-day inactivity reminders" },
      { status: 500 }
    )
  }
}

/**
 * GET – for testing / status
 */
export async function GET() {
  try {
    const count = await sql`
      WITH last_activity AS (
        SELECT gs.id, MAX(ucp.last_accessed_at) AS last_accessed
        FROM gold_students gs
        LEFT JOIN user_course_progress ucp ON ucp.user_id = gs.id
        WHERE gs.account_status = 'active' AND gs.whatsapp_number IS NOT NULL AND gs.whatsapp_number != ''
        GROUP BY gs.id
      ),
      last_warning AS (
        SELECT student_id, MAX(sent_at) AS last_sent FROM inactivity_15day_warning_sent GROUP BY student_id
      )
      SELECT COUNT(*)::int AS c
      FROM last_activity la
      LEFT JOIN last_warning lw ON lw.student_id = la.id
      WHERE (la.last_accessed IS NULL OR la.last_accessed < NOW() - INTERVAL '1 day' * ${INACTIVITY_DAYS})
        AND (lw.last_sent IS NULL OR lw.last_sent <= COALESCE(la.last_accessed, '1970-01-01'::timestamptz))
    `.then((r) => r[0]?.c ?? 0)

    return NextResponse.json({
      students_15day_inactive_eligible_for_warning: count,
      message: "Use POST to send 15-day inactivity warnings via WhatsApp",
    })
  } catch (e) {
    const msg = String(e)
    if (msg.includes("does not exist") || msg.includes("relation")) {
      return NextResponse.json({
        students_15day_inactive_eligible_for_warning: 0,
        message: "Run scripts/057-inactivity-15day-warning.sql first. Use POST to send warnings.",
      })
    }
    return NextResponse.json({ error: "Check failed" }, { status: 500 })
  }
}
