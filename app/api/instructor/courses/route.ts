import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies, getInstructorFromRequest } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/instructor/courses
 * Instructor only: list my courses (learning_courses where instructor_id = me).
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

    const courses = await sql`
      SELECT c.id, c.title, c.slug, c.description, c.thumbnail_url, c.instructor_name,
             c.estimated_duration_minutes, c.difficulty_level, c.price, c.is_active, c.is_featured,
             c.order_index, c.created_at, c.updated_at,
             COUNT(DISTINCT m.id)::int AS modules_count,
             COUNT(DISTINCT l.id)::int AS lessons_count
      FROM learning_courses c
      LEFT JOIN learning_modules m ON m.course_id = c.id AND m.is_active = true
      LEFT JOIN learning_lessons l ON l.module_id = m.id AND l.is_active = true
      WHERE c.instructor_id = ${instructor.id}
      GROUP BY c.id
      ORDER BY c.order_index ASC NULLS LAST, c.created_at DESC
    `

    return NextResponse.json(courses)
  } catch (e) {
    console.error("Instructor courses list error:", e)
    return NextResponse.json(
      { error: "Failed to list courses" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/instructor/courses
 * Instructor only: create course (instructor_id set to me).
 */
export async function POST(request: Request) {
  try {
    let instructor = await getInstructorFromCookies()
    if (!instructor) instructor = getInstructorFromRequest(request)
    if (!instructor) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Please log in as instructor (Instructor Login) and try again. If you just logged in, refresh the page.",
        },
        { status: 401 }
      )
    }

    const [statusRow] = await sql`
      SELECT status FROM instructors WHERE id = ${instructor.id} AND deleted_at IS NULL
    `
    if (!statusRow || statusRow.status !== "active") {
      return NextResponse.json(
        { error: "Account is suspended. Contact admin." },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const {
      title,
      slug,
      description,
      thumbnail_url,
      estimated_duration_minutes,
      difficulty_level,
      price,
      is_featured,
      order_index,
    } = body

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const titleTrim = title.trim()
    let slugClean =
      (typeof slug === "string" && slug.trim())
        ? slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        : titleTrim.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    if (!slugClean) slugClean = "course-" + Date.now()
    const instructorName = instructor.name?.trim() || "Instructor"

    let course: Record<string, unknown> | undefined

    try {
      const [row] = await sql`
        INSERT INTO learning_courses (
          title, slug, description, thumbnail_url, instructor_name,
          estimated_duration_minutes, difficulty_level, price, is_featured, order_index,
          instructor_id
        )
        VALUES (
          ${titleTrim},
          ${slugClean},
          ${description?.trim() ?? null},
          ${thumbnail_url?.trim() ?? null},
          ${instructorName},
          ${Number(estimated_duration_minutes) || 0},
          ${difficulty_level === "intermediate" || difficulty_level === "advanced" ? difficulty_level : "beginner"},
          ${Number(price) || 0},
          ${is_featured === true},
          ${Number(order_index) ?? 0},
          ${instructor.id}
        )
        RETURNING id, title, slug, description, thumbnail_url, instructor_name,
                  estimated_duration_minutes, difficulty_level, price, is_active, is_featured,
                  order_index, instructor_id, created_at, updated_at
      `
      course = row as Record<string, unknown>
    } catch (insertErr: unknown) {
      const msg = String((insertErr as { message?: string })?.message ?? "")
      if (msg.includes("instructor_id") && (msg.includes("does not exist") || msg.includes("column"))) {
        try {
          const [row] = await sql`
            INSERT INTO learning_courses (
              title, slug, description, thumbnail_url, instructor_name,
              estimated_duration_minutes, difficulty_level, price, is_featured, order_index
            )
            VALUES (
              ${titleTrim},
              ${slugClean},
              ${description?.trim() ?? null},
              ${thumbnail_url?.trim() ?? null},
              ${instructorName},
              ${Number(estimated_duration_minutes) || 0},
              ${difficulty_level === "intermediate" || difficulty_level === "advanced" ? difficulty_level : "beginner"},
              ${Number(price) || 0},
              ${is_featured === true},
              ${Number(order_index) ?? 0}
            )
            RETURNING id, title, slug, description, thumbnail_url, instructor_name,
                      estimated_duration_minutes, difficulty_level, price, is_active, is_featured,
                      order_index, created_at, updated_at
          `
          course = row as Record<string, unknown>
        } catch (fallbackErr: unknown) {
          console.error("Instructor create course fallback error:", fallbackErr)
          return NextResponse.json(
            { error: "Failed to create course. Run migration 058 (instructor_id on learning_courses)." },
            { status: 500 }
          )
        }
      } else {
        throw insertErr
      }
    }

    if (!course) {
      return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
    }
    return NextResponse.json(course, { status: 201 })
  } catch (e: unknown) {
    console.error("Instructor create course error:", e)
    const err = e as { code?: string; message?: string }
    if (err.code === "23505") {
      return NextResponse.json({ error: "Course slug already exists. Use a different title or slug." }, { status: 400 })
    }
    const message = err.message ? String(err.message) : "Failed to create course"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
