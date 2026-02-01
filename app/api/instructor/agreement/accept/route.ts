import { NextResponse } from "next/server"
import postgres from "postgres"
import { getInstructorFromCookies } from "@/lib/auth"
import { getCurrentAgreementVersion } from "@/lib/agreement"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

function getClientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0]?.trim() ?? null
  const xri = request.headers.get("x-real-ip")
  if (xri) return xri.trim()
  return null
}

function getUserAgent(request: Request): string | null {
  return request.headers.get("user-agent")
}

/**
 * POST /api/instructor/agreement/accept
 * Instructor only: accept current agreement (digital or legacy).
 * Logs to instructor_agreement_acceptances when digital; updates instructors.
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

    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    let contentSnapshot: string | null = null
    try {
      const body = await request.json().catch(() => ({}))
      if (typeof body.content_snapshot === "string" && body.content_snapshot.length <= 50000) {
        contentSnapshot = body.content_snapshot
      }
    } catch {
      // optional body
    }

    const currentVersion = await getCurrentAgreementVersion(sql)

    if (currentVersion) {
      await sql`
        INSERT INTO instructor_agreement_acceptances (
          instructor_id, agreement_version_id, version_string, source, content_snapshot,
          accepted_at_utc, ip_address, user_agent
        )
        VALUES (
          ${instructor.id}, ${currentVersion.id}, ${currentVersion.version}, 'digital',
          ${contentSnapshot},
          (NOW() AT TIME ZONE 'UTC'), ${ip}, ${userAgent}
        )
      `

      await sql`
        UPDATE instructors
        SET accepted_agreement_version_id = ${currentVersion.id},
            agreement_accepted_at = NOW(),
            updated_at = NOW()
        WHERE id = ${instructor.id} AND deleted_at IS NULL
      `
    } else {
      const [agreementDoc] = await sql`
        SELECT id FROM instructor_documents
        WHERE instructor_id = ${instructor.id} AND document_type = 'agreement'
        ORDER BY created_at DESC LIMIT 1
      `
      if (!agreementDoc) {
        return NextResponse.json(
          { error: "No agreement has been set for you yet. Please contact admin." },
          { status: 400 }
        )
      }

      await sql`
        UPDATE instructors
        SET agreement_accepted_at = NOW(), updated_at = NOW()
        WHERE id = ${instructor.id} AND deleted_at IS NULL
      `
    }

    const [updated] = await sql`
      SELECT agreement_accepted_at, accepted_agreement_version_id FROM instructors
      WHERE id = ${instructor.id} AND deleted_at IS NULL
    `

    return NextResponse.json({
      success: true,
      agreement_accepted_at: updated?.agreement_accepted_at ?? null,
      accepted_version_id: updated?.accepted_agreement_version_id ?? null,
      message: "Agreement accepted successfully. Your acceptance has been recorded.",
    })
  } catch (e) {
    console.error("Instructor agreement accept error:", e)
    return NextResponse.json(
      { error: "Failed to accept agreement" },
      { status: 500 }
    )
  }
}
