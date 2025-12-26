import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require admin authentication
const adminProtectedRoutes = ["/admin"]
const adminProtectedApiRoutes = [
  "/api/admin/users",
  "/api/admin/quizzes",
  "/api/admin/ecommerce-submissions",
  "/api/classes",
  "/api/courses",
  "/api/modules",
  "/api/lessons",
  "/api/assignments",
  "/api/universities",
  "/api/university-students",
  "/api/penn-students",
  "/api/groups",
  "/api/enrollments",
  "/api/videos",
  "/api/challenges",
  "/api/financial-report",
  "/api/general-expenses",
  "/api/student-marks",
  "/api/upload",
]

// Public routes that don't need auth
const publicRoutes = [
  "/admin/login",
  "/api/admin/login",
  "/api/admin/auth/login",
  "/api/gold/auth/login",
  "/api/gold/auth/register",
  "/api/gold/students", // POST for registration
  "/api/quiz", // Public quiz taking
  "/api/forum",
  "/api/videos/public",
  "/api/dashboard/stats",
]

// Gold student protected API routes
const goldProtectedApiRoutes = [
  "/api/gold/enrollments",
  "/api/gold/lesson-progress",
  "/api/gold/progress",
  "/api/gold/level-requests",
]

function verifyAdminToken(token: string | null): boolean {
  if (!token) return false
  try {
    const decoded = JSON.parse(atob(token))
    if (!decoded.id || !decoded.role || !decoded.exp) return false
    if (Date.now() > decoded.exp) return false
    if (decoded.role !== "admin" && decoded.role !== "super_admin") return false
    return true
  } catch {
    return false
  }
}

function verifyGoldToken(token: string | null): boolean {
  if (!token) return false
  try {
    const decoded = JSON.parse(atob(token))
    if (!decoded.id || !decoded.exp || decoded.type !== "gold_student") return false
    if (Date.now() > decoded.exp) return false
    return true
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Allow all GET requests to most endpoints (read-only is generally safe)
  // But block POST/PUT/DELETE without auth
  const isModifyingRequest = ["POST", "PUT", "DELETE", "PATCH"].includes(method)

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  if (isPublicRoute) {
    // Special case: gold/students POST is registration, but PUT/DELETE need auth
    if (pathname === "/api/gold/students" && method === "POST") {
      return NextResponse.next()
    }
    if (!isModifyingRequest || pathname.includes("/login") || pathname.includes("/register")) {
      return NextResponse.next()
    }
  }

  // Check admin API routes
  const isAdminApiRoute = adminProtectedApiRoutes.some((route) => pathname.startsWith(route))
  if (isAdminApiRoute && isModifyingRequest) {
    const adminToken = request.cookies.get("admin_token")?.value
    const adminSession = request.cookies.get("adminSession")?.value

    // Check new token system OR legacy session system
    if (!verifyAdminToken(adminToken) && adminSession !== "true") {
      return NextResponse.json({ error: "Unauthorized - Admin authentication required" }, { status: 401 })
    }
  }

  // Check gold student API routes
  const isGoldApiRoute = goldProtectedApiRoutes.some((route) => pathname.startsWith(route))
  if (isGoldApiRoute && isModifyingRequest) {
    const goldToken = request.cookies.get("gold_student_token")?.value
    if (!verifyGoldToken(goldToken)) {
      return NextResponse.json({ error: "Unauthorized - Gold student authentication required" }, { status: 401 })
    }
  }

  // Check admin page routes
  const isAdminPageRoute = adminProtectedRoutes.some((route) => pathname.startsWith(route))
  if (isAdminPageRoute && !pathname.startsWith("/admin/login")) {
    const adminSession = request.cookies.get("adminSession")?.value
    const adminToken = request.cookies.get("admin_token")?.value

    if (!verifyAdminToken(adminToken) && adminSession !== "true") {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check session expiry for legacy system
    const sessionExpiry = request.cookies.get("sessionExpiry")?.value
    if (sessionExpiry && !adminToken) {
      const expiryTime = Number.parseInt(sessionExpiry, 10)
      if (Date.now() > expiryTime) {
        const response = NextResponse.redirect(new URL("/admin/login?expired=true", request.url))
        response.cookies.delete("adminSession")
        response.cookies.delete("sessionExpiry")
        response.cookies.delete("adminUser")
        return response
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/classes/:path*",
    "/api/courses/:path*",
    "/api/modules/:path*",
    "/api/lessons/:path*",
    "/api/assignments/:path*",
    "/api/universities/:path*",
    "/api/university-students/:path*",
    "/api/penn-students/:path*",
    "/api/groups/:path*",
    "/api/enrollments/:path*",
    "/api/videos/:path*",
    "/api/challenges/:path*",
    "/api/financial-report/:path*",
    "/api/general-expenses/:path*",
    "/api/student-marks/:path*",
    "/api/upload/:path*",
    "/api/gold/:path*",
  ],
}
