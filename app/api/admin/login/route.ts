import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("[v0] Admin login API - checking credentials:", { username })

    // Query the admin_users table
    const result = await sql`
      SELECT id, username, full_name, email, role, created_at 
      FROM admin_users 
      WHERE username = ${username} AND password = ${password}
      LIMIT 1
    `

    if (result.length === 0) {
      console.log("[v0] Admin login failed - invalid credentials")
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
    }

    const admin = result[0]
    console.log("[v0] Admin login successful:", { username: admin.username, role: admin.role })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("[v0] Admin login API error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
