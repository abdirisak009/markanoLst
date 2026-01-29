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
 * POST /api/admin/enrollments/[id]/reject
 * Reject enrollment request
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication (admin_token from login API, or adminSession for compatibility)
    let admin = await getAdminFromCookies()
    if (!admin) {
      const cookieStore = await cookies()
      const adminSession = cookieStore.get("adminSession")?.value
      if (adminSession !== "true") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      // Session cookie present – allow action (same fallback as GET /api/admin/enrollments)
      admin = { id: 0, username: "admin", role: "admin" }
    }

    const { id } = await params
    const enrollmentId = parseInt(id)

    // Get enrollment details
    const enrollment = await sql`
      SELECT * FROM course_payments
      WHERE id = ${enrollmentId}
    `

    if (enrollment.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment[0].status !== "pending") {
      return NextResponse.json({ error: "Enrollment is not pending" }, { status: 400 })
    }

    // Update enrollment status to rejected
    await sql`
      UPDATE course_payments
      SET status = 'failed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${enrollmentId}
    `

    return NextResponse.json({ success: true, message: "Enrollment rejected" })
  } catch (error: any) {
    console.error("Error rejecting enrollment:", error)
    return NextResponse.json({ error: "Failed to reject enrollment" }, { status: 500 })
  }
}
