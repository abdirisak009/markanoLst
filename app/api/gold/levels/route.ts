import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET levels by track
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get("trackId")

    let levels
    if (trackId) {
      levels = await sql`
        SELECT 
          l.*,
          t.name as track_name,
          COUNT(DISTINCT ls.id) as lessons_count,
          COUNT(DISTINCT e.id) as exercises_count
        FROM gold_levels l
        LEFT JOIN gold_tracks t ON l.track_id = t.id
        LEFT JOIN gold_lessons ls ON l.id = ls.level_id
        LEFT JOIN gold_exercises e ON l.id = e.level_id
        WHERE l.track_id = ${trackId}
        GROUP BY l.id, t.name
        ORDER BY l.order_index ASC
      `
    } else {
      levels = await sql`
        SELECT 
          l.*,
          t.name as track_name,
          COUNT(DISTINCT ls.id) as lessons_count,
          COUNT(DISTINCT e.id) as exercises_count
        FROM gold_levels l
        LEFT JOIN gold_tracks t ON l.track_id = t.id
        LEFT JOIN gold_lessons ls ON l.id = ls.level_id
        LEFT JOIN gold_exercises e ON l.id = e.level_id
        GROUP BY l.id, t.name
        ORDER BY t.order_index ASC, l.order_index ASC
      `
    }
    return NextResponse.json(levels)
  } catch (error) {
    console.error("Error fetching levels:", error)
    return NextResponse.json({ error: "Failed to fetch levels" }, { status: 500 })
  }
}

// POST create new level
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { track_id, name, description, order_index } = body

    const result = await sql`
      INSERT INTO gold_levels (track_id, name, description, order_index)
      VALUES (${track_id}, ${name}, ${description}, ${order_index || 0})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating level:", error)
    return NextResponse.json({ error: "Failed to create level" }, { status: 500 })
  }
}

// PUT update level
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, track_id, name, description, order_index, is_active } = body

    const result = await sql`
      UPDATE gold_levels 
      SET track_id = ${track_id}, name = ${name}, description = ${description},
          order_index = ${order_index}, is_active = ${is_active}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating level:", error)
    return NextResponse.json({ error: "Failed to update level" }, { status: 500 })
  }
}

// DELETE level
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM gold_levels WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting level:", error)
    return NextResponse.json({ error: "Failed to delete level" }, { status: 500 })
  }
}
