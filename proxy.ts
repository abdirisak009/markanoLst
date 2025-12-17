import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/admin"]
const publicRoutes = ["/admin/login", "/student", "/api"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Check for admin session cookie
    const adminSession = request.cookies.get("adminSession")?.value

    if (!adminSession || adminSession !== "true") {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check session expiry
    const sessionExpiry = request.cookies.get("sessionExpiry")?.value
    if (sessionExpiry) {
      const expiryTime = Number.parseInt(sessionExpiry, 10)
      if (Date.now() > expiryTime) {
        // Session expired - redirect to login
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
    // Match all admin routes except login
    "/admin/:path*",
  ],
}
