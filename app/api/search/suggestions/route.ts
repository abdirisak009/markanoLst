import { NextResponse } from "next/server"
import postgres from "postgres"
import {
  normalizeQuery,
  resolveQuery,
  fuzzyMatch,
  scoreSuggestion,
  type SearchFilter,
} from "@/lib/search-utils"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

const AI_TOOLS_SUGGESTIONS = [
  { id: "ai-tools", title: "AI Tools", href: "/self-learning?category=ai-tools" },
  { id: "chatgpt", title: "ChatGPT", href: "/self-learning?category=ai-tools&q=ChatGPT" },
  { id: "ai-basics", title: "AI Basics", href: "/self-learning?category=ai-tools" },
]

const TOPICS_SUGGESTIONS = [
  "Excel",
  "React",
  "Node.js",
  "Photoshop",
  "Illustrator",
  "SPSS",
  "Web Development",
  "Programming",
  "Design",
  "Data Analysis",
]

/**
 * GET /api/search/suggestions?q=...&filter=all|courses|ai-tools|community
 * Returns grouped suggestions (courses, aiTools, topics) with typo tolerance.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() || ""
    const filter = (searchParams.get("filter") as SearchFilter) || "all"

    if (q.length < 1) {
      return NextResponse.json({
        courses: [],
        aiTools: [],
        topics: [],
      })
    }

    const normalized = normalizeQuery(q)
    const resolved = resolveQuery(q)
    const escapeLike = (s: string) => s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
    const patternPrefix = escapeLike(normalized) + "%"
    const patternContains = "%" + escapeLike(normalized) + "%"

    const result: {
      courses: Array<{ id: number; title: string; href: string }>
      aiTools: Array<{ id: string; title: string; href: string }>
      topics: Array<{ title: string; href: string }>
    } = {
      courses: [],
      aiTools: [],
      topics: [],
    }

    // Courses from DB — intelligent: xarfaha ka bilowda (prefix) first, then contains
    if (filter === "all" || filter === "courses") {
      const courses = await sql`
        SELECT id, title, slug
        FROM learning_courses
        WHERE is_active = true
          AND (title ILIKE ${patternPrefix} OR title ILIKE ${patternContains})
        ORDER BY CASE WHEN title ILIKE ${patternPrefix} THEN 0 ELSE 1 END, title ASC
        LIMIT 12
      `
      const scored = courses
        .map((c: { id: number; title: string; slug: string }) => ({
          ...c,
          score: scoreSuggestion(q, c.title, "courses"),
        }))
        .filter((c: { score: number }) => c.score > 0)
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
        .slice(0, 10)

      result.courses = scored.map((c: { id: number; title: string }) => ({
        id: c.id,
        title: c.title,
        href: `/learning/courses/${c.id}`,
      }))
    }

    // AI Tools — intelligent: starts with or contains
    if (filter === "all" || filter === "ai-tools") {
      const matched = AI_TOOLS_SUGGESTIONS.filter(
        (t) => {
          const tNorm = normalizeQuery(t.title)
          return tNorm.startsWith(normalized) || tNorm.includes(normalized) ||
            normalized.includes(tNorm) || fuzzyMatch(q, t.title) ||
            normalizeQuery(resolved).includes(tNorm)
        }
      )
      result.aiTools = matched.slice(0, 6)
    }

    // Topics — intelligent: xarfaha ka bilowda first
    if (filter === "all" || filter === "community") {
      const topicMatches = TOPICS_SUGGESTIONS.filter(
        (t) => {
          const tNorm = normalizeQuery(t)
          return tNorm.startsWith(normalized) || tNorm.includes(normalized) ||
            normalized.includes(tNorm) || fuzzyMatch(q, t) ||
            normalizeQuery(resolved) === tNorm
        }
      )
      result.topics = topicMatches.slice(0, 8).map((title) => ({
        title,
        href: `/self-learning?q=${encodeURIComponent(title)}`,
      }))
    }

    if (filter === "community") {
      result.topics.push({
        title: "Community",
        href: "/forum",
      })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error("Search suggestions error:", e)
    return NextResponse.json(
      { courses: [], aiTools: [], topics: [] },
      { status: 200 }
    )
  }
}
