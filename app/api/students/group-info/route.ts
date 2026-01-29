import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id } = body

    if (!student_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Find the student's group
    const studentGroup = await sql`
      SELECT 
        g.*,
        c.name as class_name,
        u.name as university_name,
        leader.full_name as leader_name,
        leader.student_id as leader_id,
        gm.added_at as joined_at
      FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      JOIN classes c ON g.class_id = c.id
      JOIN universities u ON g.university_id = u.id
      LEFT JOIN university_students leader ON g.leader_student_id = leader.student_id AND g.class_id = leader.class_id
      WHERE gm.student_id = ${student_id}
      LIMIT 1
    `

    if (studentGroup.length === 0) {
      return NextResponse.json({ error: "Student not found in any group" }, { status: 404 })
    }

    const group = studentGroup[0]

    // Get all members of the group
    const members = await sql`
      SELECT 
        gm.*,
        us.full_name as student_name,
        us.gender,
        us.phone
      FROM group_members gm
      LEFT JOIN university_students us ON gm.student_id = us.student_id AND gm.class_id = us.class_id
      WHERE gm.group_id = ${group.id}
      ORDER BY 
        CASE WHEN gm.student_id = ${student_id} THEN 0 ELSE 1 END,
        gm.added_at ASC
    `

    // Get payment status
    const paymentStatus = await sql`
      SELECT 
        CASE WHEN COUNT(*) > 0 THEN true ELSE false END as has_paid
      FROM group_payments
      WHERE student_id = ${student_id} AND group_id = ${group.id}
    `

    return NextResponse.json({
      group,
      members,
      currentStudent: student_id,
      hasPaid: paymentStatus[0]?.has_paid || false,
    })
  } catch (error) {
    console.error("[v0] Error fetching student group info:", error)
    return NextResponse.json({ error: "Failed to fetch group information" }, { status: 500 })
  }
}
