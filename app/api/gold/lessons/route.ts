import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET lessons by module, level, or track
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get("moduleId")
    const levelId = searchParams.get("levelId")
    const trackId = searchParams.get("trackId")

    let lessons
    if (moduleId) {
      lessons = await sql`
        SELECT ls.*, m.name as module_name, t.name as track_name, l.name as level_name
        FROM gold_lessons ls
        LEFT JOIN gold_modules m ON ls.module_id = m.id
        LEFT JOIN gold_tracks t ON m.track_id = t.id
        LEFT JOIN gold_levels l ON ls.level_id = l.id
        WHERE ls.module_id = ${moduleId}
        ORDER BY ls.order_index ASC
      `
    } else if (levelId) {
      lessons = await sql`
        SELECT ls.*, l.name as level_name, t.name as track_name, m.name as module_name
        FROM gold_lessons ls
        LEFT JOIN gold_levels l ON ls.level_id = l.id
        LEFT JOIN gold_tracks t ON l.track_id = t.id
        LEFT JOIN gold_modules m ON ls.module_id = m.id
        WHERE ls.level_id = ${levelId}
        ORDER BY ls.order_index ASC
      `
    } else if (trackId) {
      lessons = await sql`
        SELECT 
          ls.*, 
          l.name as level_name, 
          COALESCE(t1.name, t2.name) as track_name, 
          m.name as module_name
        FROM gold_lessons ls
        LEFT JOIN gold_modules m ON ls.module_id = m.id
        LEFT JOIN gold_tracks t1 ON m.track_id = t1.id
        LEFT JOIN gold_levels l ON ls.level_id = l.id
        LEFT JOIN gold_tracks t2 ON l.track_id = t2.id
        WHERE (t1.id = ${trackId} OR t2.id = ${trackId})
        ORDER BY 
          COALESCE(t1.order_index, t2.order_index, 0) ASC, 
          COALESCE(m.order_index, 0) ASC, 
          COALESCE(l.order_index, 0) ASC, 
          ls.order_index ASC
      `
    } else {
      lessons = await sql`
        SELECT 
          ls.*, 
          l.name as level_name, 
          COALESCE(t1.name, t2.name) as track_name, 
          m.name as module_name
        FROM gold_lessons ls
        LEFT JOIN gold_modules m ON ls.module_id = m.id
        LEFT JOIN gold_tracks t1 ON m.track_id = t1.id
        LEFT JOIN gold_levels l ON ls.level_id = l.id
        LEFT JOIN gold_tracks t2 ON l.track_id = t2.id
        ORDER BY 
          COALESCE(t1.order_index, t2.order_index, 0) ASC, 
          COALESCE(m.order_index, 0) ASC, 
          COALESCE(l.order_index, 0) ASC, 
          ls.order_index ASC
      `
    }
    return NextResponse.json(lessons)
  } catch (error: any) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch lessons" }, { status: 500 })
  }
}

// POST create new lesson
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { module_id, level_id, title, lesson_type, content, video_url, video_duration, is_required, order_index } = body

    if (!module_id && !level_id) {
      return NextResponse.json({ error: "Module ID or Level ID is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO gold_lessons (module_id, level_id, title, lesson_type, content, video_url, video_duration, is_required, order_index)
      VALUES (${module_id || null}, ${level_id || null}, ${title}, ${lesson_type}, ${content || null}, ${video_url || null}, ${video_duration || 0}, ${is_required ?? true}, ${order_index || 0})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating lesson:", error)
    return NextResponse.json({ error: error.message || "Failed to create lesson" }, { status: 500 })
  }
}

// PUT update lesson
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, module_id, level_id, title, lesson_type, content, video_url, video_duration, is_required, order_index } = body

    const result = await sql`
      UPDATE gold_lessons 
      SET module_id = ${module_id !== undefined ? module_id : null}, 
          level_id = ${level_id !== undefined ? level_id : null}, 
          title = ${title}, lesson_type = ${lesson_type},
          content = ${content || null}, video_url = ${video_url || null}, video_duration = ${video_duration || 0},
          is_required = ${is_required}, order_index = ${order_index}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating lesson:", error)
    return NextResponse.json({ error: error.message || "Failed to update lesson" }, { status: 500 })
  }
}

// DELETE lesson
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM gold_lessons WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
  }
}
