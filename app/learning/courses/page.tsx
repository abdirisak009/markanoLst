"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getImageSrc } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  Award,
  TrendingUp,
  Sparkles,
  Users,
  Zap,
  Target,
} from "lucide-react"

interface Course {
  id: number
  title: string
  description: string
  thumbnail_url: string
  instructor_name: string
  estimated_duration_minutes: number
  difficulty_level: string
  is_featured: boolean
  modules_count: number
  lessons_count: number
  progress: {
    progress_percentage: number
    lessons_completed: number
    total_lessons: number
    current_lesson_id: number | null
    last_accessed_at: string | null
  }
}

export default function LearningCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCourse, setHoveredCourse] = useState<number | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    // Get user ID from auth system
    const storedUser = localStorage.getItem("gold_student") || localStorage.getItem("verified_student_id")
    if (storedUser) {
      const user = typeof storedUser === "string" ? JSON.parse(storedUser) : { id: storedUser }
      setUserId(user.id || user)
      fetchCourses(user.id || user)
    } else {
      fetchCourses(null)
    }
  }, [])

  const fetchCourses = async (userId: number | null) => {
    try {
      const url = userId 
        ? `/api/learning/courses?userId=${userId}`
        : `/api/learning/courses`
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) {
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mb-4"></div>
          <p className="text-gray-400">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d62839]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#e63946]/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        {/* Website Header */}
        <Navbar />

        {/* Hero Section */}
        <div className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-16 md:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#e63946]/20 to-[#d62839]/20 border border-[#e63946]/30 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Award className="h-4 w-4 text-[#e63946]" />
              <span className="text-sm font-semibold text-[#e63946]">Learning Path</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Explore Learning Courses
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              Master new skills with our comprehensive learning paths. Track your progress, earn XP, and unlock achievements as you learn.
            </p>
          </div>
        </div>

        {/* Courses Section */}
        <div className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Available Courses
                </h2>
                <p className="text-gray-400">
                  {courses.length} {courses.length === 1 ? "Course" : "Courses"} Available
                </p>
              </div>
              {userId && (
                <Link href="/learning/dashboard">
                  <Button 
                    variant="outline" 
                    className="border-[#e63946]/30 text-[#e63946] hover:bg-[#e63946]/10 hover:border-[#e63946]/50"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    My Dashboard
                  </Button>
                </Link>
              )}
            </div>

            {/* Courses Grid */}
            {courses.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#0f1419] via-[#0a0a0f] to-[#0f1419] border border-white/10">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No courses available</h3>
                  <p className="text-gray-400">Check back soon for new learning paths!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {courses.map((course, index) => {
                  const progress = course.progress?.progress_percentage || 0
                  const isCompleted = progress === 100
                  const hasProgress = progress > 0 && !isCompleted

                  return (
                    <Card
                      key={course.id}
                      className="group relative bg-gradient-to-br from-[#0f1419] via-[#0a0a0f] to-[#0f1419] border border-white/10 hover:border-[#e63946]/40 overflow-hidden backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-[#e63946]/20 transition-all duration-500 hover:scale-[1.03] animate-in slide-in-from-bottom-4 duration-500 cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onMouseEnter={() => setHoveredCourse(course.id)}
                      onMouseLeave={() => setHoveredCourse(null)}
                      onClick={() => router.push(`/learning/courses/${course.id}`)}
                    >
                      {/* Animated Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/0 via-[#e63946]/5 to-[#e63946]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Featured Badge */}
                      {course.is_featured && (
                        <div className="absolute top-4 right-4 z-20">
                          <Badge className="bg-gradient-to-r from-[#e63946] to-[#d62839] text-white shadow-lg shadow-[#e63946]/50 border-0 animate-pulse">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      {/* Completion Badge */}
                      {isCompleted && (
                        <div className="absolute top-4 left-4 z-20">
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      )}

                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden">
                        {course.thumbnail_url ? (
                          <img
                            src={getImageSrc(course.thumbnail_url) || course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/20 flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-[#e63946]/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                      </div>

                      {/* Content Section */}
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-white mb-2 group-hover:text-[#e63946] transition-colors line-clamp-2">
                              {course.title}
                            </CardTitle>
                            <CardDescription className="text-gray-400 line-clamp-2 mb-4">
                              {course.description}
                            </CardDescription>
                          </div>
                        </div>

                        {/* Difficulty Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className={getDifficultyColor(course.difficulty_level)}>
                            {course.difficulty_level || "Beginner"}
                          </Badge>
                        </div>

                        {/* Course Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <BookOpen className="h-4 w-4 text-[#e63946]" />
                            <span className="text-sm">{course.modules_count || 0} Modules</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <BookOpen className="h-4 w-4 text-[#e63946]" />
                            <span className="text-sm">{course.lessons_count || 0} Lessons</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="h-4 w-4 text-[#e63946]" />
                            <span className="text-sm">
                              {Math.floor((course.estimated_duration_minutes || 0) / 60)}h {(course.estimated_duration_minutes || 0) % 60}m
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Users className="h-4 w-4 text-[#e63946]" />
                            <span className="text-sm">{course.instructor_name || "Expert"}</span>
                          </div>
                        </div>

                        {/* Progress Bar (if user has progress) */}
                        {userId && course.progress && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-400 font-medium">Progress</span>
                              <span className="text-white font-bold">{progress}%</span>
                            </div>
                            <Progress 
                              value={progress} 
                              className="h-2 bg-gray-800"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {course.progress.lessons_completed} of {course.progress.total_lessons} lessons completed
                            </p>
                          </div>
                        )}
                      </CardHeader>

                      {/* Action Button */}
                      <CardContent className="p-6 pt-0">
                        {userId && course.progress?.current_lesson_id ? (
                          <Link href={`/learning/lessons/${course.progress.current_lesson_id}`}>
                            <Button 
                              className="w-full bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white shadow-lg shadow-[#e63946]/30 group-hover:shadow-[#e63946]/50 transition-all duration-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                              Continue Learning
                            </Button>
                          </Link>
                        ) : isCompleted ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Course Completed
                          </Button>
                        ) : (
                          <Button 
                            className="w-full bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white shadow-lg shadow-[#e63946]/30 group-hover:shadow-[#e63946]/50 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/learning/courses/${course.id}`)
                            }}
                          >
                            <Target className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                            View Course
                            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
