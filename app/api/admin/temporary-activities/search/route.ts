import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET search temporary activity by student ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId || studentId.trim() === "") {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const searchId = studentId.trim().toLowerCase()

    // Search for activity that contains this student ID in various formats
    let activities
    try {
      activities = await sql`
        SELECT id, activity, rating, student_id, created_at, updated_at
        FROM temporary_activities
        WHERE 
          LOWER(activity) LIKE ${`%student id: ${searchId}%`} OR
          LOWER(activity) LIKE ${`%id: ${searchId}%`} OR
          LOWER(activity) LIKE ${`%studentid: ${searchId}%`} OR
          LOWER(activity) LIKE ${`%student_id: ${searchId}%`} OR
          LOWER(activity) LIKE ${`%student id ${searchId}%`} OR
          LOWER(activity) LIKE ${`%id ${searchId}%`} OR
          id::text = ${searchId} OR
          LOWER(activity) = ${searchId}
        ORDER BY created_at DESC
        LIMIT 1
      `
    } catch (e: any) {
      // Fallback if student_id column doesn't exist
      if (e.message?.includes('student_id') || e.message?.includes('column')) {
        activities = await sql`
          SELECT id, activity, rating, created_at, updated_at
          FROM temporary_activities
          WHERE 
            LOWER(activity) LIKE ${`%student id: ${searchId}%`} OR
            LOWER(activity) LIKE ${`%id: ${searchId}%`} OR
            LOWER(activity) LIKE ${`%studentid: ${searchId}%`} OR
            LOWER(activity) LIKE ${`%student_id: ${searchId}%`} OR
            LOWER(activity) LIKE ${`%student id ${searchId}%`} OR
            LOWER(activity) LIKE ${`%id ${searchId}%`} OR
            id::text = ${searchId} OR
            LOWER(activity) = ${searchId}
          ORDER BY created_at DESC
          LIMIT 1
        `
        activities = activities.map((a: any) => ({ ...a, student_id: null }))
      } else {
        throw e
      }
    }

    if (activities.length === 0) {
      return NextResponse.json({ error: "No marks found for this Student ID" }, { status: 404 })
    }

    return NextResponse.json(activities[0])
  } catch (error) {
    console.error("Error searching temporary activity:", error)
    return NextResponse.json({ error: "Failed to search activity" }, { status: 500 })
  }
}
