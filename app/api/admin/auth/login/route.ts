import postgres from "postgres"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { generateAdminToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set")
      return NextResponse.json(
        { error: "Database configuration error. Please contact administrator." },
        { status: 500 }
      )
    }

    const sql = postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    const [user] = await sql`
      SELECT 
        au.id,
        au.username,
        au.email,
        au.full_name,
        au.role,
        au.status,
        au.password,
        au.profile_image,
        COALESCE(
          array_agg(up.permission_key) FILTER (WHERE up.permission_key IS NOT NULL),
          ARRAY[]::varchar[]
        ) as permissions
      FROM admin_users au
      LEFT JOIN user_permissions up ON au.id = up.user_id
      WHERE au.username = ${username} OR au.email = ${username}
      GROUP BY au.id
    `

    if (!user) {
      return NextResponse.json({ error: "Username ama password-ku waa khalad" }, { status: 401 })
    }

    if (user.status !== "active") {
      return NextResponse.json({ error: "Account-kaagu waa la joojiyay" }, { status: 401 })
    }

    let isValid = false

    if (user.password?.startsWith("$2")) {
      isValid = await bcrypt.compare(password, user.password)
    } else {
      isValid = user.password === password

      if (isValid) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await sql`UPDATE admin_users SET password = ${hashedPassword} WHERE id = ${user.id}`
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: "Username ama password-ku waa khalad" }, { status: 401 })
    }

    await sql`UPDATE admin_users SET last_login = NOW() WHERE id = ${user.id}`

    const token = generateAdminToken({
      id: user.id,
      username: user.username,
      role: user.role,
    })

    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      ...userWithoutPassword,
      fullName: user.full_name,
      profileImage: user.profile_image || null,
    })

    // Set secure httpOnly cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error during login:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("DATABASE_URL") || error.message.includes("database")) {
        return NextResponse.json(
          { error: "Database connection error. Please contact administrator." },
          { status: 500 }
        )
      }
      if (error.message.includes("ECONNREFUSED") || error.message.includes("connection")) {
        return NextResponse.json(
          { error: "Unable to connect to database. Please try again later." },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Login failed. Please check your credentials and try again." },
      { status: 500 }
    )
  }
}
