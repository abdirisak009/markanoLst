import postgres from "postgres"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId } = body

    if (!groupId) {
      return NextResponse.json({ error: "Group ID required" }, { status: 400 })
    }

    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    await sql`
      UPDATE ecommerce_wizard_submissions
      SET
        status = 'submitted',
        submitted_at = NOW(),
        updated_at = NOW()
      WHERE group_id = ${Number.parseInt(groupId)}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting:", error)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }
}
