import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: Request, { params }: { params: Promise<{ participantId: string }> }) {
  try {
    const { participantId } = await params

    // Reset focus violations and unlock the editor
    await sql`
      UPDATE live_coding_participants 
      SET 
        focus_violations = 0,
        is_editor_locked = false,
        updated_at = NOW()
      WHERE id = ${participantId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unlocking participant:", error)
    return NextResponse.json({ error: "Failed to unlock participant" }, { status: 500 })
  }
}
