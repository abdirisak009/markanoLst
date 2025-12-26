import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET lessons by level
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get("levelId")

    let lessons
    if (levelId) {
      lessons = await sql`
        SELECT ls.*, l.name as level_name, t.name as track_name
        FROM gold_lessons ls
        LEFT JOIN gold_levels l ON ls.level_id = l.id
        LEFT JOIN gold_tracks t ON l.track_id = t.id
        WHERE ls.level_id = ${levelId}
        ORDER BY ls.order_index ASC
      `
    } else {
      lessons = await sql`
        SELECT ls.*, l.name as level_name, t.name as track_name
        FROM gold_lessons ls
        LEFT JOIN gold_levels l ON ls.level_id = l.id
        LEFT JOIN gold_tracks t ON l.track_id = t.id
        ORDER BY t.order_index ASC, l.order_index ASC, ls.order_index ASC
      `
    }
    return NextResponse.json(lessons)
  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}

// POST create new lesson
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { level_id, title, lesson_type, content, video_url, video_duration, is_required, order_index } = body

    const result = await sql`
      INSERT INTO gold_lessons (level_id, title, lesson_type, content, video_url, video_duration, is_required, order_index)
      VALUES (${level_id}, ${title}, ${lesson_type}, ${content}, ${video_url}, ${video_duration}, ${is_required ?? true}, ${order_index || 0})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
  }
}

// PUT update lesson
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, level_id, title, lesson_type, content, video_url, video_duration, is_required, order_index } = body

    const result = await sql`
      UPDATE gold_lessons 
      SET level_id = ${level_id}, title = ${title}, lesson_type = ${lesson_type},
          content = ${content}, video_url = ${video_url}, video_duration = ${video_duration},
          is_required = ${is_required}, order_index = ${order_index}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating lesson:", error)
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
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
