import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { students } = body

    console.log("[v0] Received bulk upload request with students:", students.length)

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const student of students) {
      try {
        console.log("[v0] Processing student:", student.student_id, student.full_name)

        // Find university by name or abbreviation
        const universityResult = await sql`
          SELECT id FROM universities 
          WHERE LOWER(name) = LOWER(${student.university_name}) 
          OR LOWER(abbreviation) = LOWER(${student.university_name})
          LIMIT 1
        `

        console.log("[v0] University lookup for", student.university_name, "found:", universityResult.length)

        if (universityResult.length === 0) {
          errors.push({
            student_id: student.student_id,
            error: `University not found: ${student.university_name}`,
          })
          continue
        }

        const universityId = universityResult[0].id

        // Find class by name and university
        const classResult = await sql`
          SELECT id FROM classes 
          WHERE LOWER(name) = LOWER(${student.class_name})
          AND university_id = ${universityId}
          AND type = 'University'
          LIMIT 1
        `

        console.log(
          "[v0] Class lookup for",
          student.class_name,
          "in university",
          universityId,
          "found:",
          classResult.length,
        )

        if (classResult.length === 0) {
          errors.push({
            student_id: student.student_id,
            error: `Class not found: ${student.class_name} for university ${student.university_name}`,
          })
          continue
        }

        const classId = classResult[0].id

        const result = await sql`
          INSERT INTO university_students (student_id, full_name, phone, address, gender, university_id, class_id, status)
          VALUES (
            ${student.student_id},
            ${student.full_name},
            ${student.phone || null},
            ${student.address || null},
            ${student.gender || null},
            ${universityId},
            ${classId},
            ${student.status || "Active"}
          )
          ON CONFLICT (student_id) DO UPDATE
          SET 
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            address = EXCLUDED.address,
            gender = EXCLUDED.gender,
            university_id = EXCLUDED.university_id,
            class_id = EXCLUDED.class_id,
            status = EXCLUDED.status
          RETURNING *
        `

        console.log("[v0] Successfully inserted/updated student:", result[0].student_id)
        results.push(result[0])
      } catch (error) {
        console.error("[v0] Error processing student:", student.student_id, error)
        errors.push({ student_id: student.student_id, error: String(error) })
      }
    }

    console.log("[v0] Bulk upload completed. Inserted:", results.length, "Errors:", errors.length)

    return NextResponse.json({
      success: true,
      inserted: results.length,
      errors: errors.length,
      errorDetails: errors,
    })
  } catch (error) {
    console.error("[v0] Bulk upload error:", error)
    return NextResponse.json({ error: "Failed to upload students" }, { status: 500 })
  }
}
