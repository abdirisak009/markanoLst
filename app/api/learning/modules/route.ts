import { NextResponse } from "next/server"
import postgres from "postgres"
import { getAdminFromCookies, getInstructorFromCookies, getInstructorFromRequest } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

async function canEditCourse(courseId: number, request?: Request): Promise<boolean> {
  const admin = await getAdminFromCookies()
  if (admin) return true
  let instructor = await getInstructorFromCookies()
  if (!instructor && request) instructor = getInstructorFromRequest(request)
  if (!instructor) return false
  const [row] = await sql`
    SELECT id FROM learning_courses WHERE id = ${courseId} AND instructor_id = ${instructor.id}
  `
  return !!row
}

/**
 * GET /api/learning/modules?courseId={id}
 * Get all modules for a course
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 })
    }

    const modules = await sql`
      SELECT * FROM learning_modules
      WHERE course_id = ${courseId}
      ORDER BY order_index ASC
    `

    return NextResponse.json(modules)
  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
  }
}

/**
 * POST /api/learning/modules
 * Create a new module (admin or course instructor)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { course_id, title, description, order_index } = body

    if (!course_id || !title) {
      return NextResponse.json({ error: "course_id and title are required" }, { status: 400 })
    }

    const allowed = await canEditCourse(Number(course_id), request)
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized. Only admin or the assigned instructor can add modules." }, { status: 403 })
    }

    const result = await sql`
      INSERT INTO learning_modules (course_id, title, description, order_index)
      VALUES (${course_id}, ${title}, ${description || null}, ${order_index || 0})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating module:", error)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Module order_index already exists for this course" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 })
  }
}

/**
 * PUT /api/learning/modules
 * Update a module (admin or course instructor)
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, description, order_index, is_active } = body

    if (!id || !title) {
      return NextResponse.json({ error: "id and title are required" }, { status: 400 })
    }

    const [mod] = await sql`SELECT course_id FROM learning_modules WHERE id = ${id}`
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 })
    const allowed = await canEditCourse(mod.course_id, request)
    if (!allowed) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const result = await sql`
      UPDATE learning_modules
      SET 
        title = ${title},
        description = ${description || null},
        order_index = ${order_index || 0},
        is_active = ${is_active !== false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating module:", error)
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 })
  }
}

/**
 * DELETE /api/learning/modules?id={id}
 * Delete a module (admin or course instructor; soft delete)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const [mod] = await sql`SELECT course_id FROM learning_modules WHERE id = ${id}`
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 })
    const allowed = await canEditCourse(mod.course_id, request)
    if (!allowed) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const result = await sql`
      UPDATE learning_modules
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ message: "Module deleted successfully", module: result[0] })
  } catch (error) {
    console.error("Error deleting module:", error)
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 })
  }
}
