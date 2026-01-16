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
  Layers,
} from "lucide-react"
import { toast } from "sonner"

interface Track {
  id: number
  name: string
  slug: string
  description: string
  color: string
}

interface Module {
  id: number
  track_id: number
  level_id: number | null
  name: string
  description: string
  order_index: number
  is_active: boolean
  levels_count: number
  lessons_count: number
}

interface Level {
  id: number
  track_id: number
  module_id: number | null
  name: string
  description: string
  order_index: number
  is_active: boolean
  lessons_count: number
  exercises_count: number
}

interface Lesson {
  id: number
  level_id: number | null
  module_id: number | null
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
  const [modules, setModules] = useState<Module[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  // Module Dialog State
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [selectedLevelIdForModule, setSelectedLevelIdForModule] = useState<number | null>(null)
  const [moduleForm, setModuleForm] = useState({
    name: "",
    description: "",
    order_index: 0,
    is_active: true,
  })

  // Level Dialog State
  const [levelDialogOpen, setLevelDialogOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [levelForm, setLevelForm] = useState({
    name: "",
    description: "",
    order_index: 0,
    is_active: true,
  })

  // Lesson Dialog State
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleIdForLesson, setSelectedModuleIdForLesson] = useState<number | null>(null)
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

      // Fetch modules for this track
      const modulesRes = await fetch(`/api/gold/modules?trackId=${id}`)
      const modulesData = await modulesRes.json()
      setModules(modulesData)

      // Fetch levels for this track (both with and without modules for backward compatibility)
      const levelsRes = await fetch(`/api/gold/levels?trackId=${id}`)
      const levelsData = await levelsRes.json()
      setLevels(levelsData)

      // Fetch all lessons for this track (by modules and levels)
      const lessonsRes = await fetch("/api/gold/lessons")
      const lessonsData = await lessonsRes.json()
      const trackModuleIds = modulesData.map((m: Module) => m.id)
      const trackLevelIds = levelsData.map((l: Level) => l.id)
      const filteredLessons = lessonsData.filter(
        (ls: Lesson) =>
          (ls.module_id && trackModuleIds.includes(ls.module_id)) ||
          (ls.level_id && trackLevelIds.includes(ls.level_id))
      )
      setLessons(filteredLessons)
    } catch (error) {
      console.error("[v0] Error fetching track data:", error)
      toast.error("Khalad ayaa dhacay xogta soo dejinta")
    } finally {
      setLoading(false)
    }
  }

  // Module CRUD
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!editingModule && !selectedLevelIdForModule) {
        toast.error("Fadlan dooro Level")
        return
      }

      const method = editingModule ? "PUT" : "POST"
      const body = editingModule
        ? { ...moduleForm, id: editingModule.id, level_id: selectedLevelIdForModule }
        : { ...moduleForm, track_id: Number.parseInt(id), level_id: selectedLevelIdForModule }

      const response = await fetch("/api/gold/modules", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast.success(editingModule ? "Module-ka waa la cusboonaysiiyay" : "Module cusub waa la abuuray")
        fetchTrackData()
        closeModuleDialog()
      }
    } catch (error) {
      console.error("[v0] Error saving module:", error)
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setSelectedLevelIdForModule(module.level_id)
    setModuleForm({
      name: module.name,
      description: module.description || "",
      order_index: module.order_index,
      is_active: module.is_active,
    })
    setModuleDialogOpen(true)
  }

  const openAddModule = (levelId: number | null = null) => {
    setEditingModule(null)
    setSelectedLevelIdForModule(levelId)
    setModuleForm({
      name: "",
      description: "",
      order_index: modules.filter(m => levelId ? m.level_id === levelId : !m.level_id).length,
      is_active: true,
    })
    setModuleDialogOpen(true)
  }

  const closeModuleDialog = () => {
    setModuleDialogOpen(false)
    setEditingModule(null)
    setSelectedLevelIdForModule(null)
    setModuleForm({
      name: "",
      description: "",
      order_index: 0,
      is_active: true,
    })
  }

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Ma hubtaa? Dhammaan levels-ka iyo lessons-ka module-kan waa la tirtiri doonaa.")) return

    try {
      await fetch(`/api/gold/modules?id=${moduleId}`, { method: "DELETE" })
      toast.success("Module-ka waa la tirtiray")
      fetchTrackData()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  // Level CRUD
  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingLevel ? "PUT" : "POST"
      // Levels are directly under track, not under modules
      const body = editingLevel
        ? { ...levelForm, id: editingLevel.id, track_id: Number.parseInt(id), module_id: null }
        : { ...levelForm, track_id: Number.parseInt(id), module_id: null }

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
    setSelectedModuleId(level.module_id || null)
    setLevelForm({
      name: level.name,
      description: level.description || "",
      order_index: level.order_index,
      is_active: level.is_active,
    })
    setLevelDialogOpen(true)
  }

  const handleCreateLevel = (moduleId: number) => {
    setSelectedModuleId(moduleId)
    setEditingLevel(null)
    setLevelForm({ name: "", description: "", order_index: 0, is_active: true })
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
    setSelectedModuleId(null)
    setLevelForm({ name: "", description: "", order_index: 0, is_active: true })
  }

  // Lesson CRUD
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!selectedModuleIdForLesson && !selectedLevelId && !editingLesson) {
        toast.error("Fadlan dooro Module")
        return
      }

      const method = editingLesson ? "PUT" : "POST"
      const body = editingLesson
        ? { ...lessonForm, id: editingLesson.id }
        : { ...lessonForm, module_id: selectedModuleIdForLesson, level_id: selectedLevelId }

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

  const openAddLesson = (moduleId: number) => {
    setSelectedModuleIdForLesson(moduleId)
    setSelectedLevelId(null)
    setLessonDialogOpen(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setSelectedModuleIdForLesson(lesson.module_id || null)
    setSelectedLevelId(lesson.level_id || null)
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
    setSelectedModuleIdForLesson(null)
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
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setLevelDialogOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ku Dar Level Cusub
          </Button>
        </div>
      </div>

      {/* Levels List - Track → Level → Module → Lesson */}
      {levels.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <Layers className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Wali ma jiro Level</h3>
            <p className="text-gray-500 mb-4">
              <strong>1. Ku bilow abuuraada level-kaaga koowaad</strong>
              <br />
              <strong>2. Ka dibna abuuri modules-ka level-kaas</strong>
              <br />
              <strong>3. Ka dibna abuuri lessons-ka module kasta</strong>
            </p>
            <Button onClick={() => setLevelDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Ku Dar Level Koowaad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Render Levels with their Modules */}
          {levels
            .filter((l) => !l.module_id) // Only levels directly under track (not under modules)
            .sort((a, b) => a.order_index - b.order_index)
            .map((level, levelIndex) => {
              const levelModules = modules.filter((m) => m.level_id === level.id).sort((a, b) => a.order_index - b.order_index)
              return (
                <Card
                  key={level.id}
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedLevel === level.id ? "shadow-lg" : "hover:shadow-md"
                  }`}
                  style={{ borderLeftColor: track.color || "#F59E0B", borderLeftWidth: "4px" }}
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
                            className="h-12 w-12 rounded-lg flex items-center justify-center font-bold text-white text-lg"
                            style={{ backgroundColor: track.color || "#F59E0B" }}
                          >
                            {levelIndex + 1}
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{level.name}</CardTitle>
                          <p className="text-sm text-gray-500">{level.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{levelModules.length} Modules</span>
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
                            openAddModule(level.id)
                          }}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Module
                        </Button>
                        <ChevronRight
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            expandedLevel === level.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  {/* Modules within Level */}
                  {expandedLevel === level.id && (
                    <CardContent className="pt-0 border-t bg-gray-50/50">
                      <div className="flex items-center justify-between py-3 mb-3">
                        <h4 className="font-semibold text-gray-700">Modules-ka Level-kan</h4>
                        <Button
                          size="sm"
                          onClick={() => openAddModule(level.id)}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ku Dar Module
                        </Button>
                      </div>

                      {levelModules.length === 0 ? (
                        <div className="py-8 text-center border-2 border-dashed rounded-lg">
                          <Layers className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500 mb-4">Wali ma jiro Module level-kan</p>
                          <Button
                            size="sm"
                            onClick={() => openAddModule(level.id)}
                            className="bg-emerald-500 hover:bg-emerald-600"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ku Dar Module
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {levelModules.map((module, moduleIndex) => {
                            const moduleLessons = lessons.filter((ls) => ls.module_id === module.id).sort((a, b) => a.order_index - b.order_index)
                            return (
              <Card
                key={module.id}
                className={`overflow-hidden transition-all duration-300 ${
                  expandedModule === module.id ? "shadow-lg" : "hover:shadow-md"
                }`}
                style={{ borderLeftColor: "#10B981", borderLeftWidth: "4px" }}
              >
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-300" />
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center font-bold text-white">
                          M{moduleIndex + 1}
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {module.name}
                          <Badge className="bg-emerald-100 text-emerald-700">Module</Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-500">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="h-4 w-4" />
                          {lessons.filter((ls) => ls.module_id === module.id).length} Lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditModule(module)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteModule(module.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openAddLesson(module.id)
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Lesson
                        </Button>
                      </div>
                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedModule === module.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                </CardHeader>

                {/* Lessons directly within Module (Track → Module → Lessons) */}
                {expandedModule === module.id && (
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between py-3 mb-3 border-b">
                      <h4 className="font-semibold text-gray-700">Lessons-ka Module-kan</h4>
                      <Button
                        size="sm"
                        onClick={() => openAddLesson(module.id)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ku Dar Lesson
                      </Button>
                    </div>

                    {(() => {
                      const moduleLessons = lessons.filter((ls) => ls.module_id === module.id)
                      return moduleLessons.length === 0 ? (
                        <div className="py-8 text-center border-2 border-dashed rounded-lg">
                          <PlayCircle className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500 mb-4">Wali ma jiro Lesson module-kan</p>
                          <Button
                            size="sm"
                            onClick={() => openAddLesson(module.id)}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ku Dar Lesson
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {moduleLessons
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((lesson, lessonIndex) => {
                              const LessonIcon = getLessonIcon(lesson.lesson_type)
                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-all cursor-pointer group"
                                  onClick={() => handleEditLesson(lesson)}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="text-sm text-gray-400 w-6">{lessonIndex + 1}.</span>
                                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                      <LessonIcon className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{lesson.title}</p>
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
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                      )
                    })()}
                  </CardContent>
                )}
              </Card>
            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
        </div>
      )}

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingModule ? "Wax ka Beddel Module-ka" : "Ku Dar Module Cusub"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveModule} className="space-y-5 mt-4">
            {!editingModule && (
              <div className="space-y-2">
                <Label htmlFor="levelSelect" className="text-sm font-semibold text-gray-700">
                  Level <span className="text-red-600">*</span>
                </Label>
                {selectedLevelIdForModule ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500 text-white">Level</Badge>
                      <span className="font-medium text-gray-900">
                        {levels.find((l) => l.id === selectedLevelIdForModule)?.name || "Level"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Module-kan waa la sameyn doonaa level-kan hoose</p>
                  </div>
                ) : (
                  <Select
                    value={selectedLevelIdForModule?.toString() || ""}
                    onValueChange={(value) => setSelectedLevelIdForModule(Number.parseInt(value))}
                    required
                  >
                    <SelectTrigger id="levelSelect" className="bg-white border-gray-300">
                      <SelectValue placeholder="Dooro Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels
                        .filter((l) => !l.module_id)
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((level) => (
                          <SelectItem key={level.id} value={level.id.toString()}>
                            {level.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="moduleName" className="text-sm font-semibold text-gray-700">
                Magaca Module-ka <span className="text-red-600">*</span>
              </Label>
              <Input
                id="moduleName"
                value={moduleForm.name}
                onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                placeholder="tusaale: Web Development Basics"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moduleDesc" className="text-sm font-semibold text-gray-700">
                Sharaxaad
              </Label>
              <Textarea
                id="moduleDesc"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Sharaxaad kooban..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moduleOrder" className="text-sm font-semibold text-gray-700">
                  Tartibka
                </Label>
                <Input
                  id="moduleOrder"
                  type="number"
                  value={moduleForm.order_index}
                  onChange={(e) => setModuleForm({ ...moduleForm, order_index: Number.parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Xaaladda</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={moduleForm.is_active}
                    onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_active: checked })}
                  />
                  <span className="text-sm text-gray-600">{moduleForm.is_active ? "Firfircoon" : "Joojin"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModuleDialog} className="flex-1 bg-transparent">
                Ka Noqo
              </Button>
              <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                {editingModule ? "Cusboonaysii" : "Samee Module"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Level Dialog */}
      <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingLevel ? "Wax ka Beddel Level-ka" : "Ku Dar Level Cusub"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLevel} className="space-y-5 mt-4">
            {/* Level form - levels are directly under track, no module selection needed */}
            <div className="space-y-2">
              <Label htmlFor="levelName" className="text-sm font-semibold text-gray-700">
                Magaca Level-ka <span className="text-red-600">*</span>
              </Label>
              <Input
                id="levelName"
                value={levelForm.name}
                onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                placeholder="tusaale: Level 1 - Basics"
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
              <Button type="button" variant="outline" onClick={() => setLevelDialogOpen(false)} className="flex-1 bg-transparent">
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
            {!editingLesson && (
              <div className="space-y-2">
                <Label htmlFor="moduleSelectLesson" className="text-sm font-semibold text-gray-700">
                  Module <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={selectedModuleIdForLesson?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedModuleIdForLesson(Number.parseInt(value))
                    setSelectedLevelId(null)
                  }}
                  required
                >
                  <SelectTrigger id="moduleSelectLesson">
                    <SelectValue placeholder="Dooro Module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id.toString()}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
