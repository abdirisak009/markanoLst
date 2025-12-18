import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET - Fetch quiz by access code (public)
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params

    // Fetch quiz
    const quizResult = await sql`
      SELECT 
        id, title, description, time_limit, passing_score, max_attempts,
        shuffle_questions, shuffle_options, show_results, show_correct_answers,
        status, start_date, end_date, access_code
      FROM quizzes 
      WHERE access_code = ${code}
    `

    if (quizResult.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quiz = quizResult[0]

    // Check if quiz is published
    if (quiz.status !== "published") {
      return NextResponse.json({ error: "Quiz is not available" }, { status: 403 })
    }

    // Check date restrictions
    const now = new Date()
    if (quiz.start_date && new Date(quiz.start_date) > now) {
      return NextResponse.json({ error: "Quiz has not started yet" }, { status: 403 })
    }
    if (quiz.end_date && new Date(quiz.end_date) < now) {
      return NextResponse.json({ error: "Quiz has ended" }, { status: 403 })
    }

    // Fetch questions (without correct answers for security)
    let questions = await sql`
      SELECT id, quiz_id, question_type, question_text, question_image, points, order_index
      FROM quiz_questions 
      WHERE quiz_id = ${quiz.id} 
      ORDER BY order_index ASC
    `

    // Shuffle questions if enabled
    if (quiz.shuffle_questions) {
      questions = questions.sort(() => Math.random() - 0.5)
    }

    // Fetch options for each question (without is_correct for security)
    const questionsWithOptions = await Promise.all(
      questions.map(async (q) => {
        let options = await sql`
          SELECT id, option_text, option_image, match_pair, order_index
          FROM quiz_options 
          WHERE question_id = ${q.id} 
          ORDER BY order_index ASC
        `

        // Shuffle options if enabled (except for matching questions)
        if (quiz.shuffle_options && q.question_type !== "matching") {
          options = options.sort(() => Math.random() - 0.5)
        }

        return { ...q, options }
      }),
    )

    return NextResponse.json({
      quiz: {
        ...quiz,
        question_count: questionsWithOptions.length,
      },
      questions: questionsWithOptions,
    })
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
}
