import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * POST /api/instructor/agreement/accept
 * Instructor only: accept the current contract (sets agreement_accepted_at = now()).
 */
export async function POST() {
  try {
    const instructor = await getInstructorFromCookies()
    if (!instructor) {
      return NextResponse.json(
        { error: "Unauthorized - Instructor authentication required" },
        { status: 401 }
      )
    }

    const [agreementDoc] = await sql`
      SELECT id FROM instructor_documents
      WHERE instructor_id = ${instructor.id} AND document_type = 'agreement'
      ORDER BY created_at DESC LIMIT 1
    `
    if (!agreementDoc) {
      return NextResponse.json(
        { error: "No contract document has been set for you yet. Please contact admin." },
        { status: 400 }
      )
    }

    await sql`
      UPDATE instructors
      SET agreement_accepted_at = NOW(), updated_at = NOW()
      WHERE id = ${instructor.id} AND deleted_at IS NULL
    `

    const [updated] = await sql`
      SELECT agreement_accepted_at FROM instructors WHERE id = ${instructor.id} AND deleted_at IS NULL
    `

    return NextResponse.json({
      success: true,
      agreement_accepted_at: updated?.agreement_accepted_at ?? null,
      message: "Contract accepted successfully.",
    })
  } catch (e) {
    console.error("Instructor agreement accept error:", e)
    return NextResponse.json(
      { error: "Failed to accept agreement" },
      { status: 500 }
    )
  }
}
