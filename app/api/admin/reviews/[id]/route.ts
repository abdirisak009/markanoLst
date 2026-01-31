import { NextRequest, NextResponse } from "next/server"
import postgres from "postgres"
import { getAdminFromCookies } from "@/lib/auth"
import { cookies } from "next/headers"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

async function ensureAdmin() {
  const admin = await getAdminFromCookies()
  const session = (await cookies()).get("adminSession")?.value
  if (!admin && session !== "true") {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }
}

/**
 * PATCH /api/admin/reviews/[id]
 * Admin: approve or reject a review.
 * Body: { status: 'approved' | 'rejected' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureAdmin()
    const { id } = await params
    const body = await request.json()
    const status = body.status === "rejected" ? "rejected" : "approved"

    await sql`
      UPDATE reviews
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id, 10)}
    `

    return NextResponse.json({ success: true, status })
  } catch (e) {
    if (e instanceof Response) return e
    console.error("PATCH /api/admin/reviews/[id] error:", e)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Admin: delete a review.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureAdmin()
    const { id } = await params

    await sql`DELETE FROM reviews WHERE id = ${parseInt(id, 10)}`

    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof Response) return e
    console.error("DELETE /api/admin/reviews/[id] error:", e)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
