"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Trophy,
  Users,
  Code,
  Eye,
  Shield,
  Crown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface TeamSubmission {
  team_id: number
  team_name: string
  team_color: string
  participants: {
    id: number
    student_name: string
    html_code: string
    css_code: string
    focus_violations: number
    is_locked: boolean
    submitted_at: string
  }[]
}

export default function ChallengeResultsPage() {
  const params = useParams()
  const router = useRouter()
  const challengeId = params.id as string
  const { toast } = useToast()

  const [challenge, setChallenge] = useState<any>(null)
  const [teams, setTeams] = useState<TeamSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [fullscreenPreview, setFullscreenPreview] = useState<number | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      const [challengeRes, teamsRes] = await Promise.all([
        fetch(`/api/live-coding/challenges/${challengeId}`),
        fetch(`/api/live-coding/challenges/${challengeId}/results`),
      ])

      const challengeData = await challengeRes.json()
      const teamsData = await teamsRes.json()

      setChallenge(challengeData)
      setTeams(Array.isArray(teamsData) ? teamsData : [])

      if (teamsData.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsData[0].team_name)
      }
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }, [challengeId, selectedTeam])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const generatePreview = (html: string, css: string) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}
  </style>
</head>
<body>${html}</body>
</html>`
  }

  const getTeamIcon = (index: number) => {
    return index === 0 ? Shield : Crown
  }

  const getTeamGradient = (color: string) => {
    if (color === "#3b82f6") return "from-blue-500/20 via-blue-600/10 to-transparent"
    if (color === "#ef4444") return "from-red-500/20 via-red-600/10 to-transparent"
    return "from-purple-500/20 via-purple-600/10 to-transparent"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border-4 border-[#e63946] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white/60">Natiijada soo dejinaya...</p>
        </div>
      </div>
    )
  }

  const currentTeam = teams.find((t) => t.team_name === selectedTeam)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f]">
      {/* Fullscreen Preview Modal */}
      {fullscreenPreview !== null && currentTeam && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentTeam.team_color }} />
              <h2 className="text-white font-bold">{currentTeam.team_name} - Preview</h2>
            </div>
            <Button variant="ghost" onClick={() => setFullscreenPreview(null)} className="text-white hover:bg-white/10">
              <Minimize2 className="w-5 h-5 mr-2" />
              Ka bax
            </Button>
          </div>
          <div className="flex-1 p-4">
            <iframe
              srcDoc={generatePreview(
                currentTeam.participants[0]?.html_code || "",
                currentTeam.participants[0]?.css_code || "",
              )}
              className="w-full h-full bg-white rounded-xl shadow-2xl"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
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
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h1 className="text-2xl font-bold text-white">{challenge?.title}</h1>
                </div>
                <p className="text-white/50 mt-1">Natiijada Challenge-ka</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Dhammaaday
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Teams Stats Overview */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {teams.map((team, index) => {
            const TeamIcon = getTeamIcon(index)
            const violations = team.participants.reduce((sum, p) => sum + (p.focus_violations || 0), 0)
            const disqualified = team.participants.filter((p) => p.is_locked).length

            return (
              <Card
                key={team.team_id}
                className={`relative overflow-hidden bg-gradient-to-br ${getTeamGradient(team.team_color)} border-white/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  selectedTeam === team.team_name ? "ring-2 ring-white/30" : ""
                }`}
                onClick={() => setSelectedTeam(team.team_name)}
              >
                {/* Background Icon */}
                <div className="absolute -right-8 -top-8 opacity-10">
                  <TeamIcon className="w-40 h-40" style={{ color: team.team_color }} />
                </div>

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: team.team_color + "30" }}
                        >
                          <TeamIcon className="w-6 h-6" style={{ color: team.team_color }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{team.team_name}</h3>
                          <p className="text-white/50 text-sm">{team.participants.length} xubnood</p>
                        </div>
                      </div>
                    </div>

                    {selectedTeam === team.team_name && (
                      <Badge className="bg-white/20 text-white">
                        <Eye className="w-3 h-3 mr-1" />
                        La doortay
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-black/30 rounded-lg p-3 text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 text-white/60" />
                      <p className="text-2xl font-bold text-white">{team.participants.length}</p>
                      <p className="text-xs text-white/50">Xubnood</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 text-center">
                      <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                      <p className="text-2xl font-bold text-white">{violations}</p>
                      <p className="text-xs text-white/50">Violations</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 text-center">
                      <Code className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                      <p className="text-2xl font-bold text-white">{team.participants.length - disqualified}</p>
                      <p className="text-xs text-white/50">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Team Preview Section */}
        {currentTeam && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: currentTeam.team_color + "30" }}
                >
                  <Code className="w-5 h-5" style={{ color: currentTeam.team_color }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{currentTeam.team_name} - Code & Preview</h2>
                  <p className="text-white/50 text-sm">Eeg code-ka iyo preview-ga team-kan</p>
                </div>
              </div>

              <Button
                onClick={() => setFullscreenPreview(currentTeam.team_id)}
                className="bg-white/10 text-white hover:bg-white/20"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen Preview
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Code Section */}
              <div className="space-y-4">
                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="bg-white/5 border border-white/10 p-1">
                    <TabsTrigger
                      value="html"
                      className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      HTML
                    </TabsTrigger>
                    <TabsTrigger
                      value="css"
                      className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      CSS
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="html">
                    <Card className="bg-[#1a1a2e] border-white/10">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/30">
                          <span className="text-orange-400 text-sm font-medium">index.html</span>
                          <Badge variant="outline" className="text-white/50 border-white/20 text-xs">
                            {(currentTeam.participants[0]?.html_code || "").length} chars
                          </Badge>
                        </div>
                        <pre className="p-4 text-sm text-white/90 font-mono overflow-auto max-h-[400px] whitespace-pre-wrap">
                          <code>{currentTeam.participants[0]?.html_code || "<!-- Wax lama qorin -->"}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="css">
                    <Card className="bg-[#1a1a2e] border-white/10">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/30">
                          <span className="text-blue-400 text-sm font-medium">styles.css</span>
                          <Badge variant="outline" className="text-white/50 border-white/20 text-xs">
                            {(currentTeam.participants[0]?.css_code || "").length} chars
                          </Badge>
                        </div>
                        <pre className="p-4 text-sm text-white/90 font-mono overflow-auto max-h-[400px] whitespace-pre-wrap">
                          <code>{currentTeam.participants[0]?.css_code || "/* Wax lama qorin */"}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Team Members */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {currentTeam.participants.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          p.is_locked ? "bg-red-500/10 border border-red-500/20" : "bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: currentTeam.team_color }}
                          >
                            {p.student_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{p.student_name}</p>
                            {p.submitted_at && (
                              <p className="text-white/40 text-xs">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(p.submitted_at).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {p.focus_violations > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {p.focus_violations} violations
                            </Badge>
                          )}
                          {p.is_locked ? (
                            <Badge className="bg-red-500/20 text-red-400 text-xs">Disqualified</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Preview Section */}
              <div>
                <Card className="bg-[#1e1e2e] border-white/10 overflow-hidden h-full">
                  {/* Browser Chrome */}
                  <div className="bg-[#2d2d3d] px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 bg-[#1a1a2e] rounded-lg px-4 py-1.5 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-white/40" />
                        <span className="text-white/60 text-sm">
                          {currentTeam.team_name.toLowerCase().replace(" ", "-")}.preview
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="h-[500px]">
                    <iframe
                      srcDoc={generatePreview(
                        currentTeam.participants[0]?.html_code || "",
                        currentTeam.participants[0]?.css_code || "",
                      )}
                      className="w-full h-full bg-white"
                      sandbox="allow-scripts"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {teams.length === 0 && (
          <Card className="bg-white/5 border-white/10 border-dashed">
            <CardContent className="py-16 text-center">
              <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Natiijo ma jirto</h3>
              <p className="text-white/50">Challenge-kan wali lama dhamaysan ama teams-ka ma qorin code</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
