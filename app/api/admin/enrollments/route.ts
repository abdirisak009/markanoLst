import { NextResponse } from "next/server"
import postgres from "postgres"
import { getAdminFromCookies } from "@/lib/auth"
import { cookies } from "next/headers"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * GET /api/admin/enrollments
 * Get all enrollment requests with user and course details
 */
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const admin = await getAdminFromCookies()
    
    // Fallback: check adminSession cookie (for compatibility)
    if (!admin) {
      const cookieStore = await cookies()
      const adminSession = cookieStore.get("adminSession")?.value
      if (adminSession !== "true") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"

    // Fetch enrollments with user and course details based on filter
    let enrollments
    if (filter === "pending") {
      enrollments = await sql`
        SELECT 
          cp.*,
          gs.full_name as user_name,
          gs.email as user_email,
          gs.whatsapp_number as user_phone,
          lc.title as course_title,
          lc.price as course_price
        FROM course_payments cp
        LEFT JOIN gold_students gs ON cp.user_id = gs.id
        LEFT JOIN learning_courses lc ON cp.course_id = lc.id
        WHERE cp.status = 'pending'
        ORDER BY cp.created_at DESC
      `
    } else if (filter === "approved") {
      enrollments = await sql`
        SELECT 
          cp.*,
          gs.full_name as user_name,
          gs.email as user_email,
          gs.whatsapp_number as user_phone,
          lc.title as course_title,
          lc.price as course_price
        FROM course_payments cp
        LEFT JOIN gold_students gs ON cp.user_id = gs.id
        LEFT JOIN learning_courses lc ON cp.course_id = lc.id
        WHERE cp.status = 'completed' OR cp.status = 'approved'
        ORDER BY cp.created_at DESC
      `
    } else if (filter === "rejected") {
      enrollments = await sql`
        SELECT 
          cp.*,
          gs.full_name as user_name,
          gs.email as user_email,
          gs.whatsapp_number as user_phone,
          lc.title as course_title,
          lc.price as course_price
        FROM course_payments cp
        LEFT JOIN gold_students gs ON cp.user_id = gs.id
        LEFT JOIN learning_courses lc ON cp.course_id = lc.id
        WHERE cp.status = 'failed' OR cp.status = 'rejected'
        ORDER BY cp.created_at DESC
      `
    } else {
      // All enrollments
      enrollments = await sql`
        SELECT 
          cp.*,
          gs.full_name as user_name,
          gs.email as user_email,
          gs.whatsapp_number as user_phone,
          lc.title as course_title,
          lc.price as course_price
        FROM course_payments cp
        LEFT JOIN gold_students gs ON cp.user_id = gs.id
        LEFT JOIN learning_courses lc ON cp.course_id = lc.id
        ORDER BY cp.created_at DESC
      `
    }

    return NextResponse.json(enrollments)
  } catch (error: any) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}
