import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("student_id")
    const category = searchParams.get("category")

    // Get all videos with categories
    let videos

    if (studentId) {
      // Get student's class to filter videos they can access
      const student = await sql`
        SELECT class_id FROM university_students WHERE student_id = ${studentId}
      `

      if (student.length === 0) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }

      const classId = student[0].class_id

      // Get videos that are either open OR the student's class has access to
      videos = await sql`
        SELECT DISTINCT v.* FROM videos v
        LEFT JOIN video_class_access vca ON v.id = vca.video_id
        WHERE v.access_type = 'open' 
        OR (v.access_type = 'watch_universities' AND vca.class_id = ${classId})
        ${category ? sql`AND v.category = ${category}` : sql``}
        ORDER BY v.uploaded_at DESC
      `
    } else {
      // Only return open videos if no student ID
      videos = await sql`
        SELECT * FROM videos 
        WHERE access_type = 'open'
        ${category ? sql`AND category = ${category}` : sql``}
        ORDER BY uploaded_at DESC
      `
    }

    return NextResponse.json(videos)
  } catch (error) {
    console.error("[v0] Error fetching public videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}
