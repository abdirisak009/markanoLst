import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendProjectMarksMessage } from "@/lib/whatsapp"

const sql = neon(process.env.DATABASE_URL!)

// POST send WhatsApp message when project marks are shown
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_id, activity_marks } = body

    if (!student_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const searchId = student_id.toString().trim()
    console.log(`Looking up student ${searchId} in university_students table...`)

    // Find student in university_students table by student_id
    const studentResult = await sql`
      SELECT student_id, full_name, phone
      FROM university_students
      WHERE student_id = ${searchId}
      LIMIT 1
    `

    if (studentResult.length === 0) {
      console.log(`Student ${searchId} not found in university_students table`)
      return NextResponse.json({ 
        error: "Student not found in university_students table",
        found: false 
      }, { status: 404 })
    }

    const student = studentResult[0]

    if (!student.phone || student.phone.trim() === "") {
      console.log(`Student ${searchId} found but no phone number`)
      return NextResponse.json({ 
        error: "Student phone number not found",
        found: true,
        hasPhone: false 
      }, { status: 400 })
    }

    // Format phone number - ensure it has 252 prefix if needed
    let phoneNumber = student.phone.trim()
    
    // Remove any non-digit characters first
    phoneNumber = phoneNumber.replace(/\D/g, "")
    
    // If phone doesn't start with 252, add it
    if (!phoneNumber.startsWith("252")) {
      // Remove leading 0 if present
      if (phoneNumber.startsWith("0")) {
        phoneNumber = phoneNumber.substring(1)
      }
      // Add 252 prefix
      phoneNumber = "252" + phoneNumber
    }
    
    console.log(`Found student: ${student.full_name}, Original phone: ${student.phone}, Formatted phone: ${phoneNumber}`)

    // Send WhatsApp message with formatted phone number
    const result = await sendProjectMarksMessage(
      phoneNumber,
      student.full_name || "Arday",
      activity_marks || ""
    )

    if (result.success) {
      console.log(`WhatsApp message sent successfully to ${phoneNumber}`)
      return NextResponse.json({ 
        success: true,
        message: "WhatsApp message sent successfully",
        student_name: student.full_name,
        phone: phoneNumber,
        original_phone: student.phone
      })
    } else {
      console.error(`Failed to send WhatsApp message: ${result.error}`)
      return NextResponse.json({ 
        success: false,
        error: result.error || "Failed to send WhatsApp message"
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return NextResponse.json({ 
      error: "Failed to send WhatsApp message",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
