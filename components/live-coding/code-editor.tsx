"use client"

import type React from "react"

import { useState, useRef, useCallback, useMemo } from "react"
import { FileCode, Palette, Sparkles, Zap, Terminal } from "lucide-react"

// Jellyfish Theme Colors
const JELLYFISH_THEME = {
  // Background colors
  bgPrimary: "#0a0a12",
  bgSecondary: "#0d0d18",
  bgTertiary: "#12121f",
  bgHighlight: "#1a1a2e",

  // Accent colors (Jellyfish inspired - purples, pinks, cyans)
  purple: "#a855f7",
  purpleLight: "#c084fc",
  purpleDark: "#7c3aed",
  pink: "#ec4899",
  pinkLight: "#f472b6",
  cyan: "#22d3ee",
  cyanLight: "#67e8f9",
  magenta: "#d946ef",
  blue: "#3b82f6",

  // Syntax colors
  tag: "#22d3ee", // cyan for HTML tags
  attribute: "#a855f7", // purple for attributes
  string: "#f472b6", // pink for strings
  property: "#c084fc", // light purple for CSS properties
  value: "#67e8f9", // light cyan for CSS values
  selector: "#ec4899", // pink for CSS selectors
  comment: "#6b7280", // gray for comments
  punctuation: "#9ca3af", // light gray for brackets
  keyword: "#d946ef", // magenta for keywords
}

// HTML Tags for autocomplete
const HTML_TAGS = [
  { tag: "div", snippet: "<div></div>", description: "Container element" },
  { tag: "span", snippet: "<span></span>", description: "Inline container" },
  { tag: "h1", snippet: "<h1></h1>", description: "Heading level 1" },
  { tag: "h2", snippet: "<h2></h2>", description: "Heading level 2" },
  { tag: "h3", snippet: "<h3></h3>", description: "Heading level 3" },
  { tag: "p", snippet: "<p></p>", description: "Paragraph" },
  { tag: "a", snippet: '<a href=""></a>', description: "Anchor link" },
  { tag: "img", snippet: '<img src="/placeholder.svg" alt="" />', description: "Image" },
  { tag: "ul", snippet: "<ul>\n  <li></li>\n</ul>", description: "Unordered list" },
  { tag: "ol", snippet: "<ol>\n  <li></li>\n</ol>", description: "Ordered list" },
  { tag: "li", snippet: "<li></li>", description: "List item" },
  { tag: "button", snippet: "<button></button>", description: "Button" },
  { tag: "input", snippet: '<input type="text" />', description: "Input field" },
  { tag: "form", snippet: "<form>\n  \n</form>", description: "Form element" },
  { tag: "header", snippet: "<header></header>", description: "Header section" },
  { tag: "footer", snippet: "<footer></footer>", description: "Footer section" },
  { tag: "nav", snippet: "<nav></nav>", description: "Navigation" },
  { tag: "main", snippet: "<main></main>", description: "Main content" },
  { tag: "section", snippet: "<section></section>", description: "Section" },
  { tag: "article", snippet: "<article></article>", description: "Article" },
  { tag: "table", snippet: "<table>\n  <tr>\n    <td></td>\n  </tr>\n</table>", description: "Table" },
  { tag: "tr", snippet: "<tr></tr>", description: "Table row" },
  { tag: "td", snippet: "<td></td>", description: "Table cell" },
  { tag: "video", snippet: '<video src="" controls></video>', description: "Video" },
  { tag: "canvas", snippet: "<canvas></canvas>", description: "Canvas" },
]

