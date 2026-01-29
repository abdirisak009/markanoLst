import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// POST - Add question to quiz
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: quizId } = await params
    const body = await request.json()
    const { question_type, question_text, question_image, points, explanation, options } = body

    // Get next order index
    const orderResult = await sql`
      SELECT COALESCE(MAX(order_index), 0) + 1 as next_order 
      FROM quiz_questions WHERE quiz_id = ${quizId}
    `
    const nextOrder = orderResult[0].next_order

    // Insert question
    const questionResult = await sql`
      INSERT INTO quiz_questions (
        quiz_id, question_type, question_text, question_image, points, order_index, explanation
      ) VALUES (
        ${quizId}, ${question_type}, ${question_text}, ${question_image || null}, 
        ${points || 1}, ${nextOrder}, ${explanation || null}
      )
      RETURNING *
    `

    const question = questionResult[0]

    // Insert options if provided
    if (options && options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]
        await sql`
          INSERT INTO quiz_options (
            question_id, option_text, option_image, is_correct, match_pair, order_index
          ) VALUES (
            ${question.id}, ${opt.option_text}, ${opt.option_image || null}, 
            ${opt.is_correct || false}, ${opt.match_pair || null}, ${i}
          )
        `
      }
    }

    // Fetch options
    const optionsResult = await sql`
      SELECT * FROM quiz_options WHERE question_id = ${question.id} ORDER BY order_index
    `

    return NextResponse.json({ question: { ...question, options: optionsResult } }, { status: 201 })
  } catch (error) {
    console.error("Error adding question:", error)
    return NextResponse.json({ error: "Failed to add question" }, { status: 500 })
  }
}

// PUT - Update question order
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { questions } = body // Array of { id, order_index }

    for (const q of questions) {
      await sql`
        UPDATE quiz_questions SET order_index = ${q.order_index} WHERE id = ${q.id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering questions:", error)
    return NextResponse.json({ error: "Failed to reorder questions" }, { status: 500 })
  }
}
