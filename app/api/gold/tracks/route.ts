import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET all tracks with levels count
export async function GET() {
  try {
    const tracks = await sql`
      SELECT 
        t.*,
        COUNT(DISTINCT l.id) as levels_count,
        COUNT(DISTINCT ls.id) as lessons_count,
        COUNT(DISTINCT e.student_id) as enrolled_students
      FROM gold_tracks t
      LEFT JOIN gold_levels l ON t.id = l.track_id
      LEFT JOIN gold_lessons ls ON l.id = ls.level_id
      LEFT JOIN gold_enrollments e ON t.id = e.track_id
      GROUP BY t.id
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
    const { name, slug, description, icon, color, estimated_duration } = body

    const result = await sql`
      INSERT INTO gold_tracks (name, slug, description, icon, color, estimated_duration)
      VALUES (${name}, ${slug}, ${description}, ${icon || "BookOpen"}, ${color || "#3B82F6"}, ${estimated_duration})
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
    const { id, name, slug, description, icon, color, estimated_duration, is_active, order_index } = body

    const result = await sql`
      UPDATE gold_tracks 
      SET name = ${name}, slug = ${slug}, description = ${description}, 
          icon = ${icon}, color = ${color}, estimated_duration = ${estimated_duration},
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