// CSS Properties for autocomplete
const CSS_PROPERTIES = [
  { property: "color", snippet: "color: ;", description: "Text color" },
  { property: "background", snippet: "background: ;", description: "Background" },
  { property: "background-color", snippet: "background-color: ;", description: "Background color" },
  { property: "font-size", snippet: "font-size: ;", description: "Font size" },
  { property: "font-weight", snippet: "font-weight: ;", description: "Font weight" },
  { property: "font-family", snippet: "font-family: ;", description: "Font family" },
  { property: "margin", snippet: "margin: ;", description: "Margin" },
  { property: "padding", snippet: "padding: ;", description: "Padding" },
  { property: "border", snippet: "border: ;", description: "Border" },
  { property: "border-radius", snippet: "border-radius: ;", description: "Border radius" },
  { property: "display", snippet: "display: ;", description: "Display type" },
  { property: "flex", snippet: "flex: ;", description: "Flex" },
  { property: "flex-direction", snippet: "flex-direction: ;", description: "Flex direction" },
  { property: "justify-content", snippet: "justify-content: ;", description: "Justify content" },
  { property: "align-items", snippet: "align-items: ;", description: "Align items" },
  { property: "gap", snippet: "gap: ;", description: "Gap" },
  { property: "grid", snippet: "grid: ;", description: "Grid" },
  { property: "grid-template-columns", snippet: "grid-template-columns: ;", description: "Grid columns" },
  { property: "position", snippet: "position: ;", description: "Position" },
  { property: "width", snippet: "width: ;", description: "Width" },
  { property: "height", snippet: "height: ;", description: "Height" },
  { property: "box-shadow", snippet: "box-shadow: ;", description: "Box shadow" },
  { property: "transition", snippet: "transition: ;", description: "Transition" },
  { property: "transform", snippet: "transform: ;", description: "Transform" },
  { property: "opacity", snippet: "opacity: ;", description: "Opacity" },
  { property: "z-index", snippet: "z-index: ;", description: "Z-index" },
]

const CSS_VALUES = [
  { value: "flex", snippet: "flex", description: "Flexbox" },
  { value: "grid", snippet: "grid", description: "Grid" },
  { value: "block", snippet: "block", description: "Block" },
  { value: "inline-block", snippet: "inline-block", description: "Inline block" },
  { value: "none", snippet: "none", description: "None" },
  { value: "center", snippet: "center", description: "Center" },
  { value: "space-between", snippet: "space-between", description: "Space between" },
  { value: "space-around", snippet: "space-around", description: "Space around" },
  { value: "column", snippet: "column", description: "Column" },
  { value: "row", snippet: "row", description: "Row" },
  { value: "absolute", snippet: "absolute", description: "Absolute" },
  { value: "relative", snippet: "relative", description: "Relative" },
  { value: "fixed", snippet: "fixed", description: "Fixed" },
]

interface CodeEditorProps {
  activeTab: "html" | "css"
  htmlCode: string
  cssCode: string
  onHtmlChange: (code: string) => void
  onCssChange: (code: string) => void
  onTabChange: (tab: "html" | "css") => void
  disabled?: boolean
}

