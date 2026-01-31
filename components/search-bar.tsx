"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, BookOpen, Sparkles, MessageCircle, Laptop, Smartphone, Camera, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { resolveQuery, type SearchFilter } from "@/lib/search-utils"

const SEARCH_PLACEHOLDER = "What are you looking for?"
const DEFAULT_RECOMMENDATIONS = [
  "Excel", "React", "Node.js", "Laptop", "Smartphones", "AI Tools",
  "Photoshop", "Web Development", "Design", "SPSS", "Programming",
]
const SEARCH_PHRASES = [
  "Excel", "React", "Node.js", "Laptop", "Smartphones", "AI Tools",
  "Photoshop", "Web Development", "Design", "SPSS", "Programming", "Data Analysis",
  "watch", "watch for men", "watch for women", "washing machine", "water bottle",
  "wallet", "wall panel", "wardrobe closet", "Web Design", "Excel course", "React course",
  "Illustrator", "Node.js course", "Photoshop course", "SPSS course", "AI course",
]

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const re = new RegExp(`(${escapeRegExp(query.trim())})`, "gi")
  const parts = text.split(re)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold text-[#2596be]">{part}</span>
    ) : (
      part
    )
  )
}

const FILTER_OPTIONS: { value: SearchFilter; label: string; icon: typeof BookOpen }[] = [
  { value: "all", label: "All", icon: Search },
  { value: "ai-tools", label: "AI Tools", icon: Sparkles },
  { value: "courses", label: "Courses", icon: BookOpen },
  { value: "laptop", label: "Laptop", icon: Laptop },
  { value: "smartphones", label: "Smartphones", icon: Smartphone },
]

type SuggestionCourse = { id: number; title: string; href: string }
type SuggestionAiTool = { id: string; title: string; href: string }
type SuggestionTopic = { title: string; href: string }

interface SearchBarProps {
  /** Inline mode: show filters + input + button in one row (desktop). Compact: just input + dropdown (mobile). */
  variant?: "inline" | "compact" | "dropdown"
  /** When variant=dropdown, the panel is inside a popover. */
  onClose?: () => void
  className?: string
}

