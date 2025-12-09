import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const videos = await sql`
      SELECT * FROM videos 
      ORDER BY uploaded_at DESC
    `
    return NextResponse.json(videos)
  } catch (error) {
    console.error("[v0] Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, url, duration, category, access_type } = body

    const result = await sql`
      INSERT INTO videos (title, description, url, duration, category, access_type, views)
      VALUES (${title}, ${description}, ${url}, ${duration || "0:00"}, ${category}, ${access_type || "open"}, 0)
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating video:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, description, url, duration, category, access_type } = body

    const result = await sql`
      UPDATE videos
      SET 
        title = ${title},
        description = ${description},
        url = ${url},
        duration = ${duration},
        category = ${category},
        access_type = ${access_type}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating video:", error)
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM videos WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting video:", error)
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
  }
}
