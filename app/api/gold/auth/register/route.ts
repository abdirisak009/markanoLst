import postgres from "postgres"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sendWelcomeMessage } from "@/lib/whatsapp"
import { sendRegistrationEmail } from "@/lib/email"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    let { full_name, email, password, university, field_of_study, whatsapp_number } = body

    if (!full_name || !email || !password || !whatsapp_number) {
      return NextResponse.json(
        { error: "Please fill in all required fields including WhatsApp number" },
        { status: 400 },
      )
    }

    // Normalize email: trim whitespace and convert to lowercase
    email = email.trim().toLowerCase()
    full_name = full_name.trim()
    password = password.trim()
    whatsapp_number = whatsapp_number.trim()

    // Check if email already exists (case-insensitive)
    const existing = await sql`SELECT id FROM gold_students WHERE LOWER(TRIM(email)) = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "This email is already registered" }, { status: 400 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Set account_status to 'active' so students can login immediately after registration
    const result = await sql`
      INSERT INTO gold_students (full_name, email, password_hash, university, field_of_study, whatsapp_number, account_status)
      VALUES (${full_name}, ${email}, ${password_hash}, ${university || null}, ${field_of_study || null}, ${whatsapp_number}, 'active')
      RETURNING id, full_name, email, university, field_of_study, whatsapp_number, account_status, created_at
    `

    // Send welcome WhatsApp message (non-blocking)
    sendWelcomeMessage(whatsapp_number, full_name, email, password)
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

    // Send registration email with credentials (non-blocking)
    sendRegistrationEmail(email, full_name, password)
      .then((result) => {
        if (result.success) {
          console.log(`✅ Registration email sent to ${email} for ${full_name}`)
        } else {
          console.error(`❌ Failed to send registration email to ${email}:`, result.error)
        }
      })
      .catch((error) => {
        console.error("❌ Error sending registration email:", error)
        // Don't fail the registration if email fails
      })

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! You can now login with your credentials.",
        student: result[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering student:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
