import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@/lib/db"

// Admin unblock: adds IP to admin_unblocked_ips so middleware allows it even if in-memory block exists.

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value ?? null

  const result = verifyAdminToken(token)
  if (!result.valid || (result.payload?.role !== "super_admin" && result.payload?.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 403 })
  }

  return NextResponse.json({
    message: "Blocked IPs are managed in middleware. Use DELETE with body { ip } to unblock an IP.",
  })
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value ?? null

  const result = verifyAdminToken(token)
  if (!result.valid || (result.payload?.role !== "super_admin" && result.payload?.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 403 })
  }

  let body: { ip?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const ip = body.ip?.trim()
  if (!ip) {
    return NextResponse.json({ error: "Missing or empty 'ip' in body" }, { status: 400 })
  }

  try {
    await sql`
      INSERT INTO admin_unblocked_ips (ip)
      VALUES (${ip})
      ON CONFLICT (ip) DO UPDATE SET unblocked_at = NOW()
    `
    return NextResponse.json({ success: true, message: `IP ${ip} unblocked. They can access the site again.` })
  } catch (e) {
    console.error("[blocked-ips] unblock failed:", e)
    return NextResponse.json(
      { error: "Unblock failed. Ensure table admin_unblocked_ips exists (run scripts/055-admin-unblocked-ips.sql)." },
      { status: 500 },
    )
  }
}
