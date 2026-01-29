import postgres from "postgres"
import { NextResponse } from "next/server"
import { generateGoldStudentToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    let { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Please enter both email and password",
          code: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    // Trim whitespace and convert email to lowercase for comparison
    email = email.trim().toLowerCase()
    password = password.trim()

    // Find student (case-insensitive email comparison)
    const students = await sql`
      SELECT * FROM gold_students WHERE LOWER(TRIM(email)) = ${email}
    `

    if (students.length === 0) {
      console.log(`[Login] Student not found for email: ${email}`)
      return NextResponse.json(
        {
          error: "Invalid email or password. Please check your credentials and try again.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 },
      )
    }

    const student = students[0]

    // Check if password_hash exists
    if (!student.password_hash || student.password_hash.trim() === "") {
      console.log(`[Login] No password hash found for student: ${student.id}, email: ${email}`)
      console.log(`[Login] Student data:`, { id: student.id, email: student.email, account_status: student.account_status })
      return NextResponse.json(
        {
          error: "Your account does not have a password set. Please contact an administrator to set your password.",
          code: "NO_PASSWORD",
        },
        { status: 401 },
      )
    }

    // Try bcrypt first (new method)
    let isPasswordValid = false
    
    try {
      if (student.password_hash.startsWith("$2")) {
        // Bcrypt hash (starts with $2a$, $2b$, etc.)
        isPasswordValid = await bcrypt.compare(password, student.password_hash)
        console.log(`[Login] Bcrypt comparison result for student ${student.id}: ${isPasswordValid}`)
        console.log(`[Login] Password hash prefix: ${student.password_hash.substring(0, 20)}...`)
      } else {
        // Old SHA-256 hash - try to verify it
        const encoder = new TextEncoder()
        const data = encoder.encode(password + "markano_gold_salt_2024")
        const hashBuffer = await crypto.subtle.digest("SHA-256", data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const sha256Hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
        
        isPasswordValid = sha256Hash === student.password_hash
        console.log(`[Login] SHA-256 comparison result for student ${student.id}: ${isPasswordValid}`)
        console.log(`[Login] Expected hash: ${sha256Hash.substring(0, 20)}...`)
        console.log(`[Login] Stored hash: ${student.password_hash.substring(0, 20)}...`)
        
        // If old hash works, upgrade to bcrypt for next time
        if (isPasswordValid) {
          const newHash = await bcrypt.hash(password, 12)
          await sql`UPDATE gold_students SET password_hash = ${newHash} WHERE id = ${student.id}`
          console.log(`[Login] Upgraded password hash for student: ${student.id}`)
        }
      }
    } catch (passwordError) {
      console.error(`[Login] Password verification error for student ${student.id}:`, passwordError)
      isPasswordValid = false
    }

    if (!isPasswordValid) {
      console.log(`[Login] Invalid password for student: ${student.id}, email: ${email}`)
      console.log(`[Login] Password hash type: ${student.password_hash?.substring(0, 20)}...`)
      console.log(`[Login] Account status: ${student.account_status}`)
      return NextResponse.json(
        {
          error: "Invalid email or password. Please check your credentials and try again.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 },
      )
    }

    // Check account status after password verification
    console.log(`[Login] Password valid for student ${student.id}, checking account status: ${student.account_status}`)
    
    if (student.account_status === "pending") {
      console.log(`[Login] Account pending for student: ${student.id}`)
      return NextResponse.json(
        {
          error: "Your account is pending approval. You will receive an email once an admin approves your account.",
          code: "ACCOUNT_PENDING",
        },
        { status: 403 },
      )
    }

    if (student.account_status === "suspended") {
      console.log(`[Login] Account suspended for student: ${student.id}`)
      return NextResponse.json(
        {
          error: "Your account has been suspended. Please contact support for assistance.",
          code: "ACCOUNT_SUSPENDED",
        },
        { status: 403 },
      )
    }

    if (student.account_status !== "active") {
      console.log(`[Login] Account not active for student: ${student.id}, status: ${student.account_status}`)
      return NextResponse.json(
        {
          error: `Your account is ${student.account_status}. Please contact support for assistance.`,
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

    // Try to fetch enrollments, but don't fail if table doesn't exist
    let enrollments: any[] = []
    try {
      const enrollmentResult = await sql`
        SELECT e.*, t.name as track_title, t.description as track_description
        FROM gold_enrollments e
        JOIN gold_tracks t ON e.track_id = t.id
        WHERE e.student_id = ${student.id}
      `
      enrollments = Array.isArray(enrollmentResult) ? enrollmentResult : []
    } catch (enrollmentError) {
      console.log(`[Login] Could not fetch enrollments for student ${student.id}:`, enrollmentError)
      // Continue without enrollments - not critical for login
      enrollments = []
    }

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
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Error details:", errorMessage)
    console.error("Full error object:", error)
    
    // More specific error messages
    if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("timeout") || errorMessage.includes("connect")) {
      return NextResponse.json(
        {
          error: "Database connection error. Please try again in a few minutes.",
          code: "DATABASE_ERROR",
        },
        { status: 500 },
      )
    }
    
    if (errorMessage.includes("password") || errorMessage.includes("hash") || errorMessage.includes("bcrypt")) {
      return NextResponse.json(
        {
          error: "Password verification failed. Please check your credentials.",
          code: "PASSWORD_ERROR",
        },
        { status: 500 },
      )
    }
    
    // Generic error with more details in development
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development" 
          ? `Login error: ${errorMessage}` 
          : "Something went wrong. Please try again in a few minutes.",
        code: "SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}
