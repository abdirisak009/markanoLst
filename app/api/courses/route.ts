import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const courses = await sql`
      SELECT 
        c.*,
        COUNT(DISTINCT m.id) as modules_count,
        COUNT(DISTINCT l.id) as lessons_count
      FROM courses c
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN lessons l ON m.id = l.module_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `
    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, instructor, type, duration, rating, students_count } = body

    const result = await sql`
      INSERT INTO courses (title, description, instructor, duration, rating, students_count, type)
      VALUES (
        ${title}, 
        ${description}, 
        ${instructor}, 
        ${duration || "8 weeks"}, 
        ${rating || 0}, 
        ${students_count || 0}, 
        ${type || "University"}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, description, instructor, duration, rating, students_count, type } = body

    const result = await sql`
      UPDATE courses
      SET 
        title = ${title},
        description = ${description},
        instructor = ${instructor},
        duration = ${duration},
        rating = ${rating},
        students_count = ${students_count},
        type = ${type}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM courses WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
