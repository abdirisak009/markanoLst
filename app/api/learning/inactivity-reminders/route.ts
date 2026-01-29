import { NextResponse } from "next/server"
import postgres from "postgres"
import { sendInactivityReminder1, sendInactivityReminder2 } from "@/lib/whatsapp"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

/**
 * POST /api/learning/inactivity-reminders
 * Check for inactive students and send reminder messages
 * This should be called by a cron job daily
 */
export async function POST(request: Request) {
  try {
    // Check for authorization (optional - you can add API key check here)
    const authHeader = request.headers.get("authorization")
    const expectedKey = process.env.CRON_SECRET_KEY
    
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find students who haven't accessed any course in the last 24 hours
    // Get their most recent course for the reminder message
    const inactiveStudents = await sql`
      SELECT DISTINCT
        gs.id,
        gs.full_name,
        gs.whatsapp_number,
        MAX(ucp.last_accessed_at) as last_activity,
        (
          SELECT lc.title
          FROM user_course_progress ucp2
          JOIN learning_courses lc ON ucp2.course_id = lc.id
          WHERE ucp2.user_id = gs.id
          ORDER BY ucp2.last_accessed_at DESC NULLS LAST
          LIMIT 1
        ) as course_title
      FROM gold_students gs
      LEFT JOIN user_course_progress ucp ON gs.id = ucp.user_id
      WHERE gs.whatsapp_number IS NOT NULL
        AND gs.whatsapp_number != ''
        AND gs.account_status = 'active'
        AND (
          ucp.last_accessed_at IS NULL 
          OR ucp.last_accessed_at < NOW() - INTERVAL '1 day'
        )
      GROUP BY gs.id, gs.full_name, gs.whatsapp_number
      HAVING MAX(ucp.last_accessed_at) IS NULL 
         OR MAX(ucp.last_accessed_at) < NOW() - INTERVAL '1 day'
    `

    const results = {
      checked: inactiveStudents.length,
      sent: 0,
      failed: 0,
      details: [] as Array<{ student: string; status: string; error?: string }>,
    }

    // Send reminder messages to inactive students
    for (const student of inactiveStudents) {
      try {
        // Send first reminder message
        const result1 = await sendInactivityReminder1(
          student.whatsapp_number,
          student.full_name || "Arday"
        )

        if (result1.success) {
          // Wait 30 seconds before sending second message
          await new Promise((resolve) => setTimeout(resolve, 30000))

          // Send second reminder message
          const result2 = await sendInactivityReminder2(
            student.whatsapp_number,
            student.full_name || "Arday",
            student.course_title || undefined,
            student.last_activity || undefined
          )

          if (result2.success) {
            results.sent += 2
            results.details.push({
              student: student.full_name || `Student #${student.id}`,
              status: "success",
            })
          } else {
            results.sent += 1
            results.failed += 1
            results.details.push({
              student: student.full_name || `Student #${student.id}`,
              status: "partial",
              error: result2.error,
            })
          }
        } else {
          results.failed += 2
          results.details.push({
            student: student.full_name || `Student #${student.id}`,
            status: "failed",
            error: result1.error,
          })
        }

        // Add small delay between students to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error: any) {
        results.failed += 2
        results.details.push({
          student: student.full_name || `Student #${student.id}`,
          status: "error",
          error: error.message || "Unknown error",
        })
        console.error(`Error sending reminder to student ${student.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${inactiveStudents.length} inactive students`,
      results,
    })
  } catch (error: any) {
    console.error("Error processing inactivity reminders:", error)
    return NextResponse.json(
      { error: "Failed to process inactivity reminders", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/learning/inactivity-reminders
 * Check status (for testing)
 */
export async function GET() {
  try {
    const inactiveCount = await sql`
      SELECT COUNT(DISTINCT gs.id) as count
      FROM gold_students gs
      LEFT JOIN user_course_progress ucp ON gs.id = ucp.user_id
      WHERE gs.whatsapp_number IS NOT NULL
        AND gs.whatsapp_number != ''
        AND gs.account_status = 'active'
        AND (
          ucp.last_accessed_at IS NULL 
          OR ucp.last_accessed_at < NOW() - INTERVAL '1 day'
        )
      GROUP BY gs.id
      HAVING MAX(ucp.last_accessed_at) IS NULL 
         OR MAX(ucp.last_accessed_at) < NOW() - INTERVAL '1 day'
    `

    return NextResponse.json({
      inactive_students_count: inactiveCount.length,
      message: "Use POST to send reminder messages",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to check inactivity", details: error.message },
      { status: 500 }
    )
  }
}
