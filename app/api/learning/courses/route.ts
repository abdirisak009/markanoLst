import { NextResponse } from "next/server"
import postgres from "postgres"
import { cookies } from "next/headers"
import { getAdminFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/learning/courses
 * Get all active courses with progress for authenticated user.
 * If ?all=true and request is from admin, returns ALL courses (active + inactive) to match DB table.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const allParam = searchParams.get("all")

    const isAdmin =
      (await getAdminFromCookies()) ||
      (await cookies()).get("adminSession")?.value === "true"

    const adminWantsAll = allParam === "true" && isAdmin

    // Base query: admin with ?all=true gets every course; otherwise only active
    const courses = await (adminWantsAll
      ? sql`
          SELECT 
            c.*,
            COUNT(DISTINCT m.id) as modules_count,
            COUNT(DISTINCT l.id) as lessons_count
          FROM learning_courses c
          LEFT JOIN learning_modules m ON c.id = m.course_id AND m.is_active = true
          LEFT JOIN learning_lessons l ON m.id = l.module_id AND l.is_active = true
          GROUP BY c.id
          ORDER BY c.order_index ASC, c.created_at DESC
        `
      : sql`
          SELECT 
            c.*,
            COUNT(DISTINCT m.id) as modules_count,
            COUNT(DISTINCT l.id) as lessons_count
          FROM learning_courses c
          LEFT JOIN learning_modules m ON c.id = m.course_id AND m.is_active = true
          LEFT JOIN learning_lessons l ON m.id = l.module_id AND l.is_active = true
          WHERE c.is_active = true
          GROUP BY c.id
          ORDER BY c.order_index ASC, c.created_at DESC
        `)

    // If userId provided, only return courses where user has approved enrollment
    if (userId) {
      // Get courses where user has approved enrollment (has record in user_course_progress)
      // This means their enrollment was approved and they were enrolled
      const enrolledCourses = await sql`
        SELECT 
          c.id,
          c.title,
          c.slug,
          c.description,
          c.thumbnail_url,
          c.instructor_name,
          c.estimated_duration_minutes,
          c.difficulty_level,
          c.price,
          c.is_featured,
          c.order_index,
          c.created_at,
          c.updated_at,
          COUNT(DISTINCT m.id) as modules_count,
          COUNT(DISTINCT l.id) as lessons_count,
          ucp.progress_percentage,
          ucp.lessons_completed,
          ucp.total_lessons,
          ucp.current_lesson_id,
          ucp.last_accessed_at
        FROM user_course_progress ucp
        JOIN learning_courses c ON ucp.course_id = c.id
        LEFT JOIN learning_modules m ON c.id = m.course_id AND m.is_active = true
        LEFT JOIN learning_lessons l ON m.id = l.module_id AND l.is_active = true
        WHERE ucp.user_id = ${parseInt(userId)} AND c.is_active = true
        GROUP BY 
          c.id, c.title, c.slug, c.description, c.thumbnail_url, c.instructor_name,
          c.estimated_duration_minutes, c.difficulty_level, c.price, c.is_featured,
          c.order_index, c.created_at, c.updated_at,
          ucp.progress_percentage, ucp.lessons_completed, ucp.total_lessons,
          ucp.current_lesson_id, ucp.last_accessed_at
        ORDER BY ucp.last_accessed_at DESC NULLS LAST, c.order_index ASC, c.created_at DESC
      `

      // Format the response with progress data
      const coursesWithProgress = enrolledCourses.map((course: any) => ({
        ...course,
        progress: {
          progress_percentage: course.progress_percentage || 0,
          lessons_completed: course.lessons_completed || 0,
          total_lessons: course.total_lessons || course.lessons_count || 0,
          current_lesson_id: course.current_lesson_id,
          last_accessed_at: course.last_accessed_at,
        },
      }))

      return NextResponse.json(coursesWithProgress)
    }

    // If no userId, return all active courses (for public viewing)
    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

/**
 * POST /api/learning/courses
 * Create a new course (admin only)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      slug,
      description,
      thumbnail_url,
      instructor_id,
      instructor_name,
      estimated_duration_minutes,
      difficulty_level,
      price,
      is_featured,
      order_index,
    } = body

    const result = await sql`
      INSERT INTO learning_courses (
        title, slug, description, thumbnail_url, instructor_id, instructor_name,
        estimated_duration_minutes, difficulty_level, price, is_featured, order_index
      )
      VALUES (
        ${title}, ${slug}, ${description}, ${thumbnail_url || null}, ${instructor_id ?? null}, ${instructor_name || null},
        ${estimated_duration_minutes || 0}, ${difficulty_level || 'beginner'},
        ${price || 0}, ${is_featured || false}, ${order_index ?? 0}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating course:", error)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Course slug already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
