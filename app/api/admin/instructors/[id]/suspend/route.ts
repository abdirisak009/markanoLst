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
 * PUT /api/admin/instructors/[id]/suspend
 * Admin only: set instructor status to suspended (or back to active if body.unsuspend).
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
    const instructorId = parseInt(id, 10)
    if (Number.isNaN(instructorId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const unsuspend = body.unsuspend === true

    const [instructor] = await sql`
      SELECT id, status FROM instructors WHERE id = ${instructorId} AND deleted_at IS NULL
    `
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const newStatus = unsuspend ? "active" : "suspended"
    await sql`
      UPDATE instructors SET status = ${newStatus}, updated_at = NOW() WHERE id = ${instructorId}
    `

    return NextResponse.json({
      success: true,
      message: unsuspend ? "Instructor unsuspended." : "Instructor suspended.",
      status: newStatus,
    })
  } catch (e) {
    console.error("Suspend instructor error:", e)
    return NextResponse.json(
      { error: "Failed to update instructor status" },
      { status: 500 }
    )
  }
}
