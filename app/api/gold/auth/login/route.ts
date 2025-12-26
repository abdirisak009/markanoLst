import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { generateGoldStudentToken } from "@/lib/auth"

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

    // Find student
    const students = await sql`
      SELECT * FROM gold_students WHERE email = ${email}
    `

    if (students.length === 0) {
      return NextResponse.json({ error: "Email-ku ma jiro" }, { status: 401 })
    }

    const student = students[0]

    const hashedInput = await hashPassword(password)

    if (hashedInput !== student.password_hash) {
      return NextResponse.json({ error: "Password-ku khalad" }, { status: 401 })
    }

    // Check account status
    if (student.account_status !== "active") {
      return NextResponse.json({ error: "Account-kaagu wali ma shaqeenayo" }, { status: 403 })
    }

    const token = generateGoldStudentToken({
      id: student.id,
      email: student.email,
      name: student.full_name,
    })

    // Return student data (without password)
    const { password_hash, ...studentData } = student

    const response = NextResponse.json(studentData)

    // Set secure httpOnly cookie
    response.cookies.set("gold_student_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
