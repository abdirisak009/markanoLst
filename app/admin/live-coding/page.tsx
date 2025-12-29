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
  Code2,
  Eye,
  Link2,
  Copy,
  Check,
  Edit,
  Monitor,
  Timer,
  Minus,
  Settings,
  Trash2,
  RotateCcw,
  FileText,
  Sparkles,
  Rocket,
  Target,
  Award,
  Zap,
  Type,
  ListChecks,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [timeDialogOpen, setTimeDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [timeAdjustment, setTimeAdjustment] = useState(5)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [challengeToStart, setChallengeToStart] = useState<any>(null)
  const [startDuration, setStartDuration] = useState(15)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    duration_minutes: 5,
  })

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    duration_minutes: 5,
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
        setFormData({ title: "", description: "", instructions: "", duration_minutes: 5 })
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
          reset: "Challenge waa dib loo bilaabay",
        }
        toast({ title: "Guul!", description: actionMessages[action] })
        fetchChallenges()
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Action ma la fulin karin", variant: "destructive" })
    }
  }

  const adjustTime = async (challengeId: number, minutes: number) => {
    try {
      const res = await fetch(`/api/live-coding/challenges/${challengeId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adjust_time", minutes }),
      })

      if (res.ok) {
        toast({
          title: "Guul!",
          description:
            minutes > 0 ? `${minutes} daqiiqo ayaa lagu daray` : `${Math.abs(minutes)} daqiiqo ayaa laga jaray`,
        })
        setTimeDialogOpen(false)
        fetchChallenges()
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Waqtiga ma la bedeli karin", variant: "destructive" })
    }
  }

  const updateChallenge = async () => {
    if (!selectedChallenge) return

    try {
      const res = await fetch(`/api/live-coding/challenges/${selectedChallenge.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })

      if (res.ok) {
        toast({ title: "Guul!", description: "Challenge waa la cusbooneysiiyay" })
        setEditDialogOpen(false)
        setSelectedChallenge(null)
        fetchChallenges()
      } else {
        const error = await res.json()
        toast({ title: "Khalad", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Challenge ma la cusbooneysiinyn karin", variant: "destructive" })
    }
  }

  const deleteChallenge = async () => {
    if (!selectedChallenge) return

    try {
      const res = await fetch(`/api/live-coding/challenges/${selectedChallenge.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({ title: "Guul!", description: "Challenge waa la tirtiray" })
        setDeleteDialogOpen(false)
        setSelectedChallenge(null)
        fetchChallenges()
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Challenge ma la tirtiri karin", variant: "destructive" })
    }
  }

  const openEditDialog = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setEditFormData({
      title: challenge.title,
      description: challenge.description || "",
      instructions: challenge.instructions || "",
      duration_minutes: challenge.duration_minutes,
    })
    setEditDialogOpen(true)
  }

  const openTimeDialog = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setTimeAdjustment(5)
    setTimeDialogOpen(true)
  }

  const openDeleteDialog = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setDeleteDialogOpen(true)
  }

  const openStartDialog = (challenge: any) => {
    setChallengeToStart(challenge)
    setStartDuration(challenge.duration_minutes || 15)
    setShowStartDialog(true)
  }

  const startChallengeWithDuration = async () => {
    if (!challengeToStart) return

    try {
      // First update duration if changed
      if (startDuration !== challengeToStart.duration_minutes) {
        await fetch(`/api/live-coding/challenges/${challengeToStart.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration_minutes: startDuration }),
        })
      }

      // Then start the challenge
      const res = await fetch(`/api/live-coding/challenges/${challengeToStart.id}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      })

      if (res.ok) {
        toast({ title: "Guul!", description: `Challenge waa la bilaabay - ${startDuration} daqiiqo` })
        fetchChallenges()
        setShowStartDialog(false)
        setChallengeToStart(null)
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Challenge ma la bilaabi karin", variant: "destructive" })
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
              <Button className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:opacity-90 text-white gap-2 shadow-lg shadow-[#e63946]/20">
                <Plus className="w-5 h-5" />
                Challenge Cusub
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-b from-[#0f1419] to-[#0a0a0f] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Header with animated background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#e63946]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#ff6b6b]/10 rounded-full blur-3xl" />
              </div>

              <DialogHeader className="relative">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#e63946]/30">
                    <Rocket className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      Samee Challenge Cusub
                    </DialogTitle>
                    <p className="text-white/50 text-sm mt-1">Ku abuuro tartanka cusub ee coding-ka</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-6 relative">
                {/* Title Input - Premium Design */}
                <div className="group">
                  <Label className="text-white/80 flex items-center gap-2 mb-3 text-sm font-medium">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Type className="w-4 h-4 text-blue-400" />
                    </div>
                    Cinwaanka Challenge-ka
                    <span className="text-[#e63946]">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="tusaale: HTML Portfolio Challenge"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 pl-4 pr-4 text-base rounded-xl focus:border-[#e63946]/50 focus:ring-2 focus:ring-[#e63946]/20 transition-all"
                    />
                    {formData.title && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Input */}
                <div className="group">
                  <Label className="text-white/80 flex items-center gap-2 mb-3 text-sm font-medium">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    Faahfaahinta
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Sharax waxa challenge-ku yahay iyo ujeedadiisa..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px] rounded-xl focus:border-[#e63946]/50 focus:ring-2 focus:ring-[#e63946]/20 transition-all resize-none"
                  />
                  <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Sharaxaad kooban oo ardayda u cad
                  </p>
                </div>

                {/* Instructions Input */}
                <div className="group">
                  <Label className="text-white/80 flex items-center gap-2 mb-3 text-sm font-medium">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <ListChecks className="w-4 h-4 text-amber-400" />
                    </div>
                    Tilmaamaha (Instructions)
                    <span className="text-[#e63946]">*</span>
                  </Label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="1. Samee structure HTML-ka\n2. Ku dar CSS styling\n3. Hubi responsive design..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[150px] rounded-xl focus:border-[#e63946]/50 focus:ring-2 focus:ring-[#e63946]/20 transition-all resize-none font-mono text-sm"
                  />
                  <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Tilmaamaha waxaa lagu muujin doonaa ardayda inta lagu jiro challenge-ka
                  </p>
                </div>

                {/* Duration Selection - Premium Cards */}
                <div className="group">
                  <Label className="text-white/80 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#e63946]" />
                    Muddada Challenge-ka (Daqiiqo)
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                    {[5, 10, 15, 20, 25, 30, 45, 60, 75, 90, 105, 120, 150, 180].map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => setFormData({ ...formData, duration_minutes: minutes })}
                        className={`relative p-2.5 rounded-xl border-2 transition-all duration-200 ${
                          formData.duration_minutes === minutes
                            ? "border-[#e63946] bg-[#e63946]/10 shadow-lg shadow-[#e63946]/20"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        {formData.duration_minutes === minutes && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e63946] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <div
                          className={`text-center ${formData.duration_minutes === minutes ? "text-white" : "text-white/60"}`}
                        >
                          <div className="font-bold text-base">
                            {minutes >= 60
                              ? `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? minutes % 60 : ""}`
                              : minutes}
                          </div>
                          <div className="text-[10px] opacity-70">{minutes >= 60 ? "" : "daq"}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Card */}
                <div className="bg-gradient-to-r from-[#e63946]/10 to-[#ff6b6b]/10 border border-[#e63946]/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-5 h-5 text-[#e63946]" />
                    <span className="text-white/80 font-medium">Preview</span>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4">
                    <h4 className="font-bold text-white mb-1">{formData.title || "Cinwaanka Challenge-ka"}</h4>
                    <p className="text-white/50 text-sm mb-2">{formData.description || "Faahfaahinta..."}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formData.duration_minutes} daqiiqo
                      </span>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">2 Teams</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="border-white/10 text-white hover:bg-white/5 flex-1 h-12 rounded-xl"
                >
                  Ka noqo
                </Button>
                <Button
                  onClick={createChallenge}
                  disabled={!formData.title || !formData.instructions}
                  className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white flex-1 h-12 rounded-xl shadow-lg shadow-[#e63946]/30 hover:shadow-[#e63946]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  Samee Challenge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Wadarta Challenges", value: challenges.length, icon: Code2, color: "from-blue-500 to-blue-600" },
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

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(challenge)}
                        className="text-white/40 hover:text-white hover:bg-white/10 h-8 w-8"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openDeleteDialog(challenge)}
                        className="text-white/40 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {challenge.status === "draft" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => openStartDialog(challenge)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 gap-2 shadow-lg shadow-green-500/20"
                        >
                          <Zap className="w-4 h-4" />
                          Bilow Challenge
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
                          onClick={() => openTimeDialog(challenge)}
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 gap-1"
                        >
                          <Timer className="w-4 h-4" />
                          Waqtiga
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
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => (window.location.href = `/admin/live-coding/${challenge.id}/results`)}
                          className="border-white/10 text-white hover:bg-white/5 gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Natiijada
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateChallengeStatus(challenge.id, "reset")}
                          className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 gap-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Dib u Bilow
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#0f1419] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Settings className="w-6 h-6 text-[#e63946]" />
              Wax ka Bedel Challenge-ka
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-white/80">Cinwaanka Challenge-ka</Label>
              <Input
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="tusaale: HTML Portfolio Challenge"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Faahfaahinta</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Sharax waxa challenge-ku yahay..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Tilmaamaha (Instructions)</Label>
              <Textarea
                value={editFormData.instructions}
                onChange={(e) => setEditFormData({ ...editFormData, instructions: e.target.value })}
                placeholder="Tilmaamaha ardaydu ay raaci doonaan..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Muddada (Daqiiqadaha)</Label>
              <Select
                value={editFormData.duration_minutes.toString()}
                onValueChange={(v) => setEditFormData({ ...editFormData, duration_minutes: Number.parseInt(v) })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 25, 30, 45, 60, 75, 90, 105, 120, 150, 180].map((minutes) => (
                    <SelectItem key={minutes} value={minutes.toString()}>
                      {minutes} daqiiqo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Ka noqo
            </Button>
            <Button onClick={updateChallenge} className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white">
              Keydi Isbedelada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent className="bg-[#0f1419] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Timer className="w-6 h-6 text-blue-400" />
              Waqtiga Bedel
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Ku dar ama ka jar daqiiqado challenge-ka waqtigiisa
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => selectedChallenge && adjustTime(selectedChallenge.id, -timeAdjustment)}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 h-16 w-16"
              >
                <Minus className="w-8 h-8" />
              </Button>

              <div className="text-center">
                <Input
                  type="number"
                  value={timeAdjustment}
                  onChange={(e) => setTimeAdjustment(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="bg-white/5 border-white/10 text-white text-center text-3xl font-bold w-24 h-16"
                  min={1}
                />
                <p className="text-white/60 text-sm mt-2">daqiiqo</p>
              </div>

              <Button
                size="lg"
                onClick={() => selectedChallenge && adjustTime(selectedChallenge.id, timeAdjustment)}
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 h-16 w-16"
              >
                <Plus className="w-8 h-8" />
              </Button>
            </div>

            {/* Quick adjustment buttons */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[1, 5, 10, 15, 30].map((mins) => (
                <Button
                  key={mins}
                  size="sm"
                  variant="outline"
                  onClick={() => setTimeAdjustment(mins)}
                  className={`border-white/10 ${timeAdjustment === mins ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                >
                  {mins} daq
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTimeDialogOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Xir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0f1419] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3 text-red-400">
              <Trash2 className="w-6 h-6" />
              Tirtir Challenge-ka
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Ma hubtaa inaad rabto inaad tirtirto &quot;{selectedChallenge?.title}&quot;? Tani waxay tirtiri doontaa
              dhammaan teams-ka, ardayda, iyo submissions-ka.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Ka noqo
            </Button>
            <Button onClick={deleteChallenge} className="bg-red-500 hover:bg-red-600 text-white">
              Haa, Tirtir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Bilow Challenge</DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Dooro inta daqiiqo aad rabto challenge-ka
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Challenge Info */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Challenge</p>
              <p className="text-lg font-semibold text-white">{challengeToStart?.title}</p>
            </div>

            {/* Duration Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Timer className="w-4 h-4 text-green-400" />
                Waqtiga Challenge-ka
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20, 25, 30, 45, 60, 75, 90, 105, 120, 150, 180].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setStartDuration(mins)}
                    className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                      startDuration === mins
                        ? "border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <span className={`text-lg font-bold ${startDuration === mins ? "text-green-400" : "text-white"}`}>
                      {mins}
                    </span>
                    <span className={`text-xs block ${startDuration === mins ? "text-green-400/70" : "text-gray-500"}`}>
                      daq
                    </span>
                    {startDuration === mins && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Preview */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Waqtiga la doortay</p>
                    <p className="text-2xl font-bold text-green-400">{startDuration} daqiiqo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Timer</p>
                  <p className="text-xl font-mono text-white">
                    {String(Math.floor(startDuration)).padStart(2, "0")}:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStartDialog(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Ka noqo
            </Button>
            <Button
              onClick={startChallengeWithDuration}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 gap-2 shadow-lg shadow-green-500/20"
            >
              <Zap className="w-4 h-4" />
              Bilow Hadda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
