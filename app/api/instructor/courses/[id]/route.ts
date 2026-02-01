import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"
import { instructorMustAcceptAgreement } from "@/lib/agreement"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/courses/[id]
 * Instructor only: get my course (404 if not owner).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const courseId = parseInt(id, 10)
    if (Number.isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course id" }, { status: 400 })
    }

    const [course] = await sql`
      SELECT id, title, slug, description, thumbnail_url, instructor_name,
             estimated_duration_minutes, difficulty_level, price, is_active, is_featured,
             order_index, instructor_id, created_at, updated_at
      FROM learning_courses
      WHERE id = ${courseId} AND instructor_id = ${instructor.id}
    `
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const modules = await sql`
      SELECT m.id, m.title, m.description, m.order_index, m.is_active,
             COUNT(l.id)::int AS lessons_count
      FROM learning_modules m
      LEFT JOIN learning_lessons l ON l.module_id = m.id AND l.is_active = true
      WHERE m.course_id = ${courseId}
      GROUP BY m.id
      ORDER BY m.order_index ASC
    `

    return NextResponse.json({ ...course, modules })
  } catch (e) {
    console.error("Instructor course get error:", e)
    return NextResponse.json(
      { error: "Failed to load course" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/instructor/courses/[id]
 * Instructor only: update my course (404 if not owner).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const courseId = parseInt(id, 10)
    if (Number.isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course id" }, { status: 400 })
    }

    const [current] = await sql`
      SELECT title, slug, description, thumbnail_url, estimated_duration_minutes, difficulty_level, price, is_active, is_featured, order_index
      FROM learning_courses WHERE id = ${courseId} AND instructor_id = ${instructor.id}
    `
    if (!current) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (await instructorMustAcceptAgreement(sql, instructor.id)) {
      return NextResponse.json(
        { error: "You must accept the Instructor Agreement before updating courses or publishing.", requires_agreement: true },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const title = body.title !== undefined ? String(body.title).trim() : current.title
    const slug = body.slug !== undefined ? String(body.slug).trim().toLowerCase().replace(/\s+/g, "-") : current.slug
    const description = body.description !== undefined ? body.description : current.description
    const thumbnail_url = body.thumbnail_url !== undefined ? body.thumbnail_url : current.thumbnail_url
    const estimated_duration_minutes = body.estimated_duration_minutes !== undefined ? Number(body.estimated_duration_minutes) : current.estimated_duration_minutes
    const difficulty_level = body.difficulty_level === "intermediate" || body.difficulty_level === "advanced" ? body.difficulty_level : (body.difficulty_level !== undefined ? "beginner" : current.difficulty_level)
    const price = body.price !== undefined ? Number(body.price) : current.price
    const is_active = body.is_active !== undefined ? Boolean(body.is_active) : current.is_active
    const is_featured = body.is_featured !== undefined ? Boolean(body.is_featured) : current.is_featured
    const order_index = body.order_index !== undefined ? Number(body.order_index) : current.order_index

    const [course] = await sql`
      UPDATE learning_courses
      SET title = ${title}, slug = ${slug}, description = ${description}, thumbnail_url = ${thumbnail_url},
          estimated_duration_minutes = ${estimated_duration_minutes}, difficulty_level = ${difficulty_level},
          price = ${price}, is_active = ${is_active}, is_featured = ${is_featured}, order_index = ${order_index},
          updated_at = NOW()
      WHERE id = ${courseId} AND instructor_id = ${instructor.id}
      RETURNING id, title, slug, description, thumbnail_url, instructor_name,
                estimated_duration_minutes, difficulty_level, price, is_active, is_featured,
                order_index, instructor_id, created_at, updated_at
    `

    return NextResponse.json(course)
  } catch (e: unknown) {
    console.error("Instructor course update error:", e)
    const err = e as { code?: string }
    if (err.code === "23505") {
      return NextResponse.json({ error: "Course slug already exists" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    )
  }
}
