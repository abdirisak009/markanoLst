import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("class_id")

    console.log("[v0] Fetching students with class_id:", classId)

    let students
    if (classId && classId !== "undefined" && classId !== "null") {
      const classIdNum = Number.parseInt(classId)
      if (isNaN(classIdNum)) {
        return NextResponse.json({ error: "Invalid class_id parameter" }, { status: 400 })
      }

      students = await sql`
        SELECT 
          us.*,
          u.name as university_name,
          u.abbreviation as university_abbr,
          c.name as class_name
        FROM university_students us
        LEFT JOIN universities u ON us.university_id = u.id
        LEFT JOIN classes c ON us.class_id = c.id
        WHERE us.class_id = ${classIdNum}
        ORDER BY us.full_name ASC
      `
    } else {
      students = await sql`
        SELECT 
          us.*,
          u.name as university_name,
          u.abbreviation as university_abbr,
          c.name as class_name
        FROM university_students us
        LEFT JOIN universities u ON us.university_id = u.id
        LEFT JOIN classes c ON us.class_id = c.id
        ORDER BY us.registered_at DESC
      `
    }

    return NextResponse.json(students)
  } catch (error) {
    console.error("[v0] Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, full_name, phone, address, gender, university_id, class_id, status } = body

    const result = await sql`
      INSERT INTO university_students (student_id, full_name, phone, address, gender, university_id, class_id, status)
      VALUES (${student_id}, ${full_name}, ${phone}, ${address}, ${gender}, ${university_id}, ${class_id}, ${status || "Active"})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating student:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, student_id, full_name, phone, address, gender, university_id, class_id, status } = body

    const result = await sql`
      UPDATE university_students
      SET 
        student_id = ${student_id},
        full_name = ${full_name},
        phone = ${phone},
        address = ${address},
        gender = ${gender},
        university_id = ${university_id},
        class_id = ${class_id},
        status = ${status}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating student:", error)
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM university_students WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting student:", error)
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}
