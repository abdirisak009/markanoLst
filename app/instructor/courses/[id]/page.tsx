"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Save,
  Layers,
  FileVideo,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
} from "lucide-react"
import { toast } from "sonner"

interface CourseDetail {
  id: number
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  instructor_name: string | null
  estimated_duration_minutes: number
  difficulty_level: string
  price: number
  is_active: boolean
  is_featured: boolean
  order_index: number
  created_at: string
  updated_at: string
  modules: Array<{
    id: number
    title: string
    description: string | null
    order_index: number
    is_active: boolean
    lessons_count: number
  }>
}

interface ModuleRow {
  id: number
  course_id: number
  title: string
  description: string | null
  order_index: number
  is_active: boolean
}

interface LessonRow {
  id: number
  module_id: number
  title: string
  description: string | null
  video_url: string | null
  video_duration_seconds: number
  lesson_type: string
  order_index: number
  xp_reward: number
  is_active: boolean
}

export default function InstructorCourseDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    difficulty_level: "beginner",
    price: 0,
    is_active: true,
  })
  const [modulesList, setModulesList] = useState<ModuleRow[]>([])
  const [lessonsByModule, setLessonsByModule] = useState<Record<number, LessonRow[]>>({})
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleRow | null>(null)
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleDescription, setModuleDescription] = useState("")
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<LessonRow | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonDescription, setLessonDescription] = useState("")
  const [lessonVideoUrl, setLessonVideoUrl] = useState("")
  const [lessonVideoDuration, setLessonVideoDuration] = useState("")
  const [lessonType, setLessonType] = useState("video")
  const [lessonXpReward, setLessonXpReward] = useState("10")
  const [submittingModule, setSubmittingModule] = useState(false)
  const [submittingLesson, setSubmittingLesson] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchCourse()
  }, [id])

  useEffect(() => {
    if (!id || !course) return
    fetchModulesAndLessons()
  }, [id, course?.id])

  const fetchModulesAndLessons = async () => {
    if (!id) return
    try {
      const modRes = await fetch(`/api/learning/modules?courseId=${id}`, { credentials: "include" })
      if (!modRes.ok) return
      let mods: unknown = []
      try {
        const text = await modRes.text()
        mods = text ? JSON.parse(text) : []
      } catch {
        mods = []
      }
      const list = Array.isArray(mods) ? mods : []
      setModulesList(list)
      const byModule: Record<number, LessonRow[]> = {}
      for (const m of list) {
        try {
          const lessRes = await fetch(`/api/learning/lessons?moduleId=${m.id}`, { credentials: "include" })
          if (lessRes.ok) {
            const lessText = await lessRes.text()
            const less = lessText ? JSON.parse(lessText) : []
            byModule[m.id] = Array.isArray(less) ? less : []
          } else {
            byModule[m.id] = []
          }
        } catch {
          byModule[m.id] = []
        }
      }
      setLessonsByModule(byModule)
      setExpandedModules((prev) => (prev.size === 0 && list.length > 0 ? new Set([list[0].id]) : prev))
    } catch {
      setModulesList([])
      setLessonsByModule({})
    }
  }

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/instructor/courses/${id}`, { credentials: "include" })
      if (res.status === 401) {
        window.location.href = `/instructor/login?redirect=/instructor/courses/${id}`
        return
      }
      if (res.status === 404) {
        setCourse(null)
        return
      }
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setCourse(data)
      setForm({
        title: data.title,
        slug: data.slug,
        description: data.description || "",
        difficulty_level: data.difficulty_level || "beginner",
        price: Number(data.price) || 0,
        is_active: data.is_active !== false,
      })
    } catch {
      toast.error("Failed to load course")
      setCourse(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/instructor/courses/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim() || form.title.trim().toLowerCase().replace(/\s+/g, "-"),
          description: form.description.trim() || null,
          difficulty_level: form.difficulty_level,
          price: Number(form.price) || 0,
          is_active: form.is_active,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      toast.success("Course updated")
      setCourse((prev) => (prev ? { ...prev, ...data } : null))
      setEditMode(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const openAddModule = () => {
    setEditingModule(null)
    setModuleTitle("")
    setModuleDescription("")
    setModuleDialogOpen(true)
  }
  const openEditModule = (m: ModuleRow) => {
    setEditingModule(m)
    setModuleTitle(m.title)
    setModuleDescription(m.description || "")
    setModuleDialogOpen(true)
  }
  const closeModuleDialog = () => {
    setModuleDialogOpen(false)
    setEditingModule(null)
    setModuleTitle("")
    setModuleDescription("")
  }

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!moduleTitle.trim()) {
      toast.error("Module title is required")
      return
    }
    setSubmittingModule(true)
    try {
      const method = editingModule ? "PUT" : "POST"
      const body = editingModule
        ? {
            id: editingModule.id,
            title: (moduleTitle ?? "").trim(),
            description: (moduleDescription ?? "").trim() || null,
            order_index: editingModule.order_index,
            is_active: true,
          }
        : {
            course_id: Number(id),
            title: (moduleTitle ?? "").trim(),
            description: (moduleDescription ?? "").trim() || null,
            order_index: modulesList.length,
          }
      const res = await fetch("/api/learning/modules", {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      let data: { error?: string } = {}
      try {
        const text = await res.text()
        if (text) data = JSON.parse(text)
      } catch {
        data = { error: "Invalid response from server" }
      }
      if (!res.ok) throw new Error(data.error || "Failed to save module")
      toast.success(editingModule ? "Module updated" : "Module created")
      closeModuleDialog()
      await fetchModulesAndLessons()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save module")
    } finally {
      setSubmittingModule(false)
    }
  }

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Delete this module? All lessons in it will be hidden.")) return
    try {
      const res = await fetch(`/api/learning/modules?id=${moduleId}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete")
      }
      toast.success("Module deleted")
      await fetchModulesAndLessons()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete module")
    }
  }

  const openAddLesson = (moduleId: number) => {
    setEditingLesson(null)
    setSelectedModuleId(moduleId)
    setLessonTitle("")
    setLessonDescription("")
    setLessonVideoUrl("")
    setLessonVideoDuration("")
    setLessonType("video")
    setLessonXpReward("10")
    setLessonDialogOpen(true)
  }
  const openEditLesson = (lesson: LessonRow) => {
    setEditingLesson(lesson)
    setSelectedModuleId(lesson.module_id)
    setLessonTitle(lesson.title)
    setLessonDescription(lesson.description || "")
    setLessonVideoUrl(lesson.video_url || "")
    setLessonVideoDuration(String(lesson.video_duration_seconds || 0))
    setLessonType(lesson.lesson_type || "video")
    setLessonXpReward(String(lesson.xp_reward || 10))
    setLessonDialogOpen(true)
  }
  const closeLessonDialog = () => {
    setLessonDialogOpen(false)
    setEditingLesson(null)
    setSelectedModuleId(null)
    setLessonTitle("")
    setLessonDescription("")
    setLessonVideoUrl("")
    setLessonVideoDuration("")
    setLessonType("video")
    setLessonXpReward("10")
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonTitle.trim()) {
      toast.error("Lesson title is required")
      return
    }
    if (!selectedModuleId) {
      toast.error("Select a module")
      return
    }
    setSubmittingLesson(true)
    try {
      const method = editingLesson ? "PUT" : "POST"
      const body = editingLesson
        ? {
            id: editingLesson.id,
            title: lessonTitle.trim(),
            description: lessonDescription.trim() || null,
            video_url: lessonVideoUrl.trim() || null,
            video_duration_seconds: parseInt(lessonVideoDuration, 10) || 0,
            lesson_type: lessonType,
            order_index: editingLesson.order_index,
            xp_reward: parseInt(lessonXpReward, 10) || 10,
            is_active: true,
          }
        : {
            module_id: selectedModuleId,
            title: lessonTitle.trim(),
            description: lessonDescription.trim() || null,
            video_url: lessonVideoUrl.trim() || null,
            video_duration_seconds: parseInt(lessonVideoDuration, 10) || 0,
            lesson_type: lessonType,
            order_index: lessonsByModule[selectedModuleId]?.length ?? 0,
            xp_reward: parseInt(lessonXpReward, 10) || 10,
          }
      const res = await fetch("/api/learning/lessons", {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      let data: { error?: string } = {}
      try {
        const text = await res.text()
        if (text) data = JSON.parse(text)
      } catch {
        data = { error: "Invalid response from server" }
      }
      if (!res.ok) throw new Error(data.error || "Failed to save lesson")
      toast.success(editingLesson ? "Lesson updated" : "Lesson created")
      closeLessonDialog()
      await fetchModulesAndLessons()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save lesson")
    } finally {
      setSubmittingLesson(false)
    }
  }

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Delete this lesson?")) return
    try {
      const res = await fetch(`/api/learning/lessons?id=${lessonId}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete")
      }
      toast.success("Lesson deleted")
      await fetchModulesAndLessons()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete lesson")
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#e63946]" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-slate-600 font-medium">Course not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/instructor/courses">Back to Learning Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" className="mb-6 gap-2 text-slate-600" asChild>
        <Link href="/instructor/courses">
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Courses
        </Link>
      </Button>

      <Card className="border-slate-200 shadow-sm mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#e63946]" />
            {editMode ? "Edit Course" : course.title}
          </CardTitle>
          {!editMode ? (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              Edit
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="mt-1 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Difficulty</Label>
                  <select
                    value={form.difficulty_level}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty_level: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price || ""}
                    onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <Label htmlFor="is_active">Course is active (visible to students)</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="bg-[#e63946] hover:bg-[#d62839]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-slate-600">
              <p><span className="font-medium text-slate-700">Slug:</span> {course.slug}</p>
              {course.description && <p className="mt-2">{course.description}</p>}
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">{course.difficulty_level}</Badge>
                <Badge variant="secondary">${Number(course.price).toFixed(2)}</Badge>
                <Badge className={course.is_active ? "bg-green-50 text-green-700" : "bg-slate-100"}>
                  {course.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#e63946]" />
              Modules & Lessons
            </CardTitle>
            <p className="text-slate-500 text-sm mt-1">
              You can add, edit, and delete modules and lessons for this course (assigned to you by admin).
            </p>
          </div>
          <Button onClick={openAddModule} className="bg-[#e63946] hover:bg-[#d62839]">
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </CardHeader>
        <CardContent>
          {modulesList.length === 0 ? (
            <p className="text-slate-500">No modules yet. Click &quot;Add Module&quot; to create one, then add lessons.</p>
          ) : (
            <ul className="space-y-2">
              {modulesList.map((m) => (
                <li key={m.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100"
                    onClick={() => toggleModule(m.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedModules.has(m.id) ? (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      )}
                      <FolderOpen className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{m.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {lessonsByModule[m.id]?.length ?? 0} lessons
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => openAddLesson(m.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Lesson
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditModule(m)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteModule(m.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {expandedModules.has(m.id) && (
                    <ul className="border-t border-slate-200 bg-white divide-y divide-slate-100">
                      {(lessonsByModule[m.id] ?? []).map((l) => (
                        <li key={l.id} className="flex items-center justify-between px-4 py-2 pl-10">
                          <div className="flex items-center gap-2">
                            <FileVideo className="h-4 w-4 text-slate-400" />
                            <span>{l.title}</span>
                            {!l.is_active && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditLesson(l)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(l.id)} className="text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      ))}
                      {(lessonsByModule[m.id] ?? []).length === 0 && (
                        <li className="px-4 py-3 pl-10 text-slate-500 text-sm">No lessons. Click &quot;Lesson&quot; to add one.</li>
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={moduleDialogOpen} onOpenChange={(open) => !open && closeModuleDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Add Module"}</DialogTitle>
            <DialogDescription>Modules group lessons. Add a title and optional description.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveModule} className="space-y-4">
            <div>
              <Label htmlFor="moduleTitle">Title *</Label>
              <Input
                id="moduleTitle"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Week 1: Basics"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="moduleDesc">Description (optional)</Label>
              <Textarea
                id="moduleDesc"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                rows={2}
                className="mt-1 resize-none"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModuleDialog}>Cancel</Button>
              <Button type="submit" disabled={submittingModule} className="bg-[#e63946] hover:bg-[#d62839]">
                {submittingModule ? <Loader2 className="h-4 w-4 animate-spin" /> : editingModule ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={lessonDialogOpen} onOpenChange={(open) => !open && closeLessonDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
            <DialogDescription>Add a lesson with title and optional video URL.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveLesson} className="space-y-4">
            <div>
              <Label htmlFor="lessonTitle">Title *</Label>
              <Input
                id="lessonTitle"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Introduction"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lessonDesc">Description (optional)</Label>
              <Textarea
                id="lessonDesc"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                rows={2}
                className="mt-1 resize-none"
              />
            </div>
            <div>
              <Label htmlFor="lessonVideo">Video URL (optional)</Label>
              <Input
                id="lessonVideo"
                value={lessonVideoUrl}
                onChange={(e) => setLessonVideoUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lessonDuration">Duration (seconds)</Label>
                <Input
                  id="lessonDuration"
                  type="number"
                  min={0}
                  value={lessonVideoDuration}
                  onChange={(e) => setLessonVideoDuration(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lessonXp">XP reward</Label>
                <Input
                  id="lessonXp"
                  type="number"
                  min={0}
                  value={lessonXpReward}
                  onChange={(e) => setLessonXpReward(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lessonType">Type</Label>
              <select
                id="lessonType"
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="video">Video</option>
                <option value="reading">Reading</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeLessonDialog}>Cancel</Button>
              <Button type="submit" disabled={submittingLesson} className="bg-[#e63946] hover:bg-[#d62839]">
                {submittingLesson ? <Loader2 className="h-4 w-4 animate-spin" /> : editingLesson ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
