import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET all tracks with levels count and lessons count (including lessons directly under modules)
export async function GET() {
  try {
    const tracks = await sql`
      SELECT 
        t.*,
        COALESCE(level_counts.levels_count, 0)::int as levels_count,
        COALESCE(lesson_counts.lessons_count, 0)::int as lessons_count,
        COALESCE(enrolled_counts.enrolled_students, 0)::int as enrolled_students
      FROM gold_tracks t
      LEFT JOIN (
        SELECT track_id, COUNT(*)::int as levels_count
        FROM gold_levels
        GROUP BY track_id
      ) level_counts ON t.id = level_counts.track_id
      LEFT JOIN (
        SELECT 
          COALESCE(m.track_id, l.track_id) as track_id,
          COUNT(DISTINCT ls.id)::int as lessons_count
        FROM gold_lessons ls
        LEFT JOIN gold_modules m ON ls.module_id = m.id
        LEFT JOIN gold_levels l ON ls.level_id = l.id
        WHERE ls.module_id IS NOT NULL OR ls.level_id IS NOT NULL
        GROUP BY COALESCE(m.track_id, l.track_id)
      ) lesson_counts ON t.id = lesson_counts.track_id
      LEFT JOIN (
        SELECT track_id, COUNT(DISTINCT student_id)::int as enrolled_students
        FROM gold_enrollments
        GROUP BY track_id
      ) enrolled_counts ON t.id = enrolled_counts.track_id
      ORDER BY t.order_index ASC
    `
    return NextResponse.json(tracks)
  } catch (error) {
    console.error("Error fetching tracks:", error)
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 })
  }
}

// POST create new track
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, description, icon, color, start_date, end_date } = body

    const result = await sql`
      INSERT INTO gold_tracks (name, slug, description, icon, color, start_date, end_date)
      VALUES (${name}, ${slug}, ${description}, ${icon || "BookOpen"}, ${color || "#3B82F6"}, ${start_date || null}, ${end_date || null})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating track:", error)
    return NextResponse.json({ error: "Failed to create track" }, { status: 500 })
  }
}

// PUT update track
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, slug, description, icon, color, start_date, end_date, is_active, order_index } = body

    const result = await sql`
      UPDATE gold_tracks 
      SET name = ${name}, slug = ${slug}, description = ${description}, 
          icon = ${icon}, color = ${color}, start_date = ${start_date || null}, end_date = ${end_date || null},
          is_active = ${is_active}, order_index = ${order_index}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating track:", error)
    return NextResponse.json({ error: "Failed to update track" }, { status: 500 })
  }
}

// DELETE track
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM gold_tracks WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting track:", error)
    return NextResponse.json({ error: "Failed to delete track" }, { status: 500 })
  }
}
