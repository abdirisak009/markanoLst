import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get("groupId")

    if (!groupId) {
      return NextResponse.json({ valid: false, error: "Group ID required" })
    }

    const sql = neon(process.env.DATABASE_URL!)

    const groups = await sql`
      SELECT id, name FROM groups WHERE id = ${Number.parseInt(groupId)}
    `

    return NextResponse.json({
      valid: groups.length > 0,
      group: groups[0] || null,
    })
  } catch (error) {
    console.error("Error validating group:", error)
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 })
  }
}
