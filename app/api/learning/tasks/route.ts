import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * GET /api/learning/tasks?lessonId={id}
 * Get all tasks for a lesson
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 })
    }

    const tasks = await sql`
      SELECT * FROM lesson_tasks
      WHERE lesson_id = ${lessonId}
      ORDER BY id ASC
    `

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

/**
 * POST /api/learning/tasks
 * Create a new task
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      lesson_id, 
      task_type, 
      title, 
      instructions, 
      expected_output, 
      is_required,
      programming_language,
      starter_code,
      test_cases,
      solution_code
    } = body

    if (!lesson_id || !title || !instructions) {
      return NextResponse.json({ error: "lesson_id, title, and instructions are required" }, { status: 400 })
    }

    // Validate coding practice fields
    if (task_type === "coding_practice" && !programming_language) {
      return NextResponse.json({ error: "programming_language is required for coding practice tasks" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO lesson_tasks (
        lesson_id, task_type, title, instructions, expected_output, is_required,
        programming_language, starter_code, test_cases, solution_code
      )
      VALUES (
        ${lesson_id}, 
        ${task_type || 'reflection'}, 
        ${title},
        ${instructions}, 
        ${expected_output || null}, 
        ${is_required !== false},
        ${programming_language || null},
        ${starter_code || null},
        ${test_cases ? JSON.stringify(test_cases) : null},
        ${solution_code || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

/**
 * PUT /api/learning/tasks
 * Update a task
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { 
      id, 
      task_type, 
      title, 
      instructions, 
      expected_output, 
      is_required,
      programming_language,
      starter_code,
      test_cases,
      solution_code
    } = body

    if (!id || !title || !instructions) {
      return NextResponse.json({ error: "id, title, and instructions are required" }, { status: 400 })
    }

    // Validate coding practice fields
    if (task_type === "coding_practice" && !programming_language) {
      return NextResponse.json({ error: "programming_language is required for coding practice tasks" }, { status: 400 })
    }

    const result = await sql`
      UPDATE lesson_tasks
      SET 
        task_type = ${task_type || 'reflection'},
        title = ${title},
        instructions = ${instructions},
        expected_output = ${expected_output || null},
        is_required = ${is_required !== false},
        programming_language = ${programming_language || null},
        starter_code = ${starter_code || null},
        test_cases = ${test_cases ? JSON.stringify(test_cases) : null},
        solution_code = ${solution_code || null}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

/**
 * DELETE /api/learning/tasks?id={id}
 * Delete a task
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await sql`DELETE FROM lesson_tasks WHERE id = ${id}`

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
