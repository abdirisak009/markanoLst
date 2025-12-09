import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const student_id = searchParams.get("student_id")
    const assignment_id = searchParams.get("assignment_id")

    let marks
    if (student_id) {
      marks = await sql`
        SELECT 
          sm.*,
          a.title as assignment_title,
          a.max_marks,
          c.name as class_name
        FROM student_marks sm
        JOIN assignments a ON sm.assignment_id = a.id
        LEFT JOIN classes c ON a.class_id = c.id
        WHERE sm.student_id = ${student_id}
        ORDER BY sm.submitted_at DESC
      `
    } else if (assignment_id) {
      marks = await sql`
        SELECT * FROM student_marks 
        WHERE assignment_id = ${assignment_id}
        ORDER BY marks_obtained DESC
      `
    } else {
      marks = await sql`
        SELECT 
          sm.*,
          a.title as assignment_title,
          a.max_marks
        FROM student_marks sm
        JOIN assignments a ON sm.assignment_id = a.id
        ORDER BY sm.submitted_at DESC
      `
    }

    return NextResponse.json(marks)
  } catch (error) {
    console.error("[v0] Error fetching marks:", error)
    return NextResponse.json({ error: "Failed to fetch marks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, assignment_id, marks_obtained, max_marks } = body

    const percentage = (marks_obtained / max_marks) * 100
    const grade = calculateGrade(percentage)

    const result = await sql`
      INSERT INTO student_marks (student_id, assignment_id, marks_obtained, percentage, grade)
      VALUES (${student_id}, ${assignment_id}, ${marks_obtained}, ${percentage}, ${grade})
      ON CONFLICT (student_id, assignment_id) DO UPDATE
      SET 
        marks_obtained = EXCLUDED.marks_obtained,
        percentage = EXCLUDED.percentage,
        grade = EXCLUDED.grade,
        submitted_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error saving marks:", error)
    return NextResponse.json({ error: "Failed to save marks" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM student_marks WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting marks:", error)
    return NextResponse.json({ error: "Failed to delete marks" }, { status: 500 })
  }
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+"
  if (percentage >= 85) return "A"
  if (percentage >= 80) return "A-"
  if (percentage >= 75) return "B+"
  if (percentage >= 70) return "B"
  if (percentage >= 65) return "B-"
  if (percentage >= 60) return "C+"
  if (percentage >= 55) return "C"
  if (percentage >= 50) return "C-"
  if (percentage >= 45) return "D"
  return "F"
}
