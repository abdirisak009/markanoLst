import postgres from "postgres"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })
    const { groupId, studentId } = await request.json()

    if (!groupId || !studentId) {
      return NextResponse.json(
        { isLeader: false, message: "Group ID iyo Student ID waa loo baahan yahay" },
        { status: 400 },
      )
    }

    // Check if the student is the leader of the group
    const result = await sql`
      SELECT 
        g.id,
        g.name,
        g.leader_student_id,
        c.name as class_name
      FROM groups g
      LEFT JOIN classes c ON g.class_id = c.id
      WHERE g.id = ${groupId}
    `

    if (result.length === 0) {
      return NextResponse.json({ isLeader: false, message: "Group-kan lama helin" }, { status: 404 })
    }

    const group = result[0]

    // Check if the provided studentId matches the leader_student_id
    const isLeader = group.leader_student_id === studentId

    if (isLeader) {
      return NextResponse.json({
        isLeader: true,
        message: "Waad ku guulaysatay! Waxaad tahay leader-ka group-kan.",
        group: {
          id: group.id,
          name: group.name,
          class_name: group.class_name,
        },
      })
    } else {
      return NextResponse.json({
        isLeader: false,
        message: "Maaha leader-ka group-kan. Kaliya leader-ku ayaa buuxin kara wizard-kan.",
      })
    }
  } catch (error) {
    console.error("Error verifying leader:", error)
    return NextResponse.json(
      { isLeader: false, message: "Khalad ayaa dhacay. Fadlan isku day mar kale." },
      { status: 500 },
    )
  }
}
