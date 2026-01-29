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
 * PUT /api/admin/instructors/[id]/reject
 * Admin only: reject application by ID (application id). Stores rejection_reason.
 */
export async function PUT(
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
    const applicationId = parseInt(id, 10)
    if (Number.isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application id" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const rejection_reason = body.rejection_reason?.trim() || "No reason provided."

    const [app] = await sql`
      SELECT id FROM instructor_applications
      WHERE id = ${applicationId} AND deleted_at IS NULL AND status IN ('pending', 'changes_requested')
    `
    if (!app) {
      return NextResponse.json(
        { error: "Application not found or already processed" },
        { status: 404 }
      )
    }

    await sql`
      UPDATE instructor_applications
      SET status = 'rejected', rejection_reason = ${rejection_reason},
          reviewed_at = NOW(), reviewed_by = ${(admin as { id?: number })?.id ?? null}
      WHERE id = ${applicationId}
    `

    return NextResponse.json({
      success: true,
      message: "Application rejected.",
    })
  } catch (e) {
    console.error("Reject instructor application error:", e)
    return NextResponse.json(
      { error: "Failed to reject application" },
      { status: 500 }
    )
  }
}
