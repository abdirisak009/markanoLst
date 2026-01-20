import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

/**
 * POST /api/admin/offline-payments/[id]/reject
 * Reject offline payment
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin_token")?.value

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const paymentId = parseInt(id)

    // Get payment details
    const payment = await sql`
      SELECT * FROM course_payments
      WHERE id = ${paymentId} AND payment_method = 'offline'
    `

    if (payment.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment[0].status !== "pending") {
      return NextResponse.json({ error: "Payment is not pending" }, { status: 400 })
    }

    // Update payment status to failed
    await sql`
      UPDATE course_payments
      SET status = 'failed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${paymentId}
    `

    return NextResponse.json({ success: true, message: "Payment rejected" })
  } catch (error: any) {
    console.error("Error rejecting payment:", error)
    return NextResponse.json({ error: "Failed to reject payment" }, { status: 500 })
  }
}
