"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useParams } from "next/navigation"
import {
  Code2,
  Clock,
  CheckCircle2,
  Loader2,
  FileCode,
  Palette,
  Play,
  Maximize2,
  Minimize2,
  AlertCircle,
  Users,
  Eye,
  PanelLeftClose,
  PanelRightClose,
  Columns2,
  Lock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import JellyfishCodeEditor from "@/components/live-coding/code-editor"

// Helper function for debounced saving
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout | null
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

const HTML_TAGS = [
  { tag: "div", snippet: "<div></div>", description: "Container element" },
  { tag: "span", snippet: "<span></span>", description: "Inline container" },
  { tag: "h1", snippet: "<h1></h1>", description: "Heading level 1" },
  { tag: "h2", snippet: "<h2></h2>", description: "Heading level 2" },
  { tag: "h3", snippet: "<h3></h3>", description: "Heading level 3" },
  { tag: "h4", snippet: "<h4></h4>", description: "Heading level 4" },
  { tag: "h5", snippet: "<h5></h5>", description: "Heading level 5" },
  { tag: "h6", snippet: "<h6></h6>", description: "Heading level 6" },
  { tag: "p", snippet: "<p></p>", description: "Paragraph" },
  { tag: "a", snippet: '<a href=""></a>', description: "Anchor link" },
  { tag: "img", snippet: '<img src="/placeholder.svg" alt="" />', description: "Image" },
  { tag: "ul", snippet: "<ul>\n  <li></li>\n</ul>", description: "Unordered list" },
  { tag: "ol", snippet: "<ol>\n  <li></li>\n</ol>", description: "Ordered list" },
  { tag: "li", snippet: "<li></li>", description: "List item" },
  { tag: "table", snippet: "<table>\n  <tr>\n    <td></td>\n  </tr>\n</table>", description: "Table" },
  { tag: "tr", snippet: "<tr></tr>", description: "Table row" },
  { tag: "td", snippet: "<td></td>", description: "Table cell" },
  { tag: "th", snippet: "<th></th>", description: "Table header" },
  { tag: "form", snippet: "<form>\n  \n</form>", description: "Form element" },
  { tag: "input", snippet: '<input type="text" />', description: "Input field" },
  { tag: "button", snippet: "<button></button>", description: "Button" },
  { tag: "textarea", snippet: "<textarea></textarea>", description: "Text area" },
  { tag: "select", snippet: "<select>\n  <option></option>\n</select>", description: "Dropdown" },
  { tag: "option", snippet: "<option></option>", description: "Select option" },
  { tag: "label", snippet: '<label for=""></label>', description: "Form label" },
  { tag: "header", snippet: "<header></header>", description: "Header section" },
  { tag: "footer", snippet: "<footer></footer>", description: "Footer section" },
  { tag: "nav", snippet: "<nav></nav>", description: "Navigation" },
  { tag: "main", snippet: "<main></main>", description: "Main content" },
  { tag: "section", snippet: "<section></section>", description: "Section" },
  { tag: "article", snippet: "<article></article>", description: "Article" },
  { tag: "aside", snippet: "<aside></aside>", description: "Sidebar" },
  { tag: "video", snippet: '<video src="" controls></video>', description: "Video player" },
  { tag: "audio", snippet: '<audio src="" controls></audio>', description: "Audio player" },
  { tag: "canvas", snippet: "<canvas></canvas>", description: "Canvas" },
  { tag: "iframe", snippet: '<iframe src=""></iframe>', description: "Inline frame" },
  { tag: "br", snippet: "<br />", description: "Line break" },
  { tag: "hr", snippet: "<hr />", description: "Horizontal rule" },
  { tag: "strong", snippet: "<strong></strong>", description: "Bold text" },
  { tag: "em", snippet: "<em></em>", description: "Italic text" },
  { tag: "code", snippet: "<code></code>", description: "Code text" },
  { tag: "pre", snippet: "<pre></pre>", description: "Preformatted text" },
  { tag: "blockquote", snippet: "<blockquote></blockquote>", description: "Block quote" },
]

const CSS_PROPERTIES = [
  { property: "color", snippet: "color: ;", description: "Text color" },
  { property: "background-color", snippet: "background-color: ;", description: "Background color" },
  { property: "background", snippet: "background: ;", description: "Background shorthand" },
  { property: "background-image", snippet: "background-image: url();", description: "Background image" },
  { property: "font-size", snippet: "font-size: px;", description: "Font size" },
  { property: "font-family", snippet: "font-family: ;", description: "Font family" },
  { property: "font-weight", snippet: "font-weight: ;", description: "Font weight" },
  { property: "font-style", snippet: "font-style: ;", description: "Font style" },
  { property: "text-align", snippet: "text-align: ;", description: "Text alignment" },
  { property: "text-decoration", snippet: "text-decoration: ;", description: "Text decoration" },
  { property: "text-transform", snippet: "text-transform: ;", description: "Text transform" },
  { property: "line-height", snippet: "line-height: ;", description: "Line height" },
  { property: "letter-spacing", snippet: "letter-spacing: ;", description: "Letter spacing" },
  { property: "margin", snippet: "margin: ;", description: "Margin shorthand" },
  { property: "margin-top", snippet: "margin-top: ;", description: "Top margin" },
  { property: "margin-right", snippet: "margin-right: ;", description: "Right margin" },
  { property: "margin-bottom", snippet: "margin-bottom: ;", description: "Bottom margin" },
  { property: "margin-left", snippet: "margin-left: ;", description: "Left margin" },
  { property: "padding", snippet: "padding: ;", description: "Padding shorthand" },
  { property: "padding-top", snippet: "padding-top: ;", description: "Top padding" },
  { property: "padding-right", snippet: "padding-right: ;", description: "Right padding" },
  { property: "padding-bottom", snippet: "padding-bottom: ;", description: "Bottom padding" },
  { property: "padding-left", snippet: "padding-left: ;", description: "Left padding" },
  { property: "width", snippet: "width: ;", description: "Element width" },
  { property: "height", snippet: "height: ;", description: "Element height" },
  { property: "max-width", snippet: "max-width: ;", description: "Maximum width" },
  { property: "max-height", snippet: "max-height: ;", description: "Maximum height" },
  { property: "min-width", snippet: "min-width: ;", description: "Minimum width" },
  { property: "min-height", snippet: "min-height: ;", description: "Minimum height" },
  { property: "border", snippet: "border: 1px solid ;", description: "Border shorthand" },
  { property: "border-radius", snippet: "border-radius: ;", description: "Border radius" },
  { property: "border-color", snippet: "border-color: ;", description: "Border color" },
  { property: "border-width", snippet: "border-width: ;", description: "Border width" },
  { property: "border-style", snippet: "border-style: ;", description: "Border style" },
  { property: "box-shadow", snippet: "box-shadow: 0 0 10px ;", description: "Box shadow" },
  { property: "display", snippet: "display: ;", description: "Display type" },
  { property: "position", snippet: "position: ;", description: "Position type" },
  { property: "top", snippet: "top: ;", description: "Top position" },
  { property: "right", snippet: "right: ;", description: "Right position" },
  { property: "bottom", snippet: "bottom: ;", description: "Bottom position" },
  { property: "left", snippet: "left: ;", description: "Left position" },
  { property: "z-index", snippet: "z-index: ;", description: "Stack order" },
  { property: "flex", snippet: "flex: ;", description: "Flex shorthand" },
  { property: "flex-direction", snippet: "flex-direction: ;", description: "Flex direction" },
  { property: "flex-wrap", snippet: "flex-wrap: ;", description: "Flex wrap" },
  { property: "justify-content", snippet: "justify-content: ;", description: "Justify content" },
  { property: "align-items", snippet: "align-items: ;", description: "Align items" },
  { property: "align-content", snippet: "align-content: ;", description: "Align content" },
  { property: "gap", snippet: "gap: ;", description: "Flex/Grid gap" },
  { property: "grid", snippet: "grid: ;", description: "Grid shorthand" },
  { property: "grid-template-columns", snippet: "grid-template-columns: ;", description: "Grid columns" },
  { property: "grid-template-rows", snippet: "grid-template-rows: ;", description: "Grid rows" },
  { property: "overflow", snippet: "overflow: ;", description: "Overflow behavior" },
  { property: "opacity", snippet: "opacity: ;", description: "Opacity level" },
  { property: "cursor", snippet: "cursor: ;", description: "Cursor style" },
  { property: "transition", snippet: "transition: all 0.3s ease;", description: "Transition effect" },
  { property: "transform", snippet: "transform: ;", description: "Transform" },
  { property: "animation", snippet: "animation: ;", description: "Animation" },
  { property: "filter", snippet: "filter: ;", description: "Filter effects" },
  { property: "visibility", snippet: "visibility: ;", description: "Visibility" },
  { property: "float", snippet: "float: ;", description: "Float direction" },
  { property: "clear", snippet: "clear: ;", description: "Clear float" },
]

const CSS_VALUES = [
  { value: "flex", snippet: "flex", description: "Flexbox display" },
  { value: "grid", snippet: "grid", description: "Grid display" },
  { value: "block", snippet: "block", description: "Block display" },
  { value: "inline", snippet: "inline", description: "Inline display" },
  { value: "inline-block", snippet: "inline-block", description: "Inline-block" },
  { value: "none", snippet: "none", description: "Hide element" },
  { value: "center", snippet: "center", description: "Center alignment" },
  { value: "left", snippet: "left", description: "Left alignment" },
  { value: "right", snippet: "right", description: "Right alignment" },
  { value: "space-between", snippet: "space-between", description: "Space between" },
  { value: "space-around", snippet: "space-around", description: "Space around" },
  { value: "column", snippet: "column", description: "Column direction" },
  { value: "row", snippet: "row", description: "Row direction" },
  { value: "wrap", snippet: "wrap", description: "Flex wrap" },
  { value: "nowrap", snippet: "nowrap", description: "No wrap" },
  { value: "absolute", snippet: "absolute", description: "Absolute position" },
  { value: "relative", snippet: "relative", description: "Relative position" },
  { value: "fixed", snippet: "fixed", description: "Fixed position" },
  { value: "sticky", snippet: "sticky", description: "Sticky position" },
  { value: "hidden", snippet: "hidden", description: "Hide overflow" },
  { value: "auto", snippet: "auto", description: "Auto value" },
  { value: "pointer", snippet: "pointer", description: "Pointer cursor" },
  { value: "bold", snippet: "bold", description: "Bold weight" },
  { value: "normal", snippet: "normal", description: "Normal value" },
  { value: "italic", snippet: "italic", description: "Italic style" },
  { value: "underline", snippet: "underline", description: "Underline text" },
  { value: "uppercase", snippet: "uppercase", description: "Uppercase text" },
  { value: "lowercase", snippet: "lowercase", description: "Lowercase text" },
  { value: "transparent", snippet: "transparent", description: "Transparent" },
  { value: "inherit", snippet: "inherit", description: "Inherit from parent" },
]

// The useParams hook can directly return the params, no need for a promise wrapper
// export default function LiveCodingChallengePage({ params }: { params: Promise<{ accessCode: string }> }) {
export default function LiveCodingChallengePage() {
  // Renamed from LiveCodingPage
  const params = useParams() // Use useParams hook
  const accessCode = params.accessCode as string // Type assertion

  const [challenge, setChallenge] = useState<any>(null)
  const [participant, setParticipant] = useState<any>(null)
  const [teams, setTeams] = useState<any[]>([])
  const [teamsLoading, setTeamsLoading] = useState(true) // Add teams loading state
  const [htmlCode, setHtmlCode] = useState("")
  const [cssCode, setCssCode] = useState("")
  const [activeTab, setActiveTab] = useState<"html" | "css">("html")
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null) // Changed to null initially
  const [timeExpired, setTimeExpired] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [joining, setJoining] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null) // Track selected team

  const [refreshingTeams, setRefreshingTeams] = useState(false)

  const [focusViolations, setFocusViolations] = useState(0)
  const [isDisqualified, setIsDisqualified] = useState(false)
  const MAX_VIOLATIONS = 3
  const EDITOR_LOCK_VIOLATIONS = 2

  const [showFocusWarning, setShowFocusWarning] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [isEditorLocked, setIsEditorLocked] = useState(false)

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })
  const [currentWord, setCurrentWord] = useState("")

  // Renamed from panelView to panelLayout for clarity
  const [panelLayout, setPanelLayout] = useState<"split" | "editor" | "preview">("split")

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (html: string, css: string) => {
      if (!participant || !challenge || challenge.status !== "active" || isDisqualified) {
        return
      }

      setIsSaving(true)
      setLastSaved(null) // Clear last saved timestamp
      try {
        const res = await fetch("/api/live-coding/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId: participant.id,
            htmlCode: html,
            cssCode: css,
            isFinal: false, // Not a final submission yet
          }),
        })

        if (res.ok) {
          setLastSaved(new Date())
        } else {
          const data = await res.json()
          setError(data.error || "Failed to save code")
        }
      } catch (err) {
        setError("Failed to save code")
      } finally {
        setIsSaving(false)
        // Automatically clear the 'Saving...' state after a short delay if not an error
        if (!error) {
          setTimeout(() => {
            setLastSaved(new Date()) // Show 'Saved' after a short delay
          }, 1000)
        }
      }
    }, 2000), // Debounce delay of 2 seconds
    [participant, challenge, isDisqualified, error], // Dependencies for debouncedSave
  )

  // Fetch challenge data
  const fetchChallenge = useCallback(async () => {
    try {
      console.log("[v0] Fetching challenge with accessCode:", accessCode)
      console.log("[v0] Full URL:", `/api/live-coding/join/${accessCode}`)

      const res = await fetch(`/api/live-coding/join/${accessCode}`)
      console.log("[v0] Response status:", res.status)
      console.log("[v0] Response ok:", res.ok)
      console.log("[v0] Response headers:", Object.fromEntries(res.headers.entries()))

      const text = await res.text()
      console.log("[v0] Raw response text:", text)

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.log("[v0] JSON parse error:", parseError)
        setError("Invalid response from server")
        setLoading(false)
        setTeamsLoading(false)
        return
      }

      console.log("[v0] fetchChallenge parsed data:", data)

      if (!res.ok) {
        console.log("[v0] Error response:", data.error)
        setError(data.error || "Challenge not found")
        setLoading(false)
        setTeamsLoading(false)
        return
      }

      setChallenge(data.challenge)

      if (data.teams) {
        console.log("[v0] Setting teams:", data.teams)
        setTeams(data.teams)
      } else if (!data.joined) {
        console.log("[v0] No teams in response, fetching separately")
        setTeams([])
      }

      setTeamsLoading(false)

      if (data.joined && data.participant) {
        setParticipant(data.participant)
        setHtmlCode(data.submission?.html_code || "")
        setCssCode(data.submission?.css_code || "")
        setIsEditorLocked(data.participant.focus_violations >= EDITOR_LOCK_VIOLATIONS)
      } else {
        setParticipant(null)
      }

      setLoading(false)
    } catch (err) {
      console.log("[v0] Fetch error:", err)
      setError("Failed to load challenge")
      setLoading(false)
      setTeamsLoading(false)
    }
  }, [accessCode])

  useEffect(() => {
    fetchChallenge()
  }, [fetchChallenge])

  // Timer countdown - Fixed NaN issue
  useEffect(() => {
    if (!challenge || challenge.status !== "active") return

    const endTime = challenge.end_time ? new Date(challenge.end_time).getTime() : null

    if (!endTime || isNaN(endTime)) {
      setTimeRemaining(challenge.duration_minutes ? challenge.duration_minutes * 60 : 0)
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
      setTimeRemaining(remaining)

      if (remaining === 0 && !timeExpired) {
        setTimeExpired(true)
        setPanelLayout("preview") // Auto-switch to preview only
        // Auto-save final code
        // Ensure participant and challenge are available before attempting to save
        const hasJoined = !!participant // Check if participant is defined
        const participantId = participant?.id // Get participant ID if available

        if (hasJoined && participantId) {
          fetch("/api/live-coding/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participantId,
              htmlCode,
              cssCode,
              isFinal: true, // Mark as final submission
            }),
          })
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [challenge, timeExpired, setPanelLayout, participant, htmlCode, cssCode]) // Added dependencies

  // Activity tracking
  useEffect(() => {
    if (!participant || !challenge) return

    const trackActivity = async () => {
      try {
        await fetch("/api/live-coding/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId: participant.id,
            challengeId: challenge.id,
          }),
        })
      } catch (err) {
        console.error("Failed to track activity:", err)
      }
    }

    trackActivity()
    const interval = setInterval(trackActivity, 30000)

    return () => clearInterval(interval)
  }, [participant, challenge])

  useEffect(() => {
    // Lock editor at 2 violations
    if (focusViolations >= EDITOR_LOCK_VIOLATIONS && !isEditorLocked) {
      setIsEditorLocked(true)
      // Auto switch to preview mode when editor is locked
      setPanelLayout("preview")
    }

    // Full disqualification at 3 violations
    if (focusViolations >= MAX_VIOLATIONS && !isDisqualified) {
      setIsDisqualified(true)
      setShowFocusWarning(false)

      // Save disqualification to server
      if (participant?.id) {
        fetch("/api/live-coding/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId: participant.id,
            action: "disqualified",
            focusViolations: focusViolations,
          }),
        }).catch(console.error)
      }
    }
  }, [focusViolations, isDisqualified, isEditorLocked, participant, MAX_VIOLATIONS, EDITOR_LOCK_VIOLATIONS])

  const refreshTeams = async () => {
    setRefreshingTeams(true)
    try {
      const res = await fetch(`/api/live-coding/join/${accessCode}`)
      if (res.ok) {
        const data = await res.json()
        if (data.teams) {
          setTeams(data.teams)
        }
      }
    } catch (err) {
      console.error("Failed to refresh teams")
    } finally {
      setRefreshingTeams(false)
    }
  }

  useEffect(() => {
    if (!participant && !loading && teams.length > 0) {
      const interval = setInterval(refreshTeams, 3000)
      return () => clearInterval(interval)
    }
  }, [participant, loading, teams.length, accessCode])

  // Join team handler
  const handleJoinTeam = async (teamId: number, teamName: string) => {
    const team = teams.find((t: any) => t.id === teamId)
    if (team?.is_locked) {
      setError("Team-kan waa la doortay! Fadlan dooro team kale.")
      return
    }

    setJoining(true)
    setSelectedTeamId(String(teamId)) // Set selected team ID
    try {
      const res = await fetch(`/api/live-coding/join/${accessCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.teamLocked) {
          await refreshTeams()
        }
        setError(data.error || "Failed to join")
        setSelectedTeamId(null) // Reset selection if join failed
        return
      }

      setParticipant(data.participant)

      // Set cookie
      document.cookie = `lc_participant_${accessCode}=${data.participant.id}; path=/; max-age=86400`
    } catch (err) {
      setError("Failed to join team")
      setSelectedTeamId(null) // Reset selection on error
    } finally {
      setJoining(false)
    }
  }

  const getWordAtCursor = useCallback(
    (text: string, cursorPos: number) => {
      const beforeCursor = text.substring(0, cursorPos)
      const afterCursor = text.substring(cursorPos)

      // Get current line
      const lines = beforeCursor.split("\n")
      const currentLine = lines[lines.length - 1]

      // For HTML: Check if we're typing a tag (after <)
      const htmlTagMatch = currentLine.match(/<([a-zA-Z]*)$/)
      if (htmlTagMatch && activeTab === "html") {
        return {
          word: htmlTagMatch[1],
          type: "html-tag" as const,
          startPos: cursorPos - htmlTagMatch[1].length,
        }
      }

      // For CSS: Check if we're typing a property or value
      if (activeTab === "css") {
        // Check if we're inside a value (after :)
        const valueMatch = currentLine.match(/:\s*([a-zA-Z-]*)$/)
        if (valueMatch) {
          return {
            word: valueMatch[1],
            type: "css-value" as const,
            startPos: cursorPos - valueMatch[1].length,
          }
        }

        // Check if we're typing a property (start of line or after ; or {)
        const propertyMatch = currentLine.match(/(?:^|[;{}\s])([a-zA-Z-]+)$/)
        if (propertyMatch) {
          return {
            word: propertyMatch[1],
            type: "css-property" as const,
            startPos: cursorPos - propertyMatch[1].length,
          }
        }
      }

      if (activeTab === "html") {
        const textMatch = currentLine.match(/(?:^|>|\s)([a-zA-Z]+)$/)
        if (textMatch && textMatch[1].length >= 1) {
          return {
            word: textMatch[1],
            type: "html-text" as const,
            startPos: cursorPos - textMatch[1].length,
          }
        }
      }

      return { word: "", type: null, startPos: cursorPos }
    },
    [activeTab],
  )

  const filterSuggestions = useCallback((word: string, type: string | null) => {
    if (!word || word.length < 1) {
      setShowSuggestions(false)
      return
    }

    let filtered: any[] = []

    if (type === "html-tag") {
      filtered = HTML_TAGS.filter((item) => item.tag.toLowerCase().startsWith(word.toLowerCase())).slice(0, 8)
    } else if (type === "html-text") {
      // Suggest HTML tags when typing text that could be a tag name
      filtered = HTML_TAGS.filter((item) => item.tag.toLowerCase().startsWith(word.toLowerCase())).slice(0, 8)
    } else if (type === "css-property") {
      filtered = CSS_PROPERTIES.filter((item) => item.property.toLowerCase().startsWith(word.toLowerCase())).slice(0, 8)
    } else if (type === "css-value") {
      filtered = CSS_VALUES.filter((item) => item.value.toLowerCase().startsWith(word.toLowerCase())).slice(0, 8)
    }

    if (filtered.length > 0) {
      setSuggestions(filtered)
      setSelectedSuggestion(0)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [])

  const calculateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const text = textarea.value
    const cursorPos = textarea.selectionStart
    const lines = text.substring(0, cursorPos).split("\n")
    const lineNumber = lines.length
    const charInLine = lines[lines.length - 1].length

    // Approximate position (adjust based on font size and padding)
    const lineHeight = 24 // Increased to account for larger font/leading
    const charWidth = 9 // Slightly increased character width

    setCursorPosition({
      top: Math.min(lineNumber * lineHeight, textarea.clientHeight - 200),
      left: Math.min(charInLine * charWidth, textarea.clientWidth - 250),
    })
  }, [])

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      const cursorPos = e.target.selectionStart

      if (activeTab === "html") {
        setHtmlCode(value)
      } else {
        setCssCode(value)
      }

      // Check for autocomplete
      const { word, type, startPos } = getWordAtCursor(value, cursorPos)
      setCurrentWord(word)
      filterSuggestions(word, type)
      calculateCursorPosition()

      // Trigger debounced save on code change
      if (activeTab === "html") {
        debouncedSave(value, cssCode)
      } else {
        debouncedSave(htmlCode, value)
      }
    },
    [activeTab, getWordAtCursor, filterSuggestions, calculateCursorPosition, debouncedSave, htmlCode, cssCode],
  )

  const applySuggestion = useCallback(
    (suggestion: any) => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const cursorPos = textarea.selectionStart
      const code = activeTab === "html" ? htmlCode : cssCode

      const { word, type, startPos } = getWordAtCursor(code, cursorPos)

      let newCode = ""
      let newCursorPos = 0

      if (type === "html-tag") {
        // Replace from < to cursor with the snippet
        const beforeTag = code.substring(0, startPos - 1) // -1 to include <
        const afterCursor = code.substring(cursorPos)
        newCode = beforeTag + suggestion.snippet + afterCursor
        // Position cursor inside the tag
        const tagEnd = suggestion.snippet.indexOf(">") + 1
        newCursorPos = beforeTag.length + tagEnd
      } else if (type === "html-text") {
        // Replace text with full HTML tag snippet
        const beforeWord = code.substring(0, startPos)
        const afterCursor = code.substring(cursorPos)
        newCode = beforeWord + suggestion.snippet + afterCursor
        // Position cursor inside the tag
        const tagEnd = suggestion.snippet.indexOf(">") + 1
        newCursorPos = beforeWord.length + tagEnd
      } else if (type === "css-property") {
        const beforeWord = code.substring(0, startPos)
        const afterCursor = code.substring(cursorPos)
        newCode = beforeWord + suggestion.snippet + afterCursor
        // Position cursor at the semicolon
        newCursorPos = beforeWord.length + suggestion.snippet.indexOf(";")
      } else if (type === "css-value") {
        const beforeWord = code.substring(0, startPos)
        const afterCursor = code.substring(cursorPos)
        newCode = beforeWord + suggestion.snippet + afterCursor
        newCursorPos = beforeWord.length + suggestion.snippet.length
      }

      if (activeTab === "html") {
        setHtmlCode(newCode)
      } else {
        setCssCode(newCode)
      }

      setShowSuggestions(false)

      // Set cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    },
    [activeTab, htmlCode, cssCode, getWordAtCursor],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestion((prev) => Math.max(prev - 1, 0))
        return
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault()
        if (suggestions[selectedSuggestion]) {
          applySuggestion(suggestions[selectedSuggestion])
        }
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setShowSuggestions(false)
        return
      }
    }

    // Regular tab handling (insert spaces)
    if (e.key === "Tab" && !showSuggestions) {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const value = target.value
      const newValue = value.substring(0, start) + "  " + value.substring(end)

      if (activeTab === "html") {
        setHtmlCode(newValue)
      } else {
        setCssCode(newValue)
      }

      // Set cursor position after tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2
      }, 0)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function formatTime(seconds: number | null): string {
    if (seconds === null || isNaN(seconds)) {
      return "--:--"
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const previewHtml = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>${htmlCode}</body>
      </html>
    `
  }, [htmlCode, cssCode])

  const isEditable = challenge?.status === "active" && !challenge?.is_editing_locked && !timeExpired && !isEditorLocked

  useEffect(() => {
    if (!participant || !challenge || challenge.status !== "active" || isDisqualified) return // Added isDisqualified check

    // Activity tracking and focus violation detection
    const trackActivityAndFocus = async () => {
      try {
        await fetch("/api/live-coding/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId: participant.id,
            challengeId: challenge.id,
          }),
        })
      } catch (err) {
        console.error("Failed to track activity:", err)
      }
    }

    // Detect tab visibility change (switching tabs, minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPageVisible(false)
        setFocusViolations((prev) => prev + 1)
        setShowFocusWarning(true)
      } else {
        setIsPageVisible(true)
      }
    }

    // Detect window blur (clicking outside browser)
    const handleWindowBlur = () => {
      // Only count as a violation if the page is visible, otherwise it's just a tab switch
      if (isPageVisible) {
        setFocusViolations((prev) => prev + 1)
        setShowFocusWarning(true)
      }
    }

    // Prevent leaving page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "Challenge wali ma dhamaan - ma hubtaa inaad baxdid?"
      return e.returnValue
    }

    // Prevent keyboard shortcuts for new tab, etc.
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+T (new tab), Ctrl+N (new window), Ctrl+W (close tab)
      if (e.ctrlKey || e.metaKey) {
        if (["t", "n", "w", "Tab"].includes(e.key.toLowerCase())) {
          e.preventDefault()
          if (!isDisqualified) {
            // Don't show warning if already disqualified
            setFocusViolations((prev) => prev + 1)
            setShowFocusWarning(true)
          }
          return false
        }
      }
      // Block Alt+Tab
      if (e.altKey && e.key === "Tab") {
        e.preventDefault()
        if (!isDisqualified) {
          setFocusViolations((prev) => prev + 1)
          setShowFocusWarning(true)
        }
        return false
      }
    }

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleWindowBlur)
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("contextmenu", handleContextMenu)

    // Request fullscreen on join (optional)
    const requestFullscreen = async () => {
      try {
        // Only request fullscreen if not already in fullscreen and the challenge is active
        if (!document.fullscreenElement && challenge.status === "active") {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen()
            setIsFullscreen(true)
          }
        }
      } catch (err) {
        console.log("Fullscreen not available or challenge not active")
      }
    }

    // Auto-request fullscreen after a short delay
    const fullscreenTimeout = setTimeout(requestFullscreen, 1000)

    // Detect fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
        // Don't count as violation but show gentle reminder if not disqualified
        if (!isDisqualified) {
          // Optionally, you could show a subtle reminder here if needed.
        }
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleWindowBlur)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      clearTimeout(fullscreenTimeout)
    }
  }, [
    participant,
    challenge,
    isDisqualified,
    focusViolations,
    MAX_VIOLATIONS,
    isPageVisible,
    isEditorLocked,
    isFullscreen,
  ]) // Added isDisqualified, focusViolations, MAX_VIOLATIONS, isPageVisible, isEditorLocked, isFullscreen to dependencies

  const FocusWarningModal = () => {
    if (!showFocusWarning || isDisqualified) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-yellow-500/30 rounded-2xl p-6 max-w-md mx-4 shadow-2xl shadow-yellow-500/20 animate-in zoom-in-95 duration-300">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                focusViolations >= EDITOR_LOCK_VIOLATIONS
                  ? "bg-gradient-to-br from-red-500 to-red-700 animate-pulse"
                  : "bg-gradient-to-br from-yellow-500 to-orange-600"
              }`}
            >
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h3
            className={`text-xl font-bold text-center mb-2 ${
              focusViolations >= EDITOR_LOCK_VIOLATIONS ? "text-red-400" : "text-yellow-400"
            }`}
          >
            {focusViolations >= EDITOR_LOCK_VIOLATIONS ? "Code Editor Waa La Xiray!" : "Digniinta Focus!"}
          </h3>

          {/* Message */}
          <p className="text-gray-300 text-center mb-4">
            {focusViolations >= EDITOR_LOCK_VIOLATIONS
              ? "Waxaad baxday bogga 2 jeer. Code editor-ku hadda waa read-only. Waxaad arki kartaa preview-gaaga laakiin ma qori kartid code cusub."
              : "Waxaad ka baxday bogga challenge-ka. Fadlan ku sug boggan si aadan u waayayn fursadda."}
          </p>

          {/* Violations Progress */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Focus Violations</span>
              <span
                className={`text-sm font-bold ${
                  focusViolations >= EDITOR_LOCK_VIOLATIONS ? "text-red-400" : "text-yellow-400"
                }`}
              >
                {focusViolations} / {MAX_VIOLATIONS}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  focusViolations >= EDITOR_LOCK_VIOLATIONS
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500"
                }`}
                style={{ width: `${(focusViolations / MAX_VIOLATIONS) * 100}%` }}
              />
            </div>
          </div>

          {/* Status Info */}
          <div className="space-y-2 mb-4">
            <div
              className={`flex items-center gap-2 text-sm ${focusViolations >= 1 ? "text-yellow-400" : "text-gray-500"}`}
            >
              <div className={`w-2 h-2 rounded-full ${focusViolations >= 1 ? "bg-yellow-400" : "bg-gray-600"}`} />
              <span>1-gaal: Digniin</span>
            </div>
            <div
              className={`flex items-center gap-2 text-sm ${focusViolations >= EDITOR_LOCK_VIOLATIONS ? "text-red-400" : "text-gray-500"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${focusViolations >= EDITOR_LOCK_VIOLATIONS ? "bg-red-400" : "bg-gray-600"}`}
              />
              <span>2-aad: Code Editor waa la xirayaa</span>
            </div>
            <div
              className={`flex items-center gap-2 text-sm ${focusViolations >= MAX_VIOLATIONS ? "text-red-600" : "text-gray-500"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${focusViolations >= MAX_VIOLATIONS ? "bg-red-600" : "bg-gray-600"}`}
              />
              <span>3-aad: Challenge-ka waa la joojinayaa</span>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => {
              setShowFocusWarning(false)
              // If editor is locked, automatically switch to preview and try to re-enter fullscreen
              if (focusViolations >= EDITOR_LOCK_VIOLATIONS) {
                setPanelLayout("preview")
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {})
                }
              }
            }}
            className={`w-full ${
              focusViolations >= EDITOR_LOCK_VIOLATIONS
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            } text-white font-medium rounded-xl`}
          >
            {focusViolations >= EDITOR_LOCK_VIOLATIONS ? "Sii Daawad Preview-ga" : "Waan Fahmay"}
          </Button>
        </div>
      </div>
    )
  }

  if (isDisqualified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-lg w-full">
          <div className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 text-center shadow-2xl shadow-red-500/20">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
              <XCircle className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-red-400 mb-3">Waxaad Ka Baxday Challenge-ka</h1>

            {/* Description */}
            <p className="text-gray-400 mb-6 leading-relaxed">
              Waxaad {MAX_VIOLATIONS} jeer ka baxday bogga challenge-ka. Shuruudaha tartanka waxay qaban waayeen.
            </p>

            {/* Violations Count */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <span className="text-red-400 font-semibold">
                  Focus Violations: {focusViolations}/{MAX_VIOLATIONS}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-gray-800/50 rounded-xl p-4 text-left space-y-2 mb-6">
              <p className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-red-400">•</span>
                Tab kale ayaad aadday {focusViolations} jeer
              </p>
              <p className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-red-400">•</span>
                Challenge-ka code-kaaga waa la keydsaday
              </p>
              <p className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-red-400">•</span>
                Macalinka ayaa arki kara xaaladdan
              </p>
            </div>

            {/* Challenge Info */}
            <div className="text-sm text-gray-500">
              <p>{challenge?.title}</p>
              <p className="text-xs mt-1">Team: {participant?.team_name}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center animate-pulse">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-[#e63946] mx-auto" />
        </div>
      </div>
    )
  }

  if (error) {
    // Removed !challenge check as error can occur even if challenge is partially loaded
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#1a1a2e]/80 border border-[#e63946]/30 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e63946]/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[#e63946]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Khalad!</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#013565] hover:bg-[#013565]/80">
            Dib u cusbooneysii bogga
          </Button>
        </div>
      </div>
    )
  }

  // Join screen
  if (!participant) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#013565]/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#e63946]/30">
              <Code2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{challenge?.title || "Loading..."}</h1>
            {challenge?.description && <p className="text-gray-400 text-sm">{challenge.description}</p>}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {challenge?.duration_minutes || "--"} daqiiqo
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${challenge?.status === "active" ? "bg-green-500/20 text-green-400" : challenge?.status === "draft" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}
              >
                {challenge?.status || "..."}
              </span>
            </div>
          </div>

          {/* Team Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 font-medium">Dooro Team-kaaga</p>
              <button
                onClick={refreshTeams}
                disabled={refreshingTeams}
                className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${refreshingTeams ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {teamsLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-[#e63946] animate-spin mb-3" />
                <p className="text-gray-400 text-sm">Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-white/5 rounded-xl border border-white/10">
                <AlertTriangle className="w-10 h-10 text-yellow-500 mb-3" />
                <p className="text-gray-300 font-medium mb-1">Ma jiraan teams</p>
                <p className="text-gray-500 text-sm text-center">Admin-ku wali ma abuurin teams challenge-kan.</p>
                <button
                  onClick={refreshTeams}
                  className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshingTeams ? "animate-spin" : ""}`} />
                  Dib u hubo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {teams.map((team: any, index: number) => {
                  const isLocked = team.is_locked
                  const isSelected = selectedTeamId === String(team.id)

                  return (
                    <button
                      key={team.id}
                      onClick={() => !isLocked && handleJoinTeam(team.id, team.name)}
                      disabled={joining || isLocked}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isLocked
                          ? "border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-60"
                          : isSelected
                            ? "border-[#e63946] shadow-lg shadow-[#e63946]/20 scale-105"
                            : index === 0
                              ? "border-blue-500/50 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 bg-blue-500/5 hover:scale-105"
                              : "border-[#e63946]/50 hover:border-[#e63946] hover:shadow-lg hover:shadow-[#e63946]/20 bg-[#e63946]/5 hover:scale-105"
                      }`}
                    >
                      {/* Lock badge for locked teams */}
                      {isLocked && (
                        <div className="absolute -top-2 -right-2 bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center gap-1 border border-gray-600">
                          <Lock className="w-3 h-3" />
                          La doortay
                        </div>
                      )}

                      {/* Available badge for open teams */}
                      {!isLocked && (
                        <div
                          className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                            index === 0
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Diyaar
                        </div>
                      )}

                      <div
                        className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-transform ${
                          !isLocked && "group-hover:scale-110"
                        } ${
                          isLocked
                            ? "bg-gray-700/50"
                            : index === 0
                              ? "bg-gradient-to-br from-blue-500 to-blue-600"
                              : "bg-gradient-to-br from-[#e63946] to-[#ff6b6b]"
                        }`}
                      >
                        {isLocked ? (
                          <Lock className="w-8 h-8 text-gray-400" />
                        ) : index === 0 ? (
                          <Shield className="w-8 h-8 text-white" />
                        ) : (
                          <Crown className="w-8 h-8 text-white" />
                        )}
                      </div>

                      <p className={`font-bold text-lg ${isLocked ? "text-gray-500" : "text-white"}`}>{team.name}</p>

                      {isSelected && joining && (
                        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Users className="w-4 h-4" />
            Access Code: <code className="px-2 py-0.5 bg-white/10 rounded text-white/80">{accessCode}</code>
          </div>
        </div>
      </div>
    )
  }

  // Main editor - Complete redesign with dark theme and collapse buttons
  return (
    <div className={`min-h-screen bg-[#0a0a0f] flex flex-col ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Focus Warning Modal */}
      <FocusWarningModal />

      {isEditorLocked && !isDisqualified && !showFocusWarning && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-600/90 to-orange-600/90 backdrop-blur-sm py-2 px-4 flex items-center justify-center gap-3 shadow-lg">
          <Lock className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">
            Code Editor waa la xiray - Tab kale ayaad aadday {focusViolations} jeer. Preview-ga oo keliya ayaad arki
            kartaa.
          </span>
        </div>
      )}

      {/* Disqualified Screen */}
      {isDisqualified && (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 flex items-center justify-center p-4">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative z-10 max-w-lg w-full">
            <div className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 text-center shadow-2xl shadow-red-500/20">
              {/* Icon */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                <XCircle className="w-12 h-12 text-white" />
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-red-400 mb-3">Waxaad Ka Baxday Challenge-ka</h1>

              {/* Description */}
              <p className="text-gray-400 mb-6 leading-relaxed">
                Waxaad {MAX_VIOLATIONS} jeer ka baxday bogga challenge-ka. Shuruudaha tartanka waxay qaban waayeen.
              </p>

              {/* Violations Count */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <span className="text-red-400 font-semibold">
                    Focus Violations: {focusViolations}/{MAX_VIOLATIONS}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="bg-gray-800/50 rounded-xl p-4 text-left space-y-2 mb-6">
                <p className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  Tab kale ayaad aadday {focusViolations} jeer
                </p>
                <p className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  Challenge-ka code-kaaga waa la keydsaday
                </p>
                <p className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  Macalinka ayaa arki kara xaaladdan
                </p>
              </div>

              {/* Challenge Info */}
              <div className="text-sm text-gray-500">
                <p>{challenge?.title}</p>
                <p className="text-xs mt-1">Team: {participant?.team_name}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-[#0a0a12] via-[#0d0d18] to-[#12121f] border-b border-purple-500/20 p-3">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{challenge?.title}</h1>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: participant?.team_name === "Team A" ? "#3b82f6" : "#ef4444", // Hardcoded team colors for now
                  }}
                />
                <span className="text-gray-400">{participant?.team_name}</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Editing locked indicator */}
            {challenge?.is_editing_locked && (
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Qorista Furan
              </div>
            )}

            <div
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 font-mono text-xl font-bold ${
                timeExpired
                  ? "bg-pink-500/30 text-pink-400 border border-pink-500/50"
                  : timeRemaining !== null && timeRemaining < 60
                    ? "bg-pink-500/20 text-pink-400 animate-pulse border border-pink-500/30"
                    : "bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-white border border-purple-500/20"
              }`}
            >
              <Clock className="w-5 h-5" />
              {timeExpired ? "00:00" : formatTime(timeRemaining)}
            </div>

            {/* Save status */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <span className="text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : lastSaved ? (
                <span className="text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/10">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved
                </span>
              ) : null}
            </div>

            {/* Fullscreen toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {challenge?.instructions && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-500/20">
            <p className="text-sm text-purple-200">
              <span className="font-semibold text-cyan-400">Tilmaamaha:</span> {challenge.instructions}
            </p>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {timeExpired &&
          participant &&
          !isDisqualified && ( // Added participant check here
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
              onContextMenu={(e) => e.preventDefault()} // Prevent context menu on the overlay
            >
              <div className="text-center animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center shadow-2xl shadow-[#e63946]/50 animate-pulse">
                  <Clock className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Waqtigu Wuu Dhamaaday!</h2>
                <p className="text-gray-400 text-lg mb-4">Code-kaaga waa la keydiyay</p>
                <div className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 inline-flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <span className="text-white">Preview Mode - Eeg natiijadaada</span>
                </div>
              </div>
            </div>
          )}

        {!timeExpired && (
          <div
            className={`flex flex-col border-r border-purple-500/20 transition-all duration-300 ${
              panelLayout === "editor" ? "w-full" : panelLayout === "preview" ? "w-0 overflow-hidden" : "w-1/2"
            }`}
          >
            {/* Panel Controls */}
            <div className="flex items-center justify-end gap-1 px-2 py-1.5 bg-[#0a0a12] border-b border-purple-500/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPanelLayout("editor")}
                className={`h-7 w-7 p-0 ${
                  panelLayout === "editor"
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                title="Code Editor Buuxi"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPanelLayout("split")}
                className={`h-7 w-7 p-0 ${
                  panelLayout === "split"
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                title="Labadaba Muuji"
              >
                <Columns2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPanelLayout("preview")}
                className={`h-7 w-7 p-0 ${
                  panelLayout === "preview"
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                title="Preview Buuxi"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Jellyfish Code Editor */}
            <div className="flex-1 overflow-hidden">
              <JellyfishCodeEditor
                activeTab={activeTab}
                htmlCode={htmlCode}
                cssCode={cssCode}
                onHtmlChange={(code) => {
                  setHtmlCode(code)
                  debouncedSave(code, cssCode)
                }}
                onCssChange={(code) => {
                  setCssCode(code)
                  debouncedSave(htmlCode, code)
                }}
                onTabChange={setActiveTab}
                disabled={!isEditable}
              />
            </div>
          </div>
        )}

        {/* Preview Panel */}
        <div
          className={`flex flex-col transition-all duration-300 ${
            timeExpired
              ? "w-full"
              : panelLayout === "preview"
                ? "w-full"
                : panelLayout === "editor"
                  ? "w-0 overflow-hidden"
                  : "w-1/2"
          }`}
        >
          <div className="px-4 py-3.5 border-b border-purple-500/20 bg-gradient-to-r from-[#0a0a12] to-[#0d0d18] flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              Live Preview
              {timeExpired && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30">
                  Natiijada Ugu Dambeysa
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {!timeExpired && (
                <>
                  <span className="text-xs text-purple-400/60 px-2 py-1 rounded bg-purple-500/10">Auto-refresh</span>

                  <div className="flex items-center gap-1 ml-2 border-l border-purple-500/20 pl-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPanelLayout("editor")}
                      className={`h-8 w-8 p-0 ${
                        panelLayout === "editor"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                      title="Code Editor Buuxi"
                    >
                      <PanelRightClose className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPanelLayout("split")}
                      className={`h-8 w-8 p-0 ${
                        panelLayout === "split"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                      title="Labadaba Muuji"
                    >
                      <Columns2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPanelLayout("preview")}
                      className={`h-8 w-8 p-0 ${
                        panelLayout === "preview"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                      title="Preview Buuxi"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview iFrame */}
          <div className="flex-1 bg-white">
            <iframe srcDoc={previewHtml} title="Preview" className="w-full h-full border-0" sandbox="allow-scripts" />
          </div>
        </div>
      </div>

      {/* Time expired view - stay in preview mode with small banner */}
      {timeExpired &&
        participant &&
        !isDisqualified && ( // Added participant check here
          <div
            className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] text-white"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Header */}
            <header className="h-16 border-b border-white/10 bg-[#0d0d14]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#e63946]/20">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">{challenge?.title}</h1>
                  <p className="text-xs text-gray-400">{participant?.team_name}</p>
                </div>
              </div>

              {/* Time's Up Badge */}
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e63946]/20 to-[#ff6b6b]/20 border border-[#e63946]/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e63946] flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[#ff6b6b]">Waqtigu Dhamaaday</p>
                    <p className="text-lg font-bold text-white font-mono">00:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Saved</span>
                </div>
              </div>
            </header>

            {/* Time Expired Banner */}
            <div className="bg-gradient-to-r from-[#e63946]/10 via-amber-500/10 to-[#e63946]/10 border-b border-[#e63946]/20 px-6 py-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#e63946] flex items-center justify-center animate-pulse">
                  <Clock className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm text-gray-300">
                  <span className="text-[#ff6b6b] font-semibold">Waqtigu wuu dhamaaday!</span> - Code-kaagii waa la
                  keydiyay. Preview-ga hoose waxaad ku arki kartaa shaqadaadii.
                </p>
              </div>
            </div>

            {/* Preview Only - Full Width */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d14] overflow-hidden shadow-2xl">
                {/* Browser chrome */}
                <div className="bg-[#2a2a3e] px-4 py-2.5 flex items-center gap-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 bg-[#0d0d14] rounded-lg px-4 py-1.5 text-xs text-gray-400 flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    <span>preview.local</span>
                  </div>
                </div>
                {/* Iframe */}
                <div className="bg-white" style={{ height: "calc(100vh - 320px)" }}>
                  <iframe
                    srcDoc={`<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
    ${cssCode}
  </style>
</head>
<body>${htmlCode}</body>
</html>`}
                    className="w-full h-full border-0"
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>

              {/* Final Code Summary */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0d0d14] border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <FileCode className="w-4 h-4 text-[#ff6b6b]" />
                    <span className="text-sm font-medium text-gray-300">HTML Code</span>
                    <span className="ml-auto text-xs text-gray-500">{htmlCode.length} chars</span>
                  </div>
                  <pre className="text-xs text-gray-400 font-mono bg-black/30 rounded-lg p-3 max-h-32 overflow-auto">
                    {htmlCode || "// No HTML code"}
                  </pre>
                </div>
                <div className="p-4 rounded-xl bg-[#0d0d14] border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">CSS Code</span>
                    <span className="ml-auto text-xs text-gray-500">{cssCode.length} chars</span>
                  </div>
                  <pre className="text-xs text-gray-400 font-mono bg-black/30 rounded-lg p-3 max-h-32 overflow-auto">
                    {cssCode || "// No CSS code"}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
