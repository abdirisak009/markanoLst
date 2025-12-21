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
        c.id as class_id,
        c.name as class_name,
        ews.business_name,
        ews.platform_selected,
        ews.custom_store_name,
        ews.custom_store_url,
        ews.status,
        ews.current_step,
        ews.revenue_target,
        ews.product_name,
        ews.created_at,
        ews.updated_at,
        ews.submitted_at,
        (
          SELECT us.name 
          FROM group_members gm 
          JOIN university_students us ON gm.student_id = us.id 
          WHERE gm.group_id = g.id AND gm.is_leader = true 
          LIMIT 1
        ) as leader_name
      FROM ecommerce_wizard_submissions ews
      LEFT JOIN groups g ON ews.group_id = g.id
      LEFT JOIN classes c ON g.class_id = c.id
      ORDER BY ews.updated_at DESC NULLS LAST, ews.created_at DESC
    `

    const classes = await sql`
      SELECT DISTINCT c.id, c.name 
      FROM ecommerce_wizard_submissions ews
      LEFT JOIN groups g ON ews.group_id = g.id
      LEFT JOIN classes c ON g.class_id = c.id
      WHERE c.id IS NOT NULL
      ORDER BY c.name
    `

    return NextResponse.json({ submissions, classes })
  } catch (error) {
    console.error("Error fetching ecommerce submissions:", error)
    return NextResponse.json({ submissions: [], classes: [] })
  }
}
