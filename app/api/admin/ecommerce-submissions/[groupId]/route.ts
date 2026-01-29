import postgres from "postgres"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    const submissions = await sql`
      SELECT 
        ews.*,
        g.name as group_name,
        c.name as class_name
      FROM ecommerce_wizard_submissions ews
      LEFT JOIN groups g ON ews.group_id = g.id
      LEFT JOIN classes c ON g.class_id = c.id
      WHERE ews.group_id = ${groupId}
      LIMIT 1
    `

    if (submissions.length === 0) {
      return NextResponse.json({ submission: null })
    }

    return NextResponse.json({ submission: submissions[0] })
  } catch (error) {
    console.error("Error fetching submission:", error)
    return NextResponse.json({ submission: null }, { status: 500 })
  }
}
