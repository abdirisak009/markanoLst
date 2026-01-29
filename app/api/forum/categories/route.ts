import postgres from "postgres"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    const categories = await sql`
      SELECT 
        fc.*,
        COALESCE(COUNT(DISTINCT ft.id), 0)::int as topics_count,
        COALESCE(COUNT(DISTINCT fr.id), 0)::int as posts_count
      FROM forum_categories fc
      LEFT JOIN forum_topics ft ON ft.category_id = fc.id
      LEFT JOIN forum_replies fr ON fr.topic_id = ft.id
      GROUP BY fc.id
      ORDER BY fc.id
    `

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching forum categories:", error)
    return NextResponse.json([], { status: 200 })
  }
}
