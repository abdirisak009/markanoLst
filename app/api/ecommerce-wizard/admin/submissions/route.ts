import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const submissions = await sql`
      SELECT 
        e.*,
        g.name as group_name
      FROM ecommerce_wizard_submissions e
      LEFT JOIN groups g ON e.group_id = g.id
      ORDER BY e.updated_at DESC
    `

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
