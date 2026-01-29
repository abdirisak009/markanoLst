import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * PATCH /api/instructor/revenue/payment-details
 * Instructor only: update payment_details (bank account, mobile money, etc.).
 */
export async function PATCH(request: Request) {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const paymentDetails = typeof body.payment_details === "string" ? body.payment_details : (body.payment_details != null ? String(body.payment_details) : null)

    await sql`
      UPDATE instructors
      SET payment_details = ${paymentDetails}, updated_at = NOW()
      WHERE id = ${instructor.id} AND deleted_at IS NULL
    `

    return NextResponse.json({
      success: true,
      message: "Payment details updated. Admin will use this to send your payout.",
    })
  } catch (e) {
    console.error("Instructor payment details update error:", e)
    return NextResponse.json(
      { error: "Failed to update payment details" },
      { status: 500 }
    )
  }
}
