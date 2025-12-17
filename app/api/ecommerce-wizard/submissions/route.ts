import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const submissions = await sql`
      SELECT 
        ews.*,
        g.name as group_name,
        c.name as class_name
      FROM ecommerce_wizard_submissions ews
      JOIN groups g ON ews.group_id = g.id
      LEFT JOIN classes c ON g.class_id = c.id
      ORDER BY ews.updated_at DESC
    `

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
