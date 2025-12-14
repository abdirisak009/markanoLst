import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const students = await sql`
      SELECT s.id, s.full_name, s.student_id, c.name as class_name
      FROM university_students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.student_id = ${studentId}
      LIMIT 1
    `

    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = students[0]

    const assignments = await sql`
      SELECT 
        a.id,
        a.title,
        c.name as class_name,
        a.max_marks,
        sm.marks_obtained,
        COALESCE(ROUND((sm.marks_obtained::numeric / NULLIF(a.max_marks, 0)::numeric * 100)::numeric, 1), 0) as percentage,
        sm.submitted_at,
        false as is_award,
        null as award_type
      FROM student_marks sm
      JOIN assignments a ON sm.assignment_id = a.id
      JOIN classes c ON a.class_id = c.id
      WHERE sm.student_id = ${student.student_id}
      ORDER BY sm.submitted_at DESC
    `

    const videoAwards = await sql`
      SELECT 
        id,
        bonus_marks,
        videos_completed,
        awarded_at
      FROM video_watch_awards
      WHERE student_id = ${student.student_id}
      ORDER BY awarded_at DESC
    `

    // Get video watch awards for this student
    // const videoAwards = await sql`
    //   SELECT
    //     id,
    //     bonus_marks,
    //     videos_completed,
    //     awarded_at
    //   FROM video_watch_awards
    //   WHERE student_id = ${student.id}
    //   ORDER BY awarded_at DESC
    // `

    // Add video awards as special "assignments"
    const videoAwardAssignments = videoAwards.map((award: any, index: number) => ({
      id: `award-${award.id}`,
      title: `Video Daawasho Bonus #${videoAwards.length - index}`,
      class_name: "Video Awards",
      max_marks: Number(award.bonus_marks) || 0,
      marks_obtained: Number(award.bonus_marks) || 0,
      percentage: 100,
      submitted_at: award.awarded_at,
      is_award: true,
      award_type: `${award.videos_completed} videos dhammeysatay`,
    }))

    const normalizedAssignments = assignments.map((a: any) => ({
      ...a,
      percentage: Number(a.percentage) || 0,
      marks_obtained: Number(a.marks_obtained) || 0,
      max_marks: Number(a.max_marks) || 0,
    }))

    // Combine regular assignments with video awards
    const allAssignments = [...normalizedAssignments, ...videoAwardAssignments].sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
    )

    // Calculate summary statistics
    const totalMarksObtained = allAssignments.reduce((sum, a) => sum + Number(a.marks_obtained), 0)
    const totalMaxMarks = allAssignments.reduce((sum, a) => sum + Number(a.max_marks), 0)
    const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0

    return NextResponse.json({
      student: {
        id: student.id,
        full_name: student.full_name,
        student_id: student.student_id,
        class_name: student.class_name,
      },
      assignments: allAssignments,
      summary: {
        total_assignments: assignments.length,
        total_marks_obtained: totalMarksObtained,
        total_max_marks: totalMaxMarks,
        overall_percentage: overallPercentage,
        video_awards: videoAwards.length,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching student results:", error)
    return NextResponse.json({ error: "Failed to fetch student results" }, { status: 500 })
  }
}
