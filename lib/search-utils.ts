/**
 * Search utilities: typo tolerance, semantic mappings, and suggestion data.
 */

export type SearchFilter = "all" | "courses" | "ai-tools" | "community" | "laptop" | "smartphones"

/** Semantic / typo mappings: user input → canonical search terms or direct matches */
export const SEMANTIC_MAP: Record<string, string[]> = {
  excell: ["Excel"],
  exel: ["Excel"],
  exell: ["Excel"],
  design: ["Photoshop", "Illustrator"],
  photoshop: ["Photoshop"],
  illustrator: ["Illustrator"],
  react: ["React"],
  reactjs: ["React"],
  node: ["Node.js"],
  nodejs: ["Node.js"],
  ai: ["AI Tools", "ChatGPT", "AI"],
  "ai tools": ["AI Tools"],
  spss: ["SPSS"],
  excel: ["Excel"],
  community: ["Community", "Forum"],
  forum: ["Forum", "Community"],
  laptop: ["Laptop", "Laptops"],
  laptops: ["Laptop"],
  smartphone: ["Smartphone", "Smartphones"],
  smartphones: ["Smartphones"],
  phone: ["Smartphone", "Smartphones"],
}

/** Popular skills/topics for suggestions (prioritized) */
export const POPULAR_TOPICS = [
  "Excel",
  "React",
  "Node.js",
  "Photoshop",
  "Illustrator",
  "AI Tools",
  "SPSS",
  "Web Development",
  "Programming",
  "Design",
  "Data Analysis",
]

/** Normalize query: lowercase, trim, collapse spaces */
export function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

/**
 * Apply typo tolerance and semantic mapping.
 * Returns the best canonical term(s) to use for matching, or the original if no mapping.
 */
export function resolveQuery(query: string): string {
  const n = normalizeQuery(query)
  if (!n) return query
  const mapped = SEMANTIC_MAP[n]
  if (mapped && mapped[0]) return mapped[0]
  return query
}

/**
 * Simple Levenshtein-like distance for typo tolerance (max 2 edits).
 * Returns true if a matches b with small typos.
 */
export function fuzzyMatch(a: string, b: string, maxEdits = 2): boolean {
  const x = normalizeQuery(a)
  const y = normalizeQuery(b)
  if (x === y) return true
  if (x.includes(y) || y.includes(x)) return true
  const len = Math.max(x.length, y.length)
  if (len <= 2) return x === y
  let edits = 0
  let i = 0
  let j = 0
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) {
      i++
      j++
      continue
    }
    edits++
    if (edits > maxEdits) return false
    if (x.length < y.length) j++
    else if (x.length > y.length) i++
    else {
      i++
      j++
    }
  }
  edits += x.length - i + (y.length - j)
  return edits <= maxEdits
}

/**
 * Score a suggestion against the query (for sorting).
 * Higher = better match.
 */
export function scoreSuggestion(
  query: string,
  suggestionTitle: string,
  category: string
): number {
  const q = normalizeQuery(query)
  const t = normalizeQuery(suggestionTitle)
  if (!q) return 0
  if (t.startsWith(q)) return 100
  if (t.includes(q)) return 80
  const resolved = resolveQuery(q)
  if (normalizeQuery(resolved) === t) return 90
  if (t.includes(normalizeQuery(resolved))) return 70
  if (fuzzyMatch(q, t)) return 60
  return 0
}
