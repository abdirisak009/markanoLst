import { NextRequest, NextResponse } from "next/server"
import postgres from "postgres"
import bcrypt from "bcryptjs"
import { deleteFromStorage } from "@/lib/storage"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// GET current student profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || request.cookies.get("goldStudentId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const student = await sql`
      SELECT id, full_name, email, profile_image, university, field_of_study, created_at
      FROM gold_students
      WHERE id = ${parseInt(userId)}
    `

    if (student.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student[0])
  } catch (error) {
    console.error("Error fetching student profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// PUT update student profile
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || request.cookies.get("goldStudentId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, email, password, profile_image, old_password } = body

    // Get current student data
    const currentStudent = await sql`
      SELECT email, password_hash, profile_image
      FROM gold_students
      WHERE id = ${parseInt(userId)}
    `

    if (currentStudent.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Update full_name
    if (full_name !== undefined && full_name.trim() !== "") {
      await sql`
        UPDATE gold_students 
        SET full_name = ${full_name.trim()}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(userId)}
      `
    }

    // Update email (check if it's not already taken by another user)
    if (email !== undefined && email.trim() !== "") {
      const normalizedEmail = email.trim().toLowerCase()
      
      // Check if email is already taken by another user
      const emailCheck = await sql`
        SELECT id FROM gold_students 
        WHERE LOWER(TRIM(email)) = ${normalizedEmail} AND id != ${parseInt(userId)}
      `
      
      if (emailCheck.length > 0) {
        return NextResponse.json({ error: "This email is already registered" }, { status: 400 })
      }

      await sql`
        UPDATE gold_students 
        SET email = ${normalizedEmail}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(userId)}
      `
    }

    // Update password (requires old password verification)
    if (password !== undefined && password.trim() !== "") {
      if (!old_password) {
        return NextResponse.json({ error: "Old password is required to change password" }, { status: 400 })
      }

      // Verify old password
      const currentHash = currentStudent[0].password_hash
      let isOldPasswordValid = false

      if (currentHash.startsWith("$2")) {
        // Bcrypt hash
        isOldPasswordValid = await bcrypt.compare(old_password, currentHash)
      } else {
        // Old SHA-256 hash
        const encoder = new TextEncoder()
        const data = encoder.encode(old_password + "markano_gold_salt_2024")
        const hashBuffer = await crypto.subtle.digest("SHA-256", data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const sha256Hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
        isOldPasswordValid = sha256Hash === currentHash
      }

      if (!isOldPasswordValid) {
        return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 })
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(password.trim(), 12)
      await sql`
        UPDATE gold_students 
        SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(userId)}
      `
    }

    // Update profile_image
    if (profile_image !== undefined) {
      // If new image is provided and old image exists, delete old image from MinIO
      if (profile_image && currentStudent[0].profile_image && profile_image !== currentStudent[0].profile_image) {
        try {
          await deleteFromStorage(currentStudent[0].profile_image)
        } catch (deleteError) {
          console.error("Error deleting old profile image:", deleteError)
          // Continue even if deletion fails
        }
      }

      await sql`
        UPDATE gold_students 
        SET profile_image = ${profile_image || null}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(userId)}
      `
    }

    // Get updated student data
    const updatedStudent = await sql`
      SELECT id, full_name, email, profile_image, university, field_of_study, created_at, updated_at
      FROM gold_students
      WHERE id = ${parseInt(userId)}
    `

    return NextResponse.json({
      success: true,
      student: updatedStudent[0],
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating student profile:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 },
    )
  }
}
