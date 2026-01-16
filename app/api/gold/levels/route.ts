import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET levels by track
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get("trackId")
    const moduleId = searchParams.get("moduleId")

    let levels
    if (moduleId) {
      levels = await sql`
        SELECT 
          l.*,
          t.name as track_name,
          m.name as module_name,
          COUNT(DISTINCT ls.id) as lessons_count,
          COUNT(DISTINCT e.id) as exercises_count
        FROM gold_levels l
        LEFT JOIN gold_tracks t ON l.track_id = t.id
        LEFT JOIN gold_modules m ON l.module_id = m.id
        LEFT JOIN gold_lessons ls ON l.id = ls.level_id
        LEFT JOIN gold_exercises e ON l.id = e.level_id
        WHERE l.module_id = ${moduleId}
        GROUP BY l.id, t.name, m.name
        ORDER BY l.order_index ASC
      `
    } else if (trackId) {
      levels = await sql`
        SELECT 
          l.*,
          t.name as track_name,
          m.name as module_name,
          COUNT(DISTINCT ls.id) as lessons_count,
          COUNT(DISTINCT e.id) as exercises_count
        FROM gold_levels l
        LEFT JOIN gold_tracks t ON l.track_id = t.id
        LEFT JOIN gold_modules m ON l.module_id = m.id
        LEFT JOIN gold_lessons ls ON l.id = ls.level_id
        LEFT JOIN gold_exercises e ON l.id = e.level_id
        WHERE l.track_id = ${trackId}
        GROUP BY l.id, t.name, m.name
        ORDER BY l.order_index ASC
      `
    } else {
      levels = await sql`
        SELECT 
          l.*,
          t.name as track_name,
          m.name as module_name,
          t.order_index as track_order,
          COUNT(DISTINCT ls.id) as lessons_count,
          COUNT(DISTINCT e.id) as exercises_count
        FROM gold_levels l
        LEFT JOIN gold_tracks t ON l.track_id = t.id
        LEFT JOIN gold_modules m ON l.module_id = m.id
        LEFT JOIN gold_lessons ls ON l.id = ls.level_id
        LEFT JOIN gold_exercises e ON l.id = e.level_id
        GROUP BY l.id, t.name, m.name, t.order_index
        ORDER BY t.order_index ASC, l.order_index ASC
      `
    }
    return NextResponse.json(levels)
  } catch (error) {
    console.error("Error fetching levels:", error)
    return NextResponse.json([])
  }
}

// POST create new level
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { track_id, module_id, name, description, order_index, is_active } = body

    if (!track_id || !name) {
      return NextResponse.json({ error: "Track ID and name are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO gold_levels (track_id, module_id, name, description, order_index, is_active)
      VALUES (${track_id}, ${module_id || null}, ${name}, ${description || null}, ${order_index || 0}, ${is_active !== false})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating level:", error)
    return NextResponse.json({ error: error.message || "Failed to create level" }, { status: 500 })
  }
}

// PUT update level
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, track_id, module_id, name, description, order_index, is_active } = body

    const result = await sql`
      UPDATE gold_levels 
      SET track_id = ${track_id}, module_id = ${module_id !== undefined ? module_id : null}, 
          name = ${name}, description = ${description || null},
          order_index = ${order_index}, is_active = ${is_active !== false}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating level:", error)
    return NextResponse.json({ error: error.message || "Failed to update level" }, { status: 500 })
  }
}

// DELETE level
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Level ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM gold_levels WHERE id = ${id}`
    return NextResponse.json({ success: true, message: "Level deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting level:", error)
    return NextResponse.json({ error: error.message || "Failed to delete level" }, { status: 500 })
  }
}
