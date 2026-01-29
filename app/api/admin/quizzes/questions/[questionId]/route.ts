import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// PUT - Update question
export async function PUT(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    const { questionId } = await params
    const body = await request.json()
    const { question_type, question_text, question_image, points, explanation, options } = body

    // Update question
    await sql`
      UPDATE quiz_questions SET
        question_type = ${question_type},
        question_text = ${question_text},
        question_image = ${question_image || null},
        points = ${points || 1},
        explanation = ${explanation || null}
      WHERE id = ${questionId}
    `

    // Delete existing options and insert new ones
    await sql`DELETE FROM quiz_options WHERE question_id = ${questionId}`

    if (options && options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]
        await sql`
          INSERT INTO quiz_options (
            question_id, option_text, option_image, is_correct, match_pair, order_index
          ) VALUES (
            ${questionId}, ${opt.option_text}, ${opt.option_image || null}, 
            ${opt.is_correct || false}, ${opt.match_pair || null}, ${i}
          )
        `
      }
    }

    // Fetch updated question with options
    const questionResult = await sql`SELECT * FROM quiz_questions WHERE id = ${questionId}`
    const optionsResult = await sql`SELECT * FROM quiz_options WHERE question_id = ${questionId} ORDER BY order_index`

    return NextResponse.json({ question: { ...questionResult[0], options: optionsResult } })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

// DELETE - Delete question
export async function DELETE(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    const { questionId } = await params

    await sql`DELETE FROM quiz_questions WHERE id = ${questionId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
