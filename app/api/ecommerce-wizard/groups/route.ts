import postgres from "postgres"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    const groups = await sql`
      SELECT id, name, project_name, leader_student_id
      FROM groups
      ORDER BY id ASC
    `

    return NextResponse.json({ groups })
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}
