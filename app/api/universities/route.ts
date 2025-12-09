import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const universities = await sql`SELECT * FROM universities ORDER BY name`
    return NextResponse.json(universities)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch universities" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, abbreviation } = body

    const result = await sql`
      INSERT INTO universities (name, abbreviation)
      VALUES (${name}, ${abbreviation})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create university" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, abbreviation } = body

    const result = await sql`
      UPDATE universities
      SET name = ${name}, abbreviation = ${abbreviation}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update university" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM universities WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete university" }, { status: 500 })
  }
}
