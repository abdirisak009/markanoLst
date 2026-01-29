import postgres from "postgres"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get("tab") || "latest"
    const category = searchParams.get("category") || "all"

    let orderBy = "ft.created_at DESC"
    if (tab === "hot") {
      orderBy = "(ft.views + ft.replies_count * 10) DESC"
    }

    let categoryFilter = ""
    if (category !== "all") {
      categoryFilter = `AND fc.slug = '${category}'`
    }

    const topics = await sql`
      SELECT 
        ft.*,
        fc.name as category_name,
        fc.slug as category_slug,
        fc.color as category_color,
        COALESCE(
          (SELECT full_name FROM penn_students WHERE student_id = ft.author_id),
          (SELECT full_name FROM university_students WHERE student_id = ft.author_id),
          (SELECT full_name FROM admin_users WHERE id::text = ft.author_id),
          'Anonymous'
        ) as author_name
      FROM forum_topics ft
      LEFT JOIN forum_categories fc ON fc.id = ft.category_id
      WHERE 1=1 ${category !== "all" ? sql`AND fc.slug = ${category}` : sql``}
      ORDER BY ft.is_pinned DESC, ${tab === "hot" ? sql`(ft.views + ft.replies_count * 10) DESC` : sql`ft.created_at DESC`}
      LIMIT 50
    `

    // Get participants for each topic
    const topicsWithParticipants = await Promise.all(
      topics.map(async (topic: any) => {
        const participants = await sql`
          SELECT DISTINCT 
            ftp.user_id as id,
            COALESCE(
              (SELECT full_name FROM penn_students WHERE student_id = ftp.user_id),
              (SELECT full_name FROM university_students WHERE student_id = ftp.user_id),
              'User'
            ) as name
          FROM forum_topic_participants ftp
          WHERE ftp.topic_id = ${topic.id}
          LIMIT 5
        `
        return { ...topic, participants }
      }),
    )

    return NextResponse.json(topicsWithParticipants)
  } catch (error) {
    console.error("Error fetching forum topics:", error)
    return NextResponse.json([], { status: 200 })
  }
}
