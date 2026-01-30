"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, BookOpen, Sparkles, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { resolveQuery, type SearchFilter } from "@/lib/search-utils"

const SEARCH_PLACEHOLDER = "Maxaad rabtaa inaad barato maanta?"
// Hint text removed per design; kept as empty to avoid ReferenceError if any remnant references it
const SEARCH_HINT = ""

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
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const flatSuggestions = [
    ...suggestions.courses.map((c) => ({ type: "course" as const, ...c })),
    ...suggestions.aiTools.map((t) => ({ type: "ai-tool" as const, ...t })),
    ...suggestions.topics.map((t) => ({ type: "topic" as const, ...t })),
  ]
  const hasSuggestions = flatSuggestions.length > 0

  const fetchSuggestions = useCallback(async (q: string, f: SearchFilter) => {
    if (q.length < 2) {
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
    if (query.length < 2) {
      setSuggestions({ courses: [], aiTools: [], topics: [] })
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query, filter)
      setShowSuggestions(true)
    }, 200)
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
    return q ? `/self-learning?q=${q}` : "/self-learning"
  }, [query, filter])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const url = getSubmitUrl()
      const term = query.trim()
      if (term) {
        trackSearch(term, hasSuggestions ? "popular" : "no_result")
      } else {
        trackSearch("browse", "popular")
      }
      onClose?.()
      setShowSuggestions(false)
      router.push(url)
    },
    [getSubmitUrl, query, hasSuggestions, trackSearch, router, onClose]
  )

  const handleSelectSuggestion = useCallback(
    (href: string) => {
      trackSearch(query.trim(), "popular")
      onClose?.()
      setShowSuggestions(false)
      router.push(href)
    },
    [query, trackSearch, router, onClose]
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
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      <div className={`relative ${isInline ? "flex gap-2 items-stretch" : ""}`}>
        <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2596be]/50 pointer-events-none" />
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
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
          className="pl-9 py-2.5 h-11 bg-white border-[#e8f4f3] text-[#1a1a1a] placeholder:text-[#2596be]/50 rounded-xl text-sm focus:border-[#2596be] focus:ring-[#2596be]/20 w-full"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && query.length >= 2 && (
          <div
            id="search-suggestions"
            ref={listRef}
            role="listbox"
            className="absolute left-0 right-0 top-full mt-1 z-[100] max-h-[min(18rem,60vh)] overflow-y-auto rounded-xl bg-white border border-[#e8f4f3] shadow-xl shadow-[#2596be]/15 py-2"
          >
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-[#2596be]/70">
                Raadinaya...
              </div>
            ) : !hasSuggestions ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Wax walba lama helin. Isku day eray kale.
              </div>
            ) : (
              <>
                {suggestions.courses.length > 0 && (
                  <div className="px-2 pb-1">
                    <p className="text-[10px] font-semibold text-[#2596be]/80 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" />
                      Courses
                    </p>
                    {suggestions.courses.map((c, i) => {
                      const idx = i
                      return (
                        <button
                          key={`course-${c.id}`}
                          type="button"
                          data-index={idx}
                          id={`suggestion-${idx}`}
                          role="option"
                          aria-selected={highlightedIndex === idx}
                          onClick={() => handleSelectSuggestion(c.href)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#1a1a1a] hover:bg-[#2596be]/10 flex items-center gap-2 ${
                            highlightedIndex === idx ? "bg-[#2596be]/10" : ""
                          }`}
                        >
                          {c.title}
                        </button>
                      )
                    })}
                  </div>
                )}
                {suggestions.aiTools.length > 0 && (
                  <div className="px-2 pb-1">
                    <p className="text-[10px] font-semibold text-[#2596be]/80 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      AI Tools
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
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#1a1a1a] hover:bg-[#2596be]/10 flex items-center gap-2 ${
                            highlightedIndex === idx ? "bg-[#2596be]/10" : ""
                          }`}
                        >
                          {t.title}
                        </button>
                      )
                    })}
                  </div>
                )}
                {suggestions.topics.length > 0 && (
                  <div className="px-2 pb-1">
                    <p className="text-[10px] font-semibold text-[#2596be]/80 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                      <MessageCircle className="h-3 w-3" />
                      Topics
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
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#1a1a1a] hover:bg-[#2596be]/10 flex items-center gap-2 ${
                            highlightedIndex === idx ? "bg-[#2596be]/10" : ""
                          }`}
                        >
                          {t.title}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        </div>

        <Button
          type="submit"
          className={isInline ? "flex-shrink-0 h-11 px-5 rounded-xl bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-bold shadow-lg shadow-[#2596be]/30" : "w-full h-11 rounded-xl bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-bold shadow-lg shadow-[#2596be]/30"}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

    </form>
  )
}
