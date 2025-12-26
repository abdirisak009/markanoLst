import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Find student
    const students = await sql`
      SELECT * FROM gold_students WHERE email = ${email}
    `

    if (students.length === 0) {
      return NextResponse.json({ error: "Email-ku ma jiro" }, { status: 401 })
    }

    const student = students[0]

    // Check password
    const validPassword = await bcrypt.compare(password, student.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: "Password-ku khalad" }, { status: 401 })
    }

    // Check account status
    if (student.account_status !== "active") {
      return NextResponse.json({ error: "Account-kaagu wali ma shaqeenayo" }, { status: 403 })
    }

    // Return student data (without password)
    const { password_hash, ...studentData } = student
    return NextResponse.json(studentData)
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
