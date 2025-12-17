import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const submissions = await sql`
      SELECT 
        ews.id,
        ews.group_id,
        g.name as group_name,
        c.name as class_name,
        ews.business_name,
        ews.platform_selected,
        ews.status,
        ews.current_step,
        ews.created_at,
        ews.updated_at
      FROM ecommerce_wizard_submissions ews
      LEFT JOIN groups g ON ews.group_id = g.id
      LEFT JOIN classes c ON g.class_id = c.id
      ORDER BY ews.updated_at DESC NULLS LAST, ews.created_at DESC
    `

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Error fetching ecommerce submissions:", error)
    return NextResponse.json({ submissions: [] })
  }
}
