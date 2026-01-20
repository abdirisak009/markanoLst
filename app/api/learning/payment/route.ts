import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * POST /api/learning/payment
 * Process course payment
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, course_id, amount, payment_method } = body

    if (!user_id || !course_id || amount === undefined) {
      return NextResponse.json({ error: "user_id, course_id, and amount are required" }, { status: 400 })
    }

    if (!payment_method) {
      return NextResponse.json({ error: "payment_method is required" }, { status: 400 })
    }

    // Get course details
    const course = await sql`
      SELECT * FROM learning_courses
      WHERE id = ${course_id} AND is_active = true
    `

    if (course.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if already enrolled
    const existingProgress = await sql`
      SELECT * FROM user_course_progress
      WHERE user_id = ${user_id} AND course_id = ${course_id}
    `

    if (existingProgress.length > 0) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 })
    }

    // Check if there's a pending payment
    const pendingPayment = await sql`
      SELECT * FROM course_payments
      WHERE user_id = ${user_id} AND course_id = ${course_id} AND status = 'pending'
    `

    if (pendingPayment.length > 0) {
      return NextResponse.json({ error: "Payment already pending for this course" }, { status: 400 })
    }

    // Create payment record
    const payment = await sql`
      INSERT INTO course_payments (
        user_id, course_id, amount, payment_method, status, created_at
      )
      VALUES (
        ${user_id}, ${course_id}, ${amount}, ${payment_method}, 
        ${payment_method === "offline" ? "pending" : "completed"}, 
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    // If offline payment, return success (admin will approve later)
    if (payment_method === "offline") {
      return NextResponse.json({
        success: true,
        payment: payment[0],
        message: "Payment request submitted. Admin will approve your enrollment soon.",
      })
    }

    // For online payments (wafi_pay, mastercard), we would integrate with payment gateway here
    // For now, we'll mark as completed and enroll the student immediately
    if (payment_method === "wafi_pay" || payment_method === "mastercard") {
      // Update payment status to completed
      await sql`
        UPDATE course_payments
        SET status = 'completed', paid_at = CURRENT_TIMESTAMP
        WHERE id = ${payment[0].id}
      `

      // Enroll the student
      const totalLessons = await sql`
        SELECT COUNT(DISTINCT l.id) as total_lessons
        FROM learning_courses c
        LEFT JOIN learning_modules m ON c.id = m.course_id AND m.is_active = true
        LEFT JOIN learning_lessons l ON m.id = l.module_id AND l.is_active = true
        WHERE c.id = ${course_id} AND c.is_active = true
        GROUP BY c.id
      `

      const lessonCount = totalLessons[0]?.total_lessons || 0

      // Get first lesson ID to unlock
      const firstLesson = await sql`
        SELECT l.id
        FROM learning_lessons l
        JOIN learning_modules m ON l.module_id = m.id
        WHERE m.course_id = ${course_id} AND m.is_active = true AND l.is_active = true
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
          ${user_id}, ${course_id}, 0, 0, ${lessonCount}, ${firstLessonId},
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
            ${user_id}, ${firstLessonId}, 'not_started', CURRENT_TIMESTAMP
          )
          ON CONFLICT (user_id, lesson_id) DO NOTHING
        `
      }

      // Update student account status to active when payment is successful
      await sql`
        UPDATE gold_students
        SET account_status = 'active'
        WHERE id = ${user_id}
      `

      return NextResponse.json({
        success: true,
        payment: payment[0],
        message: "Payment successful! You are now enrolled.",
      })
    }

    return NextResponse.json({ success: true, payment: payment[0] })
  } catch (error: any) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
