import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "markano_gold_salt_2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("[v0] Login attempt for:", email)

    // Find student
    const students = await sql`
      SELECT * FROM gold_students WHERE email = ${email}
    `

    if (students.length === 0) {
      return NextResponse.json({ error: "Email-ku ma jiro" }, { status: 401 })
    }

    const student = students[0]

    const hashedInput = await hashPassword(password)
    console.log(
      "[v0] Password comparison - stored:",
      student.password_hash?.substring(0, 10),
      "input:",
      hashedInput.substring(0, 10),
    )

    if (hashedInput !== student.password_hash) {
      return NextResponse.json({ error: "Password-ku khalad" }, { status: 401 })
    }

    // Check account status
    if (student.account_status !== "active") {
      return NextResponse.json({ error: "Account-kaagu wali ma shaqeenayo" }, { status: 403 })
    }

    // Return student data (without password)
    const { password_hash, ...studentData } = student
    console.log("[v0] Login successful for:", email)
    return NextResponse.json(studentData)
  } catch (error) {
    console.error("[v0] Error logging in:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
