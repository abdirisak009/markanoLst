import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * POST /api/instructor/students/bulk-upload
 * Instructor only: bulk upload university students (CSV/Excel parsed to JSON).
 * Body: { university_id, students: [{ full_name, email, phone?, student_id? }] }
 * Requires instructor to be linked to that university.
 */
export async function POST(request: Request) {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const [link] = await sql`
      SELECT university_id FROM instructor_university_links
      WHERE instructor_id = ${instructor.id}
    `
    if (!link?.university_id) {
      return NextResponse.json(
        { error: "You are not linked to a university. Bulk upload is only available for university instructors." },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { university_id, students } = body

    const uid = university_id != null ? Number(university_id) : link.university_id
    if (uid !== link.university_id) {
      return NextResponse.json(
        { error: "You can only upload students for your linked university." },
        { status: 403 }
      )
    }

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "students array is required and must not be empty" },
        { status: 400 }
      )
    }

    let inserted = 0
    let skipped = 0
    const errors: string[] = []

    for (const s of students) {
      const full_name = s.full_name?.trim()
      const email = s.email?.trim()?.toLowerCase()
      if (!full_name || !email) {
        skipped++
        errors.push(`Skipped row: missing full_name or email`)
        continue
      }

      try {
        const [existing] = await sql`
          SELECT id FROM university_students
          WHERE university_id = ${uid} AND LOWER(TRIM(email)) = ${email}
        `
        if (existing) {
          skipped++
          continue
        }

        await sql`
          INSERT INTO university_students (university_id, full_name, email, phone, student_id)
          VALUES (
            ${uid},
            ${full_name},
            ${email},
            ${s.phone?.trim() || null},
            ${s.student_id?.trim() || null}
          )
        `
        inserted++
      } catch (err: unknown) {
        const e = err as { code?: string }
        if (e.code === "23505") {
          skipped++
        } else {
          errors.push(`${email}: ${e instanceof Error ? e.message : "Insert failed"}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
      errors: errors.length ? errors : undefined,
    })
  } catch (e) {
    console.error("Instructor bulk upload error:", e)
    return NextResponse.json(
      { error: "Failed to bulk upload students" },
      { status: 500 }
    )
  }
}
