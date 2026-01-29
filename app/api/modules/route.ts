import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// GET - Fetch modules for a course
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return Response.json({ error: "Course ID required" }, { status: 400 })
    }

    const modules = await sql`
      SELECT * FROM modules 
      WHERE course_id = ${courseId}
      ORDER BY order_index ASC
    `

    return Response.json(modules)
  } catch (error) {
    console.error("[v0] Error fetching modules:", error)
    return Response.json({ error: "Failed to fetch modules" }, { status: 500 })
  }
}

// POST - Create new module
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { course_id, title, order_index } = body

    const result = await sql`
      INSERT INTO modules (course_id, title, order_index)
      VALUES (${course_id}, ${title}, ${order_index || 0})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating module:", error)
    return Response.json({ error: "Failed to create module" }, { status: 500 })
  }
}

// PUT - Update module
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, order_index } = body

    const result = await sql`
      UPDATE modules 
      SET title = ${title}, 
          order_index = ${order_index}
      WHERE id = ${id}
      RETURNING *
    `

    return Response.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating module:", error)
    return Response.json({ error: "Failed to update module" }, { status: 500 })
  }
}

// DELETE - Delete module
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Module ID required" }, { status: 400 })
    }

    // Delete associated lessons first
    await sql`DELETE FROM lessons WHERE module_id = ${id}`

    // Delete module
    await sql`DELETE FROM modules WHERE id = ${id}`

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting module:", error)
    return Response.json({ error: "Failed to delete module" }, { status: 500 })
  }
}
