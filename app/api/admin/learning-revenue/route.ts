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
 * GET /api/admin/learning-revenue
 * Admin only: revenue from Learning Courses (course_payments completed).
 * Returns: by_course, by_instructor, by_student, total_amount.
 * Query: dateFrom, dateTo (ISO date string), search (filter names/course title).
 */
export async function GET(request: Request) {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""
    const search = (searchParams.get("search") || "").trim().toLowerCase()

    const hasDateFilter = Boolean(dateFrom || dateTo)
    const dateCondition = hasDateFilter
      ? dateFrom && dateTo
        ? sql`AND (COALESCE(cp.paid_at, cp.created_at) >= ${dateFrom}::timestamp AND COALESCE(cp.paid_at, cp.created_at) <= ${dateTo}::timestamp + interval '1 day')`
        : dateFrom
        ? sql`AND COALESCE(cp.paid_at, cp.created_at) >= ${dateFrom}::timestamp`
        : sql`AND COALESCE(cp.paid_at, cp.created_at) <= ${dateTo}::timestamp + interval '1 day'`
      : sql``

    const byCourse = await sql`
      SELECT
        lc.id AS course_id,
        lc.title AS course_title,
        lc.slug,
        lc.instructor_id,
        i.full_name AS instructor_name,
        COALESCE(SUM(cp.amount), 0)::float AS total_amount,
        COUNT(cp.id)::int AS payment_count
      FROM learning_courses lc
      LEFT JOIN course_payments cp ON cp.course_id = lc.id AND cp.status IN ('completed', 'approved') ${dateCondition}
      LEFT JOIN instructors i ON i.id = lc.instructor_id AND i.deleted_at IS NULL
      GROUP BY lc.id, lc.title, lc.slug, lc.instructor_id, i.full_name
      ORDER BY total_amount DESC, lc.title ASC
    `

    const byInstructor = await sql`
      SELECT
        i.id AS instructor_id,
        i.full_name AS instructor_name,
        COALESCE(SUM(cp.amount), 0)::float AS total_amount,
        COUNT(cp.id)::int AS payment_count,
        COUNT(DISTINCT cp.course_id)::int AS course_count
      FROM instructors i
      INNER JOIN learning_courses lc ON lc.instructor_id = i.id AND i.deleted_at IS NULL
      INNER JOIN course_payments cp ON cp.course_id = lc.id AND cp.status IN ('completed', 'approved') ${dateCondition}
      GROUP BY i.id, i.full_name
      ORDER BY total_amount DESC, i.full_name ASC
    `

    const byStudentRaw = await sql`
      SELECT
        cp.user_id,
        gs.full_name AS student_name,
        gs.email AS student_email,
        COALESCE(SUM(cp.amount), 0)::float AS total_amount,
        COUNT(cp.id)::int AS payment_count,
        COUNT(DISTINCT cp.course_id)::int AS course_count
      FROM course_payments cp
      LEFT JOIN gold_students gs ON gs.id = cp.user_id
      WHERE cp.status IN ('completed', 'approved') ${dateCondition}
      GROUP BY cp.user_id, gs.full_name, gs.email
      ORDER BY total_amount DESC, gs.full_name ASC NULLS LAST
    `

    const [totalRow] = await sql`
      SELECT COALESCE(SUM(cp.amount), 0)::float AS total
      FROM course_payments cp
      WHERE cp.status IN ('completed', 'approved') ${dateCondition}
    `
    const total = Number(totalRow?.total ?? 0)

    const by_course = byCourse.map((r) => ({
      course_id: r.course_id,
      course_title: r.course_title,
      slug: r.slug,
      instructor_id: r.instructor_id,
      instructor_name: r.instructor_name,
      total_amount: Number(r.total_amount),
      payment_count: r.payment_count,
    }))

    const by_instructor = byInstructor.map((r) => ({
      instructor_id: r.instructor_id,
      instructor_name: r.instructor_name,
      total_amount: Number(r.total_amount),
      payment_count: r.payment_count,
      course_count: r.course_count,
    }))

    const by_student = byStudentRaw.map((r) => ({
      user_id: r.user_id,
      student_name: r.student_name || `User #${r.user_id}`,
      student_email: r.student_email || null,
      total_amount: Number(r.total_amount),
      payment_count: r.payment_count,
      course_count: r.course_count,
    }))

    let filteredByCourse = by_course
    let filteredByInstructor = by_instructor
    let filteredByStudent = by_student
    if (search) {
      filteredByCourse = by_course.filter(
        (r) =>
          (r.course_title && r.course_title.toLowerCase().includes(search)) ||
          (r.instructor_name && r.instructor_name.toLowerCase().includes(search)) ||
          (r.slug && r.slug.toLowerCase().includes(search))
      )
      filteredByInstructor = by_instructor.filter(
        (r) => r.instructor_name && r.instructor_name.toLowerCase().includes(search)
      )
      filteredByStudent = by_student.filter(
        (r) =>
          (r.student_name && r.student_name.toLowerCase().includes(search)) ||
          (r.student_email && r.student_email.toLowerCase().includes(search))
      )
    }

    return NextResponse.json({
      by_course: filteredByCourse,
      by_instructor: filteredByInstructor,
      by_student: filteredByStudent,
      total_amount: total,
    })
  } catch (e) {
    console.error("Admin learning revenue error:", e)
    return NextResponse.json(
      { error: "Failed to load learning revenue" },
      { status: 500 }
    )
  }
}
