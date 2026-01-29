import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * POST /api/instructor/revenue/confirm-receipt
 * Instructor only: confirm that a paid payout was received (payout_id in body).
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
    const payoutId = typeof body.payout_id === "number" ? body.payout_id : parseInt(body.payout_id, 10)
    if (Number.isNaN(payoutId)) {
      return NextResponse.json({ error: "payout_id is required" }, { status: 400 })
    }

    const [row] = await sql`
      SELECT id, status, paid_at
      FROM instructor_payout_requests
      WHERE id = ${payoutId} AND instructor_id = ${instructor.id}
    `
    if (!row) {
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 })
    }
    if (row.status !== "paid") {
      return NextResponse.json({ error: "Only paid payouts can be confirmed" }, { status: 400 })
    }
    if (!row.paid_at) {
      return NextResponse.json({ error: "Payout not marked as paid yet" }, { status: 400 })
    }

    await sql`
      UPDATE instructor_payout_requests
      SET confirmed_received_at = NOW(), updated_at = NOW()
      WHERE id = ${payoutId} AND instructor_id = ${instructor.id}
    `

    return NextResponse.json({
      success: true,
      message: "Receipt confirmed. Thank you.",
    })
  } catch (e) {
    console.error("Instructor confirm receipt error:", e)
    return NextResponse.json(
      { error: "Failed to confirm receipt" },
      { status: 500 }
    )
  }
}
