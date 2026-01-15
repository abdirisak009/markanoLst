import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { generateGoldStudentToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Please enter both email and password",
          code: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    // Find student
    const students = await sql`
      SELECT * FROM gold_students WHERE email = ${email}
    `

    if (students.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid email or password. Please check your credentials and try again.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 },
      )
    }

    const student = students[0]

    const isPasswordValid = await bcrypt.compare(password, student.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Invalid email or password. Please check your credentials and try again.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 },
      )
    }

    if (student.account_status === "pending") {
      return NextResponse.json(
        {
          error: "Your account is pending approval. You will receive an email once an admin approves your account.",
          code: "ACCOUNT_PENDING",
        },
        { status: 403 },
      )
    }

    if (student.account_status === "suspended") {
      return NextResponse.json(
        {
          error: "Your account has been suspended. Please contact support for assistance.",
          code: "ACCOUNT_SUSPENDED",
        },
        { status: 403 },
      )
    }

    if (student.account_status !== "active") {
      return NextResponse.json(
        {
          error: "Your account is not active. Please contact support for assistance.",
          code: "ACCOUNT_INACTIVE",
        },
        { status: 403 },
      )
    }

    const token = generateGoldStudentToken({
      id: student.id,
      email: student.email,
      name: student.full_name,
    })

    const enrollments = await sql`
      SELECT e.*, t.title as track_title, t.description as track_description
      FROM gold_enrollments e
      JOIN gold_tracks t ON e.track_id = t.id
      WHERE e.student_id = ${student.id}
    `

    // Return student data (without password)
    const { password_hash, ...studentData } = student

    const response = NextResponse.json({
      student: studentData,
      enrollments: enrollments,
    })

    // Set secure httpOnly cookie
    response.cookies.set("gold_student_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    })

    response.cookies.set("goldStudentId", String(student.id), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again in a few minutes.",
        code: "SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}
