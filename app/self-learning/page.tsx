"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getImageSrc } from "@/lib/utils"
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
  Smartphone,
  Download,
} from "lucide-react"

const BRAND = "#2596be"

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
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q")?.trim().toLowerCase() || ""
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCourse, setHoveredCourse] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [courseModules, setCourseModules] = useState<any[]>([])
  const [courseLessons, setCourseLessons] = useState<Record<number, any[]>>({})
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false)

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses
    return courses.filter(
      (c) =>
        (c.title?.toLowerCase().includes(searchQuery) ||
          (c.description && c.description.toLowerCase().includes(searchQuery)))
    )
  }, [courses, searchQuery])

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
        return "bg-[#2596be]/20 text-[#2596be] border-[#2596be]/30"
      case "intermediate":
        return "bg-[#3c62b3]/20 text-[#2596be] border-[#3c62b3]/30"
      case "advanced":
        return "bg-[#2596be]/25 text-[#3c62b3] border-[#2596be]/40"
      default:
        return "bg-[#2596be]/10 text-[#2596be] border-[#2596be]/20"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-[#fcf6f0] to-[#e8f4f3] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2596be]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3c62b3]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#2596be]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section - simplified on mobile (banner removed feel) */}
        <section className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pt-12 pb-8 md:pt-20 md:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-16">
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#2596be] to-[#3c62b3] mb-4 md:mb-6 shadow-xl md:shadow-2xl shadow-[#2596be]/30 ring-2 md:ring-4 ring-[#3c62b3]/30 hover:scale-110 transition-transform duration-500 group/icon">
                <GraduationCap className="h-7 w-7 md:h-10 md:w-10 text-white group-hover/icon:rotate-6 transition-transform" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-[#2596be] mb-3 md:mb-6 tracking-tight">
                Self Learning
              </h1>
              <p className="text-base sm:text-lg md:text-2xl text-[#333333]/80 max-w-3xl mx-auto leading-relaxed px-0">
                Master new skills at your own pace. Explore our comprehensive collection of courses designed to help you grow.
              </p>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pb-24 lg:pb-20">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#2596be] mb-4"></div>
                <p className="text-[#333333]/70 text-lg">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <Card className="bg-white border-[#2596be]/20 shadow-xl shadow-[#2596be]/10 rounded-2xl">
                <CardContent className="p-16 text-center">
                  <BookOpen className="h-20 w-20 text-[#2596be]/40 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-[#2596be] mb-3">No courses available yet</h3>
                  <p className="text-[#333333]/70 text-lg">Check back soon for exciting learning opportunities!</p>
                </CardContent>
              </Card>
            ) : filteredCourses.length === 0 ? (
              <Card className="bg-white border-[#2596be]/20 shadow-xl shadow-[#2596be]/10 rounded-2xl">
                <CardContent className="p-16 text-center">
                  <BookOpen className="h-20 w-20 text-[#2596be]/40 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-[#2596be] mb-3">No courses match &quot;{searchQuery}&quot;</h3>
                  <p className="text-[#333333]/70 text-lg">Try a different search term or browse all courses.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats Bar - 2x2 on mobile, 4 cols on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
                  <div className="p-6 rounded-2xl bg-white border border-[#2596be]/15 shadow-lg shadow-[#2596be]/10 hover:border-[#2596be]/40 hover:shadow-xl hover:shadow-[#2596be]/15 transition-all duration-300 hover:scale-105 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[#2596be]/10 group-hover/stat:scale-110 transition-transform">
                        <BookOpen className="h-6 w-6 text-[#2596be]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#333333]/60 uppercase mb-1">{searchQuery ? "Showing" : "Total Courses"}</p>
                        <p className="text-[#2596be] font-black text-2xl">{searchQuery ? `${filteredCourses.length} of ${courses.length}` : courses.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-[#2596be]/15 shadow-lg shadow-[#2596be]/10 hover:border-[#2596be]/40 hover:shadow-xl hover:shadow-[#2596be]/15 transition-all duration-300 hover:scale-105 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[#2596be]/10 group-hover/stat:scale-110 transition-transform">
                        <Folder className="h-6 w-6 text-[#2596be]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#333333]/60 uppercase mb-1">Total Modules</p>
                        <p className="text-[#2596be] font-black text-2xl">
                          {filteredCourses.reduce((acc, c) => acc + (c.modules_count || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-[#2596be]/15 shadow-lg shadow-[#2596be]/10 hover:border-[#2596be]/40 hover:shadow-xl hover:shadow-[#2596be]/15 transition-all duration-300 hover:scale-105 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[#2596be]/10 group-hover/stat:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-[#2596be]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#333333]/60 uppercase mb-1">Total Lessons</p>
                        <p className="text-[#2596be] font-black text-2xl">
                          {filteredCourses.reduce((acc, c) => acc + (c.lessons_count || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#3c62b3]/20 to-[#3c62b3]/10 border border-[#3c62b3]/30 shadow-lg shadow-[#3c62b3]/10 hover:shadow-xl hover:shadow-[#3c62b3]/20 transition-all duration-300 hover:scale-105 group/stat">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[#3c62b3]/20 group-hover/stat:scale-110 transition-transform">
                        <Star className="h-6 w-6 text-[#3c62b3]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#333333]/70 uppercase mb-1">Featured</p>
                        <p className="text-[#3c62b3] font-black text-2xl">
                          {filteredCourses.filter((c) => c.is_featured).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses: same design as homepage — horizontal slide on mobile, 2-col grid on desktop */}
                <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x pb-2">
                  <div className="flex gap-4 w-max min-w-full">
                    {filteredCourses.map((course, index) => {
                      const coursePrice = typeof course.price === "number" ? course.price : parseFloat(String(course.price || 0)) || 0
                      const isFree = coursePrice === 0
                      const priceMain = isFree ? "Free" : `$${Number(coursePrice) === coursePrice ? coursePrice.toFixed(0) : coursePrice.toFixed(2)}`
                      const priceSub = isFree ? "forever" : "/course"
                      const thumbSrc = course.thumbnail_url ? (getImageSrc(course.thumbnail_url) || course.thumbnail_url) : ""
                      const isFirst = index === 0
                      return (
                        <div key={course.id} className="flex-shrink-0 w-[min(85vw,320px)] snap-center">
                          <Link href={`/learning/courses/${course.id}`} className="block h-full">
                            <article className="relative h-full flex flex-col rounded-2xl bg-white overflow-hidden border-2 border-[#2596be]/15 shadow-xl shadow-[#2596be]/10 transition-all duration-300 active:scale-[0.99] group/card">
                              <div className="relative aspect-[16/10] bg-[#f1f5f9] overflow-hidden">
                                {thumbSrc ? (
                                  <img src={thumbSrc} alt={course.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2596be]/8 to-[#3c62b3]/8">
                                    <BookOpen className="w-16 h-16 text-[#2596be]/30" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                                  <span className="inline-flex py-1.5 px-3 rounded-full text-white text-xs font-bold shadow-md" style={{ background: isFirst ? `linear-gradient(135deg, ${BRAND}, #1e7a9e)` : "linear-gradient(135deg, #3c62b3, #2d4a8a)" }}>
                                    {isFirst ? "🔥 Hot" : "↑ Trending"}
                                  </span>
                                  {course.is_featured && (
                                    <span className="inline-flex py-1.5 px-3 rounded-full bg-white/95 text-[#2596be] text-xs font-bold shadow-md">Bestseller</span>
                                  )}
                                </div>
                                <span className="absolute top-3 right-3 z-10 py-1.5 px-3 rounded-full bg-white/95 text-[#475569] text-xs font-semibold shadow-md">{course.difficulty_level || "All levels"}</span>
                              </div>
                              <div className="flex-1 flex flex-col p-4">
                                <h3 className="text-base font-bold text-[#0f172a] line-clamp-2 mb-2 leading-tight group-hover/card:text-[#2596be] transition-colors">{course.title}</h3>
                                <p className="text-[#64748b] text-sm line-clamp-2 mb-4 flex-1">{course.description || "Short lessons, real projects."}</p>
                                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9]">
                                  <span className="text-lg font-bold text-[#0f172a]">{priceMain}</span>
                                  <span className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-lg" style={{ backgroundColor: BRAND }}>
                                    View course <ChevronRight className="w-4 h-4" />
                                  </span>
                                </div>
                              </div>
                            </article>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop: same 2-col grid and card design as homepage */}
                <div className="hidden md:grid md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">
                  {filteredCourses.map((course, index) => {
                    const coursePrice = typeof course.price === "number" ? course.price : parseFloat(String(course.price || 0)) || 0
                    const isFree = coursePrice === 0
                    const priceMain = isFree ? "Free" : `$${Number(coursePrice) === coursePrice ? coursePrice.toFixed(0) : coursePrice.toFixed(2)}`
                    const priceSub = isFree ? "forever" : "/course"
                    const thumbSrc = course.thumbnail_url ? (getImageSrc(course.thumbnail_url) || course.thumbnail_url) : ""
                    const isFirst = index === 0
                    return (
                      <Link key={course.id} href={`/learning/courses/${course.id}`} className="block h-full group">
                        <article className="relative h-full flex flex-col rounded-3xl bg-white overflow-hidden border border-[#e2e8f0] transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_64px_-12px_rgba(37,150,190,0.15),0_0_0_1px_rgba(37,150,190,0.08)] hover:border-[#2596be]/20 group/card">
                          <div className="relative aspect-[16/10] bg-[#f1f5f9] overflow-hidden">
                            {thumbSrc ? (
                              <img src={thumbSrc} alt={course.title} className="w-full h-full object-cover group-hover/card:scale-[1.06] transition-transform duration-700 ease-out" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2596be]/8 via-[#f8fafc] to-[#3c62b3]/8">
                                <BookOpen className="w-20 h-20 text-[#2596be]/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                            <div className="absolute top-5 left-5 z-10 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm" style={{ background: isFirst ? `linear-gradient(135deg, ${BRAND}, #1e7a9e)` : "linear-gradient(135deg, #3c62b3, #2d4a8a)", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
                                {isFirst ? "🔥 Hot pick" : "↑ Trending now"}
                              </span>
                              {course.is_featured && (
                                <span className="inline-flex py-2 px-3.5 rounded-full bg-white/95 backdrop-blur-sm text-[#2596be] text-xs font-bold shadow-md border border-white/50">Bestseller</span>
                              )}
                            </div>
                            <span className="absolute top-5 right-5 z-10 py-2 px-3.5 rounded-full bg-white/95 backdrop-blur-sm text-[#475569] text-xs font-semibold shadow-md border border-white/60">{course.difficulty_level || "All levels"}</span>
                          </div>
                          <div className="flex-1 flex flex-col p-6 md:p-8">
                            <h3 className="text-xl md:text-2xl font-bold text-[#0f172a] line-clamp-2 mb-3 leading-tight tracking-tight group-hover/card:text-[#2596be] transition-colors duration-300">{course.title}</h3>
                            <p className="text-[#64748b] text-sm md:text-base line-clamp-2 mb-6 flex-1 leading-relaxed">{course.description || "Short lessons, real projects. Build in-demand skills."}</p>
                            <div className="flex items-center justify-between gap-4 pt-5 border-t border-[#f1f5f9]">
                              <div>
                                <span className="text-2xl font-bold text-[#0f172a]">{priceMain}</span>
                                {priceSub && <span className="text-sm font-medium text-[#64748b] ml-1.5">{priceSub}</span>}
                              </div>
                              <span className="inline-flex items-center gap-2 py-3 px-5 rounded-full text-sm font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: BRAND, boxShadow: "0 4px 14px rgba(37,150,190,0.4)" }}>
                                View course <ChevronRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Mobile app version – info below courses */}
        <section className="relative px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pb-16 md:pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#2596be]/15 via-[#3c62b3]/10 to-[#2596be]/10 border border-[#2596be]/25 p-6 md:p-10 shadow-xl shadow-[#2596be]/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-4 rounded-2xl bg-white/80 border border-[#2596be]/20 shadow-lg">
                    <Smartphone className="h-10 w-10 md:h-12 md:w-12 text-[#2596be]" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#2596be] mb-2 flex items-center gap-2">
                      <span>Mobile app version</span>
                    </h3>
                    <p className="text-[#333333]/80 text-sm md:text-base leading-relaxed max-w-xl">
                      Koorsoyinka iyo wax kasta oo aad ka heli karto Markano waa la heli karaa app-ka mobile-ka. Hoos ka soo deji app-ka si aad ugu shaqeyso gacantaada.
                    </p>
                    <p className="text-[#333333]/70 text-sm mt-2">
                      All courses and learning tools are also available in the Markano mobile app. Download below to learn on the go.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-[#2596be] hover:bg-[#3c62b3] text-white font-semibold h-11 px-6 rounded-xl shadow-lg shadow-[#2596be]/25 inline-flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download app
                  </Button>
                  <Button variant="outline" className="border-[#2596be]/40 text-[#2596be] hover:bg-[#2596be]/10 h-11 px-6 rounded-xl font-medium">
                    Learn more
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Preview Popup - Amazing Design */}
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <DialogContent className="max-w-[95vw] w-[95vw] md:max-w-[90vw] md:w-[90vw] lg:max-w-[85vw] lg:w-[85vw] xl:max-w-[80vw] xl:w-[80vw] 2xl:max-w-[75vw] 2xl:w-[75vw] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-[#f8faf9] via-white to-[#fcf6f0] border-[#2596be]/30 shadow-2xl shadow-[#2596be]/20 p-0 animate-in zoom-in-95 duration-300">
            {selectedCourse && (
              <div className="relative">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#2596be]/10 via-transparent to-[#3c62b3]/10 rounded-lg blur-2xl -z-10 animate-pulse" />

                {/* Hero Section with Image */}
                <div className="relative h-72 md:h-80 lg:h-96 overflow-hidden">
                  {selectedCourse.thumbnail_url ? (
                    <>
                      <img
                        src={getImageSrc(selectedCourse.thumbnail_url) || selectedCourse.thumbnail_url}
                        alt={selectedCourse.title}
                        className="w-full h-full object-cover animate-in fade-in duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2596be]/20 via-[#e8f4f3] to-[#fcf6f0]">
                      <div className="relative">
                        <BookOpen className="h-32 w-32 text-[#2596be]/30 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-[#2596be]/10 animate-ping" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Title Overlay - Only Course Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                    <div className="flex items-start justify-between animate-in slide-in-from-bottom-4 duration-500 delay-200">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#2596be] to-[#3c62b3] shadow-2xl shadow-[#2596be]/50 animate-in zoom-in duration-500 delay-300">
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
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#f8faf9] border border-[#2596be]/20">
                      <TabsTrigger 
                        value="overview" 
                        className="text-[#333333] data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=inactive]:hover:bg-[#2596be]/10 transition-all font-semibold"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="curriculum" 
                        className="text-[#333333] data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=inactive]:hover:bg-[#2596be]/10 transition-all font-semibold"
                      >
                        Curriculum
                      </TabsTrigger>
                      <TabsTrigger 
                        value="details" 
                        className="text-[#333333] data-[state=active]:bg-[#2596be] data-[state=active]:text-white data-[state=inactive]:hover:bg-[#2596be]/10 transition-all font-semibold"
                      >
                        Details
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-6">
                      {/* Full Description - Prominent */}
                      <div className="space-y-3 p-6 rounded-xl bg-gradient-to-br from-[#2596be]/10 via-[#3c62b3]/5 to-transparent border border-[#2596be]/20">
                        <h3 className="text-xl font-bold text-[#2596be] flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-[#2596be]" />
                          About This Course
                        </h3>
                        <p className="text-[#333333]/90 leading-relaxed text-base md:text-lg">
                          {selectedCourse.description || "No description available."}
                        </p>
                      </div>

                      {/* Course Stats - Only 2 Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-[#2596be]/15 to-[#3c62b3]/10 border border-[#2596be]/30 hover:border-[#2596be]/50 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#2596be]/30 to-[#3c62b3]/20">
                              <Zap className="h-5 w-5 text-[#2596be]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 uppercase mb-1">Total XP</p>
                              <p className="text-[#2596be] font-black text-2xl">{(selectedCourse.lessons_count || 0) * 10}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-r from-[#2596be]/20 via-[#3c62b3]/20 to-[#2596be]/20 border border-[#2596be]/40 hover:border-[#2596be]/60 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#2596be]/30 to-[#3c62b3]/20">
                              <Award className="h-5 w-5 text-[#2596be]" />
                            </div>
                            <div>
                              <p className="text-xs text-[#333333]/60 uppercase mb-1">Price</p>
                              {typeof selectedCourse.price === "number" && selectedCourse.price === 0 ? (
                                <p className="text-[#2596be] font-black text-2xl">FREE</p>
                              ) : (
                                <p className="text-[#2596be] font-black text-2xl">
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
                            <Badge className="bg-[#2596be]/20 text-[#2596be] border-[#2596be]/30">
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
                        <div className="text-center py-12 bg-white rounded-xl border border-[#2596be]/20">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be] mb-4"></div>
                          <p className="text-[#333333]/70">Loading curriculum...</p>
                        </div>
                      ) : courseModules.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-[#2596be] flex items-center gap-2">
                            <Folder className="h-5 w-5 text-[#2596be]" />
                            Course Curriculum
                          </h3>
                          {courseModules.map((module, index) => (
                            <div key={module.id} className="border border-[#2596be]/20 rounded-lg p-4 bg-white hover:border-[#2596be]/40 hover:bg-[#f8faf9] transition-all">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#2596be]/20 flex items-center justify-center text-[#2596be] font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-[#2596be] font-semibold">{module.title}</h4>
                                  {module.description && (
                                    <p className="text-[#333333]/70 text-sm mt-1">{module.description}</p>
                                  )}
                                </div>
                                <Badge className="bg-[#2596be]/20 text-[#2596be] border-[#2596be]/30">
                                  {courseLessons[module.id]?.length || 0} Lessons
                                </Badge>
                              </div>
                              {courseLessons[module.id] && courseLessons[module.id].length > 0 && (
                                <div className="ml-11 space-y-2 mt-3">
                                  {courseLessons[module.id].map((lesson: any) => (
                                    <div key={lesson.id} className="flex items-center gap-2 text-sm text-[#333333]/80">
                                      <Play className="h-3 w-3 text-[#2596be]" />
                                      <span>{lesson.title}</span>
                                      {lesson.xp_reward && (
                                        <Badge variant="outline" className="ml-auto text-xs border-[#2596be]/30 text-[#2596be]">
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
                          <h3 className="text-lg font-bold text-[#2596be] flex items-center gap-2">
                            <Target className="h-5 w-5 text-[#2596be]" />
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
                          <h3 className="text-lg font-bold text-[#2596be] flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-[#2596be]" />
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
                                <p className="text-[#2596be] text-sm font-semibold">FREE</p>
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
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 mt-6 border-t border-[#2596be]/20">
                    <Button
                      onClick={() => {
                        setShowPopup(false)
                        router.push(`/learning/courses/${selectedCourse.id}`)
                      }}
                      className="flex-1 bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-semibold shadow-lg shadow-[#2596be]/25 hover:shadow-[#2596be]/40 transition-all duration-300 h-11 text-sm md:text-base group/btn hover:scale-105 active:scale-95"
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
                      className="border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10 hover:border-[#2596be] h-11 px-5 text-sm md:text-base transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
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
        <footer className="bg-[#3c62b3] text-white mt-20 pt-16 pb-8 relative border-t border-[#2596be]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <img src="/footer-logo.png" alt="Markano" className="h-12 w-auto object-contain" />
                  <div>
                    <h3 className="text-2xl font-black text-white">Self</h3>
                    <span className="text-xl font-black text-[#2596be]">Learning</span>
                  </div>
                </div>
                <p className="text-white/85 leading-relaxed mb-6">
                  Your journey to mastery starts here. Learn at your own pace, track your progress, and unlock your potential.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#2596be]" />
                  Quick Links
                </h4>
                <ul className="space-y-3 text-white/85">
                  <li>
                    <Link href="/student-login" className="hover:text-[#2596be] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Student Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/learning/dashboard" className="hover:text-[#2596be] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      My Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/videos" className="hover:text-[#2596be] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Video Tutorials
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#2596be]" />
                  Support
                </h4>
                <ul className="space-y-3 text-white/85">
                  <li>
                    <Link href="/student-login" className="hover:text-[#2596be] transition-colors flex items-center gap-2 group/link">
                      <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                      Login / Register
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#2596be] transition-colors flex items-center gap-2 group/link">
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
                  &copy; 2025 <span className="text-[#2596be] font-bold">Markano Self Learning</span>. Empowering Tech Education in Somalia.
                </p>
                <div className="flex items-center gap-6 text-sm text-white/75">
                  <a href="#" className="hover:text-[#2596be] transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-[#2596be] transition-colors">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
