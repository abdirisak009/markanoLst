import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/auth"

// In-memory security logs (in production, use database)
const securityLogs: Array<{
  timestamp: number
  ip: string
  path: string
  action: string
  details?: string
}> = []

export async function GET() {
  // Only super_admin can view security logs
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value

  const result = verifyAdminToken(token)
  if (!result.valid || result.payload?.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized - Super admin required" }, { status: 403 })
  }

  return NextResponse.json({
    logs: securityLogs.slice(-100).reverse(),
    totalLogs: securityLogs.length,
  })
}
