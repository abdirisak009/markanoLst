import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET - Fetch single quiz with questions
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Fetch quiz
    const quizResult = await sql`
      SELECT 
        q.*,
        c.name as class_name,
        u.name as university_name
      FROM quizzes q
      LEFT JOIN classes c ON q.class_id = c.id
      LEFT JOIN universities u ON q.university_id = u.id
      WHERE q.id = ${id}
    `

    if (quizResult.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Fetch questions
    const questions = await sql`
      SELECT * FROM quiz_questions 
      WHERE quiz_id = ${id} 
      ORDER BY order_index ASC
    `

    // Fetch options for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (q) => {
        const options = await sql`
          SELECT * FROM quiz_options 
          WHERE question_id = ${q.id} 
          ORDER BY order_index ASC
        `
        return { ...q, options }
      }),
    )

    return NextResponse.json({
      quiz: quizResult[0],
      questions: questionsWithOptions,
    })
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
}

// PUT - Update quiz
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      class_id,
      university_id,
      time_limit,
      passing_score,
      max_attempts,
      shuffle_questions,
      shuffle_options,
      show_results,
      show_correct_answers,
      start_date,
      end_date,
      status,
    } = body

    const result = await sql`
      UPDATE quizzes SET
        title = ${title},
        description = ${description || null},
        class_id = ${class_id || null},
        university_id = ${university_id || null},
        time_limit = ${time_limit || null},
        passing_score = ${passing_score || 60},
        max_attempts = ${max_attempts || 1},
        shuffle_questions = ${shuffle_questions || false},
        shuffle_options = ${shuffle_options || false},
        show_results = ${show_results !== false},
        show_correct_answers = ${show_correct_answers || false},
        start_date = ${start_date || null},
        end_date = ${end_date || null},
        status = ${status || "draft"},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ quiz: result[0] })
  } catch (error) {
    console.error("Error updating quiz:", error)
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 })
  }
}

// DELETE - Delete quiz
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await sql`DELETE FROM quizzes WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 })
  }
}
