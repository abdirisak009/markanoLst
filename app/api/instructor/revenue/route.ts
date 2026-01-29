import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/revenue
 * Instructor only: total earned (from completed course payments × revenue_share %),
 * total paid, available balance, payout requests, payment_details.
 */
export async function GET() {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const [instructorRow] = await sql`
      SELECT revenue_share_percent, payment_details
      FROM instructors
      WHERE id = ${instructor.id} AND deleted_at IS NULL
    `
    const sharePercent = Number(instructorRow?.revenue_share_percent ?? 0) / 100

    let totalEarned = 0
    try {
      const [earned] = await sql`
        SELECT COALESCE(SUM(cp.amount * ${sharePercent}), 0)::float AS total
        FROM course_payments cp
        JOIN learning_courses lc ON lc.id = cp.course_id AND lc.instructor_id = ${instructor.id}
        WHERE cp.status IN ('completed', 'approved')
      `
      totalEarned = Number(earned?.total ?? 0)
    } catch {
      // course_payments or join might fail
    }

    let totalPaid = 0
    let payouts: Array<{
      id: number
      amount_requested: number
      status: string
      requested_at: string
      paid_at: string | null
      payment_reference: string | null
      confirmed_received_at: string | null
    }> = []
    try {
      const paidRow = await sql`
        SELECT COALESCE(SUM(amount_requested), 0)::float AS total
        FROM instructor_payout_requests
        WHERE instructor_id = ${instructor.id} AND status = 'paid'
      `
      totalPaid = Number(paidRow[0]?.total ?? 0)
      payouts = await sql`
        SELECT id, amount_requested, status, requested_at, paid_at, payment_reference, confirmed_received_at
        FROM instructor_payout_requests
        WHERE instructor_id = ${instructor.id}
        ORDER BY created_at DESC
      `
    } catch {
      // table might not exist yet
    }

    const availableBalance = Math.max(0, totalEarned - totalPaid)

    return NextResponse.json({
      total_earned: totalEarned,
      total_paid: totalPaid,
      available_balance: availableBalance,
      revenue_share_percent: instructorRow?.revenue_share_percent ?? null,
      payment_details: instructorRow?.payment_details ?? null,
      payouts: payouts.map((p) => ({
        id: p.id,
        amount_requested: Number(p.amount_requested),
        status: p.status,
        requested_at: p.requested_at,
        paid_at: p.paid_at,
        payment_reference: p.payment_reference,
        confirmed_received_at: p.confirmed_received_at,
      })),
    })
  } catch (e) {
    console.error("Instructor revenue get error:", e)
    return NextResponse.json(
      { error: "Failed to load revenue" },
      { status: 500 }
    )
  }
}
