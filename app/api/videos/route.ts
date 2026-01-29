import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function GET() {
  try {
    const videos = await sql`
      SELECT 
        v.*,
        COALESCE(
          json_agg(
            json_build_object('class_id', vca.class_id, 'university_id', vca.university_id)
          ) FILTER (WHERE vca.id IS NOT NULL),
          '[]'
        ) as class_access
      FROM videos v
      LEFT JOIN video_class_access vca ON v.id = vca.video_id
      GROUP BY v.id
      ORDER BY v.uploaded_at DESC
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
    const { title, description, url, duration, category, access_type, class_access } = body

    const result = await sql`
      INSERT INTO videos (title, description, url, duration, category, access_type, views)
      VALUES (${title}, ${description}, ${url}, ${duration || "0:00"}, ${category}, ${access_type || "open"}, 0)
      RETURNING *
    `

    const videoId = result[0].id

    if (class_access && class_access.length > 0 && access_type === "watch_universities") {
      for (const access of class_access) {
        await sql`
          INSERT INTO video_class_access (video_id, class_id, university_id)
          VALUES (${videoId}, ${access.class_id}, ${access.university_id})
          ON CONFLICT (video_id, class_id) DO NOTHING
        `
      }
    }

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating video:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, description, url, duration, category, access_type, class_access } = body

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

    await sql`DELETE FROM video_class_access WHERE video_id = ${id}`

    if (class_access && class_access.length > 0 && access_type === "watch_universities") {
      for (const access of class_access) {
        await sql`
          INSERT INTO video_class_access (video_id, class_id, university_id)
          VALUES (${id}, ${access.class_id}, ${access.university_id})
          ON CONFLICT (video_id, class_id) DO NOTHING
        `
      }
    }

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
