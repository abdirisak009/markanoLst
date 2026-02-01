import { NextResponse } from "next/server"
import postgres from "postgres"
import { getGoldStudentFromCookies } from "@/lib/auth"
import { cookies } from "next/headers"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/learning/my-payments
 * Student only (gold_student): payments for Learning Courses (completed/approved).
 * Returns: this_month_total, this_year_total, payments[] (course title, amount, paid_at).
 * So student can see "bishaan waxa aan bixiyay" and "sannadkan waxa aan bixiyay".
 */
export async function GET() {
  try {
    const student = await getGoldStudentFromCookies()
    const cookieStore = await cookies()
    const token = cookieStore.get("gold_student_token")?.value
    if (!student && !token) {
      return NextResponse.json(
        { error: "Unauthorized - Student login required" },
        { status: 401 }
      )
    }
    const userId = student?.id
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Student not found" },
        { status: 401 }
      )
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const startOfMonthStr = startOfMonth.toISOString().slice(0, 19).replace("T", " ")
    const startOfYearStr = startOfYear.toISOString().slice(0, 19).replace("T", " ")

    const [thisMonthRow] = await sql`
      SELECT COALESCE(SUM(cp.amount), 0)::float AS total
      FROM course_payments cp
      WHERE cp.user_id = ${userId}
        AND cp.status IN ('completed', 'approved')
        AND (COALESCE(cp.paid_at, cp.created_at) >= ${startOfMonthStr}::timestamp)
    `
    const [thisYearRow] = await sql`
      SELECT COALESCE(SUM(cp.amount), 0)::float AS total
      FROM course_payments cp
      WHERE cp.user_id = ${userId}
        AND cp.status IN ('completed', 'approved')
        AND (COALESCE(cp.paid_at, cp.created_at) >= ${startOfYearStr}::timestamp)
    `

    const payments = await sql`
      SELECT
        cp.id,
        cp.course_id,
        lc.title AS course_title,
        cp.amount,
        cp.status,
        COALESCE(cp.paid_at, cp.created_at) AS paid_at
      FROM course_payments cp
      JOIN learning_courses lc ON lc.id = cp.course_id
      WHERE cp.user_id = ${userId}
        AND cp.status IN ('completed', 'approved')
      ORDER BY COALESCE(cp.paid_at, cp.created_at) DESC
    `

    return NextResponse.json({
      this_month_total: Number(thisMonthRow?.total ?? 0),
      this_year_total: Number(thisYearRow?.total ?? 0),
      payments: payments.map((p) => ({
        id: p.id,
        course_id: p.course_id,
        course_title: p.course_title,
        amount: Number(p.amount),
        status: p.status,
        paid_at: p.paid_at,
      })),
    })
  } catch (e) {
    console.error("Learning my-payments error:", e)
    return NextResponse.json(
      { error: "Failed to load payments" },
      { status: 500 }
    )
  }
}
