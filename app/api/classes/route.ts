import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const classes = await sql`
      SELECT c.*, u.name as university_name, u.abbreviation
      FROM classes c
      LEFT JOIN universities u ON c.university_id = u.id
      ORDER BY c.type, c.name
    `
    return NextResponse.json(classes)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, university_id, description } = body

    const result = await sql`
      INSERT INTO classes (name, type, university_id, description)
      VALUES (${name}, ${type}, ${university_id || null}, ${description})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, type, university_id, description } = body

    const result = await sql`
      UPDATE classes
      SET name = ${name}, type = ${type}, university_id = ${university_id || null}, description = ${description}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM classes WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 })
  }
}
