import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * POST /api/instructor/revenue/request
 * Instructor only: request payout for amount (must be <= available balance).
 */
export async function POST(request: Request) {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const amount = typeof body.amount === "number" ? body.amount : parseFloat(body.amount)
    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    let instructorRow: { revenue_share_percent?: number | null; minimum_payout_amount?: number | null } | null = null
    try {
      const [row] = await sql`
        SELECT revenue_share_percent, minimum_payout_amount FROM instructors WHERE id = ${instructor.id} AND deleted_at IS NULL
      `
      instructorRow = row as { revenue_share_percent?: number | null; minimum_payout_amount?: number | null }
    } catch {
      const [row] = await sql`
        SELECT revenue_share_percent FROM instructors WHERE id = ${instructor.id} AND deleted_at IS NULL
      `
      instructorRow = row ? { revenue_share_percent: (row as { revenue_share_percent?: number | null }).revenue_share_percent, minimum_payout_amount: null } : null
    }
    const sharePercent = Number(instructorRow?.revenue_share_percent ?? 0) / 100
    const minAmount = instructorRow?.minimum_payout_amount != null ? Number(instructorRow.minimum_payout_amount) : null
    if (minAmount != null && !Number.isNaN(minAmount) && amount < minAmount) {
      return NextResponse.json(
        { error: `Minimum payout amount is $${minAmount.toFixed(2)}. You cannot request less than this.` },
        { status: 400 }
      )
    }

    let totalEarned = 0
    let totalPaid = 0
    try {
      const [earned] = await sql`
        SELECT COALESCE(SUM(cp.amount * ${sharePercent}), 0)::float AS total
        FROM course_payments cp
        JOIN learning_courses lc ON lc.id = cp.course_id AND lc.instructor_id = ${instructor.id}
        WHERE cp.status IN ('completed', 'approved')
      `
      totalEarned = Number(earned?.total ?? 0)
      const [paid] = await sql`
        SELECT COALESCE(SUM(amount_requested), 0)::float AS total
        FROM instructor_payout_requests
        WHERE instructor_id = ${instructor.id} AND status = 'paid'
      `
      totalPaid = Number(paid?.total ?? 0)
    } catch {
      return NextResponse.json({ error: "Could not compute balance" }, { status: 500 })
    }

    const availableBalance = Math.max(0, totalEarned - totalPaid)
    const pendingSum = await sql`
      SELECT COALESCE(SUM(amount_requested), 0)::float AS total
      FROM instructor_payout_requests
      WHERE instructor_id = ${instructor.id} AND status = 'pending'
    `
    const pending = Number(pendingSum[0]?.total ?? 0)
    const availableNow = Math.max(0, availableBalance - pending)

    if (amount > availableNow) {
      return NextResponse.json(
        { error: `Amount exceeds available balance (${availableNow.toFixed(2)}). Reduce amount or wait for pending requests.` },
        { status: 400 }
      )
    }

    await sql`
      INSERT INTO instructor_payout_requests (instructor_id, amount_requested, status)
      VALUES (${instructor.id}, ${amount}, 'pending')
    `

    return NextResponse.json({
      success: true,
      message: "Payout request submitted. Admin will process and mark as paid.",
    })
  } catch (e) {
    console.error("Instructor revenue request error:", e)
    return NextResponse.json(
      { error: "Failed to submit payout request" },
      { status: 500 }
    )
  }
}
