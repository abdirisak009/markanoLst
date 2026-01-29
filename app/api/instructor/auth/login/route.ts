import { NextResponse } from "next/server"
import postgres from "postgres"
import { verifyPassword, generateInstructorToken, setInstructorCookie } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * POST /api/instructor/auth/login
 * Public: instructor login. Only approved (active) instructors can log in.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const emailLower = email.trim().toLowerCase()
    const [instructor] = await sql`
      SELECT id, full_name, email, password_hash, status
      FROM instructors
      WHERE LOWER(email) = ${emailLower} AND deleted_at IS NULL
    `

    if (!instructor) {
      return NextResponse.json(
        { error: "Invalid email or password", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      )
    }

    if (instructor.status !== "active") {
      return NextResponse.json(
        { error: "Your account is suspended. Contact support.", code: "ACCOUNT_SUSPENDED" },
        { status: 403 }
      )
    }

    const valid = await verifyPassword(password, instructor.password_hash)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      )
    }

    const token = generateInstructorToken({
      id: instructor.id,
      email: instructor.email,
      name: instructor.full_name,
    })
    await setInstructorCookie(token)

    const { password_hash, ...instructorData } = instructor
    const response = NextResponse.json({
      success: true,
      instructor: instructorData,
    })
    response.cookies.set("instructor_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60,
      path: "/",
    })
    return response
  } catch (e) {
    console.error("Instructor login error:", e)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
