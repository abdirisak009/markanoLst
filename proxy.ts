import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ============================================
// MARKANO SECURITY MIDDLEWARE
// ============================================

// In-memory stores (reset on deployment, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const blockedIPs = new Map<string, { until: number; reason: string }>()
const failedLoginAttempts = new Map<string, { count: number; firstAttempt: number }>()

// ============ CONFIGURATION ============

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
  "/api/gold/tracks", // Public - view available tracks
  "/api/gold/levels", // Public - view levels
  "/api/gold/lessons", // Public - view lessons (content protected separately)
  "/api/gold/enrollments", // Students need to view/modify their enrollments
  "/api/gold/level-requests", // Students need to view/submit level requests
  "/api/gold/applications", // Students need to apply for tracks
  "/api/gold/lesson-progress", // Students need to track progress
  "/api/gold/progress", // Students need to view progress
  "/api/quiz", // Public quiz taking
  "/api/forum",
  "/api/videos/public",
  "/api/videos/verify-student", // Added - Public student verification for videos
  "/api/videos/categories", // Added - Public video categories
  "/api/dashboard/stats",
  "/api/live-coding", // Added - Live coding challenge access
]

// Gold student protected API routes (only for modifying data)
const goldProtectedApiRoutes: string[] = []

// Rate limit configurations
const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5, blockDurationMs: 30 * 60 * 1000 },
  api: { windowMs: 60 * 1000, maxRequests: 100, blockDurationMs: 5 * 60 * 1000 },
  public: { windowMs: 60 * 1000, maxRequests: 200, blockDurationMs: 2 * 60 * 1000 },
}

// Suspicious patterns to detect attacks
const SUSPICIOUS_PATTERNS = [
  /(%27)|(')|(--)|(%23)|(#)/i,
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /\.\.\//,
  /union.*select/i,
  /insert.*into/i,
  /delete.*from/i,
  /drop.*table/i,
  /exec\s*\(/i,
]

// ============ HELPER FUNCTIONS ============

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfIP = request.headers.get("cf-connecting-ip")
  if (cfIP) return cfIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(",")[0].trim()
  return "unknown"
}

function logSecurity(action: string, ip: string, path: string, details?: string) {
  const timestamp = new Date().toISOString()
  console.log(`[SECURITY] ${timestamp} | ${action} | IP: ${ip} | Path: ${path}${details ? ` | ${details}` : ""}`)
}

// ============ IP BLOCKING ============

function isIPBlocked(ip: string): { blocked: boolean; reason?: string; remainingMs?: number } {
  const blocked = blockedIPs.get(ip)
  if (!blocked) return { blocked: false }

  if (Date.now() > blocked.until) {
    blockedIPs.delete(ip)
    return { blocked: false }
  }

  return { blocked: true, reason: blocked.reason, remainingMs: blocked.until - Date.now() }
}

function blockIP(ip: string, durationMs: number, reason: string) {
  blockedIPs.set(ip, { until: Date.now() + durationMs, reason })
  logSecurity("IP_BLOCKED", ip, "", `Duration: ${durationMs / 1000 / 60}min, Reason: ${reason}`)
}

// ============ RATE LIMITING ============

function checkRateLimit(
  ip: string,
  endpoint: string,
  config: typeof RATE_LIMITS.api,
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  if (record.count >= config.maxRequests) {
    blockIP(ip, config.blockDurationMs, `Rate limit exceeded: ${endpoint}`)
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count, resetIn: record.resetTime - now }
}

// ============ FAILED LOGIN TRACKING ============

function recordFailedLogin(ip: string): boolean {
  const now = Date.now()
  const record = failedLoginAttempts.get(ip)

  if (!record || now - record.firstAttempt > 30 * 60 * 1000) {
    failedLoginAttempts.set(ip, { count: 1, firstAttempt: now })
    return false
  }

  record.count++

  if (record.count >= 5) {
    blockIP(ip, 60 * 60 * 1000, "Too many failed login attempts")
    failedLoginAttempts.delete(ip)
    return true
  }

  return false
}

// ============ INPUT VALIDATION ============

function containsSuspiciousInput(url: string): boolean {
  const decodedUrl = decodeURIComponent(url)
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(decodedUrl)) {
      return true
    }
  }
  return false
}

// ============ TOKEN VERIFICATION ============

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

// ============ SECURITY HEADERS ============

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
}

