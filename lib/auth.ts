import { cookies } from "next/headers"

// Token expiry time (24 hours)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000

// Generate admin token
export function generateAdminToken(user: { id: number; username: string; role: string }): string {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + TOKEN_EXPIRY,
    iat: Date.now(),
  }
  return btoa(JSON.stringify(payload))
}

// Generate gold student token
export function generateGoldStudentToken(student: { id: number; email: string; name: string }): string {
  const payload = {
    id: student.id,
    email: student.email,
    name: student.name,
    type: "gold_student",
    exp: Date.now() + TOKEN_EXPIRY,
    iat: Date.now(),
  }
  return btoa(JSON.stringify(payload))
}

// Verify and decode admin token
export function verifyAdminToken(token: string | null): {
  valid: boolean
  payload?: { id: number; username: string; role: string; exp: number }
} {
  if (!token) return { valid: false }

  try {
    const decoded = JSON.parse(atob(token))

    if (!decoded.id || !decoded.role || !decoded.exp) {
      return { valid: false }
    }

    if (Date.now() > decoded.exp) {
      return { valid: false }
    }

    if (decoded.role !== "admin" && decoded.role !== "super_admin") {
      return { valid: false }
    }

    return { valid: true, payload: decoded }
  } catch {
    return { valid: false }
  }
}

// Verify and decode gold student token
export function verifyGoldStudentToken(token: string | null): {
  valid: boolean
  payload?: { id: number; email: string; name: string; exp: number }
} {
  if (!token) return { valid: false }

  try {
    const decoded = JSON.parse(atob(token))

    if (!decoded.id || !decoded.exp || decoded.type !== "gold_student") {
      return { valid: false }
    }

    if (Date.now() > decoded.exp) {
      return { valid: false }
    }

    return { valid: true, payload: decoded }
  } catch {
    return { valid: false }
  }
}

// Set admin cookie (for use in API routes)
export async function setAdminCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  })
}

// Set gold student cookie
export async function setGoldStudentCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("gold_student_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  })
}

// Get admin from cookies
export async function getAdminFromCookies(): Promise<{
  id: number
  username: string
  role: string
} | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value

  const result = verifyAdminToken(token)
  if (!result.valid || !result.payload) return null

  return {
    id: result.payload.id,
    username: result.payload.username,
    role: result.payload.role,
  }
}

// Get gold student from cookies
export async function getGoldStudentFromCookies(): Promise<{
  id: number
  email: string
  name: string
} | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("gold_student_token")?.value

  const result = verifyGoldStudentToken(token)
  if (!result.valid || !result.payload) return null

  return {
    id: result.payload.id,
    email: result.payload.email,
    name: result.payload.name,
  }
}
