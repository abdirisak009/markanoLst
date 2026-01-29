import { NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

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

    // Create payment record - ALL payments start as "pending" and require admin approval
    const payment = await sql`
      INSERT INTO course_payments (
        user_id, course_id, amount, payment_method, status, created_at
      )
      VALUES (
        ${user_id}, ${course_id}, ${amount}, ${payment_method}, 
        'pending', 
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    // For all payment methods (offline, wafi_pay, mastercard), return pending status
    // Admin must approve enrollment before student can access the course
    return NextResponse.json({
      success: true,
      payment: payment[0],
      message: "Payment request submitted. Admin will review and approve your enrollment soon. The course will be available once approved.",
    })
  } catch (error: any) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
