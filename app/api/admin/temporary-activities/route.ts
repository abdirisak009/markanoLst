import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET all temporary activities
export async function GET() {
  try {
    // Try to select with all columns, fallback if columns don't exist
    let activities
    try {
      // First try with both rating and student_id
      activities = await sql`
        SELECT id, activity, rating, student_id, created_at, updated_at
        FROM temporary_activities
        ORDER BY created_at DESC
      `
      console.log("Fetched activities with rating and student_id:", activities.length, "items")
      if (activities.length > 0) {
        console.log("Sample activity:", { 
          id: activities[0].id, 
          rating: activities[0].rating, 
          ratingType: typeof activities[0].rating,
          student_id: activities[0].student_id 
        })
      }
    } catch (columnError: any) {
      const errorMsg = columnError.message?.toLowerCase() || ''
      
      // If rating column doesn't exist, try without it
      if (errorMsg.includes('rating') || errorMsg.includes('column')) {
        console.warn("rating column not found, trying without it")
        try {
          activities = await sql`
            SELECT id, activity, student_id, created_at, updated_at
            FROM temporary_activities
            ORDER BY created_at DESC
          `
          // Add null rating to each activity
          activities = activities.map((a: any) => ({ ...a, rating: null, student_id: a.student_id || null }))
          console.log("Fetched activities without rating:", activities.length, "items")
        } catch (studentIdError: any) {
          // If student_id also doesn't exist, select only basic columns
          if (studentIdError.message?.toLowerCase().includes('student_id') || studentIdError.message?.toLowerCase().includes('column')) {
            console.warn("student_id column also not found, fetching basic columns only")
            activities = await sql`
              SELECT id, activity, created_at, updated_at
              FROM temporary_activities
              ORDER BY created_at DESC
            `
            // Add null rating and student_id to each activity
            activities = activities.map((a: any) => ({ ...a, rating: null, student_id: null }))
            console.log("Fetched activities with basic columns only:", activities.length, "items")
          } else {
            throw studentIdError
          }
        }
      } 
      // If only student_id column doesn't exist
      else if (errorMsg.includes('student_id') || errorMsg.includes('column')) {
        console.warn("student_id column not found, fetching without it")
        activities = await sql`
          SELECT id, activity, rating, created_at, updated_at
          FROM temporary_activities
          ORDER BY created_at DESC
        `
        // Add null student_id to each activity
        activities = activities.map((a: any) => ({ ...a, student_id: null }))
        console.log("Fetched activities without student_id:", activities.length, "items")
        if (activities.length > 0) {
          console.log("Sample activity:", { 
            id: activities[0].id, 
            rating: activities[0].rating, 
            ratingType: typeof activities[0].rating 
          })
        }
      } else {
        throw columnError
      }
    }
    
    // Ensure rating is properly parsed as integer and handle null/undefined
    activities = activities.map((a: any) => {
      let ratingValue = null
      // Check if rating exists in the raw data
      if (a.rating !== null && a.rating !== undefined && a.rating !== '') {
        const parsed = parseInt(a.rating.toString())
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
          ratingValue = parsed
        }
      }
      return {
        ...a,
        rating: ratingValue,
      }
    })
    
    // Log statistics - check raw data first
    console.log("Raw activities from DB:", activities.slice(0, 3).map((a: any) => ({
      id: a.id,
      rawRating: a.rating,
      ratingType: typeof a.rating,
      student_id: a.student_id,
    })))
    
    // Log statistics after parsing
    const withRatings = activities.filter((a: any) => a.rating !== null && a.rating > 0)
    console.log(`Total activities: ${activities.length}, With ratings: ${withRatings.length}`)
    if (withRatings.length > 0) {
      console.log("Sample activities with ratings:", withRatings.slice(0, 5).map((a: any) => ({ 
        id: a.id, 
        rating: a.rating, 
        student_id: a.student_id,
        ratingType: typeof a.rating 
      })))
    } else {
      console.warn("No activities with ratings found! Check if rating column exists in database.")
    }
    
    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching temporary activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}

// POST create new temporary activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { activity, id } = body

    if (!activity || activity.trim() === "") {
      return NextResponse.json({ error: "Activity is required" }, { status: 400 })
    }

    let result

    // If custom ID is provided, try to use it
    if (id && !isNaN(parseInt(id.toString())) && parseInt(id.toString()) > 0) {
      const customId = parseInt(id.toString())
      try {
        // Try to insert with custom ID, or update if it exists
        // Try to return student_id if column exists
        try {
          result = await sql`
            INSERT INTO temporary_activities (id, activity)
            VALUES (${customId}, ${activity.trim()})
            ON CONFLICT (id) DO UPDATE SET 
              activity = EXCLUDED.activity,
              updated_at = CURRENT_TIMESTAMP
            RETURNING id, activity, rating, student_id, created_at, updated_at
          `
        } catch (e) {
          // Fallback if student_id column doesn't exist
          result = await sql`
            INSERT INTO temporary_activities (id, activity)
            VALUES (${customId}, ${activity.trim()})
            ON CONFLICT (id) DO UPDATE SET 
              activity = EXCLUDED.activity,
              updated_at = CURRENT_TIMESTAMP
            RETURNING id, activity, rating, created_at, updated_at
          `
          result = result.map((r: any) => ({ ...r, student_id: null }))
        }
      } catch (insertError: any) {
        // If insert fails (e.g., ID already exists or constraint violation), fall back to auto-increment
        console.warn("Failed to insert with custom ID, using auto-increment:", insertError)
        try {
          result = await sql`
            INSERT INTO temporary_activities (activity)
            VALUES (${activity.trim()})
            RETURNING id, activity, rating, student_id, created_at, updated_at
          `
        } catch (e) {
          result = await sql`
            INSERT INTO temporary_activities (activity)
            VALUES (${activity.trim()})
            RETURNING id, activity, rating, created_at, updated_at
          `
          result = result.map((r: any) => ({ ...r, student_id: null }))
        }
      }
    } else {
      // Use auto-increment ID
      try {
        result = await sql`
          INSERT INTO temporary_activities (activity)
          VALUES (${activity.trim()})
          RETURNING id, activity, rating, student_id, created_at, updated_at
        `
      } catch (e) {
        result = await sql`
          INSERT INTO temporary_activities (activity)
          VALUES (${activity.trim()})
          RETURNING id, activity, rating, created_at, updated_at
        `
        result = result.map((r: any) => ({ ...r, student_id: null }))
      }
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating temporary activity:", error)
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
}

// DELETE temporary activity
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM temporary_activities WHERE id = ${parseInt(id)}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting temporary activity:", error)
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 })
  }
}
