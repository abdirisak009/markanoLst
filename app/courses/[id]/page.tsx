"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Clock, Star, Users, PlayCircle, ChevronDown, ChevronUp, Award } from "lucide-react"

interface Lesson {
  id: number
  title: string
  duration: string
  video_url: string | null
  order_index: number
}

interface Module {
  id: number
  title: string
  order_index: number
  lessons: Lesson[]
}

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  thumbnail: string | null
  rating: number
  students_count: number
  type: string
  modules_count: number
  lessons_count: number
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourseData() {
      try {
        // Fetch course details
        const courseRes = await fetch("/api/courses")
        if (courseRes.ok) {
          const courses = await courseRes.json()
          const foundCourse = courses.find((c: Course) => c.id === Number.parseInt(courseId))
          setCourse(foundCourse)
        }

        // Fetch modules with lessons
        const modulesRes = await fetch(`/api/modules?courseId=${courseId}`)
        if (modulesRes.ok) {
          const modulesData = await modulesRes.json()

          // Fetch lessons for each module
          const modulesWithLessons = await Promise.all(
            modulesData.map(async (module: Module) => {
              const lessonsRes = await fetch(`/api/lessons?moduleId=${module.id}`)
              const lessons = lessonsRes.ok ? await lessonsRes.json() : []
              return { ...module, lessons }
            }),
          )

          setModules(modulesWithLessons)
          // Expand first module by default
          if (modulesWithLessons.length > 0) {
            setExpandedModules(new Set([modulesWithLessons[0].id]))
          }
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId])

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#ef4444] border-r-transparent"></div>
          <p className="text-gray-500 mt-6 text-xl">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <p className="text-gray-500 text-2xl mb-6">Course not found</p>
          <Button onClick={() => router.push("/")} className="bg-[#ef4444] hover:bg-[#dc2626]">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="relative bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8c] to-[#1e3a5f] text-white py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#ef4444] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:text-white hover:bg-white/10 mb-8 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Courses
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* Course Badge */}
              <div className="inline-flex items-center gap-2 bg-[#ef4444] px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                <BookOpen className="h-4 w-4" />
                {course.type}
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">{course.title}</h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed text-pretty">{course.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Star className="h-6 w-6 text-[#ef4444] fill-current mb-2" />
                  <div className="font-bold text-2xl">{Number(course.rating || 0).toFixed(1)}</div>
                  <div className="text-sm text-gray-300">Rating</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Users className="h-6 w-6 text-[#ef4444] mb-2" />
                  <div className="font-bold text-2xl">{course.students_count}</div>
                  <div className="text-sm text-gray-300">Students</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Clock className="h-6 w-6 text-[#ef4444] mb-2" />
                  <div className="font-bold text-2xl">{course.duration}</div>
                  <div className="text-sm text-gray-300">Duration</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <BookOpen className="h-6 w-6 text-[#ef4444] mb-2" />
                  <div className="font-bold text-2xl">{course.lessons_count}</div>
                  <div className="text-sm text-gray-300">Lessons</div>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-gray-300 mb-2">Taught by</p>
                <p className="font-bold text-2xl">{course.instructor}</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-white shadow-2xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] p-6 text-center">
                    <img src="/images/white-logo.png" alt="Markano" className="h-10 mx-auto mb-4" />
                    <p className="text-white/90 text-sm">Enroll in this course</p>
                  </div>
                  <CardContent className="p-8">
                    <Button className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-lg py-6 mb-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                      Enroll Now
                    </Button>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#ef4444]" />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-[#ef4444]" />
                        <span>{course.lessons_count} video lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-[#ef4444]" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#ef4444]/10 px-4 py-2 rounded-full mb-4">
                <BookOpen className="h-5 w-5 text-[#ef4444]" />
                <span className="text-[#ef4444] font-semibold">Course Curriculum</span>
              </div>
              <h2 className="text-4xl font-bold text-[#1e3a5f] mb-4">What You'll Learn</h2>
              <p className="text-gray-600 text-lg">
                Explore the comprehensive curriculum designed to take you from beginner to expert
              </p>
            </div>

            {modules.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center text-gray-500">
                  <BookOpen className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                  <p className="text-xl mb-2">No modules available yet</p>
                  <p className="text-gray-400">Check back soon for course content updates</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {modules.map((module, index) => (
                  <Card
                    key={module.id}
                    className="overflow-hidden border-2 hover:border-[#ef4444]/30 transition-all shadow-lg hover:shadow-xl"
                  >
                    <CardHeader
                      className="cursor-pointer bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 hover:from-blue-100 hover:via-purple-100 hover:to-pink-100 transition-all"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {module.order_index}
                          </div>
                          <div>
                            <CardTitle className="text-xl text-[#1e3a5f] mb-2">{module.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <PlayCircle className="h-4 w-4" />
                                {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              index === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {index === 0 ? "Start Here" : `Module ${module.order_index}`}
                          </div>
                          {expandedModules.has(module.id) ? (
                            <ChevronUp className="h-6 w-6 text-gray-600" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {expandedModules.has(module.id) && (
                      <CardContent className="p-0 bg-white">
                        {module.lessons.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <p>No lessons in this module yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="h-10 w-10 rounded-xl bg-gray-100 group-hover:bg-[#ef4444]/10 flex items-center justify-center text-gray-600 group-hover:text-[#ef4444] font-semibold transition-colors">
                                    {lessonIndex + 1}
                                  </div>
                                  <PlayCircle className="h-6 w-6 text-[#ef4444]" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-[#1e3a5f] text-lg group-hover:text-[#ef4444] transition-colors">
                                      {lesson.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      {lesson.duration}
                                    </p>
                                  </div>
                                </div>
                                {lesson.video_url && (
                                  <Button
                                    size="sm"
                                    className="bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-md hover:shadow-lg transition-all"
                                    onClick={() => router.push(`/videos/watch/${lesson.video_url}`)}
                                  >
                                    Watch Now
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
