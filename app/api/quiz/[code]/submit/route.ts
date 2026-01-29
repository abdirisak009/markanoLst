import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// POST - Submit quiz answers
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const body = await request.json()
    const { student_id, student_type, student_phone, answers, time_spent } = body

    // Get quiz
    const quizResult = await sql`
      SELECT id, passing_score, show_results, show_correct_answers FROM quizzes 
      WHERE access_code = ${code} AND status = 'published'
    `

    if (quizResult.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quiz = quizResult[0]

    // Create attempt
    const attemptResult = await sql`
      INSERT INTO quiz_attempts (quiz_id, student_id, student_type, student_phone, time_spent, status)
      VALUES (${quiz.id}, ${student_id}, ${student_type}, ${student_phone || null}, ${time_spent || 0}, 'submitted')
      RETURNING id
    `

    const attemptId = attemptResult[0].id
    let totalScore = 0
    let totalPoints = 0

    // Process each answer
    for (const answer of answers) {
      const { question_id, selected_option_id, answer_text, matching_answers } = answer

      // Get question and correct answer
      const questionResult = await sql`
        SELECT q.*, qo.id as correct_option_id, qo.option_text as correct_text, qo.match_pair
        FROM quiz_questions q
        LEFT JOIN quiz_options qo ON qo.question_id = q.id AND qo.is_correct = true
        WHERE q.id = ${question_id}
      `

      if (questionResult.length === 0) continue

      const question = questionResult[0]
      totalPoints += question.points

      let isCorrect = false
      let pointsEarned = 0

      // Check answer based on question type
      switch (question.question_type) {
        case "multiple_choice":
        case "true_false":
          isCorrect = selected_option_id === question.correct_option_id
          break

        case "direct":
        case "fill_blank":
          // Case-insensitive comparison, trimmed
          isCorrect = answer_text?.toLowerCase().trim() === question.correct_text?.toLowerCase().trim()
          break

        case "matching":
          // Check all pairs
          const correctPairs = await sql`
            SELECT id, option_text, match_pair FROM quiz_options WHERE question_id = ${question_id}
          `
          const allCorrect = correctPairs.every((pair) => {
            const userMatch = matching_answers?.find((ma: any) => ma.left === pair.id)
            return userMatch && userMatch.right === pair.match_pair
          })
          isCorrect = allCorrect
          break
      }

      if (isCorrect) {
        pointsEarned = question.points
        totalScore += pointsEarned
      }

      // Save answer
      await sql`
        INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, answer_text, matching_answers, is_correct, points_earned)
        VALUES (${attemptId}, ${question_id}, ${selected_option_id || null}, ${answer_text || null}, 
                ${matching_answers ? JSON.stringify(matching_answers) : null}, ${isCorrect}, ${pointsEarned})
      `
    }

    // Calculate percentage and update attempt
    const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0
    const passed = percentage >= quiz.passing_score

    await sql`
      UPDATE quiz_attempts 
      SET score = ${totalScore}, total_points = ${totalPoints}, percentage = ${percentage}, 
          passed = ${passed}, submitted_at = CURRENT_TIMESTAMP, status = 'graded'
      WHERE id = ${attemptId}
    `

    // Return result
    const result: any = {
      attempt_id: attemptId,
      submitted: true,
    }

    if (quiz.show_results) {
      result.score = totalScore
      result.total_points = totalPoints
      result.percentage = Math.round(percentage * 100) / 100
      result.passed = passed
      result.passing_score = quiz.passing_score
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
