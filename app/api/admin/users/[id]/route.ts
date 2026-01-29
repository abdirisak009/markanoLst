import postgres from "postgres"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    const [user] = await sql`
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
      WHERE au.id = ${id}
      GROUP BY au.id
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })
    const body = await request.json()
    const { username, email, full_name, password, role, status, permissions, profile_image } = body

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      await sql`
        UPDATE admin_users 
        SET username = ${username}, email = ${email}, full_name = ${full_name}, 
            password = ${hashedPassword}, role = ${role}, status = ${status},
            profile_image = ${profile_image || null}
        WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE admin_users 
        SET username = ${username}, email = ${email}, full_name = ${full_name}, 
            role = ${role}, status = ${status}, profile_image = ${profile_image || null}
        WHERE id = ${id}
      `
    }

    await sql`DELETE FROM user_permissions WHERE user_id = ${id}`

    if (permissions && permissions.length > 0) {
      for (const permission of permissions) {
        await sql`
          INSERT INTO user_permissions (user_id, permission_key)
          VALUES (${id}, ${permission})
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating user:", error)
    if (error.message?.includes("duplicate")) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

    await sql`DELETE FROM admin_users WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
