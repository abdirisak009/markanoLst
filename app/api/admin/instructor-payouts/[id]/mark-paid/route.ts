import { NextResponse } from "next/server"
import postgres from "postgres"
import { getAdminFromCookies } from "@/lib/auth"
import { cookies } from "next/headers"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * POST /api/admin/instructor-payouts/[id]/mark-paid
 * Admin only: mark payout request as paid (payment_reference optional).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const payoutId = parseInt(id, 10)
    if (Number.isNaN(payoutId)) {
      return NextResponse.json({ error: "Invalid payout id" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const paymentReference = typeof body.payment_reference === "string" ? body.payment_reference : null
    const adminNotes = typeof body.admin_notes === "string" ? body.admin_notes : null

    const [row] = await sql`
      SELECT id, status FROM instructor_payout_requests WHERE id = ${payoutId}
    `
    if (!row) {
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 })
    }
    if (row.status === "paid") {
      return NextResponse.json({ error: "Already marked as paid" }, { status: 400 })
    }

    await sql`
      UPDATE instructor_payout_requests
      SET status = 'paid', paid_at = NOW(), payment_reference = ${paymentReference}, admin_notes = ${adminNotes}, updated_at = NOW()
      WHERE id = ${payoutId}
    `

    return NextResponse.json({
      success: true,
      message: "Payout marked as paid. Instructor can confirm receipt.",
    })
  } catch (e) {
    console.error("Admin mark payout paid error:", e)
    return NextResponse.json(
      { error: "Failed to update payout" },
      { status: 500 }
    )
  }
}
