import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, password, university, field_of_study } = body

    // Validate required fields
    if (!full_name || !email || !password) {
      return NextResponse.json({ error: "Fadlan buuxi dhammaan xogta loo baahan yahay" }, { status: 400 })
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM gold_students WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email-kan horey ayaa loo isticmaalay" }, { status: 400 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Create student with pending status
    const result = await sql`
      INSERT INTO gold_students (full_name, email, password_hash, university, field_of_study, account_status)
      VALUES (${full_name}, ${email}, ${password_hash}, ${university}, ${field_of_study}, 'pending')
      RETURNING id, full_name, email, university, field_of_study, account_status, created_at
    `

    return NextResponse.json(
      {
        success: true,
        message: "Is-diiwaan gelintu way guulaysatay. Fadlan sug ansixinta admin-ka.",
        student: result[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering student:", error)
    return NextResponse.json({ error: "Khalad ayaa dhacay" }, { status: 500 })
  }
}
