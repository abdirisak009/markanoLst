import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { groupId, studentId } = await request.json()

    if (!groupId || !studentId) {
      return NextResponse.json({ isLeader: false, message: "Missing group ID or student ID" }, { status: 400 })
    }

    // Check if the student is the leader of the group
    const result = await sql`
      SELECT id, name, leader_student_id 
      FROM groups 
      WHERE id = ${groupId}
    `

    if (result.length === 0) {
      return NextResponse.json({ isLeader: false, message: "Group not found" }, { status: 404 })
    }

    const group = result[0]

    // Compare student ID with leader_student_id (case-insensitive)
    const isLeader = group.leader_student_id?.toLowerCase() === studentId.toLowerCase()

    if (isLeader) {
      return NextResponse.json({
        isLeader: true,
        message: "Verified successfully",
        groupName: group.name,
      })
    } else {
      return NextResponse.json({
        isLeader: false,
        message: "You are not the leader of this group. Only group leaders can access the E-commerce Wizard.",
      })
    }
  } catch (error) {
    console.error("Error verifying leader:", error)
    return NextResponse.json({ isLeader: false, message: "Verification failed" }, { status: 500 })
  }
}
