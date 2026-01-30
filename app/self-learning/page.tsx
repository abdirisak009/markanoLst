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
        return "bg-[#016b62]/20 text-[#016b62] border-[#016b62]/30"
      case "intermediate":
        return "bg-[#fcad21]/20 text-[#016b62] border-[#fcad21]/30"
      case "advanced":
        return "bg-[#016b62]/25 text-[#014d44] border-[#016b62]/40"
      default:
        return "bg-[#016b62]/10 text-[#016b62] border-[#016b62]/20"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-[#fcf6f0] to-[#e8f4f3] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#016b62]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#fcad21]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#016b62]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pt-20 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#016b62] to-[#014d44] mb-6 shadow-2xl shadow-[#016b62]/30 ring-4 ring-[#fcad21]/30 hover:scale-110 transition-transform duration-500 group/icon">
                <GraduationCap className="h-10 w-10 text-white group-hover/icon:rotate-6 transition-transform" />
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#016b62] mb-6 tracking-tight">
                Self Learning
              </h1>
              <p className="text-xl md:text-2xl text-[#333333]/80 max-w-3xl mx-auto leading-relaxed">
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
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#016b62] mb-4"></div>
                <p className="text-[#333333]/70 text-lg">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <Card className="bg-white border-[#016b62]/20 shadow-xl shadow-[#016b62]/10 rounded-2xl">
                <CardContent className="p-16 text-center">
                  <BookOpen className="h-20 w-20 text-[#016b62]/40 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-[#016b62] mb-3">No courses available yet</h3>
                  <p className="text-[#333333]/70 text-lg">Check back soon for exciting learning opportunities!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <div className="p-6 rounded-2xl bg-white border border-[#016b62]/15 shadow-lg shadow-[#016b62]/10 hover:border-[#016b62]/40 hover:shadow-xl hover:shadow-[#016b62]/15 transition-all duration-300 hover:scale-105 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[#016b62]/10 group-hover/stat:scale-110 transition-transform">
                        <BookOpen className="h-6 w-6 text-[#016b62]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#333333]/60 uppercase mb-1">Total Courses</p>
                        <p className="text-[#016b62] font-black text-2xl">{courses.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-[#016b62]/15 shadow-lg shadow-[#016b62]/10 hover:border-[#016b62]/40 hover:shadow-xl hover:shadow-[#016b62]/15 transition-all duration-300 hover:scale-105 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[#016b62]/10 group-hover/stat:scale-110 transition-transform">
                        <Folder className="h-6 w-6 text-[#016b62]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#333333]/60 uppercase mb-1">Total Modules</p>
                        <p className="text-[#016b62] font-black text-2xl">
                          {courses.reduce((acc, c) => acc + (c.modules_count || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-[#016b62]/15 shadow-lg shadow-[#016b62]/10 hover:border-[#016b62]/40 hover:shadow-xl hover:shadow-[#016b62]/15 transition-all duration-300 hover:scale-105 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[#016b62]/10 group-hover/stat:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-[#016b62]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#333333]/60 uppercase mb-1">Total Lessons</p>
                        <p className="text-[#016b62] font-black text-2xl">
                          {courses.reduce((acc, c) => acc + (c.lessons_count || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#fcad21]/20 to-[#fcad21]/10 border border-[#fcad21]/30 shadow-lg shadow-[#fcad21]/10 hover:shadow-xl hover:shadow-[#fcad21]/20 transition-all duration-300 hover:scale-105 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[#fcad21]/20 group-hover/stat:scale-110 transition-transform">
                        <Star className="h-6 w-6 text-[#016b62]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#333333]/70 uppercase mb-1">Featured</p>
                        <p className="text-[#016b62] font-black text-2xl">
                          {courses.filter((c) => c.is_featured).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses Grid - home-style cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {courses.map((course, index) => {
                    const coursePrice = typeof course.price === "number" ? course.price : parseFloat(String(course.price || 0)) || 0
                    const isFree = coursePrice === 0
                    const lessonsCount = course.lessons_count || 0
                    const duration = course.estimated_duration_minutes
                      ? `${Math.floor(course.estimated_duration_minutes / 60)}h ${course.estimated_duration_minutes % 60}m`
                      : null
                    const priceMain = isFree ? "Free" : `$${Number(coursePrice) === coursePrice ? coursePrice.toFixed(0) : coursePrice.toFixed(2)}`
                    const priceSub = isFree ? "forever" : "/course"

                    return (
                      <Card
                        key={course.id}
                        className="group relative bg-white border-2 border-[#e0ebe9] hover:border-[#016b62]/50 overflow-hidden rounded-2xl shadow-xl shadow-[#016b62]/10 hover:shadow-2xl hover:shadow-[#016b62]/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                        onMouseEnter={() => setHoveredCourse(course.id)}
                        onMouseLeave={() => setHoveredCourse(null)}
                        onClick={() => router.push(`/self-learning/courses/${course.id}`)}
                      >
                        {course.is_featured && (
                          <div className="absolute top-0 left-0 right-0 py-2 bg-gradient-to-r from-[#fcad21] to-[#f78c6b] text-[#1a1a1a] text-center text-xs font-bold tracking-wide z-10">
                            Popular
                          </div>
                        )}

                        <div className="relative aspect-[16/10] bg-gradient-to-br from-[#e8f4f3] to-[#fcf6f0] overflow-hidden">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className={`w-full h-full object-cover transition-transform duration-500 ${hoveredCourse === course.id ? "scale-110" : "scale-100"}`}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-16 w-16 text-[#016b62]/25" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <CardContent className={`p-5 ${course.is_featured ? "pt-8" : ""}`}>
                          <h3 className="text-lg font-bold text-[#016b62] mb-2 line-clamp-2 group-hover:text-[#014d44] transition-colors">
                            {course.title}
                          </h3>
                          {course.description && (
                            <p className="text-sm text-[#333333]/75 line-clamp-2 mb-4">{course.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#333333]/70 mb-4">
                            {course.instructor_name && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3.5 w-3.5 text-[#016b62]" />
                                {course.instructor_name}
                              </span>
                            )}
                            {duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {duration}
                              </span>
                            )}
                            {lessonsCount > 0 && <span>{lessonsCount} lessons</span>}
                            {course.difficulty_level && (
                              <span className="px-2 py-0.5 rounded-full bg-[#016b62]/10 text-[#016b62] font-medium capitalize">
                                {course.difficulty_level}
                              </span>
                            )}
                          </div>

                          <div className="mt-auto pt-4 border-t border-[#e8f0ef] space-y-4">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-xs font-medium text-[#333333]/60 uppercase tracking-wide">Price</span>
                              <span className="text-xl font-bold text-[#016b62] tabular-nums">
                                {priceMain}
                                {priceSub && <span className="text-sm font-normal text-[#333333]/80 ml-0.5">{priceSub}</span>}
                              </span>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCourseClick(course)
                              }}
                              className="w-full h-11 bg-[#016b62] hover:bg-[#014d44] text-white font-bold shadow-lg shadow-[#016b62]/25 hover:shadow-[#016b62]/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-xl"
                            >
                              <span className="flex items-center justify-center gap-2">
                                View course
                                <ArrowRight className="h-4 w-4" />
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
          <DialogContent className="max-w-[95vw] w-[95vw] md:max-w-[90vw] md:w-[90vw] lg:max-w-[85vw] lg:w-[85vw] xl:max-w-[80vw] xl:w-[80vw] 2xl:max-w-[75vw] 2xl:w-[75vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-[#f8faf9] via-white to-[#fcf6f0] border-[#016b62]/30 shadow-2xl shadow-[#016b62]/20 p-0 animate-in zoom-in-95 duration-300">
            {selectedCourse && (
              <div className="relative">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#016b62]/10 via-transparent to-[#014d44]/10 rounded-lg blur-2xl -z-10 animate-pulse" />

                {/* Hero Section with Image */}
                <div className="relative h-72 md:h-80 lg:h-96 overflow-hidden">
                  {selectedCourse.thumbnail_url ? (
                    <>
                      <img
                        src={selectedCourse.thumbnail_url}
                        alt={selectedCourse.title}
                        className="w-full h-full object-cover animate-in fade-in duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#016b62]/20 via-[#e8f4f3] to-[#fcf6f0]">
                      <div className="relative">
                        <BookOpen className="h-32 w-32 text-[#016b62]/30 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-[#016b62]/10 animate-ping" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Title Overlay - Only Course Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                    <div className="flex items-start justify-between animate-in slide-in-from-bottom-4 duration-500 delay-200">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#016b62] to-[#014d44] shadow-2xl shadow-[#016b62]/50 animate-in zoom-in duration-500 delay-300">
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
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#f8faf9] border border-[#016b62]/20">
                      <TabsTrigger 
                        value="overview" 
                        className="text-[#333333] data-[state=active]:bg-[#016b62] data-[state=active]:text-white data-[state=inactive]:hover:bg-[#016b62]/10 transition-all font-semibold"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="curriculum" 
                        className="text-[#333333] data-[state=active]:bg-[#016b62] data-[state=active]:text-white data-[state=inactive]:hover:bg-[#016b62]/10 transition-all font-semibold"
                      >
                        Curriculum
                      </TabsTrigger>
                      <TabsTrigger 
                        value="details" 
                        className="text-[#333333] data-[state=active]:bg-[#016b62] data-[state=active]:text-white data-[state=inactive]:hover:bg-[#016b62]/10 transition-all font-semibold"
                      >
                        Details
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-6">
                      {/* Full Description - Prominent */}
                      <div className="space-y-3 p-6 rounded-xl bg-gradient-to-br from-[#016b62]/10 via-[#014d44]/5 to-transparent border border-[#016b62]/20">
                        <h3 className="text-xl font-bold text-[#016b62] flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-[#016b62]" />
                          About This Course
                        </h3>
                        <p className="text-[#333333]/90 leading-relaxed text-base md:text-lg">
                          {selectedCourse.description || "No description available."}
                        </p>
                      </div>

                      {/* Course Stats - Only 2 Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-[#016b62]/15 to-[#014d44]/10 border border-[#016b62]/30 hover:border-[#016b62]/50 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#016b62]/30 to-[#014d44]/20">
                              <Zap className="h-5 w-5 text-[#016b62]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 uppercase mb-1">Total XP</p>
                              <p className="text-[#016b62] font-black text-2xl">{(selectedCourse.lessons_count || 0) * 10}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-r from-[#016b62]/20 via-[#014d44]/20 to-[#016b62]/20 border border-[#016b62]/40 hover:border-[#016b62]/60 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#016b62]/30 to-[#014d44]/20">
                              <Award className="h-5 w-5 text-[#016b62]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 uppercase mb-1">Price</p>
                              {typeof selectedCourse.price === "number" && selectedCourse.price === 0 ? (
                                <p className="text-[#016b62] font-black text-2xl">FREE</p>
                              ) : (
                                <p className="text-[#016b62] font-black text-2xl">
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
                          <p className="text-xs text-[#333333]/60 mb-2">Difficulty Level</p>
                          <Badge className={`${getDifficultyColor(selectedCourse.difficulty_level)} border-0 font-semibold capitalize`}>
                            {selectedCourse.difficulty_level}
                          </Badge>
                        </div>
                        {selectedCourse.is_featured && (
                          <div>
                            <p className="text-xs text-[#333333]/60 mb-2">Status</p>
                            <Badge className="bg-[#016b62]/20 text-[#016b62] border-[#016b62]/30">
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
                        <div className="text-center py-12 bg-white rounded-xl border border-[#016b62]/20">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#016b62] mb-4"></div>
                          <p className="text-[#333333]/70">Loading curriculum...</p>
                        </div>
                      ) : courseModules.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-[#016b62] flex items-center gap-2">
                            <Folder className="h-5 w-5 text-[#016b62]" />
                            Course Curriculum
                          </h3>
                          {courseModules.map((module, index) => (
                            <div key={module.id} className="border border-[#016b62]/20 rounded-lg p-4 bg-white hover:border-[#016b62]/40 hover:bg-[#f8faf9] transition-all">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#016b62]/20 flex items-center justify-center text-[#016b62] font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-[#016b62] font-semibold">{module.title}</h4>
                                  {module.description && (
                                    <p className="text-[#333333]/70 text-sm mt-1">{module.description}</p>
                                  )}
                                </div>
                                <Badge className="bg-[#016b62]/20 text-[#016b62] border-[#016b62]/30">
                                  {courseLessons[module.id]?.length || 0} Lessons
                                </Badge>
                              </div>
                              {courseLessons[module.id] && courseLessons[module.id].length > 0 && (
                                <div className="ml-11 space-y-2 mt-3">
                                  {courseLessons[module.id].map((lesson: any) => (
                                    <div key={lesson.id} className="flex items-center gap-2 text-sm text-[#333333]/80">
                                      <Play className="h-3 w-3 text-[#016b62]" />
                                      <span>{lesson.title}</span>
                                      {lesson.xp_reward && (
                                        <Badge variant="outline" className="ml-auto text-xs border-[#016b62]/30 text-[#016b62]">
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
                          <h3 className="text-lg font-bold text-[#016b62] flex items-center gap-2">
                            <Target className="h-5 w-5 text-[#016b62]" />
                            Course Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-[#333333]/60 mb-1">Course ID</p>
                              <p className="text-[#333333] text-sm">#{selectedCourse.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 mb-1">Instructor</p>
                              <p className="text-[#333333] text-sm">{selectedCourse.instructor_name || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 mb-1">Difficulty</p>
                              <Badge className={`${getDifficultyColor(selectedCourse.difficulty_level)} border-0 capitalize`}>
                                {selectedCourse.difficulty_level}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 mb-1">Total Duration</p>
                              <p className="text-[#333333] text-sm">
                                {Math.floor(selectedCourse.estimated_duration_minutes / 60)} hours {selectedCourse.estimated_duration_minutes % 60} minutes
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-[#016b62] flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-[#016b62]" />
                            Learning Stats
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-[#333333]/60 mb-1">Total Modules</p>
                              <p className="text-[#333333] text-sm font-semibold">{selectedCourse.modules_count || 0} modules</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 mb-1">Total Lessons</p>
                              <p className="text-[#333333] text-sm font-semibold">{selectedCourse.lessons_count || 0} lessons</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 mb-1">XP Reward</p>
                              <p className="text-[#333333] text-sm font-semibold">{(selectedCourse.lessons_count || 0) * 10} XP</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 mb-1">Course Price</p>
                              {typeof selectedCourse.price === "number" && selectedCourse.price === 0 ? (
                                <p className="text-[#016b62] text-sm font-semibold">FREE</p>
                              ) : (
                                <p className="text-[#333333] text-sm font-semibold">
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
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 mt-6 border-t border-[#016b62]/20">
                    <Button
                      onClick={() => {
                        setShowPopup(false)
                        router.push(`/learning/courses/${selectedCourse.id}`)
                      }}
                      className="flex-1 bg-gradient-to-r from-[#016b62] to-[#014d44] hover:from-[#014d44] hover:to-[#013d36] text-white font-semibold shadow-lg shadow-[#016b62]/25 hover:shadow-[#016b62]/40 transition-all duration-300 h-11 text-sm md:text-base group/btn hover:scale-105 active:scale-95"
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
                      className="border-[#016b62]/30 text-[#016b62] hover:bg-[#016b62]/10 hover:border-[#016b62] h-11 px-5 text-sm md:text-base transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
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
        <footer className="bg-[#016b62] text-white mt-20 pt-16 pb-8 relative border-t border-[#fcad21]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center ring-2 ring-[#fcad21]/40">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Self</h3>
                    <span className="text-xl font-black text-[#fcad21]">Learning</span>
                  </div>
                </div>
                <p className="text-white/85 leading-relaxed mb-6">
                  Your journey to mastery starts here. Learn at your own pace, track your progress, and unlock your potential.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#fcad21]" />
                  Quick Links
                </h4>
                <ul className="space-y-3 text-white/85">
                  <li>
                    <Link href="/student-login" className="hover:text-[#fcad21] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Student Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/learning/dashboard" className="hover:text-[#fcad21] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      My Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/videos" className="hover:text-[#fcad21] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Video Tutorials
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#fcad21]" />
                  Support
                </h4>
                <ul className="space-y-3 text-white/85">
                  <li>
                    <Link href="/student-login" className="hover:text-[#fcad21] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Login / Register
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#fcad21] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/75 text-sm">
                  &copy; 2025 <span className="text-[#fcad21] font-bold">Markano Self Learning</span>. Empowering Tech Education in Somalia.
                </p>
                <div className="flex items-center gap-6 text-sm text-white/75">
                  <a href="#" className="hover:text-[#fcad21] transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-[#fcad21] transition-colors">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
