// ============================================
// MARKANO COMPREHENSIVE SECURITY SYSTEM
// ============================================

// Rate limiting storage (in-memory for serverless, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const blockedIPs = new Map<string, { until: number; reason: string }>()
const failedAttempts = new Map<string, { count: number; firstAttempt: number }>()
const securityLogs: SecurityLogEntry[] = []

// ============ TYPES ============
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  blockDurationMs: number // How long to block after exceeding
}

interface SecurityLogEntry {
  timestamp: number
  ip: string
  path: string
  method: string
  action: string
  details?: string
  userAgent?: string
}

// ============ RATE LIMIT CONFIGS ============
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Very strict for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts
    blockDurationMs: 30 * 60 * 1000, // 30 min block
  },
  // Strict for sensitive operations
  sensitive: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests
    blockDurationMs: 10 * 60 * 1000, // 10 min block
  },
  // Normal for general API
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests
    blockDurationMs: 5 * 60 * 1000, // 5 min block
  },
  // Very high for public read endpoints
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests
    blockDurationMs: 2 * 60 * 1000, // 2 min block
  },
}

// ============ SUSPICIOUS PATTERNS ============
const SUSPICIOUS_PATTERNS = [
  /(%27)|(')|(--)|(%23)|(#)/i, // SQL Injection
  /<script[^>]*>.*?<\/script>/gi, // XSS
  /javascript:/gi, // JavaScript injection
  /on\w+\s*=/gi, // Event handlers
  /\.\.\//g, // Path traversal
  /eval\s*\(/gi, // Eval injection
  /union.*select/gi, // SQL Union
  /insert.*into/gi, // SQL Insert
  /delete.*from/gi, // SQL Delete
  /drop.*table/gi, // SQL Drop
  /exec\s*\(/gi, // Command execution
  /cmd\.exe/gi, // Windows command
  /\/etc\/passwd/gi, // Unix path
]

// ============ HELPER FUNCTIONS ============

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfIP = request.headers.get("cf-connecting-ip")

  if (cfIP) return cfIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(",")[0].trim()

  return "unknown"
}

export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown"
}

// ============ SECURITY LOGGING ============

export function logSecurityEvent(
  ip: string,
  path: string,
  method: string,
  action: string,
  details?: string,
  userAgent?: string,
) {
  const entry: SecurityLogEntry = {
    timestamp: Date.now(),
    ip,
    path,
    method,
    action,
    details,
    userAgent,
  }

  securityLogs.push(entry)

  // Keep only last 10000 entries
  if (securityLogs.length > 10000) {
    securityLogs.shift()
  }

  // Log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[SECURITY] ${new Date().toISOString()} | ${action} | IP: ${ip} | ${method} ${path}${details ? ` | ${details}` : ""}`,
    )
  }
}

export function getSecurityLogs(limit = 100): SecurityLogEntry[] {
  return securityLogs.slice(-limit).reverse()
}

// ============ IP BLOCKING ============

export function isIPBlocked(ip: string): { blocked: boolean; reason?: string; until?: number } {
  const blocked = blockedIPs.get(ip)
  if (!blocked) return { blocked: false }

  if (Date.now() > blocked.until) {
    blockedIPs.delete(ip)
    return { blocked: false }
  }

  return { blocked: true, reason: blocked.reason, until: blocked.until }
}

export function blockIP(ip: string, durationMs: number, reason: string) {
  const until = Date.now() + durationMs
  blockedIPs.set(ip, { until, reason })
  logSecurityEvent(ip, "", "", "IP_BLOCKED", `Blocked for ${durationMs / 1000 / 60} minutes: ${reason}`)
}

export function unblockIP(ip: string) {
  blockedIPs.delete(ip)
  logSecurityEvent(ip, "", "", "IP_UNBLOCKED", "Manually unblocked")
}

export function getBlockedIPs(): Map<string, { until: number; reason: string }> {
  // Clean expired blocks
  for (const [ip, data] of blockedIPs) {
    if (Date.now() > data.until) {
      blockedIPs.delete(ip)
    }
  }
  return blockedIPs
}

// ============ RATE LIMITING ============

export function checkRateLimit(
  ip: string,
  endpoint: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded - block IP
    blockIP(ip, config.blockDurationMs, `Rate limit exceeded on ${endpoint}`)
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }

  // Increment counter
  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count, resetIn: record.resetTime - now }
}

