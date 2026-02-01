"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  BookOpen,
  Edit,
  Trash2,
  Plus,
  FolderOpen,
  PlayCircle,
  Clock,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  DollarSign,
  Star,
  Eye,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { cn, getImageSrc } from "@/lib/utils"

const MAX_TITLE = 200
const MAX_SLUG = 150
const MAX_DESCRIPTION = 2000

interface Course {
  id: number
  title: string
  slug: string
  description: string
  thumbnail_url: string | null
  instructor_id: number | null
  instructor_name: string
  estimated_duration_minutes: number
  difficulty_level: string
  is_active: boolean
  is_featured: boolean
  order_index: number
  price: number
  modules_count: number
  lessons_count: number
  created_at: string
}

export default function AdminLearningCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [instructorId, setInstructorId] = useState<number | null>(null)
  const [instructorName, setInstructorName] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [difficultyLevel, setDifficultyLevel] = useState("beginner")
  const [price, setPrice] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [orderIndex, setOrderIndex] = useState("0")
  const [instructors, setInstructors] = useState<Array<{ id: number; full_name: string }>>([])
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [deleteTargetCourse, setDeleteTargetCourse] = useState<Course | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const WIZARD_STEPS = 4

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    fetch("/api/admin/instructors", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setInstructors(Array.isArray(list) ? list : []))
      .catch(() => setInstructors([]))
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/learning/courses?all=true", { credentials: "include" })
      const data = await response.json()
      if (Array.isArray(data)) {
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching learning courses:", error)
      toast.error("Failed to fetch courses")
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!editingCourse) {
      setSlug(generateSlug(value))
    }
  }

  const validateForm = (): boolean => {
    const err: Record<string, string> = {}
    const t = title.trim()
    const s = (slug || generateSlug(title)).trim()
    if (!t) err.title = "Course title is required"
    else if (t.length < 3) err.title = "Title must be at least 3 characters"
    else if (t.length > MAX_TITLE) err.title = `Title must be at most ${MAX_TITLE} characters`
    if (!s) err.slug = "URL slug is required"
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) err.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
    else if (s.length > MAX_SLUG) err.slug = `Slug must be at most ${MAX_SLUG} characters`
    if (description.length > MAX_DESCRIPTION) err.description = `Description must be at most ${MAX_DESCRIPTION} characters`
    const dur = parseInt(estimatedDuration, 10)
    if (estimatedDuration !== "" && (isNaN(dur) || dur < 0)) err.estimatedDuration = "Duration must be 0 or more minutes"
    const pr = parseFloat(price)
    if (price !== "" && (isNaN(pr) || pr < 0)) err.price = "Price must be 0 or more"
    setFormErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setFormErrors({})

    const t = title.trim().slice(0, MAX_TITLE)
    const s = (slug || generateSlug(title)).trim().slice(0, MAX_SLUG).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
    const desc = description.trim().slice(0, MAX_DESCRIPTION)
    const courseData = {
      title: t,
      slug: s || generateSlug(t),
      description: desc,
      thumbnail_url: thumbnailUrl.trim() || null,
      instructor_id: instructorId,
      instructor_name: instructorName.trim().slice(0, 200),
      estimated_duration_minutes: Math.max(0, parseInt(estimatedDuration, 10) || 0),
      difficulty_level: difficultyLevel,
      price: Math.max(0, parseFloat(price) || 0),
      is_featured: isFeatured,
      is_active: isActive,
      order_index: editingCourse ? editingCourse.order_index : courses.length,
    }

    setIsSubmitting(true)
    try {
      if (editingCourse) {
        const response = await fetch(`/api/learning/courses/${editingCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
          credentials: "include",
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || "Failed to update course")
        toast.success("Course updated successfully")
      } else {
        const response = await fetch("/api/learning/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
          credentials: "include",
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || "Failed to create course")
        toast.success("Course created successfully")
      }
      fetchCourses()
      closeDialog()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to save course"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setWizardStep(1)
    setTitle(course.title)
    setSlug(course.slug)
    setDescription(course.description || "")
    setThumbnailUrl(course.thumbnail_url || "")
    setInstructorId(course.instructor_id ?? null)
    setInstructorName(course.instructor_name || "")
    setEstimatedDuration(course.estimated_duration_minutes.toString())
    setDifficultyLevel(course.difficulty_level || "beginner")
    setPrice((course.price || 0).toString())
    setIsFeatured(course.is_featured || false)
    setIsActive(course.is_active !== false)
    setOrderIndex(course.order_index?.toString() || "0")
    setIsDialogOpen(true)
  }

  const openDeleteConfirm = (course: Course) => {
    setDeleteTargetCourse(course)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTargetCourse) return
    const id = deleteTargetCourse.id
    setDeleteConfirmOpen(false)
    setDeleteTargetCourse(null)
    try {
      const response = await fetch(`/api/learning/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to delete course")
      toast.success("Course deleted successfully")
      fetchCourses()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to delete course"
      toast.error(msg)
    }
  }

  const handleViewCourse = (courseId: number) => {
    router.push(`/admin/learning-courses/${courseId}`)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingCourse(null)
    setWizardStep(1)
    setTitle("")
    setSlug("")
    setDescription("")
    setThumbnailUrl("")
    setInstructorId(null)
    setInstructorName("")
    setEstimatedDuration("")
    setDifficultyLevel("beginner")
    setPrice("")
    setIsFeatured(false)
    setIsActive(true)
    setOrderIndex("0")
  }

  const canProceedStep1 = () => {
    const t = title.trim()
    const s = (slug || generateSlug(title)).trim()
    if (!t || t.length < 3) return false
    if (!s || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) return false
    return true
  }

  const goNextStep = () => {
    if (wizardStep === 1 && !canProceedStep1()) {
      validateForm()
      return
    }
    if (wizardStep < WIZARD_STEPS) setWizardStep((s) => s + 1)
  }

  const goPrevStep = () => {
    if (wizardStep === 1) closeDialog()
    else setWizardStep((s) => s - 1)
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image (JPEG, PNG, GIF, WebP)")
      return
    }
    setUploadingThumbnail(true)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("folder", "course-thumbnails")
      form.append("type", "image")
      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Upload failed")
      if (data.url) setThumbnailUrl(data.url)
      else toast.error("No URL returned")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploadingThumbnail(false)
      e.target.value = ""
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-[#2596be]/15 text-[#2596be] border-[#2596be]/30"
      case "intermediate":
        return "bg-[#3c62b3]/15 text-[#3c62b3] border-[#3c62b3]/30"
      case "advanced":
        return "bg-[#1e3d6e]/20 text-[#1e3d6e] border-[#1e3d6e]/30"
      default:
        return "bg-gray-500/15 text-gray-600 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#2596be] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3d6e] via-[#2596be] to-[#3c62b3] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" aria-hidden="true" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Learning Courses</h1>
            <p className="text-white/80 mt-1 text-sm sm:text-base">Manage your learning path courses</p>
          </div>
          <Button
            onClick={() => { setFormErrors({}); setIsDialogOpen(true); }}
            className="bg-white text-[#2596be] hover:bg-white/90 shadow-lg shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card className="border-2 border-dashed border-[#2596be]/20 bg-[#2596be]/5 overflow-hidden">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#2596be]/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-[#2596be]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">Create your first learning course to get started</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-[#2596be] hover:bg-[#1e7a9e] text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-[#2596be]/10 hover:border-[#2596be]/25 rounded-xl overflow-hidden"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-1 line-clamp-2 text-gray-900">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-gray-600">{course.description || "—"}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {course.is_active ? (
                      <Badge className="bg-[#2596be]/15 text-[#2596be] border-[#2596be]/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500/15 text-gray-600 border-gray-500/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    {course.is_featured && (
                      <Badge className="bg-[#3c62b3] text-white border-0">
                        <Award className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getDifficultyColor(course.difficulty_level)} variant="outline">
                    {course.difficulty_level || "Beginner"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-4 w-4 text-[#2596be]" />
                      {course.modules_count || 0} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4 text-[#2596be]" />
                      {course.lessons_count || 0} Lessons
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-[#2596be]" />
                      {Math.floor((course.estimated_duration_minutes || 0) / 60)}h {(course.estimated_duration_minutes || 0) % 60}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-[#2596be]" />
                      <strong className="text-gray-700">Owner:</strong>{" "}
                      {course.instructor_id ? (course.instructor_name || "Instructor") : "System"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10"
                    onClick={() => handleViewCourse(course.id)}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(course)} aria-label="Edit course">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteConfirm(course)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    aria-label="Delete course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog – Wizard */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setFormErrors({}); setWizardStep(1); } }}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-hidden flex flex-col bg-white border-[#2596be]/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingCourse ? "Edit Course" : "Create New Learning Course"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update course details" : "Step " + wizardStep + " of " + WIZARD_STEPS}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex items-center gap-2 py-3 border-b border-gray-200">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors",
                    wizardStep === step ? "bg-[#2596be] text-white" : wizardStep > step ? "bg-[#2596be]/80 text-white" : "bg-gray-200 text-gray-500"
                  )}
                >
                  {wizardStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                </div>
                {step < 4 && <div className={cn("flex-1 h-0.5 mx-1", wizardStep > step ? "bg-[#2596be]" : "bg-gray-200")} />}
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (wizardStep === WIZARD_STEPS) handleSubmit(e); else goNextStep(); }} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto flex-1 py-4 space-y-4">
              {/* Step 1: Basic info */}
              {wizardStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Course Title <span className="text-red-600">*</span></Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => { handleTitleChange(e.target.value); setFormErrors((p) => ({ ...p, title: "" })); }}
                      placeholder="e.g. Introduction to JavaScript"
                      maxLength={MAX_TITLE + 50}
                      className={formErrors.title ? "border-red-500 focus:ring-red-500" : "focus:ring-2 focus:ring-[#2596be] border-gray-200"}
                      aria-invalid={!!formErrors.title}
                    />
                    {formErrors.title && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{formErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">URL Slug <span className="text-red-600">*</span></Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => { setSlug(e.target.value); setFormErrors((p) => ({ ...p, slug: "" })); }}
                      placeholder="e.g. introduction-to-javascript"
                      maxLength={MAX_SLUG + 20}
                      className={formErrors.slug ? "border-red-500 focus:ring-red-500" : "focus:ring-2 focus:ring-[#2596be] border-gray-200"}
                      aria-invalid={!!formErrors.slug}
                    />
                    {formErrors.slug && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{formErrors.slug}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the course"
                      rows={4}
                      maxLength={MAX_DESCRIPTION + 100}
                      className="resize-none focus:ring-2 focus:ring-[#2596be] border-gray-200"
                    />
                    <p className="text-xs text-gray-500">{description.length} / {MAX_DESCRIPTION}</p>
                  </div>
                </>
              )}

              {/* Step 2: Thumbnail */}
              {wizardStep === 2 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Course thumbnail</Label>
                  <div className="flex flex-col gap-2">
                    <Input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={uploadingThumbnail} className="focus:ring-2 focus:ring-[#2596be] border-gray-200" />
                    {uploadingThumbnail && <span className="text-sm text-[#2596be] flex items-center gap-1"><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</span>}
                    <Input id="thumbnail_url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Or paste image URL" className="focus:ring-2 focus:ring-[#2596be] border-gray-200" />
                    {thumbnailUrl && <img src={getImageSrc(thumbnailUrl) || thumbnailUrl} alt="Thumbnail preview" className="h-28 w-auto rounded-xl border border-[#2596be]/20 object-cover mt-2" />}
                  </div>
                </div>
              )}

              {/* Step 3: Instructor, duration, difficulty, price */}
              {wizardStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="instructor" className="text-sm font-semibold text-gray-700">Instructor</Label>
                    <Select
                      value={instructorId === null ? "system" : String(instructorId)}
                      onValueChange={(v) => {
                        if (v === "system") { setInstructorId(null); setInstructorName(""); }
                        else { const id = parseInt(v, 10); setInstructorId(id); setInstructorName(instructors.find((i) => i.id === id)?.full_name ?? ""); }
                      }}
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-[#2596be] border-gray-200"><SelectValue placeholder="Select instructor" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System (no instructor)</SelectItem>
                        {instructors.map((i) => <SelectItem key={i.id} value={String(i.id)}>{i.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Only approved instructors appear.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">Duration (minutes)</Label>
                      <Input id="duration" type="number" value={estimatedDuration} onChange={(e) => { setEstimatedDuration(e.target.value); setFormErrors((p) => ({ ...p, estimatedDuration: "" })); }} placeholder="120" min={0} className={formErrors.estimatedDuration ? "border-red-500" : "focus:ring-2 focus:ring-[#2596be] border-gray-200"} />
                      {formErrors.estimatedDuration && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{formErrors.estimatedDuration}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-sm font-semibold text-gray-700">Difficulty</Label>
                      <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                        <SelectTrigger className="focus:ring-2 focus:ring-[#2596be] border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 p-4 rounded-xl bg-[#2596be]/5 border border-[#2596be]/20">
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-700 flex items-center gap-2"><DollarSign className="h-4 w-4 text-[#2596be]" /> Price ($)</Label>
                    <Input id="price" type="number" step="0.01" value={price} onChange={(e) => { setPrice(e.target.value); setFormErrors((p) => ({ ...p, price: "" })); }} placeholder="0.00" min={0} className={formErrors.price ? "border-red-500 bg-white" : "focus:ring-2 focus:ring-[#2596be] border-[#2596be]/20 bg-white"} />
                    {formErrors.price && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{formErrors.price}</p>}
                  </div>
                </>
              )}

              {/* Step 4: Toggles + review */}
              {wizardStep === 4 && (
                <>
                  <div className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200">
                      <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsFeatured(!isFeatured)}>
                        <div className="p-2 rounded-lg bg-[#3c62b3]/10"><Star className="h-5 w-5 text-[#3c62b3]" /></div>
                        <div className="flex-1">
                          <Label className="text-sm font-semibold text-gray-900 cursor-pointer">Featured Course</Label>
                          <p className="text-xs text-gray-600">Show on homepage</p>
                        </div>
                      </div>
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}><Switch id="is_featured" checked={isFeatured} onCheckedChange={setIsFeatured} className="data-[state=checked]:bg-[#3c62b3]" /></div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200">
                      <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsActive(!isActive)}>
                        <div className="p-2 rounded-lg bg-[#2596be]/10"><Eye className="h-5 w-5 text-[#2596be]" /></div>
                        <div className="flex-1">
                          <Label className="text-sm font-semibold text-gray-900 cursor-pointer">Active</Label>
                          <p className="text-xs text-gray-600">Visible to students</p>
                        </div>
                      </div>
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}><Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-[#2596be]" /></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-[#2596be]/20 bg-[#2596be]/5 space-y-2">
                    <p className="text-sm font-semibold text-gray-800">Review</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">Title:</span> {title || "—"}</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">Slug:</span> {slug || "—"}</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">Duration:</span> {estimatedDuration || "0"} min · <span className="font-medium">Difficulty:</span> {difficultyLevel} · <span className="font-medium">Price:</span> ${price || "0"}</p>
                  </div>
                </>
              )}
            </div>

            {/* Wizard footer */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 shrink-0">
              <Button type="button" variant="outline" onClick={goPrevStep} disabled={isSubmitting} className="flex-1 h-11 border-gray-300 hover:bg-gray-50">
                {wizardStep === 1 ? "Cancel" : "Back"}
              </Button>
              {wizardStep < WIZARD_STEPS ? (
                <Button type="button" onClick={goNextStep} className="flex-1 h-11 bg-[#2596be] hover:bg-[#1e7a9e] text-white font-semibold">
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 bg-[#2596be] hover:bg-[#1e7a9e] text-white font-semibold disabled:opacity-70">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : editingCourse ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Update Course</> : <><Sparkles className="h-4 w-4 mr-2" /> Create Course</>}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete course?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTargetCourse?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setDeleteConfirmOpen(false); setDeleteTargetCourse(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
