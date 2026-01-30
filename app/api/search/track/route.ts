import { NextResponse } from "next/server"

const STORAGE_KEY = "markano_search_analytics"

export type TrackType = "popular" | "no_result"

/**
 * POST /api/search/track
 * Body: { type: "popular" | "no_result", term: string }
 * Tracks popular search terms and no-result searches for content optimization.
 * Stores in memory (or could persist to DB). For now we just acknowledge.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { type, term } = body as { type?: TrackType; term?: string }

    if (!term || typeof term !== "string") {
      return NextResponse.json({ ok: false, error: "Missing term" }, { status: 400 })
    }

    const t = type === "no_result" ? "no_result" : "popular"
    const normalized = term.trim().toLowerCase().slice(0, 200)

    // Client can also store in localStorage; server could log or write to DB
    if (process.env.NODE_ENV === "development") {
      console.log(`[Search track] ${t}: "${normalized}"`)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Search track error:", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
