import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET level requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let requests
    if (status) {
      requests = await sql`
        SELECT 
          lr.*,
          s.full_name as student_name,
          s.email as student_email,
          cl.name as current_level_name,
          nl.name as next_level_name,
          t.name as track_name
        FROM gold_level_requests lr
        LEFT JOIN gold_students s ON lr.student_id = s.id
        LEFT JOIN gold_levels cl ON lr.current_level_id = cl.id
        LEFT JOIN gold_levels nl ON lr.next_level_id = nl.id
        LEFT JOIN gold_tracks t ON cl.track_id = t.id
        WHERE lr.status = ${status}
        ORDER BY lr.requested_at DESC
      `
    } else {
      requests = await sql`
        SELECT 
          lr.*,
          s.full_name as student_name,
          s.email as student_email,
          cl.name as current_level_name,
          nl.name as next_level_name,
          t.name as track_name
        FROM gold_level_requests lr
        LEFT JOIN gold_students s ON lr.student_id = s.id
        LEFT JOIN gold_levels cl ON lr.current_level_id = cl.id
        LEFT JOIN gold_levels nl ON lr.next_level_id = nl.id
        LEFT JOIN gold_tracks t ON cl.track_id = t.id
        ORDER BY lr.requested_at DESC
      `
    }
    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching level requests:", error)
    return NextResponse.json({ error: "Failed to fetch level requests" }, { status: 500 })
  }
}

// POST create level request
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, current_level_id, next_level_id } = body

    const result = await sql`
      INSERT INTO gold_level_requests (student_id, current_level_id, next_level_id)
      VALUES (${student_id}, ${current_level_id}, ${next_level_id})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating level request:", error)
    return NextResponse.json({ error: "Failed to create level request" }, { status: 500 })
  }
}

// PUT approve/reject level request
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, reviewed_by, rejection_reason } = body

    const result = await sql`
      UPDATE gold_level_requests 
      SET status = ${status}, reviewed_by = ${reviewed_by}, reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = ${rejection_reason}
      WHERE id = ${id}
      RETURNING *
    `

    // If approved, update student's enrollment and create level progress
    if (status === "approved") {
      const request = result[0]

      // Update enrollment current level
      await sql`
        UPDATE gold_enrollments 
        SET current_level_id = ${request.next_level_id}
        WHERE student_id = ${request.student_id} 
        AND current_level_id = ${request.current_level_id}
      `

      // Create level progress for new level
      await sql`
        INSERT INTO gold_level_progress (student_id, level_id, status, started_at)
        VALUES (${request.student_id}, ${request.next_level_id}, 'in_progress', CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, level_id) DO UPDATE SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating level request:", error)
    return NextResponse.json({ error: "Failed to update level request" }, { status: 500 })
  }
}
