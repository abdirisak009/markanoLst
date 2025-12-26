"use client"

import type React from "react"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  Code,
  PlayCircle,
  ChevronRight,
  GripVertical,
  Clock,
} from "lucide-react"
import { toast } from "sonner"

interface Track {
  id: number
  name: string
  slug: string
  description: string
  color: string
}

interface Level {
  id: number
  track_id: number
  name: string
  description: string
  order_index: number
  is_active: boolean
  lessons_count: number
  exercises_count: number
}

interface Lesson {
  id: number
  level_id: number
  title: string
  lesson_type: string
  content: string
  video_url: string
  video_duration: number
  is_required: boolean
  order_index: number
}

const lessonTypeOptions = [
  { value: "video", label: "Video", icon: Video },
  { value: "article", label: "Maqaal", icon: FileText },
  { value: "code", label: "Code Practice", icon: Code },
  { value: "quiz", label: "Quiz", icon: BookOpen },
]

export default function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [track, setTrack] = useState<Track | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  // Level Dialog State
  const [levelDialogOpen, setLevelDialogOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [levelForm, setLevelForm] = useState({
    name: "",
    description: "",
    order_index: 0,
    is_active: true,
  })

  // Lesson Dialog State
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null)
  const [lessonForm, setLessonForm] = useState({
    title: "",
    lesson_type: "video",
    content: "",
    video_url: "",
    video_duration: 0,
    is_required: true,
    order_index: 0,
  })

  useEffect(() => {
    fetchTrackData()
  }, [id])

  const fetchTrackData = async () => {
    try {
      // Fetch track details
      const trackRes = await fetch("/api/gold/tracks")
      const tracks = await trackRes.json()
      const currentTrack = tracks.find((t: Track) => t.id === Number.parseInt(id))
      setTrack(currentTrack)

      // Fetch levels for this track
      const levelsRes = await fetch(`/api/gold/levels?trackId=${id}`)
      const levelsData = await levelsRes.json()
      setLevels(levelsData)

      // Fetch all lessons for this track's levels
      const lessonsRes = await fetch("/api/gold/lessons")
      const lessonsData = await lessonsRes.json()
      const trackLessonIds = levelsData.map((l: Level) => l.id)
      const filteredLessons = lessonsData.filter((ls: Lesson) => trackLessonIds.includes(ls.level_id))
      setLessons(filteredLessons)
    } catch (error) {
      console.error("[v0] Error fetching track data:", error)
      toast.error("Khalad ayaa dhacay xogta soo dejinta")
    } finally {
      setLoading(false)
    }
  }

  // Level CRUD
  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingLevel ? "PUT" : "POST"
      const body = editingLevel
        ? { ...levelForm, id: editingLevel.id }
        : { ...levelForm, track_id: Number.parseInt(id) }

      const response = await fetch("/api/gold/levels", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast.success(editingLevel ? "Level-ka waa la cusboonaysiiyay" : "Level cusub waa la abuuray")
        fetchTrackData()
        closeLevelDialog()
      }
    } catch (error) {
      console.error("[v0] Error saving level:", error)
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleEditLevel = (level: Level) => {
    setEditingLevel(level)
    setLevelForm({
      name: level.name,
      description: level.description || "",
      order_index: level.order_index,
      is_active: level.is_active,
    })
    setLevelDialogOpen(true)
  }

  const handleDeleteLevel = async (levelId: number) => {
    if (!confirm("Ma hubtaa? Dhammaan lessons-ka level-kan waa la tirtiri doonaa.")) return

    try {
      await fetch(`/api/gold/levels?id=${levelId}`, { method: "DELETE" })
      toast.success("Level-ka waa la tirtiray")
      fetchTrackData()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const closeLevelDialog = () => {
    setLevelDialogOpen(false)
    setEditingLevel(null)
    setLevelForm({ name: "", description: "", order_index: 0, is_active: true })
  }

  // Lesson CRUD
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingLesson ? "PUT" : "POST"
      const body = editingLesson
        ? { ...lessonForm, id: editingLesson.id }
        : { ...lessonForm, level_id: selectedLevelId }

      const response = await fetch("/api/gold/lessons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast.success(editingLesson ? "Lesson-ka waa la cusboonaysiiyay" : "Lesson cusub waa la abuuray")
        fetchTrackData()
        closeLessonDialog()
      }
    } catch (error) {
      console.error("[v0] Error saving lesson:", error)
      toast.error("Khalad ayaa dhacay")
    }
  }

  const openAddLesson = (levelId: number) => {
    setSelectedLevelId(levelId)
    setLessonDialogOpen(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setSelectedLevelId(lesson.level_id)
    setLessonForm({
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      video_duration: lesson.video_duration || 0,
      is_required: lesson.is_required,
      order_index: lesson.order_index,
    })
    setLessonDialogOpen(true)
  }

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Ma hubtaa inaad tirtireyso lesson-kan?")) return

    try {
      await fetch(`/api/gold/lessons?id=${lessonId}`, { method: "DELETE" })
      toast.success("Lesson-ka waa la tirtiray")
      fetchTrackData()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const closeLessonDialog = () => {
    setLessonDialogOpen(false)
    setEditingLesson(null)
    setSelectedLevelId(null)
    setLessonForm({
      title: "",
      lesson_type: "video",
      content: "",
      video_url: "",
      video_duration: 0,
      is_required: true,
      order_index: 0,
    })
  }

  const getLessonIcon = (type: string) => {
    const option = lessonTypeOptions.find((opt) => opt.value === type)
    return option ? option.icon : FileText
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Track-ka lama helin</p>
        <Button onClick={() => router.push("/admin/gold/tracks")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Ku Noqo Tracks
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/gold/tracks")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tracks
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{track.name}</h1>
            <p className="text-gray-600 mt-1">{track.description}</p>
          </div>
        </div>
        <Button
          onClick={() => setLevelDialogOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ku Dar Level Cusub
        </Button>
      </div>

      {/* Levels List */}
      {levels.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Wali ma jiro Level</h3>
            <p className="text-gray-500 mb-4">Ku bilow abuuraada level-kaaga koowaad</p>
            <Button onClick={() => setLevelDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Ku Dar Level
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {levels.map((level, index) => (
            <Card
              key={level.id}
              className={`overflow-hidden transition-all duration-300 ${
                expandedLevel === level.id ? "shadow-lg" : "hover:shadow-md"
              }`}
              style={{ borderLeftColor: track.color, borderLeftWidth: "4px" }}
            >
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedLevel(expandedLevel === level.id ? null : level.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-gray-300" />
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: track.color }}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{level.name}</CardTitle>
                      <p className="text-sm text-gray-500">{level.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-4 w-4" />
                        {level.lessons_count || 0} Lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Code className="h-4 w-4" />
                        {level.exercises_count || 0} Exercises
                      </span>
                    </div>
                    <Badge variant={level.is_active ? "default" : "secondary"}>
                      {level.is_active ? "Firfircoon" : "Joojin"}
                    </Badge>
                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedLevel === level.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>
              </CardHeader>

              {expandedLevel === level.id && (
                <CardContent className="pt-0 border-t bg-gray-50/50">
                  <div className="flex items-center justify-between py-3 mb-3">
                    <h4 className="font-semibold text-gray-700">Lessons-ka Level-kan</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditLevel(level)
                        }}
                        className="hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-1 text-blue-600" />
                        Wax ka Beddel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLevel(level.id)
                        }}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1 text-red-600" />
                        Tirtir
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openAddLesson(level.id)
                        }}
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ku Dar Lesson
                      </Button>
                    </div>
                  </div>

                  {/* Lessons for this level */}
                  {lessons.filter((l) => l.level_id === level.id).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <PlayCircle className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                      <p>Wali ma jiro lesson level-kan</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lessons
                        .filter((l) => l.level_id === level.id)
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((lesson, lessonIndex) => {
                          const LessonIcon = getLessonIcon(lesson.lesson_type)
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-400 w-6">{lessonIndex + 1}.</span>
                                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <LessonIcon className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{lesson.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Badge variant="outline" className="text-xs">
                                      {lessonTypeOptions.find((o) => o.value === lesson.lesson_type)?.label}
                                    </Badge>
                                    {lesson.video_duration > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(lesson.video_duration)}
                                      </span>
                                    )}
                                    {lesson.is_required && (
                                      <Badge className="bg-amber-100 text-amber-700 text-xs">Waajib</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEditLesson(lesson)}>
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteLesson(lesson.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Level Dialog */}
      <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingLevel ? "Wax ka Beddel Level-ka" : "Ku Dar Level Cusub"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLevel} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="levelName" className="text-sm font-semibold text-gray-700">
                Magaca Level-ka <span className="text-red-600">*</span>
              </Label>
              <Input
                id="levelName"
                value={levelForm.name}
                onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                placeholder="tusaale: HTML & CSS Fundamentals"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="levelDesc" className="text-sm font-semibold text-gray-700">
                Sharaxaad
              </Label>
              <Textarea
                id="levelDesc"
                value={levelForm.description}
                onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                placeholder="Sharaxaad kooban..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="levelOrder" className="text-sm font-semibold text-gray-700">
                  Tartibka
                </Label>
                <Input
                  id="levelOrder"
                  type="number"
                  value={levelForm.order_index}
                  onChange={(e) => setLevelForm({ ...levelForm, order_index: Number.parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Xaaladda</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={levelForm.is_active}
                    onCheckedChange={(checked) => setLevelForm({ ...levelForm, is_active: checked })}
                  />
                  <span className="text-sm text-gray-600">{levelForm.is_active ? "Firfircoon" : "Joojin"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeLevelDialog} className="flex-1 bg-transparent">
                Ka Noqo
              </Button>
              <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600">
                {editingLevel ? "Cusboonaysii" : "Samee Level"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingLesson ? "Wax ka Beddel Lesson-ka" : "Ku Dar Lesson Cusub"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLesson} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="lessonTitle" className="text-sm font-semibold text-gray-700">
                Cinwaanka Lesson-ka <span className="text-red-600">*</span>
              </Label>
              <Input
                id="lessonTitle"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="tusaale: Introduction to HTML"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Nooca Lesson-ka</Label>
                <Select
                  value={lessonForm.lesson_type}
                  onValueChange={(value) => setLessonForm({ ...lessonForm, lesson_type: value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {lessonTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessonOrder" className="text-sm font-semibold text-gray-700">
                  Tartibka
                </Label>
                <Input
                  id="lessonOrder"
                  type="number"
                  value={lessonForm.order_index}
                  onChange={(e) => setLessonForm({ ...lessonForm, order_index: Number.parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>

            {lessonForm.lesson_type === "video" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="text-sm font-semibold text-gray-700">
                    Video URL
                  </Label>
                  <Input
                    id="videoUrl"
                    value={lessonForm.video_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoDuration" className="text-sm font-semibold text-gray-700">
                    Muddada (ilbiriqsi)
                  </Label>
                  <Input
                    id="videoDuration"
                    type="number"
                    value={lessonForm.video_duration}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, video_duration: Number.parseInt(e.target.value) || 0 })
                    }
                    min={0}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="lessonContent" className="text-sm font-semibold text-gray-700">
                Nuxurka / Sharaxaadda
              </Label>
              <Textarea
                id="lessonContent"
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="Qor nuxurka lesson-ka halkan..."
                rows={5}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={lessonForm.is_required}
                onCheckedChange={(checked) => setLessonForm({ ...lessonForm, is_required: checked })}
              />
              <span className="text-sm text-gray-600">Lesson-kan waa waajib (Ardaygu waa inuu dhammeeyo)</span>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeLessonDialog} className="flex-1 bg-transparent">
                Ka Noqo
              </Button>
              <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600">
                {editingLesson ? "Cusboonaysii" : "Samee Lesson"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
