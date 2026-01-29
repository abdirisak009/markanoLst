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
 * PUT /api/admin/instructor-applications/[id]/request-changes
 * Admin only: set application status to changes_requested with message.
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
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const message = body.message?.trim() || body.changes_requested_message?.trim() || "Please update your application as requested."

    const [app] = await sql`
      SELECT id FROM instructor_applications
      WHERE id = ${applicationId} AND deleted_at IS NULL AND status IN ('pending', 'changes_requested')
    `
    if (!app) {
      return NextResponse.json(
        { error: "Application not found or cannot request changes" },
        { status: 404 }
      )
    }

    await sql`
      UPDATE instructor_applications
      SET status = 'changes_requested', changes_requested_message = ${message},
          reviewed_at = NOW(), reviewed_by = ${(admin as { id?: number })?.id ?? null}, updated_at = NOW()
      WHERE id = ${applicationId}
    `

    return NextResponse.json({
      success: true,
      message: "Changes requested. Applicant will see your message.",
    })
  } catch (e) {
    console.error("Request changes instructor application error:", e)
    return NextResponse.json(
      { error: "Failed to request changes" },
      { status: 500 }
    )
  }
}
