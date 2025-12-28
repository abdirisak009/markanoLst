"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  UserPlus,
  Shuffle,
  Search,
  Check,
  Crown,
  Sparkles,
  Shield,
  UserCheck,
  X,
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface Team {
  id: number
  name: string
  color: string
  participants: Participant[]
}

interface Participant {
  id: number
  student_id: string
  student_name: string
  student_type: string
}

interface Student {
  student_id: string
  full_name: string
  type: string
}

export default function TeamsManagementPage() {
  const params = useParams()
  const router = useRouter()
  const challengeId = params.id as string
  const { toast } = useToast()

  const [challenge, setChallenge] = useState<any>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [challengeId])

  const fetchData = async () => {
    try {
      const [challengeRes, teamsRes, studentsRes] = await Promise.all([
        fetch(`/api/live-coding/challenges/${challengeId}`),
        fetch(`/api/live-coding/challenges/${challengeId}/teams`),
        fetch("/api/students/all"),
      ])

      const challengeData = await challengeRes.json()
      const teamsData = await teamsRes.json()
      const studentsData = await studentsRes.json()

      setChallenge(challengeData)
      setTeams(Array.isArray(teamsData) ? teamsData : [])
      setAvailableStudents(Array.isArray(studentsData) ? studentsData : [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultTeams = async () => {
    try {
      const res = await fetch(`/api/live-coding/challenges/${challengeId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createDefault: true }),
      })

      if (res.ok) {
        toast({ title: "Guul!", description: "Teams A iyo B waa la sameeyay" })
        fetchData()
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Teams ma la samayn karin", variant: "destructive" })
    }
  }

  const addParticipants = async () => {
    if (!selectedTeamId || selectedStudents.length === 0) return

    try {
      const res = await fetch(`/api/live-coding/challenges/${challengeId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeamId,
          students: selectedStudents.map((id) => {
            const student = availableStudents.find((s) => s.student_id === id)
            return {
              student_id: id,
              student_name: student?.full_name || "Unknown",
              student_type: student?.type || "university",
            }
          }),
        }),
      })

      if (res.ok) {
        toast({ title: "Guul!", description: "Ardayda waa lagu daray team-ka" })
        setAddStudentDialogOpen(false)
        setSelectedStudents([])
        fetchData()
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Ardayda ma lagu dari karin", variant: "destructive" })
    }
  }

  const removeParticipant = async (participantId: number) => {
    try {
      const res = await fetch(`/api/live-coding/challenges/${challengeId}/participants/${participantId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({ title: "Guul!", description: "Ardayga waa laga saaray" })
        fetchData()
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Ardayga ma laga saari karin", variant: "destructive" })
    }
  }

  const shuffleStudents = async () => {
    try {
      const res = await fetch(`/api/live-coding/challenges/${challengeId}/shuffle`, {
        method: "POST",
      })

      if (res.ok) {
        toast({ title: "Guul!", description: "Ardayda waa la isku qasay teams-ka!" })
        fetchData()
      }
    } catch (error) {
      toast({ title: "Khalad", description: "Ma la isku qasi karin", variant: "destructive" })
    }
  }

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  const filteredStudents = availableStudents.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get already assigned student IDs
  const assignedStudentIds = teams.flatMap((t) => t.participants.map((p) => p.student_id))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-[#e63946]/20 border-t-[#e63946] animate-spin" />
          <Users className="w-8 h-8 text-[#e63946] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] p-6">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin/live-coding")}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{challenge?.title}</h1>
              <Sparkles className="w-5 h-5 text-[#e63946] animate-pulse" />
            </div>
            <p className="text-white/50">Maaree Teams-ka iyo Ardayda</p>
          </div>

          {teams.length > 0 && (
            <button
              onClick={shuffleStudents}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
            >
              <Shuffle className="w-4 h-4" />
              <span className="font-medium">Isku Qas Ardayda</span>
            </button>
          )}
        </div>

        {/* Teams Section */}
        {teams.length === 0 ? (
          <div className="relative rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-dashed border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#e63946]/5 to-transparent" />
            <div className="relative py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-[#e63946]/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Wali ma jiraan Teams</h3>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                Samee Team A iyo Team B si aad ardayda u qaybin karto challenge-ka
              </p>
              <button
                onClick={createDefaultTeams}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white font-semibold shadow-lg shadow-[#e63946]/30 hover:shadow-xl hover:shadow-[#e63946]/40 hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Samee Team A & B
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teams.map((team, index) => {
                const isTeamA = index === 0
                const teamGradient = isTeamA ? "from-blue-500/20 to-cyan-500/10" : "from-[#e63946]/20 to-orange-500/10"
                const teamBorder = isTeamA ? "border-blue-500/30" : "border-[#e63946]/30"
                const teamColor = isTeamA ? "text-blue-400" : "text-[#e63946]"
                const teamBg = isTeamA ? "bg-blue-500" : "bg-[#e63946]"

                return (
                  <div
                    key={team.id}
                    className={`relative rounded-2xl bg-gradient-to-br ${teamGradient} border ${teamBorder} overflow-hidden transition-all duration-300 hover:scale-[1.02]`}
                  >
                    {/* Team Header */}
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl ${teamBg} flex items-center justify-center shadow-lg`}>
                            {isTeamA ? (
                              <Shield className="w-7 h-7 text-white" />
                            ) : (
                              <Crown className="w-7 h-7 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{team.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="w-4 h-4 text-white/40" />
                              <span className="text-white/50 text-sm">{team.participants.length} arday</span>
                            </div>
                          </div>
                        </div>

                        <Dialog
                          open={addStudentDialogOpen && selectedTeamId === team.id}
                          onOpenChange={(open) => {
                            setAddStudentDialogOpen(open)
                            if (open) {
                              setSelectedTeamId(team.id)
                              setSelectedStudents([])
                              setSearchQuery("")
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <button
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300`}
                            >
                              <UserPlus className="w-4 h-4" />
                              <span className="font-medium">Ku dar</span>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-white/10 text-white max-w-xl p-0 overflow-hidden">
                            {/* Dialog Header */}
                            <div
                              className={`p-6 bg-gradient-to-r ${isTeamA ? "from-blue-500/20 to-cyan-500/10" : "from-[#e63946]/20 to-orange-500/10"} border-b border-white/10`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${teamBg} flex items-center justify-center`}>
                                  <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <DialogTitle className="text-xl font-bold">Ku dar Ardayda</DialogTitle>
                                  <p className="text-white/50 text-sm mt-1">{selectedTeam?.name}</p>
                                </div>
                              </div>
                            </div>

                            <div className="p-6 space-y-4">
                              {/* Search */}
                              <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="Raadi arday..."
                                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                />
                              </div>

                              {/* Selected Count */}
                              {selectedStudents.length > 0 && (
                                <div
                                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isTeamA ? "bg-blue-500/20 border-blue-500/30" : "bg-[#e63946]/20 border-[#e63946]/30"} border`}
                                >
                                  <UserCheck className={`w-5 h-5 ${teamColor}`} />
                                  <span className="text-white font-medium">
                                    {selectedStudents.length} arday la doortay
                                  </span>
                                  <button
                                    onClick={() => setSelectedStudents([])}
                                    className="ml-auto text-white/50 hover:text-white transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {/* Students List */}
                              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {filteredStudents
                                  .filter((s) => !assignedStudentIds.includes(s.student_id))
                                  .map((student, i) => {
                                    const isSelected = selectedStudents.includes(student.student_id)
                                    return (
                                      <button
                                        key={student.student_id}
                                        onClick={() => toggleStudent(student.student_id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                                          isSelected
                                            ? `${isTeamA ? "bg-blue-500/20 border-blue-500/50" : "bg-[#e63946]/20 border-[#e63946]/50"} scale-[0.98]`
                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                        }`}
                                        style={{ animationDelay: `${i * 50}ms` }}
                                      >
                                        {/* Checkbox */}
                                        <div
                                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                            isSelected
                                              ? `${teamBg} border-transparent`
                                              : "border-white/30 bg-transparent"
                                          }`}
                                        >
                                          {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                        </div>

                                        {/* Avatar */}
                                        <div
                                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                            isSelected ? `${teamBg} text-white` : "bg-white/10 text-white/60"
                                          }`}
                                        >
                                          {student.full_name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 text-left">
                                          <p
                                            className={`font-medium transition-colors ${isSelected ? "text-white" : "text-white/80"}`}
                                          >
                                            {student.full_name}
                                          </p>
                                          <p className="text-white/40 text-sm">{student.student_id}</p>
                                        </div>

                                        {/* Type Badge */}
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            student.type === "university"
                                              ? "bg-purple-500/20 text-purple-300"
                                              : "bg-emerald-500/20 text-emerald-300"
                                          }`}
                                        >
                                          {student.type === "university" ? "Jaamacad" : "Tacliinta"}
                                        </span>
                                      </button>
                                    )
                                  })}

                                {filteredStudents.filter((s) => !assignedStudentIds.includes(s.student_id)).length ===
                                  0 && (
                                  <div className="py-12 text-center">
                                    <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                                    <p className="text-white/40">Ma jiraan arday la heli karo</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Dialog Footer */}
                            <div className="p-6 border-t border-white/10 flex items-center justify-between gap-4">
                              <button
                                onClick={() => setAddStudentDialogOpen(false)}
                                className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                              >
                                Ka noqo
                              </button>
                              <button
                                onClick={addParticipants}
                                disabled={selectedStudents.length === 0}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                  selectedStudents.length > 0
                                    ? `bg-gradient-to-r ${isTeamA ? "from-blue-500 to-cyan-500" : "from-[#e63946] to-[#ff6b6b]"} text-white shadow-lg hover:shadow-xl hover:scale-105`
                                    : "bg-white/10 text-white/30 cursor-not-allowed"
                                }`}
                              >
                                <UserCheck className="w-5 h-5" />
                                Ku dar {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ""}
                              </button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="p-6">
                      {team.participants.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-white/20" />
                          </div>
                          <p className="text-white/40">Wali ma jiraan arday team-kan</p>
                          <p className="text-white/30 text-sm mt-1">Riix "Ku dar" si aad ardayda ugu darto</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {team.participants.map((participant, i) => (
                            <div
                              key={participant.id}
                              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                              style={{ animationDelay: `${i * 100}ms` }}
                            >
                              {/* Avatar with checkmark */}
                              <div className="relative">
                                <div
                                  className={`w-11 h-11 rounded-full ${teamBg} flex items-center justify-center font-bold text-white shadow-lg`}
                                >
                                  {participant.student_name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div
                                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${teamBg} flex items-center justify-center border-2 border-[#0f1419]`}
                                >
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                </div>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{participant.student_name}</p>
                                <p className="text-white/40 text-sm">{participant.student_id}</p>
                              </div>

                              {/* Type */}
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  participant.student_type === "university"
                                    ? "bg-purple-500/20 text-purple-300"
                                    : "bg-emerald-500/20 text-emerald-300"
                                }`}
                              >
                                {participant.student_type === "university" ? "Jaamacad" : "Tacliinta"}
                              </span>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeParticipant(participant.id)}
                                className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  )
}
