import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// POST update rating for temporary activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, rating, student_id } = body

    console.log("Rating submission received:", { id, rating, student_id })

    if (!id) {
      return NextResponse.json({ error: "Activity ID is required" }, { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const activityId = parseInt(id.toString())
    const ratingValue = parseInt(rating.toString())

    console.log(`Updating activity ${activityId} with rating ${ratingValue}`)

    let result

    // Try to update rating - handle cases where columns might not exist
    try {
      // First try with both rating and student_id
      result = await sql`
        UPDATE temporary_activities
        SET rating = ${ratingValue}, 
            student_id = ${student_id || null},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${activityId}
        RETURNING id, activity, rating, student_id, created_at, updated_at
      `
      console.log("Rating updated successfully with student_id:", result[0])
    } catch (updateError: any) {
      const errorMsg = updateError.message?.toLowerCase() || ''
      
      // If rating column doesn't exist, we can't update it
      if (errorMsg.includes('rating') || (errorMsg.includes('column') && !errorMsg.includes('student_id'))) {
        console.error("ERROR: rating column does not exist in database!")
        console.error("Please run migration script: scripts/052-add-rating-to-temporary-activities.sql")
        return NextResponse.json({ 
          error: "Rating column does not exist. Please run the database migration script first." 
        }, { status: 500 })
      }
      
      // If only student_id column doesn't exist, update without it
      if (errorMsg.includes('student_id') || errorMsg.includes('column')) {
        console.warn("student_id column not found, updating rating without it")
        try {
          result = await sql`
            UPDATE temporary_activities
            SET rating = ${ratingValue}, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${activityId}
            RETURNING id, activity, rating, created_at, updated_at
          `
          // Add null student_id for consistency
          result = result.map((r: any) => ({ ...r, student_id: null }))
          console.log("Rating updated successfully without student_id:", result[0])
        } catch (ratingError: any) {
          // If rating column also doesn't exist
          if (ratingError.message?.toLowerCase().includes('rating')) {
            console.error("ERROR: rating column does not exist in database!")
            console.error("Please run migration script: scripts/052-add-rating-to-temporary-activities.sql")
            return NextResponse.json({ 
              error: "Rating column does not exist. Please run the database migration script first." 
            }, { status: 500 })
          }
          throw ratingError
        }
      } else {
        console.error("Error updating rating:", updateError)
        throw updateError
      }
    }

    if (result.length === 0) {
      console.error(`Activity with ID ${activityId} not found`)
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }

    const updatedActivity = result[0]
    console.log("Final updated activity:", {
      id: updatedActivity.id,
      rating: updatedActivity.rating,
      ratingType: typeof updatedActivity.rating,
      student_id: updatedActivity.student_id,
    })

    return NextResponse.json(updatedActivity)
  } catch (error) {
    console.error("Error updating rating:", error)
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 })
  }
}
