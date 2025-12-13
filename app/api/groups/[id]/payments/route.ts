import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params
    console.log("[v0] Fetching payments for group:", groupId)
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)

    const payments = await sql`
      SELECT 
        gm.student_id,
        us.full_name,
        us.gender,
        gp.id as payment_id,
        gp.amount_paid,
        gp.paid_at,
        gp.payment_method,
        gp.notes,
        CASE WHEN gp.id IS NOT NULL THEN true ELSE false END as has_paid
      FROM group_members gm
      LEFT JOIN university_students us ON gm.student_id = us.student_id
      LEFT JOIN group_payments gp ON gp.group_id = ${groupId} AND gp.student_id = gm.student_id
      WHERE gm.group_id = ${groupId}
      ORDER BY us.full_name
    `

    console.log("[v0] Found", payments.length, "payment records")
    return NextResponse.json(payments)
  } catch (error) {
    console.error("[v0] Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params
    const body = await request.json()
    const { student_id, amount_paid, payment_method, notes, recorded_by } = body

    console.log("[v0] Recording payment for student:", student_id, "amount:", amount_paid)

    const existingPayment = await sql`
      SELECT id FROM group_payments 
      WHERE group_id = ${groupId} AND student_id = ${student_id}
      LIMIT 1
    `

    if (existingPayment.length > 0) {
      console.log("[v0] Payment already exists for this student in this group")
      return NextResponse.json({ error: "Payment already recorded for this student in this group" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO group_payments (group_id, student_id, amount_paid, payment_method, notes, recorded_by)
      VALUES (${groupId}, ${student_id}, ${amount_paid}, ${payment_method || null}, ${notes || null}, ${recorded_by || "admin"})
      RETURNING *
    `

    console.log("[v0] Payment recorded successfully")
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error recording payment:", error)
    return NextResponse.json(
      { error: "Failed to record payment", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("payment_id")

    console.log("[v0] Deleting payment:", paymentId)

    await sql`DELETE FROM group_payments WHERE id = ${paymentId}`

    console.log("[v0] Payment deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting payment:", error)
    return NextResponse.json(
      { error: "Failed to delete payment", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
