import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; participantId: string }> }) {
  try {
    const { participantId } = await params

    await sql`DELETE FROM live_coding_participants WHERE id = ${participantId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing participant:", error)
    return NextResponse.json({ error: "Failed to remove participant" }, { status: 500 })
  }
}
