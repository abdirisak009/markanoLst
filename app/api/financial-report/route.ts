import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Get all payments
    const payments = await sql`
      SELECT 
        gp.*,
        g.name as group_name,
        us.full_name as student_name
      FROM group_payments gp
      JOIN groups g ON gp.group_id = g.id
      LEFT JOIN university_students us ON gp.student_id = us.student_id
      ORDER BY gp.paid_at DESC
    `

    // Get all group expenses
    const groupExpenses = await sql`
      SELECT 
        ge.*,
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
      groupExpenses,
      generalExpenses,
    })
  } catch (error) {
    console.error("[v0] Error fetching financial report:", error)
    return NextResponse.json({ error: "Failed to fetch financial report" }, { status: 500 })
  }
}
