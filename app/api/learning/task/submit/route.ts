import { NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

/**
 * POST /api/learning/task/submit
 * Submit task (reflection, practice, etc.)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, task_id, submission_content } = body

    if (!user_id || !task_id || !submission_content) {
      return NextResponse.json(
        { error: "user_id, task_id, and submission_content are required" },
        { status: 400 }
      )
    }

    // Get task details
    const task = await sql`
      SELECT t.*, l.id as lesson_id
      FROM lesson_tasks t
      JOIN learning_lessons l ON t.lesson_id = l.id
      WHERE t.id = ${task_id}
    `

    if (task.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Save submission
    await sql`
      INSERT INTO task_submissions (user_id, task_id, submission_content)
      VALUES (${user_id}, ${task_id}, ${submission_content})
      ON CONFLICT (user_id, task_id) DO UPDATE
      SET submission_content = ${submission_content}, submitted_at = CURRENT_TIMESTAMP
    `

    // Update lesson progress
    await sql`
      UPDATE user_lesson_progress
      SET task_completed = true
      WHERE user_id = ${user_id} AND lesson_id = ${task[0].lesson_id}
    `

    return NextResponse.json({
      success: true,
      message: "Task submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting task:", error)
    return NextResponse.json({ error: "Failed to submit task" }, { status: 500 })
  }
}
