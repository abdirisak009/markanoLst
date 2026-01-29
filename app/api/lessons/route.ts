import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// GET - Fetch lessons for a module
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get("moduleId")

    if (!moduleId) {
      return Response.json({ error: "Module ID required" }, { status: 400 })
    }

    const lessons = await sql`
      SELECT * FROM lessons 
      WHERE module_id = ${moduleId}
      ORDER BY order_index ASC
    `

    return Response.json(lessons)
  } catch (error) {
    console.error("[v0] Error fetching lessons:", error)
    return Response.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}

// POST - Create new lesson
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { module_id, title, duration, video_url, content, order_index } = body

    const result = await sql`
      INSERT INTO lessons (module_id, title, duration, video_url, content, order_index)
      VALUES (${module_id}, ${title}, ${duration || 0}, ${video_url || ""}, ${content || ""}, ${order_index || 0})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating lesson:", error)
    return Response.json({ error: "Failed to create lesson" }, { status: 500 })
  }
}

// PUT - Update lesson
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, duration, video_url, content, order_index } = body

    const result = await sql`
      UPDATE lessons 
      SET title = ${title}, 
          duration = ${duration}, 
          video_url = ${video_url || ""}, 
          content = ${content || ""}, 
          order_index = ${order_index}
      WHERE id = ${id}
      RETURNING *
    `

    return Response.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating lesson:", error)
    return Response.json({ error: "Failed to update lesson" }, { status: 500 })
  }
}

// DELETE - Delete lesson
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Lesson ID required" }, { status: 400 })
    }

    await sql`DELETE FROM lessons WHERE id = ${id}`

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting lesson:", error)
    return Response.json({ error: "Failed to delete lesson" }, { status: 500 })
  }
}
