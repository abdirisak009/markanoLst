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
 * GET /api/admin/instructor-applications/[id]
 * Admin only: get one application with documents.
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
    const applicationId = parseInt(id, 10)
    if (Number.isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    let app: Record<string, unknown> | null
    try {
      const [row] = await sql`
        SELECT id, full_name, email, phone, cv_url, cv_file_name,
               proposed_courses, bio, experience_years,
               job_experience_years, education, previous_roles, skills_certifications, linkedin_url,
               status, rejection_reason, changes_requested_message,
               reviewed_at, reviewed_by, created_at, updated_at
        FROM instructor_applications
        WHERE id = ${applicationId} AND deleted_at IS NULL
      `
      app = row as Record<string, unknown> | null
    } catch {
      const [row] = await sql`
        SELECT id, full_name, email, phone, cv_url, cv_file_name,
               proposed_courses, bio, experience_years, status,
               rejection_reason, changes_requested_message,
               reviewed_at, reviewed_by, created_at, updated_at
        FROM instructor_applications
        WHERE id = ${applicationId} AND deleted_at IS NULL
      `
      app = row as Record<string, unknown> | null
    }
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const docs = await sql`
      SELECT id, document_type, file_url, file_name, created_at
      FROM instructor_application_documents
      WHERE application_id = ${applicationId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ ...app, documents: docs })
  } catch (e) {
    console.error("Admin instructor-application get error:", e)
    return NextResponse.json(
      { error: "Failed to get application" },
      { status: 500 }
    )
  }
}
