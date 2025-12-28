"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Plus, Trash2, UserPlus, Shuffle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

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
        <div className="w-16 h-16 rounded-full border-4 border-[#e63946] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/live-coding")}
            className="text-white/60 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{challenge?.title}</h1>
            <p className="text-white/60">Maaree Teams-ka iyo Ardayda</p>
          </div>
        </div>

        {/* Teams Section */}
        {teams.length === 0 ? (
          <Card className="bg-white/5 border-white/10 border-dashed">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Wali ma jiraan Teams</h3>
              <p className="text-white/60 mb-6">Samee Team A iyo Team B si aad ardayda u qaybin karto</p>
              <Button
                onClick={createDefaultTeams}
                className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white gap-2"
              >
                <Plus className="w-5 h-5" />
                Samee Team A & B
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mb-6">
              <Button
                variant="outline"
                onClick={shuffleStudents}
                className="border-white/10 text-white hover:bg-white/5 gap-2 bg-transparent"
              >
                <Shuffle className="w-4 h-4" />
                Isku Qas Ardayda
              </Button>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
                        {team.name}
                        <Badge variant="outline" className="border-white/20 text-white/60">
                          {team.participants.length} arday
                        </Badge>
                      </CardTitle>
                      <Dialog
                        open={addStudentDialogOpen && selectedTeamId === team.id}
                        onOpenChange={(open) => {
                          setAddStudentDialogOpen(open)
                          if (open) setSelectedTeamId(team.id)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-white/10 text-white hover:bg-white/20 gap-1">
                            <UserPlus className="w-4 h-4" />
                            Ku dar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0f1419] border-white/10 text-white max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Ku dar Ardayda {team.name}</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Raadi arday..."
                                className="pl-10 bg-white/5 border-white/10 text-white"
                              />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-2">
                              {filteredStudents
                                .filter((s) => !assignedStudentIds.includes(s.student_id))
                                .map((student) => (
                                  <label
                                    key={student.student_id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                                  >
                                    <Checkbox
                                      checked={selectedStudents.includes(student.student_id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedStudents([...selectedStudents, student.student_id])
                                        } else {
                                          setSelectedStudents(
                                            selectedStudents.filter((id) => id !== student.student_id),
                                          )
                                        }
                                      }}
                                    />
                                    <div className="flex-1">
                                      <p className="text-white font-medium">{student.full_name}</p>
                                      <p className="text-white/50 text-sm">{student.student_id}</p>
                                    </div>
                                    <Badge variant="outline" className="border-white/20 text-white/50 text-xs">
                                      {student.type}
                                    </Badge>
                                  </label>
                                ))}
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setAddStudentDialogOpen(false)}
                              className="border-white/10 text-white"
                            >
                              Ka noqo
                            </Button>
                            <Button
                              onClick={addParticipants}
                              disabled={selectedStudents.length === 0}
                              className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white"
                            >
                              Ku dar ({selectedStudents.length})
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {team.participants.length === 0 ? (
                      <p className="text-white/40 text-center py-8">Wali ma jiraan arday team-kan</p>
                    ) : (
                      <div className="space-y-2">
                        {team.participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 group"
                          >
                            <div>
                              <p className="text-white font-medium">{participant.student_name}</p>
                              <p className="text-white/50 text-sm">{participant.student_id}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeParticipant(participant.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
