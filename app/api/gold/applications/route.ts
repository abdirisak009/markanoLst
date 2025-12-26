import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET applications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const studentId = searchParams.get("studentId")

    let applications

    if (studentId) {
      applications = await sql`
        SELECT a.*, t.name as track_name, t.color as track_color
        FROM gold_track_applications a
        JOIN gold_tracks t ON a.track_id = t.id
        WHERE a.student_id = ${studentId}
        ORDER BY a.applied_at DESC
      `
    } else if (status) {
      applications = await sql`
        SELECT a.*, t.name as track_name, t.color as track_color,
               s.full_name as student_name, s.email as student_email, s.university
        FROM gold_track_applications a
        JOIN gold_tracks t ON a.track_id = t.id
        JOIN gold_students s ON a.student_id = s.id
        WHERE a.status = ${status}
        ORDER BY a.applied_at DESC
      `
    } else {
      applications = await sql`
        SELECT a.*, t.name as track_name, t.color as track_color,
               s.full_name as student_name, s.email as student_email, s.university
        FROM gold_track_applications a
        JOIN gold_tracks t ON a.track_id = t.id
        JOIN gold_students s ON a.student_id = s.id
        ORDER BY a.applied_at DESC
      `
    }

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// POST create application
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, track_id } = body

    // Check if already applied
    const existing = await sql`
      SELECT id FROM gold_track_applications 
      WHERE student_id = ${student_id} AND track_id = ${track_id}
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: "Horey ayaad u codsatay track-kan" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO gold_track_applications (student_id, track_id, status)
      VALUES (${student_id}, ${track_id}, 'pending')
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}

// PUT approve/reject application
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, rejection_reason, reviewed_by } = body

    const result = await sql`
      UPDATE gold_track_applications
      SET status = ${status}, 
          rejection_reason = ${rejection_reason || null},
          reviewed_at = CURRENT_TIMESTAMP,
          reviewed_by = ${reviewed_by || null}
      WHERE id = ${id}
      RETURNING *
    `

    // If approved, create enrollment and first level progress
    if (status === "approved") {
      const app = result[0]

      // Get first level of track
      const levels = await sql`
        SELECT id FROM gold_levels 
        WHERE track_id = ${app.track_id} AND is_active = true
        ORDER BY order_index ASC LIMIT 1
      `
      const firstLevelId = levels.length > 0 ? levels[0].id : null

      // Create enrollment
      await sql`
        INSERT INTO gold_enrollments (student_id, track_id, current_level_id, enrollment_status)
        VALUES (${app.student_id}, ${app.track_id}, ${firstLevelId}, 'active')
        ON CONFLICT (student_id, track_id) DO NOTHING
      `

      // Create level progress for first level
      if (firstLevelId) {
        await sql`
          INSERT INTO gold_level_progress (student_id, level_id, status, started_at)
          VALUES (${app.student_id}, ${firstLevelId}, 'in_progress', CURRENT_TIMESTAMP)
          ON CONFLICT (student_id, level_id) DO NOTHING
        `
      }
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
