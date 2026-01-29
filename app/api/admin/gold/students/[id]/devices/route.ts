import { NextResponse } from "next/server"
import postgres from "postgres"
import { getAdminFromCookies } from "@/lib/auth"
import { cookies } from "next/headers"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/** GET /api/admin/gold/students/[id]/devices – list allowed devices for a student (admin only). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const studentId = parseInt(id, 10)
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student id" }, { status: 400 })
    }

    const devices = await sql`
      SELECT id, student_id, device_id, device_label, last_used_at, created_at
      FROM gold_student_devices
      WHERE student_id = ${studentId}
      ORDER BY last_used_at DESC
    `

    return NextResponse.json(devices)
  } catch (e) {
    console.error("Error listing student devices:", e)
    return NextResponse.json({ error: "Failed to list devices" }, { status: 500 })
  }
}

/** DELETE /api/admin/gold/students/[id]/devices – remove one device so student can add a new one (admin only). */
export async function DELETE(
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
    const studentId = parseInt(id, 10)
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student id" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const deviceRowId = body.id ?? body.device_row_id
    if (deviceRowId == null || Number.isNaN(Number(deviceRowId))) {
      return NextResponse.json(
        { error: "Body must include id (gold_student_devices row id)" },
        { status: 400 }
      )
    }

    const deleted = await sql`
      DELETE FROM gold_student_devices
      WHERE id = ${Number(deviceRowId)} AND student_id = ${studentId}
      RETURNING id
    `

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Device not found or not owned by this student" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, removed: deleted[0].id })
  } catch (e) {
    console.error("Error removing student device:", e)
    return NextResponse.json({ error: "Failed to remove device" }, { status: 500 })
  }
}
