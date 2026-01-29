import postgres from "postgres"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get("groupId")

    if (!groupId) {
      return NextResponse.json({ error: "Group ID required" }, { status: 400 })
    }

    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    // Get submission
    const submissions = await sql`
      SELECT * FROM ecommerce_wizard_submissions
      WHERE group_id = ${Number.parseInt(groupId)}
      ORDER BY created_at DESC
      LIMIT 1
    `

    // Get group info
    const groups = await sql`
      SELECT id, name, project_name FROM groups WHERE id = ${Number.parseInt(groupId)}
    `

    return NextResponse.json({
      submission: submissions[0] || null,
      group: groups[0] || null,
    })
  } catch (error) {
    console.error("Error fetching submission:", error)
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 })
  }
}
