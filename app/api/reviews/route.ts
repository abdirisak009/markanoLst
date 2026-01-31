import { NextRequest, NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

const MAX_MESSAGE_LENGTH = 500

/**
 * GET /api/reviews
 * Public: list approved reviews (for homepage / course page).
 * Query: ?courseId= to filter by course.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    let rows
    if (courseId) {
      rows = await sql`
        SELECT id, reviewer_name, company, avatar_url, message, course_id, course_title, rating, reviewer_type, created_at
        FROM reviews
        WHERE status = 'approved' AND (course_id = ${parseInt(courseId, 10)} OR course_id IS NULL)
        ORDER BY created_at DESC
        LIMIT 50
      `
    } else {
      rows = await sql`
        SELECT id, reviewer_name, company, avatar_url, message, course_id, course_title, rating, reviewer_type, created_at
        FROM reviews
        WHERE status = 'approved'
        ORDER BY created_at DESC
        LIMIT 50
      `
    }

    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/reviews error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

/**
 * POST /api/reviews
 * Submit a new review (student or instructor).
 * Body: reviewer_name, company?, avatar_url?, message, course_id?, course_title?, rating (1-5), reviewer_type? ('student'|'instructor')
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      reviewer_name,
      company,
      avatar_url,
      message,
      course_id,
      course_title,
      rating,
      reviewer_type = "student",
    } = body

    if (!reviewer_name || typeof reviewer_name !== "string" || reviewer_name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 },
      )
    }
    const r = typeof rating === "string" ? parseInt(rating, 10) : rating
    if (typeof r !== "number" || r < 1 || r > 5) {
      return NextResponse.json({ error: "Rating must be 1 to 5" }, { status: 400 })
    }

    const [row] = await sql`
      INSERT INTO reviews (reviewer_name, company, avatar_url, message, course_id, course_title, rating, reviewer_type, status)
      VALUES (
        ${(reviewer_name as string).trim()},
        ${company ? String(company).trim() : null},
        ${avatar_url || null},
        ${(message as string).trim()},
        ${course_id != null ? parseInt(String(course_id), 10) : null},
        ${course_title ? String(course_title).trim() : null},
        ${r},
        ${reviewer_type === "instructor" ? "instructor" : "student"},
        'pending'
      )
      RETURNING id, reviewer_name, company, avatar_url, message, course_id, course_title, rating, reviewer_type, status, created_at
    `

    return NextResponse.json({
      success: true,
      review: row,
      message: "Review submitted. It will appear after admin approval.",
    })
  } catch (error) {
    console.error("POST /api/reviews error:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
