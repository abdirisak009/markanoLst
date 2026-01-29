import { NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

/**
 * GET /api/learning/quizzes?lessonId={id}
 * Get all quizzes for a lesson
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 })
    }

    const quizzes = await sql`
      SELECT * FROM lesson_quizzes
      WHERE lesson_id = ${lessonId}
      ORDER BY order_index ASC
    `

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}

/**
 * POST /api/learning/quizzes
 * Create a new quiz
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lesson_id, question, question_type, options, correct_answer, explanation, order_index } = body

    if (!lesson_id || !question || !correct_answer) {
      return NextResponse.json({ error: "lesson_id, question, and correct_answer are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO lesson_quizzes (
        lesson_id, question, question_type, options, correct_answer, explanation, order_index
      )
      VALUES (
        ${lesson_id}, ${question}, ${question_type || 'multiple_choice'},
        ${options ? JSON.stringify(options) : null}, ${correct_answer},
        ${explanation || null}, ${order_index || 0}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}

/**
 * PUT /api/learning/quizzes
 * Update a quiz
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, question, question_type, options, correct_answer, explanation, order_index } = body

    if (!id || !question || !correct_answer) {
      return NextResponse.json({ error: "id, question, and correct_answer are required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE lesson_quizzes
      SET 
        question = ${question},
        question_type = ${question_type || 'multiple_choice'},
        options = ${options ? JSON.stringify(options) : null},
        correct_answer = ${correct_answer},
        explanation = ${explanation || null},
        order_index = ${order_index || 0}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating quiz:", error)
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 })
  }
}

/**
 * DELETE /api/learning/quizzes?id={id}
 * Delete a quiz
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await sql`DELETE FROM lesson_quizzes WHERE id = ${id}`

    return NextResponse.json({ message: "Quiz deleted successfully" })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 })
  }
}
