import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Get all payments
    const payments = await sql`
      SELECT 
        gp.*,
        gp.group_id,
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
        COALESCE(SUM(DISTINCT gp.amount_paid), 0) as total_collected
      FROM classes c
      LEFT JOIN groups g ON c.id = g.class_id
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.class_id = c.id
      LEFT JOIN group_payments gp ON gm.student_id = gp.student_id AND gm.group_id = gp.group_id AND gp.group_id = g.id
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
