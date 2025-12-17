import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { username, password } = await request.json()

    const [user] = await sql`
      SELECT 
        au.id,
        au.username,
        au.email,
        au.full_name,
        au.role,
        au.status,
        au.password,
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
      // Password is hashed - use bcrypt compare
      isValid = await bcrypt.compare(password, user.password)
    } else {
      // Password is plain text - direct comparison (for legacy users)
      isValid = user.password === password

      // If valid, hash the password for future logins
      if (isValid) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await sql`UPDATE admin_users SET password = ${hashedPassword} WHERE id = ${user.id}`
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: "Username ama password-ku waa khalad" }, { status: 401 })
    }

    // Update last login
    await sql`UPDATE admin_users SET last_login = NOW() WHERE id = ${user.id}`

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Login wuu fashilmay. Fadlan isku day mar kale." }, { status: 500 })
  }
}
