import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

const API_VERSION = "4.0"

// In production, consider using Redis (Upstash) for distributed rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const MAX_REQUESTS = 10 // Max 10 requests per window
const WINDOW_MS = 60 * 1000 // 1 minute window

const failedAttemptsStore = new Map<string, { count: number; lastAttempt: number }>()
const MAX_FAILED_ATTEMPTS = 5 // Max 5 failed attempts before temporary block
const BLOCK_DURATION_MS = 5 * 60 * 1000 // 5 minute block

function getClientIP(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")
  return forwarded?.split(",")[0]?.trim() || realIP || "unknown"
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: MAX_REQUESTS - record.count }
}

function checkFailedAttempts(ip: string): boolean {
  const now = Date.now()
  const record = failedAttemptsStore.get(ip)

  if (!record) return true

  // Reset if block duration has passed
  if (now - record.lastAttempt > BLOCK_DURATION_MS) {
    failedAttemptsStore.delete(ip)
    return true
  }

  return record.count < MAX_FAILED_ATTEMPTS
}

function recordFailedAttempt(ip: string) {
  const now = Date.now()
  const record = failedAttemptsStore.get(ip)

  if (!record) {
    failedAttemptsStore.set(ip, { count: 1, lastAttempt: now })
  } else {
    record.count++
    record.lastAttempt = now
  }
}

function resetFailedAttempts(ip: string) {
  failedAttemptsStore.delete(ip)
}

function isValidStudentId(studentId: string): boolean {
  // Allow alphanumeric, max 20 characters
  const validPattern = /^[a-zA-Z0-9@._-]{1,50}$/
  return validPattern.test(studentId)
}

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const clientIP = getClientIP(headersList)

    if (!checkFailedAttempts(clientIP)) {
      console.log(`[v0] IP ${clientIP} blocked due to too many failed attempts`)
      return NextResponse.json(
        {
          verified: false,
          message: "Isku dayo badan oo guul daran. Fadlan sug 5 daqiiqo ka hor intaadan mar kale isku dayin.",
        },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "300",
          },
        },
      )
    }

    const rateLimit = checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      console.log(`[v0] Rate limit exceeded for IP: ${clientIP}`)
      return NextResponse.json(
        {
          verified: false,
          message: "Codsiyada badan. Fadlan sug daqiiqad ka hor intaadan mar kale isku dayin.",
        },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "Retry-After": "60",
          },
        },
      )
    }

    const body = await request.json()
    const { student_id, video_id } = body

    console.log(
      `[v0] API VERSION: ${API_VERSION} - Verifying student ID:`,
      student_id,
      "for video:",
      video_id,
      "from IP:",
      clientIP,
    )

    if (!student_id || typeof student_id !== "string") {
      return NextResponse.json(
        { verified: false, message: "Student ID waa loo baahan yahay" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const trimmedStudentId = student_id.trim()

    if (!isValidStudentId(trimmedStudentId)) {
      recordFailedAttempt(clientIP)
      return NextResponse.json(
        { verified: false, message: "Student ID-gu waa mid aan sax ahayn. Fadlan hubi format-ka." },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("[v0] Checking university_students table...")

    // First, try university_students table
    const universityResult = await sql`
      SELECT us.id, us.student_id, us.full_name, us.university_id, us.class_id, us.status,
             c.name as class_name, u.name as university_name,
             'university' as student_type
      FROM university_students us
      LEFT JOIN classes c ON us.class_id = c.id
      LEFT JOIN universities u ON us.university_id = u.id
      WHERE us.student_id = ${trimmedStudentId} AND us.status = 'Active'
      LIMIT 1
    `

    console.log("[v0] University students result:", JSON.stringify(universityResult))

    let result = universityResult

    // If not found in university_students, try gold_students
    if (universityResult.length === 0) {
      console.log("[v0] Not found in university_students, checking gold_students...")

      const goldResult = await sql`
        SELECT id, id::text as student_id, full_name, university, email,
               NULL as university_id, NULL as class_id,
               account_status as status, university as class_name, 
               university as university_name,
               'gold' as student_type
        FROM gold_students
        WHERE (id::text = ${trimmedStudentId} OR email = ${trimmedStudentId})
          AND account_status = 'active'
        LIMIT 1
      `

      console.log("[v0] Gold students result:", JSON.stringify(goldResult))
      result = goldResult
    }

    if (result.length === 0) {
      console.log("[v0] Not found in gold_students, trying students table...")

      try {
        const studentsResult = await sql`
          SELECT id, student_id, full_name, 
                 NULL as university_id, NULL as class_id,
                 'active' as status, 'Student' as class_name, 
                 'Markano' as university_name,
                 'regular' as student_type
          FROM students
          WHERE student_id = ${trimmedStudentId}
          LIMIT 1
        `
        console.log("[v0] Students table result:", JSON.stringify(studentsResult))
        if (studentsResult.length > 0) {
          result = studentsResult
        }
      } catch (e) {
        console.log("[v0] Students table not found or error:", e)
      }
    }

    console.log("[v0] Final result:", JSON.stringify(result))

    if (result.length > 0) {
      const student = result[0]

      resetFailedAttempts(clientIP)

      // If video_id is provided, check video access for university students
      if (video_id && student.student_type === "university") {
        const videoAccess = await sql`
          SELECT v.id, v.access_type
          FROM videos v
          LEFT JOIN video_class_access vca ON v.id = vca.video_id
          WHERE v.id = ${video_id}
          AND (v.access_type = 'open' OR vca.class_id = ${student.class_id})
          LIMIT 1
        `

        if (videoAccess.length === 0) {
          return NextResponse.json(
            { verified: false, message: "Fasalkaaga ma laha ogolaansho lagu daawado muuqaalkan" },
            { status: 403, headers: { "Content-Type": "application/json" } },
          )
        }
      }

      return NextResponse.json(
        {
          verified: true,
          student: {
            id: student.id,
            student_id: student.student_id,
            full_name: student.full_name,
            university_id: student.university_id,
            class_id: student.class_id,
            class_name: student.class_name || student.university || "Markano Gold",
            university_name: student.university_name || student.university || "Markano",
            student_type: student.student_type,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        },
      )
    } else {
      recordFailedAttempt(clientIP)
      const failedRecord = failedAttemptsStore.get(clientIP)
      const attemptsLeft = MAX_FAILED_ATTEMPTS - (failedRecord?.count || 0)

      console.log(`[v0] Student not found. IP: ${clientIP}, Failed attempts: ${failedRecord?.count || 1}`)

      return NextResponse.json(
        {
          verified: false,
          message:
            attemptsLeft > 0
              ? `Student ID-gan lama helin. Waxaad haysataa ${attemptsLeft} isku day oo haray.`
              : "Student ID-gan lama helin. Fadlan hubi oo mar kale isku day.",
        },
        { status: 404, headers: { "Content-Type": "application/json" } },
      )
    }
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json(
      { verified: false, error: "Waa la waayey in la xaqiijiyo ardayga", message: String(error) },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
