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
 * POST /api/admin/enrollments/[id]/approve
 * Approve enrollment and enroll student
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication (admin_token from login API, or adminSession for compatibility)
    let admin = await getAdminFromCookies()
    if (!admin) {
      const cookieStore = await cookies()
      const adminSession = cookieStore.get("adminSession")?.value
      if (adminSession !== "true") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      // Session cookie present – allow action (same fallback as GET /api/admin/enrollments)
      admin = { id: 0, username: "admin", role: "admin" }
    }

    const { id } = await params
    const enrollmentId = parseInt(id)

    // Get enrollment details
    const enrollment = await sql`
      SELECT * FROM course_payments
      WHERE id = ${enrollmentId}
    `

    if (enrollment.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    const enrollmentData = enrollment[0]

    if (enrollmentData.status !== "pending") {
      return NextResponse.json({ error: "Enrollment is not pending" }, { status: 400 })
    }

    // Check if already enrolled
    const existingProgress = await sql`
      SELECT * FROM user_course_progress
      WHERE user_id = ${enrollmentData.user_id} AND course_id = ${enrollmentData.course_id}
    `

    if (existingProgress.length > 0) {
      // Already enrolled, just update payment status
      await sql`
        UPDATE course_payments
        SET status = 'completed', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${enrollmentId}
      `
      // Also ensure account is active
      await sql`
        UPDATE gold_students
        SET account_status = 'active'
        WHERE id = ${enrollmentData.user_id}
      `
      return NextResponse.json({ success: true, message: "Enrollment approved (already enrolled)" })
    }

    // Update payment status
    await sql`
      UPDATE course_payments
      SET status = 'completed', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${enrollmentId}
    `

    // Get course details
    const course = await sql`
      SELECT COUNT(DISTINCT l.id) as total_lessons
      FROM learning_courses c
      LEFT JOIN learning_modules m ON c.id = m.course_id AND m.is_active = true
      LEFT JOIN learning_lessons l ON m.id = l.module_id AND l.is_active = true
      WHERE c.id = ${enrollmentData.course_id} AND c.is_active = true
      GROUP BY c.id
    `

    const totalLessons = course[0]?.total_lessons || 0

    // Get first lesson ID to unlock
    const firstLesson = await sql`
      SELECT l.id
      FROM learning_lessons l
      JOIN learning_modules m ON l.module_id = m.id
      WHERE m.course_id = ${enrollmentData.course_id} AND m.is_active = true AND l.is_active = true
      ORDER BY m.order_index ASC, l.order_index ASC
      LIMIT 1
    `

    const firstLessonId = firstLesson[0]?.id || null

    // Create course progress record
    await sql`
      INSERT INTO user_course_progress (
        user_id, course_id, progress_percentage, lessons_completed,
        total_lessons, current_lesson_id, enrolled_at, started_at, last_accessed_at
      )
      VALUES (
        ${enrollmentData.user_id}, ${enrollmentData.course_id}, 0, 0, ${totalLessons}, ${firstLessonId},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `

    // Unlock first lesson
    if (firstLessonId) {
      await sql`
        INSERT INTO user_lesson_progress (
          user_id, lesson_id, status, last_accessed_at
        )
        VALUES (
          ${enrollmentData.user_id}, ${firstLessonId}, 'not_started', CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id, lesson_id) DO NOTHING
      `
    }

    // Update student account status to active when enrollment is approved
    await sql`
      UPDATE gold_students
      SET account_status = 'active'
      WHERE id = ${enrollmentData.user_id}
    `

    return NextResponse.json({ success: true, message: "Enrollment approved and student enrolled" })
  } catch (error: any) {
    console.error("Error approving enrollment:", error)
    return NextResponse.json({ error: "Failed to approve enrollment" }, { status: 500 })
  }
}
