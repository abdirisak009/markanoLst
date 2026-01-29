import { NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

/**
 * GET /api/learning/lessons/[lessonId]
 * Get lesson details with quizzes and tasks
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Get lesson
    const lesson = await sql`
      SELECT 
        l.*,
        m.course_id,
        m.title as module_title,
        c.title as course_title
      FROM learning_lessons l
      JOIN learning_modules m ON l.module_id = m.id
      JOIN learning_courses c ON m.course_id = c.id
      WHERE l.id = ${lessonId} AND l.is_active = true
    `

    if (lesson.length === 0) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Get quizzes
    const quizzes = await sql`
      SELECT 
        id,
        lesson_id,
        question,
        question_type,
        options,
        correct_answer,
        explanation,
        order_index,
        created_at
      FROM lesson_quizzes
      WHERE lesson_id = ${lessonId}
      ORDER BY order_index ASC
    `
    
    console.log(`[API] Found ${quizzes.length} quizzes for lesson ${lessonId}`)
    
    // Parse options if they're JSON strings
    const parsedQuizzes = quizzes.map((quiz: any) => {
      let options = quiz.options
      
      // If options is a string, parse it
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options)
        } catch (e) {
          console.error('Error parsing quiz options:', e, 'Raw options:', options)
          options = []
        }
      }
      
      // If options is null or undefined
      if (options === null || options === undefined) {
        // For true_false, we don't need options
        if (quiz.question_type === 'true_false') {
          options = ['True', 'False']
        } else {
          options = []
        }
      }
      
      // Ensure options is an array
      if (!Array.isArray(options)) {
        console.warn('Quiz options is not an array:', options, 'Converting to array')
        options = []
      }
      
      const parsedQuiz = {
        ...quiz,
        options: options
      }
      
      console.log(`[API] Parsed quiz ${quiz.id}:`, {
        question: quiz.question,
        question_type: quiz.question_type,
        options_count: options.length,
        options: options
      })
      
      return parsedQuiz
    })

    // Get tasks
    const tasks = await sql`
      SELECT * FROM lesson_tasks
      WHERE lesson_id = ${lessonId}
    `

    // Get user progress if userId provided
    let userProgress: any = null
    if (userId) {
      const progress = await sql`
        SELECT * FROM user_lesson_progress
        WHERE user_id = ${userId} AND lesson_id = ${lessonId}
      `
      if (progress.length > 0) {
        userProgress = progress[0]

        // Get quiz submissions
        const quizSubmissions = await sql`
          SELECT qs.*, q.question, q.correct_answer, q.explanation
          FROM quiz_submissions qs
          JOIN lesson_quizzes q ON qs.quiz_id = q.id
          WHERE qs.user_id = ${userId} AND q.lesson_id = ${lessonId}
        `
        userProgress.quiz_submissions = quizSubmissions

        // Get task submissions
        const taskSubmissions = await sql`
          SELECT ts.*, t.title, t.instructions
          FROM task_submissions ts
          JOIN lesson_tasks t ON ts.task_id = t.id
          WHERE ts.user_id = ${userId} AND t.lesson_id = ${lessonId}
        `
        userProgress.task_submissions = taskSubmissions
      }
    }

    // Check if previous lesson is completed (for unlocking)
    let isUnlocked = true
    if (userId) {
      const previousLesson = await sql`
        SELECT l.id
        FROM learning_lessons l
        WHERE l.module_id = ${lesson[0].module_id}
        AND l.order_index < ${lesson[0].order_index}
        ORDER BY l.order_index DESC
        LIMIT 1
      `

      if (previousLesson.length > 0) {
        const prevProgress = await sql`
          SELECT status FROM user_lesson_progress
          WHERE user_id = ${userId} AND lesson_id = ${previousLesson[0].id}
        `
        isUnlocked = prevProgress.length > 0 && prevProgress[0].status === 'completed'
      }
    }

    return NextResponse.json({
      ...lesson[0],
      quizzes: parsedQuizzes,
      tasks,
      progress: userProgress,
      is_unlocked: isUnlocked,
    })
  } catch (error) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 })
  }
}
