import { cookies } from "next/headers"

// ============================================
// MARKANO AUTHENTICATION SYSTEM
// ============================================

// Token expiry time (8 hours for better security)
const TOKEN_EXPIRY = 8 * 60 * 60 * 1000

const SECRET_KEY = "markano_secure_key_2024_x9k2m5n8_v2_enhanced"

// ============ TOKEN GENERATION ============

function createSignature(payload: string): string {
  // Simple HMAC-like signature using the secret key
  let hash = 0
  const combined = payload + SECRET_KEY
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export function generateAdminToken(user: { id: number; username: string; role: string }): string {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + TOKEN_EXPIRY,
    iat: Date.now(),
    type: "admin",
  }
  const payloadStr = JSON.stringify(payload)
  const signature = createSignature(payloadStr)
  return btoa(payloadStr) + "." + signature
}

export function generateGoldStudentToken(student: { id: number; email: string; name: string }): string {
  const payload = {
    id: student.id,
    email: student.email,
    name: student.name,
    type: "gold_student",
    exp: Date.now() + TOKEN_EXPIRY,
    iat: Date.now(),
  }
  const payloadStr = JSON.stringify(payload)
  const signature = createSignature(payloadStr)
  return btoa(payloadStr) + "." + signature
}

// ============ TOKEN VERIFICATION ============

export function verifyAdminToken(token: string | null): {
  valid: boolean
  payload?: { id: number; username: string; role: string; exp: number }
  error?: string
} {
  if (!token) return { valid: false, error: "No token provided" }

  try {
    // Check for signature
    const parts = token.split(".")
    if (parts.length !== 2) {
      // Legacy token without signature - still verify but mark as legacy
      const decoded = JSON.parse(atob(token))
      if (!decoded.id || !decoded.role || !decoded.exp) {
        return { valid: false, error: "Invalid token structure" }
      }
      if (Date.now() > decoded.exp) {
        return { valid: false, error: "Token expired" }
      }
      if (decoded.role !== "admin" && decoded.role !== "super_admin") {
        return { valid: false, error: "Invalid role" }
      }
      return { valid: true, payload: decoded }
    }

    const [payloadB64, signature] = parts
    const payloadStr = atob(payloadB64)

    // Verify signature
    const expectedSig = createSignature(payloadStr)
    if (signature !== expectedSig) {
      return { valid: false, error: "Invalid signature" }
    }

    const decoded = JSON.parse(payloadStr)

    if (!decoded.id || !decoded.role || !decoded.exp) {
      return { valid: false, error: "Invalid token structure" }
    }

    if (Date.now() > decoded.exp) {
      return { valid: false, error: "Token expired" }
    }

    if (decoded.role !== "admin" && decoded.role !== "super_admin") {
      return { valid: false, error: "Invalid role" }
    }

    return { valid: true, payload: decoded }
  } catch {
    return { valid: false, error: "Token parsing failed" }
  }
}

export function verifyGoldStudentToken(token: string | null): {
  valid: boolean
  payload?: { id: number; email: string; name: string; exp: number }
  error?: string
} {
  if (!token) return { valid: false, error: "No token provided" }

  try {
    const parts = token.split(".")
    if (parts.length !== 2) {
      // Legacy token
      const decoded = JSON.parse(atob(token))
      if (!decoded.id || !decoded.exp || decoded.type !== "gold_student") {
        return { valid: false, error: "Invalid token structure" }
      }
      if (Date.now() > decoded.exp) {
        return { valid: false, error: "Token expired" }
      }
      return { valid: true, payload: decoded }
    }

    const [payloadB64, signature] = parts
    const payloadStr = atob(payloadB64)

    const expectedSig = createSignature(payloadStr)
    if (signature !== expectedSig) {
      return { valid: false, error: "Invalid signature" }
    }

    const decoded = JSON.parse(payloadStr)

    if (!decoded.id || !decoded.exp || decoded.type !== "gold_student") {
      return { valid: false, error: "Invalid token structure" }
    }

    if (Date.now() > decoded.exp) {
      return { valid: false, error: "Token expired" }
    }

    return { valid: true, payload: decoded }
  } catch {
    return { valid: false, error: "Token parsing failed" }
  }
}

// ============ COOKIE MANAGEMENT ============

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60, // 8 hours
    path: "/",
  })
}

export async function setGoldStudentCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("gold_student_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60, // 8 hours
    path: "/",
  })
}

export async function clearAdminCookies() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_token")
  cookieStore.delete("adminSession")
  cookieStore.delete("sessionExpiry")
  cookieStore.delete("adminUser")
}

export async function clearGoldStudentCookies() {
  const cookieStore = await cookies()
  cookieStore.delete("gold_student_token")
  cookieStore.delete("goldStudentSession")
}

// ============ GET USER FROM COOKIES ============

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

// ============ PASSWORD HASHING ============

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + SECRET_KEY)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}
