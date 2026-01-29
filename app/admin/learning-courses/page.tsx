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
  Eye
} from "lucide-react"
import { toast } from "sonner"

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
  const [instructorName, setInstructorName] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [difficultyLevel, setDifficultyLevel] = useState("beginner")
  const [price, setPrice] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [orderIndex, setOrderIndex] = useState("0")

  useEffect(() => {
    fetchCourses()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const courseData = {
      title,
      slug: slug || generateSlug(title),
      description,
      thumbnail_url: thumbnailUrl || null,
      instructor_name: instructorName,
      estimated_duration_minutes: parseInt(estimatedDuration) || 0,
      difficulty_level: difficultyLevel,
      price: parseFloat(price) || 0,
      is_featured: isFeatured,
      is_active: isActive,
      order_index: editingCourse ? editingCourse.order_index : courses.length, // Automatic: next available index for new, keep existing for edit
    }

    try {
      if (editingCourse) {
        // Update existing course - need to add PUT endpoint
        const response = await fetch(`/api/learning/courses/${editingCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update course")
        }

        toast.success("Course updated successfully")
      } else {
        // Create new course
        const response = await fetch("/api/learning/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to create course")
        }

        toast.success("Course created successfully")
      }

      fetchCourses()
      closeDialog()
    } catch (error: any) {
      console.error("Error saving course:", error)
      toast.error(error.message || "Failed to save course")
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setTitle(course.title)
    setSlug(course.slug)
    setDescription(course.description || "")
    setThumbnailUrl(course.thumbnail_url || "")
    setInstructorName(course.instructor_name || "")
    setEstimatedDuration(course.estimated_duration_minutes.toString())
    setDifficultyLevel(course.difficulty_level || "beginner")
    setPrice((course.price || 0).toString())
    setIsFeatured(course.is_featured || false)
    setIsActive(course.is_active !== false)
    setOrderIndex(course.order_index?.toString() || "0")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return

    try {
      const response = await fetch(`/api/learning/courses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete course")
      }

      toast.success("Course deleted successfully")
      fetchCourses()
    } catch (error: any) {
      console.error("Error deleting course:", error)
      toast.error(error.message || "Failed to delete course")
    }
  }

  const handleViewCourse = (courseId: number) => {
    router.push(`/admin/learning-courses/${courseId}`)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingCourse(null)
    setTitle("")
    setSlug("")
    setDescription("")
    setThumbnailUrl("")
    setInstructorName("")
    setEstimatedDuration("")
    setDifficultyLevel("beginner")
    setPrice("")
    setIsFeatured(false)
    setIsActive(true)
    setOrderIndex("0")
  }

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "intermediate":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Courses</h1>
          <p className="text-gray-600 mt-1">Manage your learning path courses</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">Create your first learning course to get started</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white"
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
              className="hover:shadow-lg transition-shadow border border-gray-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1 line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {course.is_active ? (
                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    {course.is_featured && (
                      <Badge className="bg-gradient-to-r from-[#e63946] to-[#d62839] text-white border-0">
                        <Award className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getDifficultyColor(course.difficulty_level)}>
                    {course.difficulty_level || "Beginner"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-4 w-4 text-[#e63946]" />
                      {course.modules_count || 0} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4 text-[#e63946]" />
                      {course.lessons_count || 0} Lessons
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-[#e63946]" />
                      {Math.floor((course.estimated_duration_minutes || 0) / 60)}h {(course.estimated_duration_minutes || 0) % 60}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-[#e63946]" />
                      <strong className="text-gray-700">Owner:</strong>{" "}
                      {course.instructor_id ? (course.instructor_name || "Instructor") : "System"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewCourse(course.id)}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingCourse ? "Edit Course" : "Create New Learning Course"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update course details" : "Add a new course to the learning path system"}
            </DialogDescription>
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
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Introduction to JavaScript"
                required
                className="focus:ring-2 focus:ring-[#e63946]"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">
                URL Slug <span className="text-red-600">*</span>
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. introduction-to-javascript"
                required
                className="focus:ring-2 focus:ring-[#e63946]"
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
                rows={4}
                className="resize-none focus:ring-2 focus:ring-[#e63946]"
              />
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url" className="text-sm font-semibold text-gray-700">
                Thumbnail URL
              </Label>
              <Input
                id="thumbnail_url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="focus:ring-2 focus:ring-[#e63946]"
              />
            </div>

            {/* Instructor Name */}
            <div className="space-y-2">
              <Label htmlFor="instructor_name" className="text-sm font-semibold text-gray-700">
                Instructor Name
              </Label>
              <Input
                id="instructor_name"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="e.g. John Doe"
                className="focus:ring-2 focus:ring-[#e63946]"
              />
            </div>

            {/* Duration and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="120"
                  min="0"
                  className="focus:ring-2 focus:ring-[#e63946]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-semibold text-gray-700">
                  Difficulty Level
                </Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger className="focus:ring-2 focus:ring-[#e63946]">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Section */}
            <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
              <Label htmlFor="price" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                className="focus:ring-2 focus:ring-green-500 border-green-300 bg-white"
              />
              <p className="text-xs text-gray-600">Course price in dollars</p>
            </div>

            {/* Toggles Section */}
            <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 hover:border-[#e63946]/30 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 flex-1" onClick={() => setIsFeatured(!isFeatured)}>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="space-y-0.5 flex-1 cursor-pointer">
                    <Label htmlFor="is_featured" className="text-sm font-semibold text-gray-900 cursor-pointer">
                      Featured Course
                    </Label>
                    <p className="text-xs text-gray-600">Show this course prominently on the homepage</p>
                  </div>
                </div>
                <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    id="is_featured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#e63946] data-[state=checked]:to-[#d62839] cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 flex-1" onClick={() => setIsActive(!isActive)}>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-0.5 flex-1 cursor-pointer">
                    <Label htmlFor="is_active" className="text-sm font-semibold text-gray-900 cursor-pointer">
                      Active
                    </Label>
                    <p className="text-xs text-gray-600">Course is visible and accessible to students</p>
                  </div>
                </div>
                <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                className="flex-1 h-11 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white shadow-lg shadow-[#e63946]/30 hover:shadow-[#e63946]/50 transition-all duration-300 font-semibold"
              >
                {editingCourse ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Update Course
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Course
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