// ============ MAIN MIDDLEWARE ============

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const method = request.method
  const ip = getClientIP(request)
  const fullUrl = pathname + search

  // 1. CHECK IF IP IS BLOCKED
  const blockStatus = isIPBlocked(ip)
  if (blockStatus.blocked) {
    logSecurity("BLOCKED_REQUEST", ip, pathname, blockStatus.reason)
    const remainingMinutes = Math.ceil((blockStatus.remainingMs || 0) / 1000 / 60)
    return addSecurityHeaders(
      NextResponse.json(
        {
          error: "Access denied. Your IP has been temporarily blocked.",
          reason: blockStatus.reason,
          retryAfterMinutes: remainingMinutes,
        },
        { status: 403 },
      ),
    )
  }

  // 2. CHECK FOR SUSPICIOUS PATTERNS IN URL
  if (containsSuspiciousInput(fullUrl)) {
    logSecurity("SUSPICIOUS_URL", ip, pathname, "Potential injection attack")
    blockIP(ip, 24 * 60 * 60 * 1000, "Suspicious URL pattern detected") // 24 hour block
    return addSecurityHeaders(NextResponse.json({ error: "Invalid request" }, { status: 400 }))
  }

  // 3. RATE LIMITING FOR AUTH ENDPOINTS
  const isAuthEndpoint = pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/auth")
  if (isAuthEndpoint && method === "POST") {
    const rateLimit = checkRateLimit(ip, "auth", RATE_LIMITS.auth)
    if (!rateLimit.allowed) {
      logSecurity("RATE_LIMITED", ip, pathname, "Auth endpoint")
      return addSecurityHeaders(
        NextResponse.json(
          {
            error: "Too many authentication attempts. Please try again later.",
            retryAfterSeconds: Math.ceil(rateLimit.resetIn / 1000),
          },
          {
            status: 429,
            headers: { "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString() },
          },
        ),
      )
    }
  }

  // 4. RATE LIMITING FOR API ENDPOINTS
  if (pathname.startsWith("/api/")) {
    const rateLimit = checkRateLimit(ip, "api", RATE_LIMITS.api)
    if (!rateLimit.allowed) {
      logSecurity("RATE_LIMITED", ip, pathname, "API endpoint")
      return addSecurityHeaders(
        NextResponse.json(
          {
            error: "Too many requests. Please slow down.",
            retryAfterSeconds: Math.ceil(rateLimit.resetIn / 1000),
          },
          {
            status: 429,
            headers: { "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString() },
          },
        ),
      )
    }
  }

  // 5. CHECK IF IT'S A PUBLIC ROUTE
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // These specific routes should be fully public (including POST)
  const fullyPublicRoutes = [
    "/api/videos/verify-student",
    "/api/videos/categories",
    "/api/live-coding",
    "/api/gold/auth/login",
    "/api/gold/auth/register",
    "/api/gold/students",
    "/api/quiz",
    "/api/forum",
    "/api/admin/login",
    "/api/admin/auth/login",
  ]

  const isFullyPublicRoute = fullyPublicRoutes.some((route) => pathname.startsWith(route))

  // If it's a fully public route, skip all auth checks
  if (isFullyPublicRoute) {
    return addSecurityHeaders(NextResponse.next())
  }

  if (isPublicRoute) {
    const isModifyingRequest = ["POST", "PUT", "DELETE", "PATCH"].includes(method)
    if (!isModifyingRequest || pathname.includes("/login") || pathname.includes("/register")) {
      return addSecurityHeaders(NextResponse.next())
    }
  }

  // 6. CHECK ADMIN API ROUTES
  const isModifyingRequest = ["POST", "PUT", "DELETE", "PATCH"].includes(method)
  const isAdminApiRoute = adminProtectedApiRoutes.some((route) => pathname.startsWith(route))

  const isPublicVideoRoute =
    pathname.startsWith("/api/videos/verify-student") ||
    pathname.startsWith("/api/videos/categories") ||
    pathname.startsWith("/api/videos/public")

  if (isAdminApiRoute && isModifyingRequest && !isPublicVideoRoute) {
    const adminToken = request.cookies.get("admin_token")?.value
    const adminSession = request.cookies.get("adminSession")?.value

    if (!verifyAdminToken(adminToken) && adminSession !== "true") {
      logSecurity("UNAUTHORIZED", ip, pathname, "Admin API access denied")
      recordFailedLogin(ip)
      return addSecurityHeaders(
        NextResponse.json({ error: "Unauthorized - Admin authentication required" }, { status: 401 }),
      )
    }

    logSecurity("AUTHORIZED", ip, pathname, "Admin API access granted")
  }

  // 7. CHECK GOLD STUDENT API ROUTES
  const isGoldApiRoute = goldProtectedApiRoutes.some((route) => pathname.startsWith(route))
  if (isGoldApiRoute) {
    const goldToken = request.cookies.get("gold_student_token")?.value
    const goldStudentId = request.cookies.get("goldStudentId")?.value

    // For GET requests, allow if user has any form of session
    if (method === "GET") {
      if (verifyGoldToken(goldToken) || goldStudentId) {
        return addSecurityHeaders(NextResponse.next())
      }
      // If no session at all, deny access
      logSecurity("UNAUTHORIZED", ip, pathname, "Gold student GET access denied - no session")
      return addSecurityHeaders(NextResponse.json({ error: "Unauthorized - Please log in first" }, { status: 401 }))
    }

    // For modifying requests (POST, PUT, DELETE), require valid token OR session
    if (isModifyingRequest) {
      if (verifyGoldToken(goldToken) || goldStudentId) {
        return addSecurityHeaders(NextResponse.next())
      }
      logSecurity("UNAUTHORIZED", ip, pathname, "Gold student API access denied")
      return addSecurityHeaders(
        NextResponse.json({ error: "Unauthorized - Gold student authentication required" }, { status: 401 }),
      )
    }
  }

  // 8. CHECK ADMIN PAGE ROUTES
  const isAdminPageRoute = adminProtectedRoutes.some((route) => pathname.startsWith(route))
  if (isAdminPageRoute && !pathname.startsWith("/admin/login")) {
    const adminSession = request.cookies.get("adminSession")?.value
    const adminToken = request.cookies.get("admin_token")?.value

    if (!verifyAdminToken(adminToken) && adminSession !== "true") {
      logSecurity("REDIRECT", ip, pathname, "Unauthenticated admin page access")
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const sessionExpiry = request.cookies.get("sessionExpiry")?.value
    if (sessionExpiry && !adminToken) {
      const expiryTime = Number.parseInt(sessionExpiry, 10)
      if (Date.now() > expiryTime) {
        logSecurity("SESSION_EXPIRED", ip, pathname, "Admin session expired")
        const response = NextResponse.redirect(new URL("/admin/login?expired=true", request.url))
        response.cookies.delete("adminSession")
        response.cookies.delete("sessionExpiry")
        response.cookies.delete("adminUser")
        return response
      }
    }
  }

  return addSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}
