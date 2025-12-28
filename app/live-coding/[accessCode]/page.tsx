"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Code,
  Eye,
  Clock,
  Lock,
  Unlock,
  FileCode,
  Palette,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Challenge {
  id: number
  title: string
  description: string
  instructions: string
  duration_minutes: number
  status: string
  editing_enabled: boolean
  started_at: string | null
}

interface Team {
  id: number
  name: string
  color: string
}

interface Participant {
  id: number
  team_id: number
  team_name: string
  team_color: string
  student_id: string
  student_name: string
}

export default function LiveCodingEditorPage() {
  const params = useParams()
  const router = useRouter()
  const accessCode = params.accessCode as string
  const { toast } = useToast()

  const [joined, setJoined] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [studentName, setStudentName] = useState("")
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [htmlCode, setHtmlCode] = useState("")
  const [cssCode, setCssCode] = useState("")
  const [activeTab, setActiveTab] = useState<"html" | "css">("html")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch challenge data
  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch(`/api/live-coding/join/${accessCode}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Challenge not found")
        setLoading(false)
        return
      }

      setChallenge(data.challenge)

      if (data.joined && data.participant) {
        setJoined(true)
        setParticipant(data.participant)

        // Load saved code if exists
        if (data.submission) {
          setHtmlCode(data.submission.html_code || "")
          setCssCode(data.submission.css_code || "")
        }

        // Calculate remaining time
        if (data.challenge.started_at && data.challenge.status === "active") {
          const startTime = new Date(data.challenge.started_at).getTime()
          const duration = data.challenge.duration_minutes * 60 * 1000
          const endTime = startTime + duration
          const remaining = Math.max(0, endTime - Date.now())
          setTimeRemaining(Math.floor(remaining / 1000))
        }
      } else {
        // Not joined - show join form
        setJoined(false)
        setTeams(data.teams || [])
      }

      setLoading(false)
    } catch (err) {
      setError("Failed to load challenge")
      setLoading(false)
    }
  }, [accessCode])

  useEffect(() => {
    fetchChallenge()
  }, [fetchChallenge])

  useEffect(() => {
    if (!joined) return
    const interval = setInterval(fetchChallenge, 5000)
    return () => clearInterval(interval)
  }, [joined, fetchChallenge])

  const handleJoin = async () => {
    if (!studentName.trim()) {
      toast({ title: "Khalad", description: "Fadlan geli magacaaga", variant: "destructive" })
      return
    }
    if (!selectedTeamId) {
      toast({ title: "Khalad", description: "Fadlan dooro team", variant: "destructive" })
      return
    }

    setIsJoining(true)
    try {
      const res = await fetch(`/api/live-coding/join/${accessCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: studentName.trim(), teamId: selectedTeamId }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: "Khalad", description: data.error, variant: "destructive" })
        return
      }

      setChallenge(data.challenge)
      setParticipant(data.participant)
      setJoined(true)

      if (data.submission) {
        setHtmlCode(data.submission.html_code || "")
        setCssCode(data.submission.css_code || "")
      }

      // Calculate remaining time
      if (data.challenge.started_at && data.challenge.status === "active") {
        const startTime = new Date(data.challenge.started_at).getTime()
        const duration = data.challenge.duration_minutes * 60 * 1000
        const endTime = startTime + duration
        const remaining = Math.max(0, endTime - Date.now())
        setTimeRemaining(Math.floor(remaining / 1000))
      }

      toast({
        title: data.rejoined ? "Dib ayaad ugu soo noqotay!" : "Ku soo dhawow!",
        description: `Waxaad ku biirtay ${data.participant.team_name}`,
      })
    } catch (err) {
      toast({ title: "Khalad", description: "Wax khalad ah ayaa dhacay", variant: "destructive" })
    } finally {
      setIsJoining(false)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining((t) => Math.max(0, t - 1)), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining])

  // Auto-save code with debounce
  const saveCode = useCallback(async () => {
    if (!participant || !challenge?.editing_enabled) return

    setIsSaving(true)
    try {
      await fetch(`/api/live-coding/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: participant.id,
          challengeId: challenge.id,
          htmlCode,
          cssCode,
        }),
      })
      setLastSaved(new Date())
    } catch (err) {
      console.error("Failed to save:", err)
    } finally {
      setIsSaving(false)
    }
  }, [participant, challenge, htmlCode, cssCode])

  // Debounced auto-save
  useEffect(() => {
    if (!challenge?.editing_enabled) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(saveCode, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [htmlCode, cssCode, saveCode, challenge?.editing_enabled])

  // Mark as active
  useEffect(() => {
    if (!participant) return

    const markActive = async () => {
      await fetch(`/api/live-coding/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: participant.id }),
      })
    }

    markActive()
    const interval = setInterval(markActive, 10000)
    return () => clearInterval(interval)
  }, [participant])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const generatePreview = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
    ${cssCode}
  </style>
