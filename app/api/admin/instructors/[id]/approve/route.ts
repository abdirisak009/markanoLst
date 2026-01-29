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
 * PUT /api/admin/instructors/[id]/approve
 * Admin only: approve application by ID (application id). Creates instructor record.
 */
export async function PUT(
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
    const applicationId = parseInt(id, 10)
    if (Number.isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application id" }, { status: 400 })
    }

    const [app] = await sql`
      SELECT id, full_name, email, phone, password_hash, cv_url, cv_file_name, bio, experience_years
      FROM instructor_applications
      WHERE id = ${applicationId} AND deleted_at IS NULL AND status IN ('pending', 'changes_requested')
    `
    if (!app) {
      return NextResponse.json(
        { error: "Application not found or already processed" },
        { status: 404 }
      )
    }

    const existing = await sql`
      SELECT id FROM instructors WHERE LOWER(email) = ${app.email.trim().toLowerCase()} AND deleted_at IS NULL
    `
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An instructor with this email already exists" },
        { status: 409 }
      )
    }

    const [instructor] = await sql`
      INSERT INTO instructors (
        application_id, full_name, email, password_hash, phone, bio, status
      )
      VALUES (
        ${app.id},
        ${app.full_name},
        ${app.email.trim().toLowerCase()},
        ${app.password_hash},
        ${app.phone || null},
        ${app.bio || null},
        'active'
      )
      RETURNING id, full_name, email, status, created_at
    `

    await sql`
      UPDATE instructor_applications
      SET status = 'approved', reviewed_at = NOW(), reviewed_by = ${(admin as { id?: number })?.id ?? null}
      WHERE id = ${applicationId}
    `

    if (app.cv_url) {
      await sql`
        INSERT INTO instructor_documents (instructor_id, document_type, file_url, file_name)
        VALUES (${instructor.id}, 'cv', ${app.cv_url}, ${app.cv_file_name || null})
      `
    }

    return NextResponse.json({
      success: true,
      message: "Application approved. Instructor can now log in.",
      instructor: {
        id: instructor.id,
        full_name: instructor.full_name,
        email: instructor.email,
        status: instructor.status,
        created_at: instructor.created_at,
      },
    })
  } catch (e) {
    console.error("Approve instructor application error:", e)
    return NextResponse.json(
      { error: "Failed to approve application" },
      { status: 500 }
    )
  }
}
