"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Edit, Trash2, Plus, FolderOpen, PlayCircle } from "lucide-react"

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  modules_count: number
  lessons_count: number
  created_at: string
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [instructor, setInstructor] = useState("")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error("[v0] Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const courseData = {
      title,
      description,
      instructor,
      duration: "8 weeks",
      rating: 0,
      students_count: 0,
    }

    try {
      if (editingCourse) {
        // Update existing course
        await fetch("/api/courses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...courseData, id: editingCourse.id }),
        })
      } else {
        // Create new course
        await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        })
      }

      fetchCourses()
      closeDialog()
    } catch (error) {
      console.error("[v0] Error saving course:", error)
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setTitle(course.title)
    setDescription(course.description)
    setInstructor(course.instructor)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      await fetch(`/api/courses?id=${id}`, { method: "DELETE" })
      fetchCourses()
    } catch (error) {
      console.error("[v0] Error deleting course:", error)
    }
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingCourse(null)
    setTitle("")
    setDescription("")
    setInstructor("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Create and manage courses with modules and lessons</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No courses yet. Create your first course!</div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-4">
                {/* Course Icon */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-red-600" />
                </div>

                {/* Course Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <span className="font-medium">
                      Instructor: <span className="text-gray-900">{course.instructor}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-4 w-4" />
                      {course.modules_count} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" />
                      {course.lessons_count} Lessons
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => (window.location.href = `/admin/courses/${course.id}`)}
                      className="hover:bg-purple-50 hover:border-purple-300"
                    >
                      <FolderOpen className="h-4 w-4 text-purple-600 mr-2" />
                      Manage Modules
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(course)}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4 text-blue-600 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(course.id)}
                      className="hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingCourse ? "Edit Course" : "Create New Course"}
            </DialogTitle>
            <p className="text-gray-600 text-sm">Add a new course with modules and lessons</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Course Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                Course Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to JavaScript"
                required
                className="focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the course"
                rows={3}
                className="resize-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Instructor */}
            <div className="space-y-2">
              <Label htmlFor="instructor" className="text-sm font-semibold text-gray-700">
                Instructor
              </Label>
              <Input
                id="instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. John Doe"
                className="focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {editingCourse ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
