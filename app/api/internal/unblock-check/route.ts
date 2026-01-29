import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// Internal: middleware checks this when IP is blocked to see if admin unblocked it.
// No auth – called from middleware with ?ip=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ip = searchParams.get("ip")?.trim()
  if (!ip) {
    return NextResponse.json({ unblocked: false })
  }
  try {
    const rows = await sql`
      SELECT 1 FROM admin_unblocked_ips WHERE ip = ${ip} LIMIT 1
    `
    return NextResponse.json({ unblocked: rows.length > 0 })
  } catch {
    return NextResponse.json({ unblocked: false })
  }
}
