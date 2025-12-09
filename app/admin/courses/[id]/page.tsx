"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Edit, Trash2, FolderOpen, PlayCircle, Video, Clock } from "lucide-react"

interface Module {
  id: number
  course_id: number
  title: string
  order_index: number
  created_at: string
}

interface Lesson {
  id: number
  module_id: number
  title: string
  duration: number
  video_url: string
  content: string
  order_index: number
  created_at: string
}

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  type: string
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({})
  const [loading, setLoading] = useState(true)

  // Module Dialog
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [moduleTitle, setModuleTitle] = useState("")

  // Lesson Dialog
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonDuration, setLessonDuration] = useState("")
  const [lessonVideoUrl, setLessonVideoUrl] = useState("")
  const [lessonContent, setLessonContent] = useState("")

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const courseRes = await fetch("/api/courses")
      const courses = await courseRes.json()
      const foundCourse = courses.find((c: Course) => c.id === Number(courseId))
      setCourse(foundCourse || null)

      // Fetch modules
      const modulesRes = await fetch(`/api/modules?courseId=${courseId}`)
      const modulesData = await modulesRes.json()
      setModules(modulesData)

      // Fetch lessons for each module
      const lessonsData: Record<number, Lesson[]> = {}
      for (const module of modulesData) {
        const lessonsRes = await fetch(`/api/lessons?moduleId=${module.id}`)
        lessonsData[module.id] = await lessonsRes.json()
      }
      setLessons(lessonsData)
    } catch (error) {
      console.error("[v0] Error fetching course data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Module CRUD
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingModule ? "PUT" : "POST"
      const body = editingModule
        ? {
            id: editingModule.id,
            title: moduleTitle,
            order_index: editingModule.order_index,
          }
        : {
            course_id: Number(courseId),
            title: moduleTitle,
            order_index: modules.length,
          }

      await fetch("/api/modules", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      fetchCourseData()
      closeModuleDialog()
    } catch (error) {
      console.error("[v0] Error saving module:", error)
    }
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleTitle(module.title)
    setIsModuleDialogOpen(true)
  }

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Delete this module and all its lessons?")) return

    try {
      await fetch(`/api/modules?id=${moduleId}`, { method: "DELETE" })
      fetchCourseData()
    } catch (error) {
      console.error("[v0] Error deleting module:", error)
    }
  }

  const closeModuleDialog = () => {
    setIsModuleDialogOpen(false)
    setEditingModule(null)
    setModuleTitle("")
  }

  // Lesson CRUD
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedModuleId) return

    try {
      const method = editingLesson ? "PUT" : "POST"
      const body = editingLesson
        ? {
            id: editingLesson.id,
            title: lessonTitle,
            duration: Number(lessonDuration),
            video_url: lessonVideoUrl,
            content: lessonContent,
            order_index: editingLesson.order_index,
          }
        : {
            module_id: selectedModuleId,
            title: lessonTitle,
            duration: Number(lessonDuration),
            video_url: lessonVideoUrl,
            content: lessonContent,
            order_index: lessons[selectedModuleId]?.length || 0,
          }

      await fetch("/api/lessons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      fetchCourseData()
      closeLessonDialog()
    } catch (error) {
      console.error("[v0] Error saving lesson:", error)
    }
  }

  const handleEditLesson = (lesson: Lesson, moduleId: number) => {
    setEditingLesson(lesson)
    setSelectedModuleId(moduleId)
    setLessonTitle(lesson.title)
    setLessonDuration(String(lesson.duration))
    setLessonVideoUrl(lesson.video_url)
    setLessonContent(lesson.content)
    setIsLessonDialogOpen(true)
  }

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Delete this lesson?")) return

    try {
      await fetch(`/api/lessons?id=${lessonId}`, { method: "DELETE" })
      fetchCourseData()
    } catch (error) {
      console.error("[v0] Error deleting lesson:", error)
    }
  }

  const openLessonDialog = (moduleId: number) => {
    setSelectedModuleId(moduleId)
    setIsLessonDialogOpen(true)
  }

  const closeLessonDialog = () => {
    setIsLessonDialogOpen(false)
    setEditingLesson(null)
    setSelectedModuleId(null)
    setLessonTitle("")
    setLessonDuration("")
    setLessonVideoUrl("")
    setLessonContent("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading course...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-lg text-gray-600">Course not found</div>
        <Button onClick={() => router.push("/admin/courses")}>Back to Courses</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/courses")}
          className="mb-4 text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-blue-100 mb-4">{course.description}</p>
        <div className="flex items-center gap-6 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">Instructor: {course.instructor}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
            <FolderOpen className="h-4 w-4" />
            {modules.length} Modules
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
            <PlayCircle className="h-4 w-4" />
            {Object.values(lessons).flat().length} Lessons
          </span>
        </div>
      </div>

      {/* Add Module Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsModuleDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {modules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No modules yet. Create your first module!</p>
            <Button onClick={() => setIsModuleDialogOpen(true)} variant="outline">
              Add Module
            </Button>
          </div>
        ) : (
          modules.map((module, moduleIndex) => (
            <div
              key={module.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Module Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                      {moduleIndex + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="h-4 w-4" />
                          {lessons[module.id]?.length || 0} Lessons
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEditModule(module)}>
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteModule(module.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div className="p-6">
                {lessons[module.id]?.length === 0 || !lessons[module.id] ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <PlayCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm mb-3">No lessons in this module yet</p>
                    <Button size="sm" variant="outline" onClick={() => openLessonDialog(module.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons[module.id]?.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                          {lessonIndex + 1}
                        </div>
                        <Video className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.duration} min
                            </span>
                            {lesson.video_url && <span className="text-blue-600">Has video</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" onClick={() => handleEditLesson(lesson, module.id)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteLesson(lesson.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openLessonDialog(module.id)}
                      className="w-full border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingModule ? "Edit Module" : "Create New Module"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateModule} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="moduleTitle" className="text-sm font-semibold">
                Module Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="moduleTitle"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Introduction to HTML"
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModuleDialog} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                {editingModule ? "Update Module" : "Create Module"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingLesson ? "Edit Lesson" : "Create New Lesson"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLesson} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="lessonTitle" className="text-sm font-semibold">
                Lesson Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="lessonTitle"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. HTML Basics"
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonDuration" className="text-sm font-semibold">
                Duration (minutes)
              </Label>
              <Input
                id="lessonDuration"
                type="number"
                value={lessonDuration}
                onChange={(e) => setLessonDuration(e.target.value)}
                placeholder="e.g. 15"
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonVideoUrl" className="text-sm font-semibold">
                Video URL
              </Label>
              <Input
                id="lessonVideoUrl"
                value={lessonVideoUrl}
                onChange={(e) => setLessonVideoUrl(e.target.value)}
                placeholder="YouTube video URL"
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonContent" className="text-sm font-semibold">
                Content
              </Label>
              <Textarea
                id="lessonContent"
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="Lesson content, notes, or transcript"
                rows={4}
                className="resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeLessonDialog} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                {editingLesson ? "Update Lesson" : "Create Lesson"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
