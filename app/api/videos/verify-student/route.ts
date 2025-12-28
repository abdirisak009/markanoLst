import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, video_id } = body

    console.log("[v0] API: Verifying student ID:", student_id, "for video:", video_id)

    if (!student_id) {
      return NextResponse.json(
        { verified: false, message: "Student ID waa loo baahan yahay" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // First, try university_students table
    const universityResult = await sql`
      SELECT us.id, us.student_id, us.full_name, us.university_id, us.class_id, us.status,
             c.name as class_name, u.name as university_name,
             'university' as student_type
      FROM university_students us
      LEFT JOIN classes c ON us.class_id = c.id
      LEFT JOIN universities u ON us.university_id = u.id
      WHERE us.student_id = ${student_id} AND us.status = 'Active'
      LIMIT 1
    `

    // If not found in university_students, try gold_students
    let result = universityResult
    if (universityResult.length === 0) {
      console.log("[v0] API: Not found in university_students, checking gold_students...")

      const goldResult = await sql`
        SELECT id, id::text as student_id, full_name, university, email,
               NULL as university_id, NULL as class_id,
               account_status as status, university as class_name, 
               university as university_name,
               'gold' as student_type
        FROM gold_students
        WHERE (id::text = ${student_id} OR email = ${student_id})
          AND account_status = 'active'
        LIMIT 1
      `
      result = goldResult
    }

    console.log("[v0] API: Query result:", result)

    if (result.length > 0) {
      const student = result[0]

      // If video_id is provided, check video access
      // Gold students have access to all open videos
      if (video_id && student.student_type === "university") {
        const videoAccess = await sql`
          SELECT v.id, v.access_type
          FROM videos v
          LEFT JOIN video_class_access vca ON v.id = vca.video_id
          WHERE v.id = ${video_id}
          AND (v.access_type = 'open' OR vca.class_id = ${student.class_id})
          LIMIT 1
        `

        if (videoAccess.length === 0) {
          return NextResponse.json(
            {
              verified: false,
              message: "Fasalkaaga ma laha ogolaansho lagu daawado muuqaalkan",
            },
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            },
          )
        }
      }

      return NextResponse.json(
        {
          verified: true,
          student: {
            id: student.id,
            student_id: student.student_id,
            full_name: student.full_name,
            university_id: student.university_id,
            class_id: student.class_id,
            class_name: student.class_name || student.university || "Markano Gold",
            university_name: student.university_name || student.university || "Markano",
            student_type: student.student_type,
          },
        },
        { headers: { "Content-Type": "application/json" } },
      )
    } else {
      return NextResponse.json(
        {
          verified: false,
          message: "Student ID-gan lama helin ama account-ku waa inactive. Fadlan hubi Student ID-kaaga.",
        },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("[v0] API: Error verifying student:", error)
    return NextResponse.json(
      { verified: false, error: "Waa la waayey in la xaqiijiyo ardayga", message: String(error) },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
