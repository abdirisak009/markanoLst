import postgres from "postgres"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    // groups.leader_student_id instead of group_members.is_leader
    // university_students.full_name instead of name
    const submissions = await sql`
      SELECT 
        ews.id,
        ews.group_id,
        g.name as group_name,
        c.id as class_id,
        c.name as class_name,
        ews.business_name,
        ews.platform_selected,
        ews.status,
        ews.current_step,
        ews.revenue_target,
        ews.product_name,
        ews.created_at,
        ews.updated_at,
        ews.submitted_at,
        us.full_name as leader_name
      FROM ecommerce_wizard_submissions ews
      LEFT JOIN groups g ON ews.group_id = g.id
      LEFT JOIN classes c ON g.class_id = c.id
      LEFT JOIN university_students us ON g.leader_student_id = us.student_id
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
