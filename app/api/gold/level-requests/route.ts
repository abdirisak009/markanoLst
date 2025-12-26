import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// GET level requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const studentId = searchParams.get("studentId")

    let requests

    if (studentId) {
      // Get requests for specific student
      requests = await sql`
        SELECT 
          lr.*,
          cl.name as current_level_name,
          cl.order_index as current_level_order,
          nl.name as next_level_name,
          nl.order_index as next_level_order,
          t.name as track_name,
          t.id as track_id
        FROM gold_level_requests lr
        LEFT JOIN gold_levels cl ON lr.current_level_id = cl.id
        LEFT JOIN gold_levels nl ON lr.next_level_id = nl.id
        LEFT JOIN gold_tracks t ON cl.track_id = t.id
        WHERE lr.student_id = ${studentId}
        ORDER BY lr.requested_at DESC
      `
    } else if (status) {
      requests = await sql`
        SELECT 
          lr.*,
          s.full_name as student_name,
          s.email as student_email,
          cl.name as current_level_name,
          cl.order_index as current_level_order,
          nl.name as next_level_name,
          nl.order_index as next_level_order,
          t.name as track_name,
          t.id as track_id
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
          cl.order_index as current_level_order,
          nl.name as next_level_name,
          nl.order_index as next_level_order,
          t.name as track_name,
          t.id as track_id
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
    const { student_id, current_level_id } = body

    const currentLevel = await sql`
      SELECT id, track_id, order_index FROM gold_levels WHERE id = ${current_level_id}
    `
    if (currentLevel.length === 0) {
      return NextResponse.json({ error: "Level-ka hadda ma jiro" }, { status: 400 })
    }

    const nextLevel = await sql`
      SELECT id FROM gold_levels 
      WHERE track_id = ${currentLevel[0].track_id} 
        AND order_index = ${currentLevel[0].order_index + 1}
        AND is_active = true
      LIMIT 1
    `
    if (nextLevel.length === 0) {
      return NextResponse.json({ error: "Track-kan ma laha level kale" }, { status: 400 })
    }

    // Check if already has pending request
    const existing = await sql`
      SELECT id FROM gold_level_requests 
      WHERE student_id = ${student_id} 
        AND current_level_id = ${current_level_id} 
        AND status = 'pending'
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: "Horey ayaad u codsatay level-kan xiga" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO gold_level_requests (student_id, current_level_id, next_level_id, status)
      VALUES (${student_id}, ${current_level_id}, ${nextLevel[0].id}, 'pending')
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
      SET status = ${status}, 
          reviewed_by = ${reviewed_by || null}, 
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = ${rejection_reason || null}
      WHERE id = ${id}
      RETURNING *
    `

    // If approved, update student's enrollment and create level progress
    if (status === "approved" && result.length > 0) {
      const levelRequest = result[0]

      // Update enrollment current level
      await sql`
        UPDATE gold_enrollments 
        SET current_level_id = ${levelRequest.next_level_id}
        WHERE student_id = ${levelRequest.student_id} 
        AND current_level_id = ${levelRequest.current_level_id}
      `

      // Mark current level as completed
      await sql`
        UPDATE gold_level_progress 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE student_id = ${levelRequest.student_id} 
        AND level_id = ${levelRequest.current_level_id}
      `

      // Create level progress for new level
      await sql`
        INSERT INTO gold_level_progress (student_id, level_id, status, started_at)
        VALUES (${levelRequest.student_id}, ${levelRequest.next_level_id}, 'in_progress', CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, level_id) DO UPDATE SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating level request:", error)
    return NextResponse.json({ error: "Failed to update level request" }, { status: 500 })
  }
}
