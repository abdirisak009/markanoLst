import { NextRequest, NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

// POST bulk upload activities from Excel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { activities } = body

    if (!Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const item of activities) {
      try {
        const activity = String(item["Activity"] || item["activity"] || "").trim()
        // Get ID from Excel - can be number or string
        const excelId = item["ID"] !== undefined && item["ID"] !== null && item["ID"] !== "" 
          ? item["ID"] 
          : item["id"] !== undefined && item["id"] !== null && item["id"] !== ""
          ? item["id"]
          : item["Id"] !== undefined && item["Id"] !== null && item["Id"] !== ""
          ? item["Id"]
          : null

        if (!activity) {
          errors.push({ row: item, error: "Activity is required" })
          continue
        }

        let result
        
        // If ID is provided in Excel, use it
        if (excelId !== null && excelId !== "" && !isNaN(Number(excelId))) {
          const idValue = parseInt(String(excelId))
          console.log(`Inserting with custom ID: ${idValue}, Activity: ${activity}`)
          
          try {
            // Try to insert with the provided ID
            result = await sql`
              INSERT INTO temporary_activities (id, activity)
              VALUES (${idValue}, ${activity})
              ON CONFLICT (id) DO UPDATE
              SET activity = EXCLUDED.activity, updated_at = CURRENT_TIMESTAMP
              RETURNING id, activity, created_at, updated_at
            `
            console.log(`Successfully inserted/updated with ID: ${idValue}`)
          } catch (idError: any) {
            console.error(`Error inserting with ID ${idValue}:`, idError)
            // If there's an error (like ID already exists), update the existing record
            result = await sql`
              UPDATE temporary_activities 
              SET activity = ${activity}, updated_at = CURRENT_TIMESTAMP
              WHERE id = ${idValue}
              RETURNING id, activity, created_at, updated_at
            `
            
            // If update didn't find a record, insert without ID (auto-increment)
            if (!result || result.length === 0) {
              console.log(`ID ${idValue} not found, using auto-increment`)
              result = await sql`
                INSERT INTO temporary_activities (activity)
                VALUES (${activity})
                RETURNING id, activity, created_at, updated_at
              `
            }
          }
        } else {
          // No ID provided in Excel, use auto-increment
          console.log(`No ID provided, using auto-increment for activity: ${activity}`)
          result = await sql`
            INSERT INTO temporary_activities (activity)
            VALUES (${activity})
            RETURNING id, activity, created_at, updated_at
          `
        }

        if (result && result.length > 0) {
          results.push(result[0])
        } else {
          errors.push({ row: item, error: "Failed to insert activity" })
        }
      } catch (error) {
        console.error("Error processing activity:", error)
        errors.push({ row: item, error: String(error) })
      }
    }

    return NextResponse.json({
      success: true,
      inserted: results.length,
      errors: errors.length,
      errorDetails: errors,
    })
  } catch (error) {
    console.error("Bulk upload error:", error)
    return NextResponse.json({ error: "Failed to upload activities" }, { status: 500 })
  }
}
