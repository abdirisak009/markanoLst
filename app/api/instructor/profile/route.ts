import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/profile
 * Instructor only: get my profile.
 */
export async function GET() {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const [row] = await sql`
      SELECT id, full_name, email, phone, profile_image_url, bio, status, created_at, updated_at
      FROM instructors
      WHERE id = ${instructor.id} AND deleted_at IS NULL
    `
    if (!row) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const [link] = await sql`
      SELECT u.id AS university_id, u.name AS university_name
      FROM instructor_university_links iul
      JOIN universities u ON u.id = iul.university_id
      WHERE iul.instructor_id = ${instructor.id} AND iul.is_primary = true
    `

    return NextResponse.json({
      ...row,
      university_id: link?.university_id ?? null,
      university_name: link?.university_name ?? null,
    })
  } catch (e) {
    console.error("Instructor profile GET error:", e)
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/instructor/profile
 * Instructor only: update my profile (bio, phone, profile_image_url).
 */
export async function PUT(request: Request) {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { bio, phone, profile_image_url } = body

    const [current] = await sql`
      SELECT bio, phone, profile_image_url FROM instructors WHERE id = ${instructor.id} AND deleted_at IS NULL
    `
    if (!current) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const newBio = bio !== undefined ? (bio === null ? null : String(bio)) : current.bio
    const newPhone = phone !== undefined ? (phone === null ? null : String(phone)) : current.phone
    const newProfileImageUrl = profile_image_url !== undefined ? (profile_image_url === null ? null : String(profile_image_url)) : current.profile_image_url

    await sql`
      UPDATE instructors
      SET bio = ${newBio}, phone = ${newPhone}, profile_image_url = ${newProfileImageUrl}, updated_at = NOW()
      WHERE id = ${instructor.id} AND deleted_at IS NULL
    `

    const [row] = await sql`
      SELECT id, full_name, email, phone, profile_image_url, bio, status, updated_at
      FROM instructors
      WHERE id = ${instructor.id} AND deleted_at IS NULL
    `
    return NextResponse.json(row ?? {})
  } catch (e) {
    console.error("Instructor profile PUT error:", e)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
