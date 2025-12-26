import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { generateAdminToken } from "@/lib/auth"

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
    return NextResponse.json({ error: "Login wuu fashilmay. Fadlan isku day mar kale." }, { status: 500 })
  }
}
