"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Clock, Code, Eye, Play, Pause, Square, Activity, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Participant {
  id: number
  student_id: string
  student_name: string
  team_name: string
  team_color: string
  is_active: boolean
  last_active_at: string
  html_code: string
  css_code: string
}

export default function ChallengeMonitorPage() {
  const params = useParams()
  const router = useRouter()
  const challengeId = params.id as string
  const { toast } = useToast()

  const [challenge, setChallenge] = useState<any>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [challengeRes, participantsRes] = await Promise.all([
        fetch(`/api/live-coding/challenges/${challengeId}`),
        fetch(`/api/live-coding/challenges/${challengeId}/participants?includeCode=true`),
      ])

      const challengeData = await challengeRes.json()
      const participantsData = await participantsRes.json()

      setChallenge(challengeData)
      setParticipants(Array.isArray(participantsData) ? participantsData : [])

      // Calculate remaining time
      if (challengeData.started_at && challengeData.status === "active") {
        const startTime = new Date(challengeData.started_at).getTime()
        const duration = challengeData.duration_minutes * 60 * 1000
        const endTime = startTime + duration
        const remaining = Math.max(0, endTime - Date.now())
        setTimeRemaining(Math.floor(remaining / 1000))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [challengeId])

  useEffect(() => {
    fetchData()
    // Poll every 3 seconds for updates
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    // Countdown timer
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining((t) => Math.max(0, t - 1)), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining])

  const controlChallenge = async (action: string) => {
    try {
      const res = await fetch(`/api/live-coding/challenges/${challengeId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        fetchData()
        toast({
          title: "Guul!",
          description: `Challenge ${action === "pause" ? "waa la joojiyay" : action === "resume" ? "waa la sii waday" : "waa la dhamaystiray"}`,
        })
      }
    } catch (error) {
      toast({ title: "Khalad", variant: "destructive" })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const generatePreview = (html: string, css: string) => {
    return `<!DOCTYPE html>
<html>
<head>
  <style>${css}</style>
</head>
<body>${html}</body>
</html>`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#e63946] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/live-coding")}
                className="text-white/60 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{challenge?.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {challenge?.editing_enabled ? (
                    <Badge className="bg-green-500 text-white animate-pulse">
                      <Activity className="w-3 h-3 mr-1" />
                      Qorista Furan
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500 text-white">Qorista Xiran</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Timer & Controls */}
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div
                className={`px-6 py-3 rounded-xl ${timeRemaining < 60 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"} font-mono text-2xl font-bold`}
              >
                <Clock className="w-5 h-5 inline mr-2" />
                {formatTime(timeRemaining)}
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2">
                {challenge?.editing_enabled ? (
                  <Button
                    onClick={() => controlChallenge("pause")}
                    className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Jooji
                  </Button>
                ) : (
                  <Button
                    onClick={() => controlChallenge("resume")}
                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Sii Wad
                  </Button>
                )}
                <Button
                  onClick={() => controlChallenge("end")}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Dhamee
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Participants List */}
          <div className="col-span-4">
            <Card className="bg-white/5 border-white/10 sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Ardayda ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-2">
                {participants.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedParticipant(p)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedParticipant?.id === p.id
                        ? "bg-[#e63946]/20 border border-[#e63946]/50"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.team_color }} />
                        <div>
                          <p className="text-white font-medium text-sm">{p.student_name}</p>
                          <p className="text-white/50 text-xs">{p.team_name}</p>
                        </div>
                      </div>
                      {p.is_active ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-white/30" />
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Code Preview */}
          <div className="col-span-8">
            {selectedParticipant ? (
              <div className="space-y-4">
                {/* Student Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedParticipant.team_color }} />
                    <h2 className="text-xl font-bold text-white">{selectedParticipant.student_name}</h2>
                    <Badge variant="outline" className="border-white/20 text-white/60">
                      {selectedParticipant.team_name}
                    </Badge>
                  </div>
                </div>

                {/* Code Panels */}
                <div className="grid grid-cols-2 gap-4">
                  {/* HTML */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="py-3 border-b border-white/10">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Code className="w-4 h-4 text-orange-400" />
                        HTML
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <pre className="p-4 text-sm text-white/80 font-mono overflow-auto max-h-[250px]">
                        {selectedParticipant.html_code || "<p>Wali ma qorin...</p>"}
                      </pre>
                    </CardContent>
                  </Card>

                  {/* CSS */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="py-3 border-b border-white/10">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-400" />
                        CSS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <pre className="p-4 text-sm text-white/80 font-mono overflow-auto max-h-[250px]">
                        {selectedParticipant.css_code || "/* Wali ma qorin... */"}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                {/* Live Preview */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="py-3 border-b border-white/10">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-400" />
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <iframe
                      srcDoc={generatePreview(selectedParticipant.html_code || "", selectedParticipant.css_code || "")}
                      className="w-full h-[300px] bg-white rounded-b-lg"
                      sandbox="allow-scripts"
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10 border-dashed h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Dooro arday si aad u aragto code-kiisa</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
