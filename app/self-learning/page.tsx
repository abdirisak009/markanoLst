"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import {
  Award,
  BookOpen,
  Clock,
  Users,
  Zap,
  Sparkles,
  ArrowRight,
  Play,
  Folder,
  ChevronRight,
  Target,
  TrendingUp,
  Star,
  GraduationCap,
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
  price: number
}

export default function SelfLearningPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCourse, setHoveredCourse] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [courseModules, setCourseModules] = useState<any[]>([])
  const [courseLessons, setCourseLessons] = useState<Record<number, any[]>>({})
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/learning/courses")
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

  const fetchCourseDetails = async (courseId: number) => {
    setLoadingCourseDetails(true)
    try {
      // Fetch modules
      const modulesRes = await fetch(`/api/learning/modules?courseId=${courseId}`)
      if (modulesRes.ok) {
        const modules = await modulesRes.json()
        setCourseModules(modules || [])
        
        // Fetch lessons for each module
        const lessonsData: Record<number, any[]> = {}
        for (const module of modules) {
          const lessonsRes = await fetch(`/api/learning/lessons?moduleId=${module.id}`)
          if (lessonsRes.ok) {
            lessonsData[module.id] = await lessonsRes.json()
          }
        }
        setCourseLessons(lessonsData)
      }
    } catch (error) {
      console.error("Error fetching course details:", error)
    } finally {
      setLoadingCourseDetails(false)
    }
  }

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setShowPopup(true)
    fetchCourseDetails(course.id)
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
        <section className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pt-20 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-slide-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#e63946] to-[#d62839] mb-6 shadow-2xl shadow-[#e63946]/30 hover:scale-110 transition-transform duration-500 group/icon">
                <GraduationCap className="h-10 w-10 text-white group-hover/icon:rotate-12 transition-transform" />
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Self Learning
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Master new skills at your own pace. Explore our comprehensive collection of courses designed to help you grow.
              </p>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pb-20">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#e63946] mb-4"></div>
                <p className="text-gray-400 text-lg">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/30 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-16 text-center">
                  <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-bold text-white mb-3">No courses available yet</h3>
                  <p className="text-gray-400 text-lg">Check back soon for exciting learning opportunities!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#e63946]/10 via-[#e63946]/5 to-transparent border border-[#e63946]/20 hover:border-[#e63946]/40 hover:bg-gradient-to-br hover:from-[#e63946]/20 hover:via-[#e63946]/10 hover:to-transparent transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#e63946]/20 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-all duration-300">
                        <BookOpen className="h-6 w-6 text-[#e63946] group-hover/stat:animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">Total Courses</p>
                        <p className="text-white font-black text-2xl group-hover/stat:text-[#e63946] transition-colors">{courses.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#e63946]/10 via-[#e63946]/5 to-transparent border border-[#e63946]/20 hover:border-[#e63946]/40 hover:bg-gradient-to-br hover:from-[#e63946]/20 hover:via-[#e63946]/10 hover:to-transparent transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#e63946]/20 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-all duration-300">
                        <Folder className="h-6 w-6 text-[#e63946] group-hover/stat:animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">Total Modules</p>
                        <p className="text-white font-black text-2xl group-hover/stat:text-[#e63946] transition-colors">
                          {courses.reduce((acc, c) => acc + (c.modules_count || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#e63946]/10 via-[#e63946]/5 to-transparent border border-[#e63946]/20 hover:border-[#e63946]/40 hover:bg-gradient-to-br hover:from-[#e63946]/20 hover:via-[#e63946]/10 hover:to-transparent transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#e63946]/20 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-all duration-300">
                        <Play className="h-6 w-6 text-[#e63946] group-hover/stat:animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">Total Lessons</p>
                        <p className="text-white font-black text-2xl group-hover/stat:text-[#e63946] transition-colors">
                          {courses.reduce((acc, c) => acc + (c.lessons_count || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#e63946]/20 via-[#d62839]/20 to-[#e63946]/20 border border-[#e63946]/30 hover:border-[#e63946]/50 hover:from-[#e63946]/30 hover:via-[#d62839]/30 hover:to-[#e63946]/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#e63946]/30 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-all duration-300">
                        <Star className="h-6 w-6 text-[#e63946] group-hover/stat:animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-300 uppercase mb-1">Featured</p>
                        <p className="text-white font-black text-2xl group-hover/stat:scale-110 transition-transform">
                          {courses.filter((c) => c.is_featured).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {courses.map((course, index) => {
                    const coursePrice = typeof course.price === "number" ? course.price : parseFloat(String(course.price || 0)) || 0
                    const isFree = coursePrice === 0
                    const modulesCount = course.modules_count || 0
                    const lessonsCount = course.lessons_count || 0

                    return (
                      <Card
                        key={course.id}
                        className="group relative bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border border-white/10 hover:border-[#e63946]/40 overflow-hidden backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-[#e63946]/20 transition-all duration-500 hover:scale-[1.03] animate-slide-up cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onMouseEnter={() => setHoveredCourse(course.id)}
                        onMouseLeave={() => setHoveredCourse(null)}
                        onClick={() => router.push(`/self-learning/courses/${course.id}`)}
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

                        {/* Image Section */}
                        <div className="h-56 bg-gradient-to-br from-[#e63946]/20 via-[#0f1419] to-[#0a0a0f] overflow-hidden relative">
                          {course.thumbnail_url ? (
                            <>
                              <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className={`w-full h-full object-cover transition-transform duration-700 ${
                                  hoveredCourse === course.id ? "scale-110" : "scale-100"
                                }`}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0f1419]/50 to-transparent" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e63946]/10 to-[#0a0a0f]">
                              <div className="relative">
                                <BookOpen className="h-24 w-24 text-[#e63946]/30" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 rounded-full bg-[#e63946]/10 animate-pulse" />
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Course Title Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0f] to-transparent">
                            <h3 className="text-white font-black text-xl md:text-2xl drop-shadow-2xl mb-1 group-hover:text-[#e63946] transition-colors duration-300">
                              {course.title}
                            </h3>
                            {course.description && (
                              <p className="text-gray-300 text-sm line-clamp-2 opacity-90">{course.description}</p>
                            )}
                          </div>
                        </div>

                        <CardContent className="p-6 bg-[#0a0a0f] relative z-10">
                          {/* Instructor & Difficulty */}
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover:scale-110 transition-transform">
                                <Users className="h-4 w-4 text-[#e63946]" />
                              </div>
                              <span className="text-gray-300 text-sm font-medium truncate">
                                {course.instructor_name || "Expert Instructor"}
                              </span>
                            </div>
                            <Badge className={`${getDifficultyColor(course.difficulty_level)} border-0 font-semibold capitalize`}>
                              {course.difficulty_level}
                            </Badge>
                          </div>

                          {/* Course Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/item">
                              <div className="p-1.5 rounded-md bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover/item:scale-110 transition-transform">
                                <Folder className="h-4 w-4 text-[#e63946]" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Modules</p>
                                <p className="text-sm font-bold text-white">{modulesCount}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/item">
                              <div className="p-1.5 rounded-md bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover/item:scale-110 transition-transform">
                                <Play className="h-4 w-4 text-[#e63946]" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Lessons</p>
                                <p className="text-sm font-bold text-white">{lessonsCount}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/item">
                              <div className="p-1.5 rounded-md bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover/item:scale-110 transition-transform">
                                <Clock className="h-4 w-4 text-[#e63946]" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Duration</p>
                                <p className="text-sm font-bold text-white">
                                  {Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/item">
                              <div className="p-1.5 rounded-md bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover/item:scale-110 transition-transform">
                                <Zap className="h-4 w-4 text-[#e63946]" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">XP</p>
                                <p className="text-sm font-bold text-[#e63946]">{lessonsCount * 10}</p>
                              </div>
                            </div>
                          </div>

                          {/* Price Section */}
                          <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-[#e63946]/10 to-[#e63946]/5 border border-[#e63946]/20 hover:border-[#e63946]/40 transition-all group/price">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Course Price</p>
                                {isFree ? (
                                  <p className="text-2xl font-black text-green-400 group-hover/price:scale-110 transition-transform">
                                    FREE
                                  </p>
                                ) : (
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-white group-hover/price:text-[#e63946] transition-colors">
                                      ${coursePrice.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-400">USD</span>
                                  </div>
                                )}
                              </div>
                              {!isFree && (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e63946] to-[#d62839] flex items-center justify-center shadow-lg shadow-[#e63946]/30 group-hover/price:scale-110 group-hover/price:rotate-12 transition-all">
                                  <span className="text-white font-bold text-lg">$</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="block" onClick={(e) => e.stopPropagation()}>
                            <Button
                              onClick={() => {
                                handleCourseClick(course)
                              }}
                              className="w-full bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white font-bold shadow-lg shadow-[#e63946]/25 hover:shadow-[#e63946]/40 transition-all duration-300 group/btn h-12 text-base hover:scale-105 active:scale-95"
                            >
                              <span className="flex items-center justify-center gap-2">
                                {isFree ? (
                                  <>
                                    <Award className="h-5 w-5" />
                                    Enroll for Free
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-5 w-5" />
                                    View Course Details
                                  </>
                                )}
                                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                              </span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Course Preview Popup - Amazing Design */}
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <DialogContent className="max-w-[95vw] w-[95vw] md:max-w-[90vw] md:w-[90vw] lg:max-w-[85vw] lg:w-[85vw] xl:max-w-[80vw] xl:w-[80vw] 2xl:max-w-[75vw] 2xl:w-[75vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border-[#e63946]/40 shadow-2xl shadow-[#e63946]/20 p-0 animate-in zoom-in-95 duration-300">
            {selectedCourse && (
              <div className="relative">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/10 via-transparent to-[#d62839]/10 rounded-lg blur-2xl -z-10 animate-pulse" />

                {/* Hero Section with Image */}
                <div className="relative h-72 md:h-80 lg:h-96 overflow-hidden">
                  {selectedCourse.thumbnail_url ? (
                    <>
                      <img
                        src={selectedCourse.thumbnail_url}
                        alt={selectedCourse.title}
                        className="w-full h-full object-cover animate-in fade-in duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0f1419]/70 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e63946]/20 via-[#0f1419] to-[#0a0a0f]">
                      <div className="relative">
                        <BookOpen className="h-32 w-32 text-[#e63946]/30 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-[#e63946]/10 animate-ping" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Title Overlay - Only Course Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10 bg-gradient-to-t from-[#0a0a0f] via-[#0f1419]/90 to-transparent">
                    <div className="flex items-start justify-between animate-in slide-in-from-bottom-4 duration-500 delay-200">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#d62839] shadow-2xl shadow-[#e63946]/50 animate-in zoom-in duration-500 delay-300">
                            <BookOpen className="h-6 w-6 md:h-7 md:w-7 text-white" />
                          </div>
                          <Badge className={`${getDifficultyColor(selectedCourse.difficulty_level)} border-0 font-semibold capitalize text-xs md:text-sm px-3 md:px-4 py-1.5 animate-in fade-in duration-500 delay-400`}>
                            {selectedCourse.difficulty_level}
                          </Badge>
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-in slide-in-from-left-4 duration-500 delay-300">
                          {selectedCourse.title}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section with Tabs */}
                <div className="p-6 md:p-8 lg:p-10 xl:p-12">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#0a0a0f] border border-[#e63946]/20">
                      <TabsTrigger 
                        value="overview" 
                        className="text-gray-300 data-[state=active]:bg-[#e63946] data-[state=active]:text-white data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-[#e63946]/20 transition-all font-semibold"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="curriculum" 
                        className="text-gray-300 data-[state=active]:bg-[#e63946] data-[state=active]:text-white data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-[#e63946]/20 transition-all font-semibold"
                      >
                        Curriculum
                      </TabsTrigger>
                      <TabsTrigger 
                        value="details" 
                        className="text-gray-300 data-[state=active]:bg-[#e63946] data-[state=active]:text-white data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-[#e63946]/20 transition-all font-semibold"
                      >
                        Details
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-6">
                      {/* Full Description - Prominent */}
                      <div className="space-y-3 p-6 rounded-xl bg-gradient-to-br from-[#e63946]/10 via-[#d62839]/5 to-transparent border border-[#e63946]/20">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-[#e63946]" />
                          About This Course
                        </h3>
                        <p className="text-gray-200 leading-relaxed text-base md:text-lg">
                          {selectedCourse.description || "No description available."}
                        </p>
                      </div>

                      {/* Course Stats - Only 2 Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-[#e63946]/15 to-[#d62839]/10 border border-[#e63946]/30 hover:border-[#e63946]/50 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#e63946]/30 to-[#d62839]/20">
                              <Zap className="h-5 w-5 text-[#e63946]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 uppercase mb-1">Total XP</p>
                              <p className="text-white font-black text-2xl">{(selectedCourse.lessons_count || 0) * 10}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-r from-[#e63946]/20 via-[#d62839]/20 to-[#e63946]/20 border border-[#e63946]/40 hover:border-[#e63946]/60 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#e63946]/30 to-[#d62839]/20">
                              <Award className="h-5 w-5 text-[#e63946]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 uppercase mb-1">Price</p>
                              {typeof selectedCourse.price === "number" && selectedCourse.price === 0 ? (
                                <p className="text-green-400 font-black text-2xl">FREE</p>
                              ) : (
                                <p className="text-white font-black text-2xl">
                                  ${(typeof selectedCourse.price === "number" ? selectedCourse.price : parseFloat(String(selectedCourse.price || 0)) || 0).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Difficulty & Level */}
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Difficulty Level</p>
                          <Badge className={`${getDifficultyColor(selectedCourse.difficulty_level)} border-0 font-semibold capitalize`}>
                            {selectedCourse.difficulty_level}
                          </Badge>
                        </div>
                        {selectedCourse.is_featured && (
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Status</p>
                            <Badge className="bg-[#e63946]/20 text-[#e63946] border-[#e63946]/30">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Curriculum Tab */}
                    <TabsContent value="curriculum" className="space-y-4 mt-6">
                      {loadingCourseDetails ? (
                        <div className="text-center py-12 bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] rounded-xl border border-[#e63946]/20">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#e63946] mb-4"></div>
                          <p className="text-gray-300">Loading curriculum...</p>
                        </div>
                      ) : courseModules.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Folder className="h-5 w-5 text-[#e63946]" />
                            Course Curriculum
                          </h3>
                          {courseModules.map((module, index) => (
                            <div key={module.id} className="border border-[#e63946]/30 rounded-lg p-4 bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] hover:border-[#e63946]/50 hover:bg-gradient-to-br hover:from-[#e63946]/10 hover:via-[#d62839]/5 hover:to-transparent transition-all">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#e63946]/20 flex items-center justify-center text-[#e63946] font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-semibold">{module.title}</h4>
                                  {module.description && (
                                    <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                                  )}
                                </div>
                                <Badge className="bg-[#e63946]/20 text-[#e63946] border-[#e63946]/30">
                                  {courseLessons[module.id]?.length || 0} Lessons
                                </Badge>
                              </div>
                              {courseLessons[module.id] && courseLessons[module.id].length > 0 && (
                                <div className="ml-11 space-y-2 mt-3">
                                  {courseLessons[module.id].map((lesson: any) => (
                                    <div key={lesson.id} className="flex items-center gap-2 text-sm text-gray-300">
                                      <Play className="h-3 w-3 text-[#e63946]" />
                                      <span>{lesson.title}</span>
                                      {lesson.xp_reward && (
                                        <Badge variant="outline" className="ml-auto text-xs border-[#e63946]/30 text-[#e63946]">
                                          {lesson.xp_reward} XP
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Folder className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No curriculum available yet</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Target className="h-5 w-5 text-[#e63946]" />
                            Course Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Course ID</p>
                              <p className="text-white text-sm">#{selectedCourse.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Instructor</p>
                              <p className="text-white text-sm">{selectedCourse.instructor_name || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Difficulty</p>
                              <Badge className={`${getDifficultyColor(selectedCourse.difficulty_level)} border-0 capitalize`}>
                                {selectedCourse.difficulty_level}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Total Duration</p>
                              <p className="text-white text-sm">
                                {Math.floor(selectedCourse.estimated_duration_minutes / 60)} hours {selectedCourse.estimated_duration_minutes % 60} minutes
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-[#e63946]" />
                            Learning Stats
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Total Modules</p>
                              <p className="text-white text-sm font-semibold">{selectedCourse.modules_count || 0} modules</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Total Lessons</p>
                              <p className="text-white text-sm font-semibold">{selectedCourse.lessons_count || 0} lessons</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">XP Reward</p>
                              <p className="text-white text-sm font-semibold">{(selectedCourse.lessons_count || 0) * 10} XP</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Course Price</p>
                              {typeof selectedCourse.price === "number" && selectedCourse.price === 0 ? (
                                <p className="text-green-400 text-sm font-semibold">FREE</p>
                              ) : (
                                <p className="text-white text-sm font-semibold">
                                  ${(typeof selectedCourse.price === "number" ? selectedCourse.price : parseFloat(String(selectedCourse.price || 0)) || 0).toFixed(2)} USD
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 mt-6 border-t border-[#e63946]/20">
                    <Button
                      onClick={() => {
                        setShowPopup(false)
                        router.push(`/learning/courses/${selectedCourse.id}`)
                      }}
                      className="flex-1 bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white font-semibold shadow-lg shadow-[#e63946]/25 hover:shadow-[#e63946]/40 transition-all duration-300 h-11 text-sm md:text-base group/btn hover:scale-105 active:scale-95"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Play className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="whitespace-nowrap">Go to Course Page</span>
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                    <Button
                      onClick={() => setShowPopup(false)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 hover:border-[#e63946]/40 h-11 px-5 text-sm md:text-base transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-20 pt-16 pb-8 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              {/* Brand Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e63946] to-[#d62839] flex items-center justify-center shadow-lg shadow-[#e63946]/30">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Self</h3>
                    <span className="text-xl font-black text-[#e63946]">Learning</span>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Your journey to mastery starts here. Learn at your own pace, track your progress, and unlock your potential.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#e63946]" />
                  Quick Links
                </h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link href="/student-login" className="hover:text-[#e63946] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Student Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/learning/dashboard" className="hover:text-[#e63946] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      My Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/videos" className="hover:text-[#e63946] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Video Tutorials
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#e63946]" />
                  Support
                </h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link href="/student-login" className="hover:text-[#e63946] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Login / Register
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#e63946] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 text-sm">
                  &copy; 2025 <span className="text-[#e63946] font-bold">Markano Self Learning</span>. Empowering Tech Education in Somalia.
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <a href="#" className="hover:text-[#e63946] transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-[#e63946] transition-colors">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
