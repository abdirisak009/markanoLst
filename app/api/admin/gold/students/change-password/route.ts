import { NextRequest, NextResponse } from "next/server"
import postgres from "postgres"
import bcrypt from "bcryptjs"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_id, new_password } = body

    if (!student_id || !new_password) {
      return NextResponse.json({ error: "Student ID and new password are required" }, { status: 400 })
    }

    if (new_password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(new_password, 12)

    // Update the password
    await sql`
      UPDATE gold_students
      SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(student_id)}
    `

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to change password" },
      { status: 500 },
    )
  }
}
