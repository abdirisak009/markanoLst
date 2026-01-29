import postgres from "postgres"
import { type NextRequest, NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params

    await sql`
      UPDATE ecommerce_wizard_submissions 
      SET status = 'submitted', submitted_at = NOW(), current_step = 8
      WHERE group_id = ${groupId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting:", error)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }
}