</head>
<body>${htmlCode}</body>
</html>`
  }

  // Handle tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-[#e63946] border-t-transparent animate-spin" />
          <p className="text-white/70 text-lg">Loading Challenge...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Khalad!</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <Button onClick={() => router.push("/")} className="bg-[#e63946] text-white">
            Ku noqo Homepage
          </Button>
        </Card>
      </div>
    )
  }

  if (!joined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e63946]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 p-8 max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] mb-4">
              <Code className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{challenge?.title}</h1>
            <p className="text-white/60">{challenge?.description}</p>

            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge className="bg-white/10 text-white/80 border-white/20">
                <Clock className="w-3 h-3 mr-1" />
                {challenge?.duration_minutes} daqiiqo
              </Badge>
              <Badge
                className={`${
                  challenge?.status === "active"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : challenge?.status === "waiting"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-white/10 text-white/60 border-white/20"
                }`}
              >
                {challenge?.status === "active"
                  ? "Socda"
                  : challenge?.status === "waiting"
                    ? "Sugitaan"
                    : challenge?.status}
              </Badge>
            </div>
          </div>

          {/* Join Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white/80">Magacaaga</Label>
              <Input
                placeholder="Geli magacaaga..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#e63946]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Dooro Team-kaaga</Label>
              <div className="grid grid-cols-2 gap-3">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedTeamId === team.id
                        ? "border-[#e63946] bg-[#e63946]/10 scale-105"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-[#0a0a0f]"
                        style={{
                          backgroundColor: team.color,
                          ringColor: selectedTeamId === team.id ? team.color : "transparent",
                        }}
                      />
                      <span className="text-white font-medium">{team.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              {teams.length === 0 && (
                <p className="text-white/40 text-sm text-center py-4">Ma jiraan teams wali - sug instructor-ka</p>
              )}
            </div>

            <Button
              onClick={handleJoin}
              disabled={isJoining || !studentName.trim() || !selectedTeamId}
              className="w-full h-12 bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white font-semibold text-lg disabled:opacity-50"
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Ku Biir Challenge-ka
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Access Code: <code className="text-white/60 bg-white/10 px-2 py-0.5 rounded">{accessCode}</code>
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const isEditable = challenge?.editing_enabled && challenge?.status === "active" && timeRemaining > 0

  return (
    <div className={`h-screen flex flex-col bg-[#0a0a0f] ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left - Challenge Info */}
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#e63946] to-[#ff6b6b]">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{challenge?.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {participant && (
                  <>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: participant.team_color }} />
                    <span className="text-white/60 text-sm">{participant.team_name}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/60 text-sm">{participant.student_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center - Status & Timer */}
          <div className="flex items-center gap-6">
            {/* Editing Status */}
            {isEditable ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1.5 px-3 py-1.5">
                <Unlock className="w-4 h-4" />
                Qorista Furan
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1.5 px-3 py-1.5">
                <Lock className="w-4 h-4" />
                Qorista Xiran
              </Badge>
            )}

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-mono text-2xl font-bold
              ${timeRemaining < 60 ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/10 text-white"}`}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <span className="text-yellow-400">Saving...</span>
              ) : lastSaved ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved
                </span>
              ) : null}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Instructions Banner */}
      {challenge?.instructions && (
        <div className="flex-shrink-0 bg-blue-500/10 border-b border-blue-500/20 px-4 py-3">
          <p className="text-blue-300 text-sm">
            <strong>Tilmaamaha:</strong> {challenge.instructions}
          </p>
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="w-1/2 flex flex-col border-r border-white/10">
          {/* Editor Tabs */}
          <div className="flex-shrink-0 flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("html")}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors
                ${activeTab === "html" ? "bg-orange-500/10 text-orange-400 border-b-2 border-orange-400" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            >
              <FileCode className="w-4 h-4" />
              HTML
            </button>
            <button
              onClick={() => setActiveTab("css")}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors
                ${activeTab === "css" ? "bg-blue-500/10 text-blue-400 border-b-2 border-blue-400" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            >
              <Palette className="w-4 h-4" />
              CSS
            </button>
          </div>

          {/* Code Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={activeTab === "html" ? htmlCode : cssCode}
              onChange={(e) => (activeTab === "html" ? setHtmlCode(e.target.value) : setCssCode(e.target.value))}
              onKeyDown={handleKeyDown}
              disabled={!isEditable}
              placeholder={
                activeTab === "html"
                  ? "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>"
                  : "/* CSS Styles */\nbody {\n  font-family: Arial, sans-serif;\n  background: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}"
              }
              className={`w-full h-full p-4 bg-[#0d1117] text-white/90 font-mono text-sm resize-none focus:outline-none
                ${!isEditable ? "opacity-60 cursor-not-allowed" : ""}
                placeholder:text-white/20`}
              style={{ lineHeight: 1.6 }}
              spellCheck={false}
            />

            {/* Line Numbers Overlay Effect */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0d1117] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Live Preview */}
        <div className="w-1/2 flex flex-col">
          {/* Preview Header */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <Eye className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">Live Preview</span>
            <span className="text-white/40 text-sm ml-auto">Auto-updates as you type</span>
          </div>

          {/* Preview Frame */}
          <div className="flex-1 bg-white">
            <iframe
              srcDoc={generatePreview()}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title="Preview"
            />
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="flex-shrink-0 border-t border-white/10 bg-black/50 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-white/50">
            <span>HTML: {htmlCode.length} chars</span>
            <span>CSS: {cssCode.length} chars</span>
          </div>
          <div className="flex items-center gap-4 text-white/50">
            <span>Press Tab for indent</span>
            <span>Auto-save enabled</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
