import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// POST - Verify student and check if they can take quiz
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const body = await request.json()
    const { student_id, phone } = body

    // Get quiz
    const quizResult = await sql`
      SELECT id, max_attempts FROM quizzes WHERE access_code = ${code} AND status = 'published'
    `

    if (quizResult.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quiz = quizResult[0]

    // Try to find student by ID or phone
    let student = null
    let studentType = "university"

    // Check university students first
    if (student_id) {
      const uniStudent = await sql`
        SELECT student_id, full_name, phone FROM university_students WHERE student_id = ${student_id}
      `
      if (uniStudent.length > 0) {
        student = uniStudent[0]
        studentType = "university"
      }
    }

    // Check by phone (format: 6xxxxx or 06xxxxx)
    if (!student && phone) {
      const cleanPhone = phone.replace(/^0/, "").replace(/^\+252/, "")
      const uniStudent = await sql`
        SELECT student_id, full_name, phone FROM university_students 
        WHERE phone LIKE ${`%${cleanPhone}`} OR phone LIKE ${`%${cleanPhone.slice(-6)}`}
      `
      if (uniStudent.length > 0) {
        student = uniStudent[0]
        studentType = "university"
      }
    }

    // Check penn students
    if (!student && student_id) {
      const pennStudent = await sql`
        SELECT student_id, full_name, phone FROM penn_students WHERE student_id = ${student_id}
      `
      if (pennStudent.length > 0) {
        student = pennStudent[0]
        studentType = "penn"
      }
    }

    if (!student) {
      return NextResponse.json({ error: "Student not found. Please check your ID or phone number." }, { status: 404 })
    }

    // Check attempt count
    const attemptCount = await sql`
      SELECT COUNT(*) as count FROM quiz_attempts 
      WHERE quiz_id = ${quiz.id} AND student_id = ${student.student_id}
    `

    if (attemptCount[0].count >= quiz.max_attempts) {
      return NextResponse.json(
        { error: `You have reached the maximum number of attempts (${quiz.max_attempts})` },
        { status: 403 },
      )
    }

    return NextResponse.json({
      verified: true,
      student: {
        id: student.student_id,
        name: student.full_name,
        type: studentType,
      },
      attempts_remaining: quiz.max_attempts - Number.parseInt(attemptCount[0].count),
    })
  } catch (error) {
    console.error("Error verifying student:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
