import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sendWelcomeMessage } from "@/lib/whatsapp"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, password, university, field_of_study, whatsapp_number } = body

    if (!full_name || !email || !password || !whatsapp_number) {
      return NextResponse.json(
        { error: "Please fill in all required fields including WhatsApp number" },
        { status: 400 },
      )
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM gold_students WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "This email is already registered" }, { status: 400 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    const result = await sql`
      INSERT INTO gold_students (full_name, email, password_hash, university, field_of_study, whatsapp_number, account_status)
      VALUES (${full_name}, ${email}, ${password_hash}, ${university || null}, ${field_of_study || null}, ${whatsapp_number}, 'pending')
      RETURNING id, full_name, email, university, field_of_study, whatsapp_number, account_status, created_at
    `

    // Send welcome WhatsApp message (non-blocking)
    sendWelcomeMessage(whatsapp_number, full_name)
      .then((result) => {
        if (result.success) {
          console.log(`✅ WhatsApp welcome message sent to ${whatsapp_number} for ${full_name}`)
        } else {
          console.error(`❌ Failed to send WhatsApp message to ${whatsapp_number}:`, result.error)
        }
      })
      .catch((error) => {
        console.error("❌ Error sending welcome WhatsApp message:", error)
        // Don't fail the registration if WhatsApp fails
      })

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please wait for admin approval.",
        student: result[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering student:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
