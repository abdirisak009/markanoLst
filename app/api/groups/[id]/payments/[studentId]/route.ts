import { type NextRequest, NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; studentId: string }> }) {
  try {
    const { id: groupId, studentId } = await context.params

    console.log("[v0] Deleting payment for student:", studentId, "in group:", groupId)

    const result = await sql`
      DELETE FROM group_payments 
      WHERE group_id = ${Number(groupId)} 
      AND student_id = ${studentId}
      RETURNING id
    `

    console.log("[v0] Rows deleted:", result.length)

    if (result.length === 0) {
      console.log("[v0] No payment found to delete - student may already be unpaid")
      return NextResponse.json({ success: true, message: "No payment found" })
    }

    console.log("[v0] Payment deleted successfully, ID:", result[0].id)

    return NextResponse.json({ success: true, deletedCount: result.length })
  } catch (error) {
    console.error("[v0] Error deleting payment:", error)
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })
  }
}
