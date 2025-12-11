import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const groupId = params.id

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

    return NextResponse.json(payments)
  } catch (error) {
    console.error("[v0] Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const groupId = params.id
    const body = await request.json()
    const { student_id, amount_paid, payment_method, notes, recorded_by } = body

    const result = await sql`
      INSERT INTO group_payments (group_id, student_id, amount_paid, payment_method, notes, recorded_by)
      VALUES (${groupId}, ${student_id}, ${amount_paid}, ${payment_method || null}, ${notes || null}, ${recorded_by || "admin"})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error recording payment:", error)
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("payment_id")

    await sql`DELETE FROM group_payments WHERE id = ${paymentId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting payment:", error)
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })
  }
}
