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
  ArrowLeft,
  BookOpen,
  Loader2,
  Save,
  Layers,
  FileVideo,
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

  useEffect(() => {
    if (!id) return
    fetchCourse()
  }, [id])

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
          <Link href="/instructor/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" className="mb-6 gap-2 text-slate-600" asChild>
        <Link href="/instructor/courses">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#e63946]" />
            Modules & Lessons
          </CardTitle>
          <p className="text-slate-500 text-sm">
            Manage modules and lessons from the admin learning courses page, or via API. This view shows the current structure.
          </p>
        </CardHeader>
        <CardContent>
          {course.modules?.length ? (
            <ul className="space-y-3">
              {course.modules.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <FileVideo className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{m.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {m.lessons_count ?? 0} lessons
                    </Badge>
                  </div>
                  <Badge variant={m.is_active ? "default" : "secondary"} className={m.is_active ? "bg-green-50 text-green-700" : ""}>
                    {m.is_active ? "Active" : "Inactive"}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No modules yet. Add modules and lessons from Admin → Learning Courses → this course.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
