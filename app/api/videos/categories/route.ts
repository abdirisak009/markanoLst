import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("student_id")

    let categories

    if (studentId) {
      // Get student's class
      const student = await sql`
        SELECT class_id FROM university_students WHERE student_id = ${studentId}
      `

      if (student.length === 0) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }

      const classId = student[0].class_id

      // Get categories with video counts for accessible videos
      categories = await sql`
        SELECT 
          v.category,
          COUNT(DISTINCT v.id) as video_count
        FROM videos v
        LEFT JOIN video_class_access vca ON v.id = vca.video_id
        WHERE v.access_type = 'open' 
        OR (v.access_type = 'watch_universities' AND vca.class_id = ${classId})
        GROUP BY v.category
        ORDER BY video_count DESC
      `
    } else {
      // Only count open videos
      categories = await sql`
        SELECT 
          category,
          COUNT(*) as video_count
        FROM videos 
        WHERE access_type = 'open'
        GROUP BY category
        ORDER BY video_count DESC
      `
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error("[v0] Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
