import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

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
