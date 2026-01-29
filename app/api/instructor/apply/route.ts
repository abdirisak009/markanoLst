import { NextResponse } from "next/server"
import postgres from "postgres"
import { hashPassword } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

const ALLOWED_STATUSES = ["pending", "changes_requested"] as const

/**
 * POST /api/instructor/apply
 * Public: submit instructor application.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      full_name,
      email,
      phone,
      password,
      cv_url,
      cv_file_name,
      proposed_courses,
      bio,
      experience_years,
      job_experience_years,
      education,
      previous_roles,
      skills_certifications,
      linkedin_url,
    } = body

    if (!full_name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required" },
        { status: 400 }
      )
    }

    const emailLower = email.trim().toLowerCase()
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const password_hash = await hashPassword(password)

    const existing = await sql`
      SELECT id FROM instructor_applications
      WHERE LOWER(email) = ${emailLower} AND status IN ('pending', 'changes_requested')
    `
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An application with this email is already pending. Use login or wait for review." },
        { status: 409 }
      )
    }

    const approved = await sql`
      SELECT id FROM instructors WHERE LOWER(email) = ${emailLower}
    `
    if (approved.length > 0) {
      return NextResponse.json(
        { error: "An instructor account with this email already exists. Please log in." },
        { status: 409 }
      )
    }

    const [app] = await sql`
      INSERT INTO instructor_applications (
        full_name, email, phone, password_hash,
        cv_url, cv_file_name, proposed_courses, bio, experience_years,
        job_experience_years, education, previous_roles, skills_certifications, linkedin_url,
        status
      )
      VALUES (
        ${full_name.trim()},
        ${emailLower},
        ${phone?.trim() || null},
        ${password_hash},
        ${cv_url?.trim() || null},
        ${cv_file_name?.trim() || null},
        ${proposed_courses?.trim() || null},
        ${bio?.trim() || null},
        ${experience_years != null ? Number(experience_years) : null},
        ${job_experience_years != null ? Number(job_experience_years) : null},
        ${education?.trim() || null},
        ${previous_roles?.trim() || null},
        ${skills_certifications?.trim() || null},
        ${linkedin_url?.trim() || null},
        'pending'
      )
      RETURNING id, full_name, email, status, created_at
    `

    return NextResponse.json({
      success: true,
      message: "Application submitted. You will be notified once reviewed.",
      application: {
        id: app.id,
        full_name: app.full_name,
        email: app.email,
        status: app.status,
        created_at: app.created_at,
      },
    })
  } catch (e) {
    console.error("Instructor apply error:", e)
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
}