export function SearchBar({
  variant = "inline",
  onClose,
  className = "",
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<SearchFilter>("all")
  const [suggestions, setSuggestions] = useState<{
    courses: SuggestionCourse[]
    aiTools: SuggestionAiTool[]
    topics: SuggestionTopic[]
  }>({ courses: [], aiTools: [], topics: [] })
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [recommendedList, setRecommendedList] = useState<string[]>(DEFAULT_RECOMMENDATIONS)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const loadRecommended = useCallback(() => {
    if (typeof localStorage === "undefined") return DEFAULT_RECOMMENDATIONS
    const raw = localStorage.getItem("markano_search_popular")
    const arr: string[] = raw ? JSON.parse(raw) : []
    return arr.length > 0 ? [...arr, ...DEFAULT_RECOMMENDATIONS].slice(0, 12) : DEFAULT_RECOMMENDATIONS
  }, [])

  const loadRecentSearches = useCallback(() => {
    if (typeof localStorage === "undefined") return []
    const raw = localStorage.getItem("markano_search_popular")
    const arr: string[] = raw ? JSON.parse(raw) : []
    return arr.slice(0, 8)
  }, [])

  const refreshRecommended = useCallback(() => {
    const list = loadRecommended()
    setRecommendedList([...list].sort(() => Math.random() - 0.5))
  }, [loadRecommended])

  useEffect(() => {
    setRecommendedList(loadRecommended())
  }, [loadRecommended])

  useEffect(() => {
    if (showDropdown) setRecentSearches(loadRecentSearches())
  }, [showDropdown, loadRecentSearches])

  const flatSuggestions = [
    ...suggestions.courses.map((c) => ({ type: "course" as const, ...c })),
    ...suggestions.aiTools.map((t) => ({ type: "ai-tool" as const, ...t })),
    ...suggestions.topics.map((t) => ({ type: "topic" as const, ...t })),
  ]
  const hasSuggestions = flatSuggestions.length > 0

  const fetchSuggestions = useCallback(async (q: string, f: SearchFilter) => {
    if (q.length < 1) {
      setSuggestions({ courses: [], aiTools: [], topics: [] })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(q)}&filter=${f}`
      )
      const data = await res.json()
      setSuggestions({
        courses: data.courses || [],
        aiTools: data.aiTools || [],
        topics: data.topics || [],
      })
      setHighlightedIndex(-1)
    } catch {
      setSuggestions({ courses: [], aiTools: [], topics: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 1) {
      setSuggestions({ courses: [], aiTools: [], topics: [] })
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query, filter)
      setShowSuggestions(true)
    }, 120)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, filter, fetchSuggestions])

  const trackSearch = useCallback(async (term: string, type: "popular" | "no_result") => {
    try {
      await fetch("/api/search/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, term: term.slice(0, 200) }),
      })
    } catch {}
    if (typeof localStorage !== "undefined") {
      const key = "markano_search_popular"
      const raw = localStorage.getItem(key)
      const arr: string[] = raw ? JSON.parse(raw) : []
      const normalized = term.trim().toLowerCase()
      if (normalized && !arr.includes(normalized)) {
        arr.unshift(normalized)
        localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)))
      }
    }
  }, [])

  const getSubmitUrl = useCallback(() => {
    const resolved = query.trim() ? resolveQuery(query.trim()) : ""
    const q = (query.trim() || resolved) ? encodeURIComponent(query.trim() || resolved) : ""
    if (filter === "community") {
      return q ? `/forum?q=${q}` : "/forum"
    }
    if (filter === "ai-tools") {
      return q ? `/self-learning?category=ai-tools&q=${q}` : "/self-learning?category=ai-tools"
    }
    if (filter === "courses") {
      return q ? `/self-learning?q=${q}` : "/self-learning"
    }
    if (filter === "laptop") {
      return q ? `/store?category=laptop&q=${q}` : "/store?category=laptop"
    }
    if (filter === "smartphones") {
      return q ? `/store?category=smartphones&q=${q}` : "/store?category=smartphones"
    }
    return q ? `/self-learning?q=${q}` : "/self-learning"
  }, [query, filter])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const url = getSubmitUrl()
      const term = query.trim()
      if (term) {
        trackSearch(term, hasSuggestions ? "popular" : "no_result")
        setRecentSearches(loadRecentSearches())
      } else {
        trackSearch("browse", "popular")
      }
      onClose?.()
      setShowSuggestions(false)
      router.push(url)
    },
    [getSubmitUrl, query, hasSuggestions, trackSearch, router, onClose, loadRecentSearches]
  )

  const handleSelectSuggestion = useCallback(
    (href: string) => {
      const term = query.trim()
      if (term) {
        trackSearch(term, "popular")
        setRecentSearches(loadRecentSearches())
      }
      onClose?.()
      setShowSuggestions(false)
      router.push(href)
    },
    [query, trackSearch, router, onClose, loadRecentSearches]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || !hasSuggestions) {
      if (e.key === "Enter") handleSubmit()
      return
    }
    if (e.key === "Escape") {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
      inputRef.current?.blur()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((i) => (i < flatSuggestions.length - 1 ? i + 1 : 0))
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((i) => (i <= 0 ? flatSuggestions.length - 1 : i - 1))
      return
    }
    if (e.key === "Enter" && highlightedIndex >= 0 && flatSuggestions[highlightedIndex]) {
      e.preventDefault()
      const item = flatSuggestions[highlightedIndex]
      const href = "href" in item ? item.href : getSubmitUrl()
      handleSelectSuggestion(href)
      return
    }
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`)
      el?.scrollIntoView({ block: "nearest" })
    }
  }, [highlightedIndex])

  const isDropdown = variant === "dropdown"
  const isCompact = variant === "compact"
  const isInline = variant === "inline"

  return (
    <form onSubmit={handleSubmit} className={`space-y-0 ${className}`}>
      {/* Single bar: Input (placeholder + camera icon inside) | Orange Search button */}
      <div className={`relative ${(isInline || isDropdown) ? "flex gap-0 items-stretch rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] shadow-sm" : ""}`}>
        <div className="relative flex-1 min-w-0 flex items-center">
        <Input
          ref={inputRef}
          type="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions && hasSuggestions}
          aria-controls="search-suggestions"
          aria-activedescendant={
            highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
          }
          placeholder={SEARCH_PLACEHOLDER}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setShowDropdown(true)
            if (query.length >= 1) setShowSuggestions(true)
          }}
          onBlur={() => setTimeout(() => {
            setShowDropdown(false)
            setShowSuggestions(false)
          }, 200)}
          className="pl-4 sm:pl-5 pr-12 py-2.5 h-11 sm:h-12 bg-transparent border-0 text-[#1a1a1a] placeholder:text-[#6b7280] rounded-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
        />
        {/* Camera icon inside input (right side) */}
        {(isInline || isDropdown) && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#374151] hover:bg-[#e5e7eb] hover:text-[#111827] transition-colors"
            aria-label="Image Search"
          >
            <Camera className="h-5 w-5" />
          </button>
        )}
        </div>

        {/* Alibaba-style overlay: Recent (xasuuso) + Recommended + filters + live suggestions */}
        {showDropdown && (isInline || isDropdown) && (
          <div
            id="search-suggestions"
            ref={listRef}
            className="absolute left-0 right-0 top-full mt-1 z-[100] max-h-[min(22rem,65vh)] overflow-y-auto rounded-xl bg-white border border-[#e8f4f3] shadow-xl shadow-[#2596be]/15 py-4"
            onMouseDown={(e) => e.preventDefault()}
          >
            {/* Recent searches — xasuuso: waxa qofka raadiyay */}
            {recentSearches.length > 0 && (
              <div className="px-4 pb-3 border-b border-[#f1f5f9]">
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Recent searches</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term)
                        inputRef.current?.focus()
                        fetchSuggestions(term, filter)
                        setShowSuggestions(true)
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#475569] bg-[#f1f5f9] hover:bg-[#2596be]/10 hover:text-[#2596be] border border-[#e2e8f0] hover:border-[#2596be]/30 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Recommended for you + Refresh */}
            <div className="px-4 pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-semibold text-[#1a1a1a]">Recommended for you</span>
                <button
                  type="button"
                  onClick={refreshRecommended}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2596be] hover:text-[#1e7a9e] transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendedList.slice(0, 8).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term)
                      inputRef.current?.focus()
                      if (term.length >= 1) {
                        fetchSuggestions(term, filter)
                        setShowSuggestions(true)
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#475569] bg-[#f8fafc] hover:bg-[#2596be]/10 hover:text-[#2596be] border border-[#e2e8f0] hover:border-[#2596be]/30 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            {/* Search in: filters */}
            <div className="px-4 py-3 border-b border-[#f1f5f9]">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Search in</p>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isActive = filter === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFilter(opt.value)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive ? "bg-[#2596be] text-white" : "bg-[#f1f5f9] text-[#475569] hover:bg-[#2596be]/10 hover:text-[#2596be]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Live suggestions — intelligent: xasuusi / fududeeyo products & courses, highlight query */}
            {query.length >= 1 && (
              <div className="px-2 pt-2">
                {loading ? (
                  <div className="px-4 py-4 text-center text-sm text-[#2596be]/70">Searching...</div>
                ) : (() => {
                  const qNorm = query.trim().toLowerCase()
                  const combined = [...new Set([...recommendedList, ...SEARCH_PHRASES])]
                  const matchingPhrases = combined.filter(
                    (t) => t.toLowerCase().startsWith(qNorm) || t.toLowerCase().includes(qNorm)
                  ).slice(0, 10)
                  const showNoResults = matchingPhrases.length === 0 && !hasSuggestions
                  return (
                  <>
                    {showNoResults && (
                      <div className="px-4 py-4 text-center text-sm text-gray-500">No results. Try another term.</div>
                    )}
                    {matchingPhrases.length > 0 && (
                      <div className="pb-2 border-b border-[#f1f5f9] mb-2">
                        <p className="text-[10px] font-semibold text-[#2596be]/80 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                          Matching — products & courses
                        </p>
                        <p className="text-[11px] text-[#64748b] px-2 pb-2">Erey hadaa qoro waa kuu xasuusinayaa (courses & products)</p>
                        {matchingPhrases.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setQuery(term)
                              inputRef.current?.focus()
                              fetchSuggestions(term, filter)
                              setShowSuggestions(true)
                            }}
                            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#1a1a1a] hover:bg-[#2596be]/10 flex items-center gap-2"
                          >
                            {highlightMatch(term, query)}
                          </button>
                        ))}
                      </div>
                    )}
                    {hasSuggestions && (
                      <>
                        {suggestions.courses.length > 0 && (
                          <div className="pb-1">
                            <p className="text-[10px] font-semibold text-[#2596be]/80 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                              <BookOpen className="h-3 w-3" /> Courses
                            </p>
                            {suggestions.courses.map((c, i) => (
                              <button
                                key={`course-${c.id}`}
                                type="button"
                                data-index={i}
                                id={`suggestion-${i}`}
                                role="option"
                                aria-selected={highlightedIndex === i}
                                onClick={() => handleSelectSuggestion(c.href)}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#1a1a1a] hover:bg-[#2596be]/10 ${highlightedIndex === i ? "bg-[#2596be]/10" : ""}`}
                              >
                                {highlightMatch(c.title, query)}
                              </button>
                            ))}
                          </div>
                        )}
                        {suggestions.aiTools.length > 0 && (
                          <div className="pb-1">
                            <p className="text-[10px] font-semibold text-[#2596be]/80 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3" /> AI Tools
                            </p>
                            {suggestions.aiTools.map((t, i) => {
                              const idx = suggestions.courses.length + i
                              return (
                                <button
                                  key={`ai-${t.id}`}
                                  type="button"
                                  data-index={idx}
                                  id={`suggestion-${idx}`}
                                  role="option"
                                  aria-selected={highlightedIndex === idx}
                                  onClick={() => handleSelectSuggestion(t.href)}
                                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#1a1a1a] hover:bg-[#2596be]/10 ${highlightedIndex === idx ? "bg-[#2596be]/10" : ""}`}
                                >
                                  {highlightMatch(t.title, query)}
                                </button>
                              )
                            })}
                          </div>
                        )}
                        {suggestions.topics.length > 0 && (
                          <div className="pb-1">
                            <p className="text-[10px] font-semibold text-[#2596be]/80 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                              <MessageCircle className="h-3 w-3" /> Topics
                            </p>
                            {suggestions.topics.map((t, i) => {
                              const idx = suggestions.courses.length + suggestions.aiTools.length + i
                              return (
                                <button
                                  key={`topic-${t.title}-${i}`}
                                  type="button"
                                  data-index={idx}
                                  id={`suggestion-${idx}`}
                                  role="option"
                                  aria-selected={highlightedIndex === idx}
                                  onClick={() => handleSelectSuggestion(t.href)}
                                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#1a1a1a] hover:bg-[#2596be]/10 ${highlightedIndex === idx ? "bg-[#2596be]/10" : ""}`}
                                >
                                  {highlightMatch(t.title, query)}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          className={isInline ? "flex-shrink-0 h-11 sm:h-12 px-5 sm:px-6 rounded-none rounded-r-xl bg-[#3c62b3] hover:bg-[#2d4d8a] text-white font-bold shadow-none border-0" : "w-full h-11 rounded-xl bg-[#3c62b3] hover:bg-[#2d4d8a] text-white font-bold"}
        >
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>

    </form>
  )
}
