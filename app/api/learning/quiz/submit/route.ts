import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * POST /api/learning/quiz/submit
 * Submit quiz answer and get instant feedback
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, quiz_id, user_answer } = body

    if (!user_id || !quiz_id || user_answer === undefined) {
      return NextResponse.json(
        { error: "user_id, quiz_id, and user_answer are required" },
        { status: 400 }
      )
    }

    // Get quiz details
    const quiz = await sql`
      SELECT 
        q.*,
        l.id as lesson_id,
        l.xp_reward
      FROM lesson_quizzes q
      JOIN learning_lessons l ON q.lesson_id = l.id
      WHERE q.id = ${quiz_id}
    `

    if (quiz.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quizData = quiz[0]
    const isCorrect = user_answer.toLowerCase().trim() === quizData.correct_answer.toLowerCase().trim()

    // Save submission
    await sql`
      INSERT INTO quiz_submissions (user_id, quiz_id, user_answer, is_correct)
      VALUES (${user_id}, ${quiz_id}, ${user_answer}, ${isCorrect})
      ON CONFLICT (user_id, quiz_id) DO UPDATE
      SET user_answer = ${user_answer}, is_correct = ${isCorrect}, submitted_at = CURRENT_TIMESTAMP
    `

    // Get all quizzes for this lesson
    const allQuizzes = await sql`
      SELECT id FROM lesson_quizzes WHERE lesson_id = ${quizData.lesson_id}
    `

    // Check if all quizzes are completed correctly
    const allSubmissions = await sql`
      SELECT is_correct FROM quiz_submissions
      WHERE user_id = ${user_id} AND quiz_id IN (
        SELECT id FROM lesson_quizzes WHERE lesson_id = ${quizData.lesson_id}
      )
    `

    const allCorrect = allSubmissions.length === allQuizzes.length && allSubmissions.every((s: any) => s.is_correct)
    const quizScore = allSubmissions.length > 0
      ? Math.round((allSubmissions.filter((s: any) => s.is_correct).length / allQuizzes.length) * 100)
      : 0

    // Update lesson progress
    if (allSubmissions.length === allQuizzes.length) {
      await sql`
        UPDATE user_lesson_progress
        SET quiz_completed = true, quiz_score = ${quizScore}
        WHERE user_id = ${user_id} AND lesson_id = ${quizData.lesson_id}
      `

      // Award bonus XP for perfect quiz score
      if (allCorrect) {
        await sql`
          INSERT INTO user_xp (user_id, xp_amount, source_type, source_id, description)
          VALUES (
            ${user_id},
            5,
            'quiz_perfect',
            ${quizData.lesson_id},
            'Perfect quiz score'
          )
        `
      }
    }

    return NextResponse.json({
      is_correct: isCorrect,
      correct_answer: quizData.correct_answer,
      explanation: quizData.explanation,
      all_quizzes_completed: allSubmissions.length === allQuizzes.length,
      quiz_score: quizScore,
      bonus_xp: allCorrect ? 5 : 0,
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
