import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[v0] Fetching group:", id)
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("[v0] DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 20))

    const group = await sql`
      SELECT 
        g.*,
        u.name as university_name,
        c.name as class_name,
        us.full_name as leader_name
      FROM groups g
      LEFT JOIN universities u ON g.university_id = u.id
      LEFT JOIN classes c ON g.class_id = c.id
      LEFT JOIN university_students us ON g.leader_student_id = us.student_id AND g.class_id = us.class_id
      WHERE g.id = ${id}
    `

    console.log("[v0] Group query returned", group.length, "results")

    if (group.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    console.log("[v0] Group found:", group[0].name)
    return NextResponse.json(group[0])
  } catch (error) {
    console.error("[v0] Error fetching group:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch group",
        details: error instanceof Error ? error.message : String(error),
        dbConfigured: !!process.env.DATABASE_URL,
      },
      { status: 500 },
    )
  }
}
