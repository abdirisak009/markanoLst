import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// GET - Fetch quiz results and analytics
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get quiz info
    const quizResult = await sql`
      SELECT q.*, 
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count
      FROM quizzes q WHERE q.id = ${id}
    `

    if (quizResult.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quiz = quizResult[0]

    // Get all attempts with student info
    const attempts = await sql`
      SELECT 
        qa.*,
        COALESCE(us.full_name, ps.full_name) as student_name,
        COALESCE(us.phone, ps.phone) as student_phone
      FROM quiz_attempts qa
      LEFT JOIN university_students us ON qa.student_id = us.student_id AND qa.student_type = 'university'
      LEFT JOIN penn_students ps ON qa.student_id = ps.student_id AND qa.student_type = 'penn'
      WHERE qa.quiz_id = ${id}
      ORDER BY qa.submitted_at DESC
    `

    // Calculate statistics
    const completedAttempts = attempts.filter((a) => a.status === "graded")
    const passedCount = completedAttempts.filter((a) => a.passed).length
    const avgScore =
      completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedAttempts.length
        : 0
    const avgTime =
      completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.time_spent || 0), 0) / completedAttempts.length
        : 0

    // Get question-level analytics
    const questionStats = await sql`
      SELECT 
        qq.id,
        qq.question_text,
        qq.question_type,
        qq.points,
        COUNT(qans.id) as total_answers,
        SUM(CASE WHEN qans.is_correct THEN 1 ELSE 0 END) as correct_count,
        ROUND(AVG(CASE WHEN qans.is_correct THEN 100 ELSE 0 END)::numeric, 1) as success_rate
      FROM quiz_questions qq
      LEFT JOIN quiz_answers qans ON qans.question_id = qq.id
      WHERE qq.quiz_id = ${id}
      GROUP BY qq.id, qq.question_text, qq.question_type, qq.points, qq.order_index
      ORDER BY qq.order_index
    `

    return NextResponse.json({
      quiz,
      statistics: {
        total_attempts: attempts.length,
        completed_attempts: completedAttempts.length,
        passed_count: passedCount,
        failed_count: completedAttempts.length - passedCount,
        pass_rate: completedAttempts.length > 0 ? (passedCount / completedAttempts.length) * 100 : 0,
        average_score: Math.round(avgScore * 100) / 100,
        average_time: Math.round(avgTime),
        highest_score: completedAttempts.length > 0 ? Math.max(...completedAttempts.map((a) => a.percentage || 0)) : 0,
        lowest_score: completedAttempts.length > 0 ? Math.min(...completedAttempts.map((a) => a.percentage || 0)) : 0,
      },
      attempts,
      questionStats,
    })
  } catch (error) {
    console.error("Error fetching quiz results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
