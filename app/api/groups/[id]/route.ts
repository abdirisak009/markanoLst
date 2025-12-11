import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

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

    if (group.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    return NextResponse.json(group[0])
  } catch (error) {
    console.error("[v0] Error fetching group:", error)
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 })
  }
}