// ============ FAILED ATTEMPTS TRACKING ============

export function recordFailedAttempt(ip: string): { shouldBlock: boolean; attempts: number } {
  const now = Date.now()
  const record = failedAttempts.get(ip)

  // Reset after 30 minutes
  if (!record || now - record.firstAttempt > 30 * 60 * 1000) {
    failedAttempts.set(ip, { count: 1, firstAttempt: now })
    return { shouldBlock: false, attempts: 1 }
  }

  record.count++

  // Block after 10 failed attempts in 30 minutes
  if (record.count >= 10) {
    blockIP(ip, 60 * 60 * 1000, "Too many failed authentication attempts") // 1 hour block
    failedAttempts.delete(ip)
    return { shouldBlock: true, attempts: record.count }
  }

  return { shouldBlock: false, attempts: record.count }
}

export function clearFailedAttempts(ip: string) {
  failedAttempts.delete(ip)
}

// ============ INPUT VALIDATION ============

export function containsSuspiciousPatterns(input: string): boolean {
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      return true
    }
  }
  return false
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript:
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim()
}

export function validateRequestBody(body: unknown, ip: string, path: string): { valid: boolean; error?: string } {
  if (!body || typeof body !== "object") {
    return { valid: true } // Empty or non-object is ok
  }

  const checkValue = (value: unknown, key: string): boolean => {
    if (typeof value === "string") {
      if (containsSuspiciousPatterns(value)) {
        logSecurityEvent(ip, path, "POST", "SUSPICIOUS_INPUT", `Suspicious pattern in field: ${key}`)
        return false
      }
    } else if (typeof value === "object" && value !== null) {
      for (const [k, v] of Object.entries(value)) {
        if (!checkValue(v, `${key}.${k}`)) return false
      }
    }
    return true
  }

  for (const [key, value] of Object.entries(body)) {
    if (!checkValue(value, key)) {
      return { valid: false, error: `Invalid input detected in field: ${key}` }
    }
  }

  return { valid: true }
}

// ============ CSRF PROTECTION ============

const csrfTokens = new Map<string, { token: string; expires: number }>()

export function generateCSRFToken(sessionId: string): string {
  const token = btoa(crypto.randomUUID() + Date.now().toString())
  csrfTokens.set(sessionId, { token, expires: Date.now() + 60 * 60 * 1000 }) // 1 hour
  return token
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId)
  if (!stored) return false
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId)
    return false
  }
  return stored.token === token
}

// ============ SECURE TOKEN GENERATION ============

export function generateSecureToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// ============ API KEY VALIDATION ============

const API_KEYS = new Map<string, { name: string; permissions: string[]; rateLimit: RateLimitConfig }>()

export function registerAPIKey(key: string, name: string, permissions: string[], rateLimit?: RateLimitConfig) {
  API_KEYS.set(key, { name, permissions, rateLimit: rateLimit || RATE_LIMITS.api })
}

export function validateAPIKey(key: string, requiredPermission?: string): { valid: boolean; name?: string } {
  const apiKey = API_KEYS.get(key)
  if (!apiKey) return { valid: false }

  if (requiredPermission && !apiKey.permissions.includes(requiredPermission) && !apiKey.permissions.includes("*")) {
    return { valid: false }
  }

  return { valid: true, name: apiKey.name }
}

// ============ SECURITY HEADERS ============

export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  }
}

// ============ RESPONSE HELPERS ============

export function securityErrorResponse(message: string, status = 403) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getSecurityHeaders(),
    },
  })
}

export function rateLimitResponse(resetIn: number) {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil(resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": Math.ceil(resetIn / 1000).toString(),
        ...getSecurityHeaders(),
      },
    },
  )
}

// ============ CLEANUP FUNCTION ============

export function cleanupExpiredData() {
  const now = Date.now()

  // Clean rate limit records
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }

  // Clean blocked IPs
  for (const [ip, data] of blockedIPs) {
    if (now > data.until) {
      blockedIPs.delete(ip)
    }
  }

  // Clean failed attempts
  for (const [ip, data] of failedAttempts) {
    if (now - data.firstAttempt > 30 * 60 * 1000) {
      failedAttempts.delete(ip)
    }
  }

  // Clean CSRF tokens
  for (const [sessionId, data] of csrfTokens) {
    if (now > data.expires) {
      csrfTokens.delete(sessionId)
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredData, 5 * 60 * 1000)
}
