import { NextResponse } from "next/server"
import postgres from "postgres"
import { cookies } from "next/headers"
import { verifyGoldStudentToken } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/learning/streak-messages?userId=
 * Returns last streak WhatsApp sent to this student (so they can see it on dashboard).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get("userId")

    const cookieStore = await cookies()
    const token = cookieStore.get("gold_student_token")?.value ?? null
    const tokenResult = verifyGoldStudentToken(token)
    const payload = tokenResult.valid ? tokenResult.payload : null

    if (!payload && !userIdParam) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = userIdParam ? parseInt(userIdParam, 10) : payload?.id
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
    }
    if (payload && payload.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let rows: { id: number; student_id: number; sent_at: string }[] = []
    try {
      rows = await sql`
        SELECT id, student_id, sent_at
        FROM streak_whatsapp_sent
        WHERE student_id = ${userId}
        ORDER BY sent_at DESC
        LIMIT 10
      `
    } catch (tableErr: unknown) {
      const msg = String(tableErr)
      if (msg.includes("does not exist") || msg.includes("relation")) {
        return NextResponse.json({ last_sent_at: null, history: [] })
      }
      throw tableErr
    }

    return NextResponse.json({
      last_sent_at: rows[0]?.sent_at ?? null,
      history: rows,
    })
  } catch (e) {
    console.error("Error fetching streak messages:", e)
    return NextResponse.json({ error: "Failed to fetch streak messages" }, { status: 500 })
  }
}
