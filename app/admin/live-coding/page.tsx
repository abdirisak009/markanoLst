"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Play,
  Pause,
  Square,
  Users,
  Clock,
  Code,
  Eye,
  Link2,
  Copy,
  Check,
  Edit,
  Monitor,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  ended_at: string | null
  access_code: string
  created_at: string
  teams_count: number
  participants_count: number
}

export default function LiveCodingAdminPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    duration_minutes: 30,
  })

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const res = await fetch("/api/live-coding/challenges")
      const data = await res.json()
      if (Array.isArray(data)) {
        setChallenges(data)
      }
    } catch (error) {
      console.error("Error fetching challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const createChallenge = async () => {
    try {
      const res = await fetch("/api/live-coding/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({ title: "Guul!", description: "Challenge cusub la sameeyay" })
        setCreateDialogOpen(false)
        setFormData({ title: "", description: "", instructions: "", duration_minutes: 30 })
        fetchChallenges()
      } else {
        const error = await res.json()
        toast({ title: "Khalad", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Challenge ma la samayn karin", variant: "destructive" })
    }
  }

  const updateChallengeStatus = async (challengeId: number, action: string) => {
    try {
      const res = await fetch(`/api/live-coding/challenges/${challengeId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        const actionMessages: Record<string, string> = {
          start: "Challenge waa la bilaabay",
          pause: "Challenge waa la joojiyay",
          resume: "Challenge waa la sii waday",
          end: "Challenge waa la dhamaystiray",
        }
        toast({ title: "Guul!", description: actionMessages[action] })
        fetchChallenges()
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Action ma la fulin karin", variant: "destructive" })
    }
  }

  const copyAccessLink = (accessCode: string) => {
    const link = `${window.location.origin}/live-coding/${accessCode}`
    navigator.clipboard.writeText(link)
    setCopiedCode(accessCode)
    toast({ title: "La koobiyay!", description: "Link-ka waa la koobiyay clipboard-ka" })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getStatusBadge = (status: string, editingEnabled: boolean) => {
    if (status === "active" && editingEnabled) {
      return <Badge className="bg-green-500 text-white animate-pulse">Live - Qorista Furan</Badge>
    }
    if (status === "active" && !editingEnabled) {
      return <Badge className="bg-yellow-500 text-white">Live - Xiran</Badge>
    }
    if (status === "paused") {
      return <Badge className="bg-orange-500 text-white">Hakad</Badge>
    }
    if (status === "completed") {
      return <Badge className="bg-slate-500 text-white">Dhammaatay</Badge>
    }
    return <Badge className="bg-slate-700 text-white">Draft</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-[#e63946] border-t-transparent animate-spin" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e63946]/10 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] shadow-lg shadow-[#e63946]/25">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Live Coding Challenges</h1>
              <p className="text-white/60">Maaree tartamayada qoraalka tooska ah</p>
            </div>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:opacity-90 text-white gap-2">
                <Plus className="w-5 h-5" />
                Challenge Cusub
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1419] border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-3">
                  <Zap className="w-6 h-6 text-[#e63946]" />
                  Samee Challenge Cusub
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Cinwaanka Challenge-ka</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="tusaale: HTML Portfolio Challenge"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">Faahfaahinta</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Sharax waxa challenge-ku yahay..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">Tilmaamaha (Instructions)</Label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Tilmaamaha ardaydu ay raaci doonaan..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">Muddada (Daqiiqadaha)</Label>
                  <Select
                    value={formData.duration_minutes.toString()}
                    onValueChange={(v) => setFormData({ ...formData, duration_minutes: Number.parseInt(v) })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="15" className="text-white">
                        15 daqiiqo
                      </SelectItem>
                      <SelectItem value="30" className="text-white">
                        30 daqiiqo
                      </SelectItem>
                      <SelectItem value="45" className="text-white">
                        45 daqiiqo
                      </SelectItem>
                      <SelectItem value="60" className="text-white">
                        1 saac
                      </SelectItem>
                      <SelectItem value="90" className="text-white">
                        1.5 saac
                      </SelectItem>
                      <SelectItem value="120" className="text-white">
                        2 saac
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  Ka noqo
                </Button>
                <Button onClick={createChallenge} className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white">
                  Samee Challenge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Wadarta Challenges", value: challenges.length, icon: Code, color: "from-blue-500 to-blue-600" },
            {
              label: "Hadda Socda",
              value: challenges.filter((c) => c.status === "active").length,
              icon: Play,
              color: "from-green-500 to-green-600",
            },
            {
              label: "Dhammaatay",
              value: challenges.filter((c) => c.status === "completed").length,
              icon: Check,
              color: "from-slate-500 to-slate-600",
            },
            {
              label: "Draft",
              value: challenges.filter((c) => c.status === "draft").length,
              icon: Edit,
              color: "from-orange-500 to-orange-600",
            },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Challenges Grid */}
        {challenges.length === 0 ? (
          <Card className="bg-white/5 border-white/10 border-dashed">
            <CardContent className="py-16 text-center">
              <Code className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Wali ma jiraan Challenges</h3>
              <p className="text-white/60 mb-6">Samee challenge-kaaga koowaad si aad u bilowdo</p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white gap-2"
              >
                <Plus className="w-5 h-5" />
                Samee Challenge
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-all group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-xl mb-2">{challenge.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(challenge.status, challenge.editing_enabled)}
                        <Badge variant="outline" className="border-white/20 text-white/70">
                          <Clock className="w-3 h-3 mr-1" />
                          {challenge.duration_minutes} daq
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {challenge.description && (
                    <p className="text-white/60 text-sm line-clamp-2">{challenge.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <Users className="w-4 h-4" />
                      <span>{challenge.teams_count || 0} Teams</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Users className="w-4 h-4" />
                      <span>{challenge.participants_count || 0} Ardayda</span>
                    </div>
                  </div>

                  {/* Access Link */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                    <Link2 className="w-4 h-4 text-white/40" />
                    <code className="text-sm text-white/70 flex-1 truncate">/live-coding/{challenge.access_code}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyAccessLink(challenge.access_code)}
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      {copiedCode === challenge.access_code ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {challenge.status === "draft" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateChallengeStatus(challenge.id, "start")}
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 gap-1"
                        >
                          <Play className="w-4 h-4" />
                          Bilow
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => (window.location.href = `/admin/live-coding/${challenge.id}/teams`)}
                          className="border-white/10 text-white hover:bg-white/5 gap-1"
                        >
                          <Users className="w-4 h-4" />
                          Teams
                        </Button>
                      </>
                    )}

                    {challenge.status === "active" && (
                      <>
                        {challenge.editing_enabled ? (
                          <Button
                            size="sm"
                            onClick={() => updateChallengeStatus(challenge.id, "pause")}
                            className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 gap-1"
                          >
                            <Pause className="w-4 h-4" />
                            Jooji
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => updateChallengeStatus(challenge.id, "resume")}
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30 gap-1"
                          >
                            <Play className="w-4 h-4" />
                            Sii Wad
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => updateChallengeStatus(challenge.id, "end")}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 gap-1"
                        >
                          <Square className="w-4 h-4" />
                          Dhamee
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => (window.location.href = `/admin/live-coding/${challenge.id}/monitor`)}
                          className="border-white/10 text-white hover:bg-white/5 gap-1"
                        >
                          <Monitor className="w-4 h-4" />
                          Monitor
                        </Button>
                      </>
                    )}

                    {challenge.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => (window.location.href = `/admin/live-coding/${challenge.id}/results`)}
                        className="border-white/10 text-white hover:bg-white/5 gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Natiijada
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
