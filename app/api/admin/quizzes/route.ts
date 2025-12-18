import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET - Fetch all quizzes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const status = searchParams.get("status")

    let quizzes

    if (classId && status) {
      quizzes = await sql`
        SELECT 
          q.*,
          c.name as class_name,
          u.name as university_name,
          (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
          (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempt_count
        FROM quizzes q
        LEFT JOIN classes c ON q.class_id = c.id
        LEFT JOIN universities u ON q.university_id = u.id
        WHERE q.class_id = ${classId} AND q.status = ${status}
        ORDER BY q.created_at DESC
      `
    } else if (classId) {
      quizzes = await sql`
        SELECT 
          q.*,
          c.name as class_name,
          u.name as university_name,
          (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
          (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempt_count
        FROM quizzes q
        LEFT JOIN classes c ON q.class_id = c.id
        LEFT JOIN universities u ON q.university_id = u.id
        WHERE q.class_id = ${classId}
        ORDER BY q.created_at DESC
      `
    } else if (status) {
      quizzes = await sql`
        SELECT 
          q.*,
          c.name as class_name,
          u.name as university_name,
          (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
          (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempt_count
        FROM quizzes q
        LEFT JOIN classes c ON q.class_id = c.id
        LEFT JOIN universities u ON q.university_id = u.id
        WHERE q.status = ${status}
        ORDER BY q.created_at DESC
      `
    } else {
      quizzes = await sql`
        SELECT 
          q.*,
          c.name as class_name,
          u.name as university_name,
          (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
          (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempt_count
        FROM quizzes q
        LEFT JOIN classes c ON q.class_id = c.id
        LEFT JOIN universities u ON q.university_id = u.id
        ORDER BY q.created_at DESC
      `
    }

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}

// POST - Create new quiz
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      class_id,
      university_id,
      created_by,
      time_limit,
      passing_score,
      max_attempts,
      shuffle_questions,
      shuffle_options,
      show_results,
      show_correct_answers,
      start_date,
      end_date,
    } = body

    const result = await sql`
      INSERT INTO quizzes (
        title, description, class_id, university_id, created_by,
        time_limit, passing_score, max_attempts, shuffle_questions,
        shuffle_options, show_results, show_correct_answers,
        start_date, end_date, status
      ) VALUES (
        ${title}, ${description || null}, ${class_id || null}, ${university_id || null}, ${created_by || null},
        ${time_limit || null}, ${passing_score || 60}, ${max_attempts || 1}, ${shuffle_questions || false},
        ${shuffle_options || false}, ${show_results !== false}, ${show_correct_answers || false},
        ${start_date || null}, ${end_date || null}, 'draft'
      )
      RETURNING *
    `

    return NextResponse.json({ quiz: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}
