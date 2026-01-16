import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET modules by track or level
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get("trackId")
    const levelId = searchParams.get("levelId")

    let modules
    if (levelId) {
      // Get modules for a specific level
      modules = await sql`
        SELECT 
          m.*,
          t.name as track_name,
          l.name as level_name,
          COALESCE(lesson_counts.lessons_count, 0)::int as lessons_count
        FROM gold_modules m
        LEFT JOIN gold_tracks t ON m.track_id = t.id
        LEFT JOIN gold_levels l ON m.level_id = l.id
        LEFT JOIN (
          SELECT module_id, COUNT(*)::int as lessons_count
          FROM gold_lessons
          WHERE module_id IS NOT NULL
          GROUP BY module_id
        ) lesson_counts ON m.id = lesson_counts.module_id
        WHERE m.level_id = ${levelId}
        ORDER BY m.order_index ASC
      `
    } else if (trackId) {
      // Get modules for a track (both directly under track and under levels in the track)
      modules = await sql`
        SELECT 
          m.*,
          t.name as track_name,
          l.name as level_name,
          COALESCE(lesson_counts.lessons_count, 0)::int as lessons_count
        FROM gold_modules m
        LEFT JOIN gold_tracks t ON m.track_id = t.id
        LEFT JOIN gold_levels l ON m.level_id = l.id
        LEFT JOIN (
          SELECT module_id, COUNT(*)::int as lessons_count
          FROM gold_lessons
          WHERE module_id IS NOT NULL
          GROUP BY module_id
        ) lesson_counts ON m.id = lesson_counts.module_id
        WHERE m.track_id = ${trackId} OR (m.level_id IS NOT NULL AND l.track_id = ${trackId})
        ORDER BY COALESCE(l.order_index, 0) ASC, m.order_index ASC
      `
    } else {
      modules = await sql`
        SELECT 
          m.*,
          t.name as track_name,
          COALESCE(level_counts.levels_count, 0)::int as levels_count,
          COALESCE(lesson_counts.lessons_count, 0)::int as lessons_count
        FROM gold_modules m
        LEFT JOIN gold_tracks t ON m.track_id = t.id
        LEFT JOIN (
          SELECT module_id, COUNT(*)::int as levels_count
          FROM gold_levels
          WHERE module_id IS NOT NULL
          GROUP BY module_id
        ) level_counts ON m.id = level_counts.module_id
        LEFT JOIN (
          SELECT module_id, COUNT(*)::int as lessons_count
          FROM gold_lessons
          WHERE module_id IS NOT NULL
          GROUP BY module_id
        ) lesson_counts ON m.id = lesson_counts.module_id
        ORDER BY t.order_index ASC, m.order_index ASC
      `
    }
    return NextResponse.json(modules)
  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
  }
}

// POST create new module
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { track_id, level_id, name, description, order_index, is_active } = body

    if (!name) {
      return NextResponse.json({ error: "Module name is required" }, { status: 400 })
    }

    if (!track_id && !level_id) {
      return NextResponse.json({ error: "Either Track ID or Level ID is required" }, { status: 400 })
    }

    // If level_id is provided, get track_id from the level
    let finalTrackId = track_id
    if (level_id && !track_id) {
      const level = await sql`SELECT track_id FROM gold_levels WHERE id = ${level_id}`
      if (level.length === 0) {
        return NextResponse.json({ error: "Level not found" }, { status: 404 })
      }
      finalTrackId = level[0].track_id
    }

    const result = await sql`
      INSERT INTO gold_modules (track_id, level_id, name, description, order_index, is_active)
      VALUES (${finalTrackId || null}, ${level_id || null}, ${name}, ${description || null}, ${order_index || 0}, ${is_active !== false})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating module:", error)
    return NextResponse.json({ error: error.message || "Failed to create module" }, { status: 500 })
  }
}

// PUT update module
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, track_id, level_id, name, description, order_index, is_active } = body

    // If level_id is provided, get track_id from the level
    let finalTrackId = track_id
    if (level_id && !track_id) {
      const level = await sql`SELECT track_id FROM gold_levels WHERE id = ${level_id}`
      if (level.length > 0) {
        finalTrackId = level[0].track_id
      }
    }

    const result = await sql`
      UPDATE gold_modules 
      SET track_id = ${finalTrackId || null}, level_id = ${level_id !== undefined ? level_id : null},
          name = ${name}, description = ${description || null}, 
          order_index = ${order_index}, is_active = ${is_active !== false},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating module:", error)
    return NextResponse.json({ error: error.message || "Failed to update module" }, { status: 500 })
  }
}

// DELETE module
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM gold_modules WHERE id = ${id}`

    return NextResponse.json({ success: true, message: "Module deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting module:", error)
    return NextResponse.json({ error: error.message || "Failed to delete module" }, { status: 500 })
  }
}
