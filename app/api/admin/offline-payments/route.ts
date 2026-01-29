import { NextResponse } from "next/server"
import postgres from "postgres"
import { cookies } from "next/headers"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

/**
 * GET /api/admin/offline-payments
 * Get all offline payments with user and course details
 */
export async function GET() {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin_token")?.value

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch offline payments with user and course details
    const payments = await sql`
      SELECT 
        cp.*,
        gs.full_name as user_name,
        gs.email as user_email,
        lc.title as course_title
      FROM course_payments cp
      LEFT JOIN gold_students gs ON cp.user_id = gs.id
      LEFT JOIN learning_courses lc ON cp.course_id = lc.id
      WHERE cp.payment_method = 'offline'
      ORDER BY cp.created_at DESC
    `

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error("Error fetching offline payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
