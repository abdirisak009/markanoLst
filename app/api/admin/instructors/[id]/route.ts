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
 * GET /api/admin/instructors/[id]
 * Admin only: get instructor by id with courses, university link, documents.
 */
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
    const instructorId = parseInt(id, 10)
    if (Number.isNaN(instructorId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    let instructor: Record<string, unknown> | null = null
    try {
      const [row] = await sql`
        SELECT i.id, i.application_id, i.full_name, i.email, i.phone, i.profile_image_url, i.bio, i.status, i.created_at, i.updated_at,
               i.revenue_share_percent, i.agreement_accepted_at,
               u.name AS university_name, iul.university_id
        FROM instructors i
        LEFT JOIN instructor_university_links iul ON iul.instructor_id = i.id AND iul.is_primary = true
        LEFT JOIN universities u ON u.id = iul.university_id
        WHERE i.id = ${instructorId} AND i.deleted_at IS NULL
      `
      instructor = row as Record<string, unknown>
    } catch (colErr: unknown) {
      const msg = colErr instanceof Error ? colErr.message : String(colErr)
      if (/column.*does not exist|revenue_share_percent|agreement_accepted_at/i.test(msg)) {
        const [row] = await sql`
          SELECT i.id, i.application_id, i.full_name, i.email, i.phone, i.profile_image_url, i.bio, i.status, i.created_at, i.updated_at,
                 u.name AS university_name, iul.university_id
          FROM instructors i
          LEFT JOIN instructor_university_links iul ON iul.instructor_id = i.id AND iul.is_primary = true
          LEFT JOIN universities u ON u.id = iul.university_id
          WHERE i.id = ${instructorId} AND i.deleted_at IS NULL
        `
        instructor = row ? { ...row, revenue_share_percent: null, agreement_accepted_at: null } : null
      } else {
        throw colErr
      }
    }
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const courses = await sql`
      SELECT id, title, slug, is_active, created_at
      FROM learning_courses
      WHERE instructor_id = ${instructorId}
      ORDER BY created_at DESC
    `

    const documents = await sql`
      SELECT id, document_type, file_url, file_name, created_at
      FROM instructor_documents
      WHERE instructor_id = ${instructorId}
      ORDER BY created_at DESC
    `

    const [application] = instructor.application_id
      ? await sql`
          SELECT id, status, created_at FROM instructor_applications WHERE id = ${instructor.application_id}
        `
      : [null]

    return NextResponse.json({
      ...instructor,
      courses,
      documents,
      application: application ?? null,
    })
  } catch (e) {
    console.error("Admin instructor get error:", e)
    return NextResponse.json(
      { error: "Failed to get instructor" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/instructors/[id]
 * Admin only: update instructor (revenue_share_percent).
 */
export async function PATCH(
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
    const revenueShareRaw = body.revenue_share_percent
    const revenueSharePercent =
      revenueShareRaw !== undefined && revenueShareRaw !== null && revenueShareRaw !== ""
        ? parseFloat(String(revenueShareRaw))
        : null
    if (revenueSharePercent != null && (Number.isNaN(revenueSharePercent) || revenueSharePercent < 0 || revenueSharePercent > 100)) {
      return NextResponse.json({ error: "Revenue share must be between 0 and 100" }, { status: 400 })
    }

    const [exists] = await sql`
      SELECT id FROM instructors WHERE id = ${instructorId} AND deleted_at IS NULL
    `
    if (!exists) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    try {
      await sql`
        UPDATE instructors
        SET revenue_share_percent = ${revenueSharePercent}, updated_at = NOW()
        WHERE id = ${instructorId} AND deleted_at IS NULL
      `
    } catch (updateErr: unknown) {
      const msg = updateErr instanceof Error ? updateErr.message : String(updateErr)
      if (/column.*does not exist|revenue_share_percent/i.test(msg)) {
        return NextResponse.json(
          { error: "Database migration required. Run scripts/060-instructor-agreement-revenue.sql." },
          { status: 400 }
        )
      }
      throw updateErr
    }

    const [row] = await sql`
      SELECT id, revenue_share_percent, updated_at FROM instructors WHERE id = ${instructorId} AND deleted_at IS NULL
    `
    return NextResponse.json({ success: true, revenue_share_percent: row?.revenue_share_percent ?? null, updated_at: row?.updated_at })
  } catch (e) {
    console.error("Admin instructor patch error:", e)
    return NextResponse.json(
      { error: "Failed to update instructor" },
      { status: 500 }
    )
  }
}
