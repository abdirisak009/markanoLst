import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; studentId: string }> }) {
  try {
    const { id, studentId } = await params

    await sql`
      DELETE FROM group_members 
      WHERE group_id = ${id} AND student_id = ${studentId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error removing member:", error)
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
  }
}
