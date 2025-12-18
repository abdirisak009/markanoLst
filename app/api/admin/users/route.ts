import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const users = await sql`
      SELECT 
        au.id,
        au.username,
        au.email,
        au.full_name,
        au.role,
        au.status,
        au.last_login,
        au.created_at,
        au.profile_image,
        COALESCE(
          array_agg(up.permission_key) FILTER (WHERE up.permission_key IS NOT NULL),
          ARRAY[]::varchar[]
        ) as permissions
      FROM admin_users au
      LEFT JOIN user_permissions up ON au.id = up.user_id
      GROUP BY au.id
      ORDER BY au.created_at DESC
    `

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const body = await request.json()
    const { username, email, full_name, password, role, permissions, profile_image } = body

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const [newUser] = await sql`
      INSERT INTO admin_users (username, email, full_name, password, role, status, profile_image, created_at)
      VALUES (${username}, ${email}, ${full_name}, ${hashedPassword}, ${role || "user"}, 'active', ${profile_image || null}, NOW())
      RETURNING id, username, email, full_name, role, status, profile_image, created_at
    `

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      for (const permission of permissions) {
        await sql`
          INSERT INTO user_permissions (user_id, permission_key)
          VALUES (${newUser.id}, ${permission})
          ON CONFLICT (user_id, permission_key) DO NOTHING
        `
      }
    }

    return NextResponse.json({ ...newUser, permissions: permissions || [] })
  } catch (error: any) {
    console.error("Error creating user:", error)
    if (error.message?.includes("duplicate")) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
