import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params

    const result = await sql`
      SELECT g.*, c.name as class_name, u.name as university_name
      FROM groups g
      LEFT JOIN classes c ON g.class_id = c.id
      LEFT JOIN universities u ON g.university_id = u.id
      WHERE g.id = ${groupId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching group:", error)
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 })
  }
}
