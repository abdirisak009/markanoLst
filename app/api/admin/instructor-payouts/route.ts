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
 * GET /api/admin/instructor-payouts
 * Admin only: list instructor payout requests with instructor name and payment_details.
 */
export async function GET(request: Request) {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status")

    let rows
    if (statusFilter === "pending" || statusFilter === "paid") {
      rows = await sql`
        SELECT pr.id, pr.instructor_id, pr.amount_requested, pr.status, pr.requested_at, pr.paid_at, pr.payment_reference, pr.confirmed_received_at, pr.admin_notes, pr.created_at,
               i.full_name AS instructor_name, i.email, i.payment_details,
               i.revenue_share_percent
        FROM instructor_payout_requests pr
        JOIN instructors i ON i.id = pr.instructor_id AND i.deleted_at IS NULL
        WHERE pr.status = ${statusFilter}
        ORDER BY pr.requested_at DESC
      `
    } else {
      rows = await sql`
        SELECT pr.id, pr.instructor_id, pr.amount_requested, pr.status, pr.requested_at, pr.paid_at, pr.payment_reference, pr.confirmed_received_at, pr.admin_notes, pr.created_at,
               i.full_name AS instructor_name, i.email, i.payment_details,
               i.revenue_share_percent
        FROM instructor_payout_requests pr
        JOIN instructors i ON i.id = pr.instructor_id AND i.deleted_at IS NULL
        ORDER BY pr.requested_at DESC
      `
    }

    const instructorIds = [...new Set(rows.map((r) => r.instructor_id))]
    const shareMap: Record<number, number> = {}
    for (const r of rows) {
      if (r.instructor_id in shareMap) continue
      shareMap[r.instructor_id] = Number((r as { revenue_share_percent?: number | null }).revenue_share_percent ?? 0) / 100
    }
    const balanceMap: Record<number, number> = {}
    for (const instId of instructorIds) {
      try {
        const sharePct = shareMap[instId] ?? 0
        const [earnedRow] = await sql`
          SELECT COALESCE(SUM(cp.amount * ${sharePct}), 0)::float AS total
          FROM course_payments cp
          JOIN learning_courses lc ON lc.id = cp.course_id AND lc.instructor_id = ${instId}
          WHERE cp.status IN ('completed', 'approved')
        `
        const [paidRow] = await sql`
          SELECT COALESCE(SUM(amount_requested), 0)::float AS total
          FROM instructor_payout_requests WHERE instructor_id = ${instId} AND status = 'paid'
        `
        const earned = Number(earnedRow?.total ?? 0)
        const paid = Number(paidRow?.total ?? 0)
        balanceMap[instId] = Math.max(0, earned - paid)
      } catch {
        balanceMap[instId] = 0
      }
    }

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        instructor_id: r.instructor_id,
        instructor_name: r.instructor_name,
        email: r.email,
        payment_details: r.payment_details,
        amount_requested: Number(r.amount_requested),
        status: r.status,
        requested_at: r.requested_at,
        paid_at: r.paid_at,
        payment_reference: r.payment_reference,
        confirmed_received_at: r.confirmed_received_at,
        admin_notes: r.admin_notes,
        created_at: r.created_at,
        instructor_balance: balanceMap[r.instructor_id] ?? 0,
      }))
    )
  } catch (e) {
    console.error("Admin instructor payouts error:", e)
    return NextResponse.json(
      { error: "Failed to load payouts" },
      { status: 500 }
    )
  }
}
