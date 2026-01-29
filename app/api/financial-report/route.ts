import { NextResponse } from "next/server"
import postgres from "postgres"

export async function GET() {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    // Get all payments
    const payments = await sql`
      SELECT 
        gp.id,
        gp.student_id,
        gp.group_id,
        gp.amount_paid,
        gp.payment_method,
        gp.notes,
        gp.paid_at,
        g.name as group_name,
        g.class_id,
        c.name as class_name,
        us.full_name as student_name
      FROM group_payments gp
      JOIN groups g ON gp.group_id = g.id
      JOIN classes c ON g.class_id = c.id
      LEFT JOIN university_students us ON gp.student_id = us.student_id
      ORDER BY gp.paid_at DESC
    `

    const unpaidStudents = await sql`
      SELECT 
        gm.student_id,
        gm.group_id,
        gm.class_id,
        us.full_name as student_name,
        g.name as group_name,
        g.cost_per_member as amount_due,
        c.name as class_name
      FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      JOIN classes c ON g.class_id = c.id
      LEFT JOIN university_students us ON gm.student_id = us.student_id
      LEFT JOIN group_payments gp ON gm.student_id = gp.student_id AND gm.group_id = gp.group_id
      WHERE gp.id IS NULL OR gp.amount_paid <= 0
      ORDER BY c.name, g.name, us.full_name
    `

    // Get all group expenses
    const groupExpenses = await sql`
      SELECT 
        ge.*,
        ge.group_id,
        g.name as group_name
      FROM group_expenses ge
      JOIN groups g ON ge.group_id = g.id
      ORDER BY ge.expense_date DESC
    `

    // Get all general expenses
    const generalExpenses = await sql`
      SELECT * FROM general_expenses 
      ORDER BY expense_date DESC
    `

    const classStats = await sql`
      SELECT 
        c.id,
        c.name as class_name,
        COUNT(DISTINCT gm.student_id) as total_students,
        COUNT(DISTINCT CASE WHEN gp.amount_paid > 0 THEN gm.student_id END) as paid_students,
        COUNT(DISTINCT gm.student_id) - COUNT(DISTINCT CASE WHEN gp.amount_paid > 0 THEN gm.student_id END) as unpaid_students,
        COALESCE(SUM(gp.amount_paid), 0) as total_collected
      FROM classes c
      LEFT JOIN groups g ON c.id = g.class_id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN group_payments gp ON gm.student_id = gp.student_id AND gm.group_id = gp.group_id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `

    const groupStats = await sql`
      SELECT 
        g.id,
        g.name as group_name,
        g.cost_per_member,
        c.name as class_name,
        COUNT(DISTINCT gm.student_id) as total_members,
        COUNT(DISTINCT CASE WHEN gp.amount_paid > 0 THEN gp.student_id END) as paid_members,
        COUNT(DISTINCT gm.student_id) - COUNT(DISTINCT CASE WHEN gp.amount_paid > 0 THEN gp.student_id END) as unpaid_members,
        COALESCE(SUM(gp.amount_paid), 0) as total_collected,
        g.cost_per_member * COUNT(DISTINCT gm.student_id) as expected_total
      FROM groups g
      JOIN classes c ON g.class_id = c.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN group_payments gp ON gm.student_id = gp.student_id AND gm.group_id = gp.group_id
      GROUP BY g.id, g.name, g.cost_per_member, c.name
      ORDER BY g.name
    `

    // Calculate totals
    const totalIncome = payments.reduce((sum, p) => sum + Number.parseFloat(p.amount_paid), 0)
    const totalGroupExpenses = groupExpenses.reduce((sum, e) => sum + Number.parseFloat(e.amount), 0)
    const totalGeneralExpenses = generalExpenses.reduce((sum, e) => sum + Number.parseFloat(e.amount), 0)
    const totalExpenses = totalGroupExpenses + totalGeneralExpenses
    const netBalance = totalIncome - totalExpenses

    return NextResponse.json({
      summary: {
        totalIncome,
        totalGroupExpenses,
        totalGeneralExpenses,
        totalExpenses,
        netBalance,
      },
      payments,
      unpaidStudents,
      groupExpenses,
      generalExpenses,
      classStats,
      groupStats,
    })
  } catch (error) {
    console.error("[v0] Error fetching financial report:", error)
    return NextResponse.json({ error: "Failed to fetch financial report" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })
    const body = await request.json()
    const { id, amount_paid, payment_method, notes } = body

    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE group_payments
      SET 
        amount_paid = ${amount_paid},
        payment_method = ${payment_method || "Cash"},
        notes = ${notes || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment updated successfully",
      payment: result[0],
    })
  } catch (error) {
    console.error("[v0] Error updating payment:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Get payment details before deleting for confirmation
    const payment = await sql`
      SELECT gp.*, us.full_name as student_name, g.name as group_name
      FROM group_payments gp
      LEFT JOIN university_students us ON gp.student_id = us.student_id
      LEFT JOIN groups g ON gp.group_id = g.id
      WHERE gp.id = ${id}
    `

    if (payment.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    await sql`DELETE FROM group_payments WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
      deletedPayment: payment[0],
    })
  } catch (error) {
    console.error("[v0] Error deleting payment:", error)
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })
  }
}
