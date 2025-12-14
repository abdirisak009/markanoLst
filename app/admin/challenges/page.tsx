"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trophy, Users, Clock, PlayCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Challenge {
  id: number
  title: string
  description: string
  type: string
  scope: string
  status: string
  start_date: string
  end_date: string
  max_score: number
  current_round: number
  total_rounds: number
  participant_count: number
  submission_count: number
}

interface Class {
  id: number
  name: string
  university_id: number
  university_name?: string
}

interface Group {
  id: number
  name: string
  class_name?: string
}

interface University {
  id: number
  name: string
}

export default function ChallengesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "coding",
    scope: "class",
    start_date: "",
    end_date: "",
    max_score: 100,
    total_rounds: 1,
  })
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<string>("")

  useEffect(() => {
    fetchChallenges()
    fetchClasses()
    fetchGroups()
    fetchUniversities()
  }, [])

  const fetchChallenges = async () => {
    try {
      const res = await fetch("/api/challenges")
      const data = await res.json()
      setChallenges(data.challenges || [])
    } catch (error) {
      console.error("[v0] Error fetching challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes")
      const data = await res.json()
      console.log("[v0] Classes response:", data)
      const classesArray = Array.isArray(data) ? data : data.classes || []
      console.log("[v0] Classes array:", classesArray)
      setClasses(classesArray)
    } catch (error) {
      console.error("[v0] Error fetching classes:", error)
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups")
      const data = await res.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error("[v0] Error fetching groups:", error)
    }
  }

  const fetchUniversities = async () => {
    try {
      console.log("[v0] Fetching universities...")
      const res = await fetch("/api/universities")
      const data = await res.json()
      console.log("[v0] Universities response:", data)

      if (Array.isArray(data)) {
        setUniversities(data)
        console.log("[v0] Successfully loaded universities:", data.length)
      } else {
        setUniversities(data.universities || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching universities:", error)
    }
  }

  const filteredClasses =
    selectedUniversity && selectedUniversity !== "all"
      ? classes.filter((cls) => {
          console.log(
            "[v0] Filtering class:",
            cls.name,
            "university_id:",
            cls.university_id,
            "selected:",
            selectedUniversity,
            "match:",
            String(cls.university_id) === selectedUniversity,
          )
          return String(cls.university_id) === selectedUniversity
        })
      : classes

  console.log("[v0] Selected university:", selectedUniversity)
  console.log("[v0] Total classes:", classes.length)
  console.log("[v0] Filtered classes:", filteredClasses.length)

  const handleCreateChallenge = async () => {
    if (!formData.title || selectedParticipants.length === 0) {
      toast({
        title: "Khalad",
        description: "Fadlan buuxi magaca iyo dooro participants",
        variant: "destructive",
      })
      return
    }

    try {
      const participants = selectedParticipants.map((id) => ({
        type: formData.scope,
        id,
      }))

      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          participants,
          created_by: "admin",
        }),
      })

      if (res.ok) {
        toast({
          title: "Guul!",
          description: "Challenge waa la abuuray",
        })
        setCreateModalOpen(false)
        fetchChallenges()
        setFormData({
          title: "",
          description: "",
          type: "coding",
          scope: "class",
          start_date: "",
          end_date: "",
          max_score: 100,
          total_rounds: 1,
        })
        setSelectedParticipants([])
        setSelectedUniversity("")
      }
    } catch (error) {
      console.error("[v0] Error creating challenge:", error)
      toast({
        title: "Khalad",
        description: "Challenge lama abuuri karin",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Challenges & Competitions</h1>
          <p className="text-gray-600 mt-1">Abuur challenges for students</p>
        </div>
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Abuur Challenge Cusub
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>Challenge Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Python Coding Challenge"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Sharaxaad ka bixi challenge-ga..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Scope</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value) => {
                      setFormData({ ...formData, scope: value })
                      setSelectedParticipants([])
                      setSelectedUniversity("")
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">By Class</SelectItem>
                      <SelectItem value="group">By Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.scope === "class" && (
                <div>
                  <Label>Dooro Jaamacada</Label>
                  <Select
                    value={selectedUniversity}
                    onValueChange={(value) => {
                      setSelectedUniversity(value)
                      setSelectedParticipants([])
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Doorto University..." />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={String(uni.id)}>
                          {uni.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Dooro {formData.scope === "class" ? "Classes" : "Groups"}</Label>
                <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3 space-y-2 bg-gray-50">
                  {formData.scope === "class" ? (
                    <>
                      {!selectedUniversity ? (
                        <p className="text-sm text-gray-500 text-center py-4">Fadlan dooro jaamacada marka hore</p>
                      ) : filteredClasses.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Classes ma jiraan jaamacadan</p>
                      ) : (
                        filteredClasses.map((cls) => (
                          <div key={cls.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded">
                            <Checkbox
                              id={`class-${cls.id}`}
                              checked={selectedParticipants.includes(cls.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedParticipants([...selectedParticipants, cls.id])
                                } else {
                                  setSelectedParticipants(selectedParticipants.filter((id) => id !== cls.id))
                                }
                              }}
                            />
                            <label htmlFor={`class-${cls.id}`} className="text-sm cursor-pointer flex-1">
                              {cls.name}
                            </label>
                          </div>
                        ))
                      )}
                    </>
                  ) : (
                    groups.map((group) => (
                      <div key={group.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={selectedParticipants.includes(group.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedParticipants([...selectedParticipants, group.id])
                            } else {
                              setSelectedParticipants(selectedParticipants.filter((id) => id !== group.id))
                            }
                          }}
                        />
                        <label htmlFor={`group-${group.id}`} className="text-sm cursor-pointer flex-1">
                          {group.name} {group.class_name && `(${group.class_name})`}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedParticipants.length} selected</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Score</Label>
                  <Input
                    type="number"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: Number.parseInt(e.target.value) || 100 })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Total Rounds</Label>
                  <Input
                    type="number"
                    value={formData.total_rounds}
                    onChange={(e) => setFormData({ ...formData, total_rounds: Number.parseInt(e.target.value) || 1 })}
                    className="mt-1"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChallenge} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Create Challenge
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {challenges.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Challenges Yet</h3>
            <p className="text-gray-500">Create your first challenge to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/admin/challenges/${challenge.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <Badge className={getStatusColor(challenge.status)}>{challenge.status}</Badge>
                </div>
                <Badge variant="outline" className="w-fit mt-2">
                  {challenge.type}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{challenge.description || "No description"}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participant_count} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Round {challenge.current_round} / {challenge.total_rounds}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <PlayCircle className="w-4 h-4" />
                    <span>{challenge.submission_count} submissions</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/challenges/${challenge.id}/leaderboard`)
                      }}
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      Leaderboard
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/challenges/${challenge.id}`)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
