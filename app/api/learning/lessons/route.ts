import { NextResponse } from "next/server"
import postgres from "postgres"
import { getAdminFromCookies, getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

async function canEditCourse(courseId: number): Promise<boolean> {
  const admin = await getAdminFromCookies()
  if (admin) return true
  const instructor = await getInstructorFromCookies()
  if (!instructor) return false
  const [row] = await sql`
    SELECT id FROM learning_courses WHERE id = ${courseId} AND instructor_id = ${instructor.id}
  `
  return !!row
}

/**
 * GET /api/learning/lessons?moduleId={id}
 * Get all lessons for a module
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get("moduleId")

    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 })
    }

    const lessons = await sql`
      SELECT 
        l.*,
        COUNT(DISTINCT q.id) as quizzes_count,
        COUNT(DISTINCT t.id) as tasks_count
      FROM learning_lessons l
      LEFT JOIN lesson_quizzes q ON l.id = q.lesson_id
      LEFT JOIN lesson_tasks t ON l.id = t.lesson_id
      WHERE l.module_id = ${moduleId}
      GROUP BY l.id
      ORDER BY l.order_index ASC
    `

    return NextResponse.json(lessons)
  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}

/**
 * POST /api/learning/lessons
 * Create a new lesson (admin or course instructor)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      module_id,
      title,
      description,
      video_url,
      video_duration_seconds,
      lesson_type,
      order_index,
      xp_reward,
    } = body

    if (!module_id || !title) {
      return NextResponse.json({ error: "module_id and title are required" }, { status: 400 })
    }

    const [mod] = await sql`SELECT course_id FROM learning_modules WHERE id = ${module_id}`
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 })
    const allowed = await canEditCourse(mod.course_id)
    if (!allowed) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const result = await sql`
      INSERT INTO learning_lessons (
        module_id, title, description, video_url, video_duration_seconds,
        lesson_type, order_index, xp_reward
      )
      VALUES (
        ${module_id}, ${title}, ${description || null}, ${video_url || null},
        ${video_duration_seconds || 0}, ${lesson_type || 'video'},
        ${order_index || 0}, ${xp_reward || 10}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating lesson:", error)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Lesson order_index already exists for this module" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
  }
}

/**
 * PUT /api/learning/lessons
 * Update a lesson (admin or course instructor)
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      title,
      description,
      video_url,
      video_duration_seconds,
      lesson_type,
      order_index,
      xp_reward,
      is_active,
    } = body

    if (!id || !title) {
      return NextResponse.json({ error: "id and title are required" }, { status: 400 })
    }

    const [lesson] = await sql`SELECT module_id FROM learning_lessons WHERE id = ${id}`
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    const [mod] = await sql`SELECT course_id FROM learning_modules WHERE id = ${lesson.module_id}`
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 })
    const allowed = await canEditCourse(mod.course_id)
    if (!allowed) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const result = await sql`
      UPDATE learning_lessons
      SET 
        title = ${title},
        description = ${description || null},
        video_url = ${video_url || null},
        video_duration_seconds = ${video_duration_seconds || 0},
        lesson_type = ${lesson_type || 'video'},
        order_index = ${order_index || 0},
        xp_reward = ${xp_reward || 10},
        is_active = ${is_active !== false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating lesson:", error)
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
  }
}

/**
 * DELETE /api/learning/lessons?id={id}
 * Delete a lesson (admin or course instructor; soft delete)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const [lesson] = await sql`SELECT module_id FROM learning_lessons WHERE id = ${id}`
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    const [mod] = await sql`SELECT course_id FROM learning_modules WHERE id = ${lesson.module_id}`
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 })
    const allowed = await canEditCourse(mod.course_id)
    if (!allowed) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const result = await sql`
      UPDATE learning_lessons
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ message: "Lesson deleted successfully", lesson: result[0] })
  } catch (error) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
  }
}