// Syntax Highlighting Component
function SyntaxHighlighter({ code, language }: { code: string; language: "html" | "css" }) {
  const highlightHTML = (text: string) => {
    const lines = text.split("\n")
    return lines
      .map((line, lineIndex) => {
        const tokens: { text: string; color: string }[] = []
        const remaining = line
        const lastIndex = 0

        // Match HTML patterns
        const patterns = [
          { regex: /<!--[\s\S]*?-->/g, color: JELLYFISH_THEME.comment },
          { regex: /<\/?[a-zA-Z][a-zA-Z0-9]*/g, color: JELLYFISH_THEME.tag },
          { regex: /\s[a-zA-Z-]+(?==)/g, color: JELLYFISH_THEME.attribute },
          { regex: /"[^"]*"|'[^']*'/g, color: JELLYFISH_THEME.string },
          { regex: />/g, color: JELLYFISH_THEME.punctuation },
          { regex: /\/?>/g, color: JELLYFISH_THEME.punctuation },
        ]

        // Simple tokenization
        let result = line

        // Comments
        result = result.replace(/(<!--[\s\S]*?-->)/g, `<span style="color:${JELLYFISH_THEME.comment}">$1</span>`)

        // Tags
        result = result.replace(
          /(&lt;|<)(\/?[a-zA-Z][a-zA-Z0-9]*)/g,
          `<span style="color:${JELLYFISH_THEME.punctuation}">&lt;</span><span style="color:${JELLYFISH_THEME.tag}">$2</span>`,
        )

        // Closing brackets
        result = result.replace(/(\/?&gt;|\/?>)/g, `<span style="color:${JELLYFISH_THEME.punctuation}">$1</span>`)

        // Attributes
        result = result.replace(
          /\s([a-zA-Z-]+)(=)/g,
          ` <span style="color:${JELLYFISH_THEME.attribute}">$1</span><span style="color:${JELLYFISH_THEME.punctuation}">=</span>`,
        )

        // Strings
        result = result.replace(/("[^"]*"|'[^']*')/g, `<span style="color:${JELLYFISH_THEME.string}">$1</span>`)

        return result
      })
      .join("\n")
  }

  const highlightCSS = (text: string) => {
    let result = text

    // Comments
    result = result.replace(/(\/\*[\s\S]*?\*\/)/g, `<span style="color:${JELLYFISH_THEME.comment}">$1</span>`)

    // Selectors (before {)
    result = result.replace(
      /([.#]?[a-zA-Z][a-zA-Z0-9_-]*)\s*\{/g,
      `<span style="color:${JELLYFISH_THEME.selector}">$1</span> <span style="color:${JELLYFISH_THEME.punctuation}">{</span>`,
    )

    // Properties
    result = result.replace(
      /([a-zA-Z-]+)\s*:/g,
      `<span style="color:${JELLYFISH_THEME.property}">$1</span><span style="color:${JELLYFISH_THEME.punctuation}">:</span>`,
    )

    // Values (simplified - after : and before ;)
    result = result.replace(
      /:\s*([^;{}]+)(;)/g,
      `: <span style="color:${JELLYFISH_THEME.value}">$1</span><span style="color:${JELLYFISH_THEME.punctuation}">;</span>`,
    )

    // Brackets
    result = result.replace(/(\{|\})/g, `<span style="color:${JELLYFISH_THEME.punctuation}">$1</span>`)

    return result
  }

  const highlighted = language === "html" ? highlightHTML(code) : highlightCSS(code)

  return (
    <pre
      className="font-mono text-sm leading-6 whitespace-pre-wrap break-all"
      dangerouslySetInnerHTML={{ __html: highlighted || "&nbsp;" }}
    />
  )
}

export default function JellyfishCodeEditor({
  activeTab,
  htmlCode,
  cssCode,
  onHtmlChange,
  onCssChange,
  onTabChange,
  disabled = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })
  const [currentWord, setCurrentWord] = useState("")

  const code = activeTab === "html" ? htmlCode : cssCode
  const setCode = activeTab === "html" ? onHtmlChange : onCssChange

  // Calculate line numbers
  const lineCount = useMemo(() => {
    return Math.max(code.split("\n").length, 20)
  }, [code])

  // Sync scroll between textarea and highlight layer
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  // Get word at cursor for autocomplete
  const getWordAtCursor = useCallback(
    (text: string, cursorPos: number) => {
      const beforeCursor = text.substring(0, cursorPos)
      const lines = beforeCursor.split("\n")
      const currentLine = lines[lines.length - 1]

      // For HTML, look for < followed by letters
      if (activeTab === "html") {
        const htmlMatch = currentLine.match(/<([a-zA-Z]*)$/)
        if (htmlMatch) return { word: htmlMatch[1], type: "tag" }

        // Also match plain text for tag suggestions
        const wordMatch = currentLine.match(/([a-zA-Z]+)$/)
        if (wordMatch) return { word: wordMatch[1], type: "text" }
      }

      // For CSS
      if (activeTab === "css") {
        // Check if we're after a colon (value context)
        const afterColon = currentLine.match(/:\s*([a-zA-Z-]*)$/)
        if (afterColon) return { word: afterColon[1], type: "value" }

        // Check for property
        const propMatch = currentLine.match(/([a-zA-Z-]+)$/)
        if (propMatch) return { word: propMatch[1], type: "property" }
      }

      return { word: "", type: "" }
    },
    [activeTab],
  )

  // Handle code change with autocomplete
  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value
      setCode(newCode)

      const cursorPos = e.target.selectionStart
      const { word, type } = getWordAtCursor(newCode, cursorPos)
      setCurrentWord(word)

      if (word.length >= 1) {
        let filtered: any[] = []

        if (activeTab === "html" && (type === "tag" || type === "text")) {
          filtered = HTML_TAGS.filter((t) => t.tag.toLowerCase().startsWith(word.toLowerCase()))
        } else if (activeTab === "css") {
          if (type === "value") {
            filtered = CSS_VALUES.filter((v) => v.value.toLowerCase().startsWith(word.toLowerCase()))
          } else {
            filtered = CSS_PROPERTIES.filter((p) => p.property.toLowerCase().startsWith(word.toLowerCase()))
          }
        }

        if (filtered.length > 0) {
          setSuggestions(filtered.slice(0, 8))
          setShowSuggestions(true)
          setSelectedSuggestion(0)

          // Calculate cursor position for popup
          const textarea = textareaRef.current
          if (textarea) {
            const lines = newCode.substring(0, cursorPos).split("\n")
            const lineNumber = lines.length
            const charPosition = lines[lines.length - 1].length

            setCursorPosition({
              top: lineNumber * 24,
              left: Math.min(charPosition * 8, 300),
            })
          }
        } else {
          setShowSuggestions(false)
        }
      } else {
        setShowSuggestions(false)
      }
    },
    [activeTab, setCode, getWordAtCursor],
  )

  // Apply suggestion
  const applySuggestion = useCallback(
    (item: any) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const cursorPos = textarea.selectionStart
      const text = activeTab === "html" ? htmlCode : cssCode

      // Find word start
      let wordStart = cursorPos
      while (wordStart > 0 && /[a-zA-Z-]/.test(text[wordStart - 1])) {
        wordStart--
      }

      // Check for < before word
      if (activeTab === "html" && wordStart > 0 && text[wordStart - 1] === "<") {
        wordStart--
      }

      const snippet = activeTab === "html" ? item.snippet : item.snippet || item.value
      const newText = text.substring(0, wordStart) + snippet + text.substring(cursorPos)

      setCode(newText)
      setShowSuggestions(false)

      // Set cursor position
      setTimeout(() => {
        const newPos = wordStart + snippet.length
        textarea.setSelectionRange(newPos, newPos)
        textarea.focus()
      }, 0)
    },
    [activeTab, htmlCode, cssCode, setCode],
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!showSuggestions) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestion((prev) => (prev + 1) % suggestions.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length)
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (suggestions.length > 0) {
          e.preventDefault()
          applySuggestion(suggestions[selectedSuggestion])
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    },
    [showSuggestions, suggestions, selectedSuggestion, applySuggestion],
  )

  return (
    <div className="h-full flex flex-col" style={{ background: JELLYFISH_THEME.bgPrimary }}>
      {/* Editor Header with Jellyfish Theme */}
      <div
        className="flex items-center justify-between border-b px-1"
        style={{
          background: `linear-gradient(135deg, ${JELLYFISH_THEME.bgSecondary} 0%, ${JELLYFISH_THEME.bgTertiary} 100%)`,
          borderColor: `${JELLYFISH_THEME.purple}20`,
        }}
      >
        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => onTabChange("html")}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all relative group`}
            style={{
              color: activeTab === "html" ? JELLYFISH_THEME.cyan : "#9ca3af",
              background: activeTab === "html" ? `${JELLYFISH_THEME.cyan}10` : "transparent",
            }}
          >
            <FileCode className="w-4 h-4" />
            <span>HTML</span>
            {activeTab === "html" && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, ${JELLYFISH_THEME.cyan}, ${JELLYFISH_THEME.purple})` }}
              />
            )}
            {/* Glow effect on hover */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
              style={{
                background: `radial-gradient(circle at center, ${JELLYFISH_THEME.cyan}10 0%, transparent 70%)`,
              }}
            />
          </button>

          <button
            onClick={() => onTabChange("css")}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all relative group`}
            style={{
              color: activeTab === "css" ? JELLYFISH_THEME.pink : "#9ca3af",
              background: activeTab === "css" ? `${JELLYFISH_THEME.pink}10` : "transparent",
            }}
          >
            <Palette className="w-4 h-4" />
            <span>CSS</span>
            {activeTab === "css" && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, ${JELLYFISH_THEME.pink}, ${JELLYFISH_THEME.magenta})` }}
              />
            )}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
              style={{
                background: `radial-gradient(circle at center, ${JELLYFISH_THEME.pink}10 0%, transparent 70%)`,
              }}
            />
          </button>
        </div>

        {/* Editor Info */}
        <div className="flex items-center gap-3 pr-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: `${JELLYFISH_THEME.purple}15`,
              color: JELLYFISH_THEME.purpleLight,
              border: `1px solid ${JELLYFISH_THEME.purple}30`,
            }}
          >
            <Sparkles className="w-3 h-3" />
            Jellyfish Theme
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: `${JELLYFISH_THEME.cyan}15`,
              color: JELLYFISH_THEME.cyanLight,
              border: `1px solid ${JELLYFISH_THEME.cyan}30`,
            }}
          >
            <Zap className="w-3 h-3" />
            Autocomplete
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 20% 80%, ${JELLYFISH_THEME.purple}15 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, ${JELLYFISH_THEME.cyan}10 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, ${JELLYFISH_THEME.pink}05 0%, transparent 70%)
            `,
          }}
        />

        {/* Line Numbers */}
        <div
          className="absolute left-0 top-0 bottom-0 w-14 flex flex-col pt-4 pr-3 text-right select-none overflow-hidden z-10"
          style={{
            background: `linear-gradient(90deg, ${JELLYFISH_THEME.bgPrimary} 0%, ${JELLYFISH_THEME.bgSecondary} 100%)`,
            borderRight: `1px solid ${JELLYFISH_THEME.purple}15`,
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              className="text-xs leading-6 font-mono transition-colors"
              style={{
                color: i < code.split("\n").length ? `${JELLYFISH_THEME.purple}60` : `${JELLYFISH_THEME.purple}20`,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Syntax Highlighted Layer (background) */}
        <div
          ref={highlightRef}
          className="absolute inset-0 pl-16 pr-4 pt-4 pb-4 overflow-auto pointer-events-none"
          style={{ color: "#e5e7eb" }}
        >
          <SyntaxHighlighter code={code} language={activeTab} />
        </div>

        {/* Textarea (foreground - transparent text) */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          disabled={disabled}
          placeholder={
            activeTab === "html"
              ? "<!-- Halkan ku qor HTML code-kaaga -->\n<div>\n  <h1>Hello World</h1>\n</div>"
              : "/* Halkan ku qor CSS styles-kaaga */\nh1 {\n  color: blue;\n}"
          }
          className={`absolute inset-0 w-full h-full pl-16 pr-4 pt-4 pb-4 bg-transparent font-mono text-sm leading-6 resize-none focus:outline-none selection:bg-purple-500/30 caret-purple-400 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          style={{
            color: "transparent",
            caretColor: JELLYFISH_THEME.purple,
          }}
          spellCheck={false}
        />

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 overflow-hidden min-w-[320px] shadow-2xl"
            style={{
              top: cursorPosition.top + 28,
              left: cursorPosition.left + 64,
              background: `linear-gradient(135deg, ${JELLYFISH_THEME.bgHighlight} 0%, ${JELLYFISH_THEME.bgSecondary} 100%)`,
              border: `1px solid ${JELLYFISH_THEME.purple}40`,
              borderRadius: "16px",
              boxShadow: `0 20px 40px -10px ${JELLYFISH_THEME.purple}30, 0 0 20px ${JELLYFISH_THEME.cyan}10`,
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-2.5 flex items-center gap-2"
              style={{
                background: `linear-gradient(90deg, ${JELLYFISH_THEME.purple}15 0%, ${JELLYFISH_THEME.cyan}10 100%)`,
                borderBottom: `1px solid ${JELLYFISH_THEME.purple}20`,
              }}
            >
              <Terminal className="w-3.5 h-3.5" style={{ color: JELLYFISH_THEME.cyan }} />
              <span className="text-xs" style={{ color: JELLYFISH_THEME.purpleLight }}>
                {activeTab === "html" ? "HTML Tags" : "CSS Properties"} • Tab/Enter doorto
              </span>
            </div>

            {/* Suggestions List */}
            <div className="max-h-[280px] overflow-y-auto py-1">
              {suggestions.map((item, index) => (
                <button
                  key={activeTab === "html" ? item.tag : item.property || item.value}
                  onClick={() => applySuggestion(item)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left transition-all"
                  style={{
                    background:
                      index === selectedSuggestion
                        ? `linear-gradient(90deg, ${JELLYFISH_THEME.purple}25 0%, ${JELLYFISH_THEME.cyan}10 100%)`
                        : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <code
                      className="px-2.5 py-1 rounded-lg text-xs font-mono"
                      style={{
                        background: `${activeTab === "html" ? JELLYFISH_THEME.cyan : JELLYFISH_THEME.pink}15`,
                        color: activeTab === "html" ? JELLYFISH_THEME.cyan : JELLYFISH_THEME.pink,
                        border: `1px solid ${activeTab === "html" ? JELLYFISH_THEME.cyan : JELLYFISH_THEME.pink}30`,
                      }}
                    >
                      {activeTab === "html" ? `<${item.tag}>` : item.property || item.value}
                    </code>
                  </div>
                  <span className="text-xs max-w-[140px] truncate" style={{ color: "#9ca3af" }}>
                    {item.description}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2 flex items-center justify-between"
              style={{
                background: `${JELLYFISH_THEME.bgPrimary}80`,
                borderTop: `1px solid ${JELLYFISH_THEME.purple}15`,
              }}
            >
              <span className="text-xs" style={{ color: "#6b7280" }}>
                ↑↓ navigate
              </span>
              <span className="text-xs" style={{ color: "#6b7280" }}>
                Esc close
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
