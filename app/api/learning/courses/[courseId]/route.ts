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
 * GET /api/learning/courses/[courseId]
 * Get course details with modules and lessons structure
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Get course
    const course = await sql`
      SELECT * FROM learning_courses WHERE id = ${courseId} AND is_active = true
    `

    if (course.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Get modules with lessons
    const modules = await sql`
      SELECT 
        m.*,
        COUNT(DISTINCT l.id) as lessons_count
      FROM learning_modules m
      LEFT JOIN learning_lessons l ON m.id = l.module_id AND l.is_active = true
      WHERE m.course_id = ${courseId} AND m.is_active = true
      GROUP BY m.id
      ORDER BY m.order_index ASC
    `

    // Get lessons for each module
    const lessons = await sql`
      SELECT 
        l.*,
        COUNT(DISTINCT q.id) as quizzes_count,
        COUNT(DISTINCT t.id) as tasks_count
      FROM learning_lessons l
      LEFT JOIN lesson_quizzes q ON l.id = q.lesson_id
      LEFT JOIN lesson_tasks t ON l.id = t.lesson_id
      WHERE l.module_id IN (
        SELECT id FROM learning_modules WHERE course_id = ${courseId}
      ) AND l.is_active = true
      GROUP BY l.id
      ORDER BY l.module_id, l.order_index ASC
    `

    // Check enrollment status if course is paid and userId is provided
    let enrollmentStatus: "approved" | "pending" | "rejected" | "none" = "none"
    let enrollmentMessage = ""
    
    if (userId && course[0].price > 0) {
      // Check if user has approved enrollment (has record in user_course_progress)
      const progress = await sql`
        SELECT * FROM user_course_progress
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `
      
      if (progress.length > 0) {
        // User is enrolled, check payment status
        const payment = await sql`
          SELECT status FROM course_payments
          WHERE user_id = ${userId} AND course_id = ${courseId}
          ORDER BY created_at DESC
          LIMIT 1
        `
        
        if (payment.length > 0) {
          if (payment[0].status === "completed" || payment[0].status === "approved") {
            enrollmentStatus = "approved"
          } else if (payment[0].status === "pending") {
            enrollmentStatus = "pending"
            enrollmentMessage = "Your enrollment request is pending approval. Please wait for admin approval."
          } else {
            enrollmentStatus = "rejected"
            enrollmentMessage = "Your enrollment request was rejected. Please contact support."
          }
        } else {
          enrollmentStatus = "approved" // If enrolled but no payment record, assume approved
        }
      } else {
        // Check if there's a pending payment
        const pendingPayment = await sql`
          SELECT status FROM course_payments
          WHERE user_id = ${userId} AND course_id = ${courseId}
          ORDER BY created_at DESC
          LIMIT 1
        `
        
        if (pendingPayment.length > 0) {
          if (pendingPayment[0].status === "pending") {
            enrollmentStatus = "pending"
            enrollmentMessage = "Your enrollment request is pending approval. The course will be available once approved."
          } else if (pendingPayment[0].status === "failed" || pendingPayment[0].status === "rejected") {
            enrollmentStatus = "rejected"
            enrollmentMessage = "Your enrollment request was rejected. Please contact support."
          }
        } else {
          enrollmentStatus = "none"
          enrollmentMessage = "You need to enroll in this course first. Please complete the enrollment process."
        }
      }
    }

    // Get user progress if userId provided and enrollment is approved
    let userProgress: any = {}
    if (userId && (enrollmentStatus === "approved" || course[0].price === 0)) {
      const progress = await sql`
        SELECT * FROM user_course_progress
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `
      if (progress.length > 0) {
        userProgress = progress[0]

        // Get lesson progress
        const lessonProgress = await sql`
          SELECT * FROM user_lesson_progress
          WHERE user_id = ${userId} AND lesson_id IN (
            SELECT id FROM learning_lessons WHERE module_id IN (
              SELECT id FROM learning_modules WHERE course_id = ${courseId}
            )
          )
        `
        userProgress.lesson_progress = lessonProgress
      }
    }

    // Organize modules with lessons
    const modulesWithLessons = modules.map((module: any) => ({
      ...module,
      lessons: lessons.filter((lesson: any) => lesson.module_id === module.id),
    }))

    return NextResponse.json({
      ...course[0],
      modules: modulesWithLessons,
      progress: userProgress,
      enrollment_status: enrollmentStatus,
      enrollment_message: enrollmentMessage,
    })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

const MAX_TITLE = 200
const MAX_SLUG = 150
const MAX_DESCRIPTION = 2000

function sanitizeSlug(s: string): string {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG)
}

/**
 * PUT /api/learning/courses/[courseId]
 * Update a course (admin only)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const isAdmin = await getAdminFromCookies() || (await cookies()).get("adminSession")?.value === "true"
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 })
    }

    const { courseId } = await params
    const body = await request.json()
    let {
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
      is_active,
      order_index,
    } = body

    const existingCourse = await sql`
      SELECT * FROM learning_courses WHERE id = ${courseId}
    `
    if (existingCourse.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    title = String(title ?? "").trim().slice(0, MAX_TITLE)
    if (!title || title.length < 3) {
      return NextResponse.json({ error: "Title is required and must be at least 3 characters" }, { status: 400 })
    }
    slug = sanitizeSlug(slug ?? title)
    if (!slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
    }
    description = String(description ?? "").trim().slice(0, MAX_DESCRIPTION)
    instructor_name = String(instructor_name ?? "").trim().slice(0, 200)
    estimated_duration_minutes = Math.max(0, parseInt(estimated_duration_minutes, 10) || 0)
    price = Math.max(0, parseFloat(price) || 0)
    difficulty_level = ["beginner", "intermediate", "advanced"].includes(difficulty_level) ? difficulty_level : "beginner"

    const result = await sql`
      UPDATE learning_courses
      SET 
        title = ${title},
        slug = ${slug},
        description = ${description || null},
        thumbnail_url = ${thumbnail_url || null},
        instructor_id = ${instructor_id ?? null},
        instructor_name = ${instructor_name || null},
        estimated_duration_minutes = ${estimated_duration_minutes},
        difficulty_level = ${difficulty_level},
        price = ${price},
        is_featured = ${!!is_featured},
        is_active = ${is_active !== false},
        order_index = ${Number(order_index) ?? 0},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${courseId}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: unknown) {
    const err = error as { code?: string }
    console.error("Error updating course:", error)
    if (err.code === "23505") {
      return NextResponse.json({ error: "Course slug already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

/**
 * DELETE /api/learning/courses/[courseId]
 * Delete a course (admin only) - soft delete by setting is_active to false
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const isAdmin = await getAdminFromCookies() || (await cookies()).get("adminSession")?.value === "true"
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 })
    }

    const { courseId } = await params

    const existingCourse = await sql`
      SELECT * FROM learning_courses WHERE id = ${courseId}
    `
    if (existingCourse.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Soft delete by setting is_active to false
    const result = await sql`
      UPDATE learning_courses
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${courseId}
      RETURNING *
    `

    return NextResponse.json({ message: "Course deleted successfully", course: result[0] })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
