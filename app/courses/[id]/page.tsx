"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Clock, Star, Users, PlayCircle, ChevronDown, ChevronUp } from "lucide-react"

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
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ef4444] border-r-transparent"></div>
          <p className="text-gray-500 mt-4 text-lg">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 text-xl">Course not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Course Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8c] to-[#1e3a5f] text-white py-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:text-white/80 hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="inline-block bg-[#ef4444] px-3 py-1 rounded-full text-sm font-semibold mb-4">
                {course.type}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-200 mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#ef4444] fill-current" />
                  <span className="font-semibold">{Number(course.rating || 0).toFixed(1)} Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#ef4444]" />
                  <span>{course.students_count} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#ef4444]" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#ef4444]" />
                  <span>{course.lessons_count} Lessons</span>
                </div>
              </div>

              <p className="mt-6 text-gray-300">
                <span className="font-semibold">Instructor:</span> {course.instructor}
              </p>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <Button className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-lg py-6 mb-4">
                    Enroll Now
                  </Button>
                  <div className="text-center text-sm text-gray-200">
                    <p>Start learning today!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-6">Course Content</h2>

            {modules.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No modules available for this course yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <Card
                    key={module.id}
                    className="overflow-hidden border-2 hover:border-[#ef4444]/20 transition-colors"
                  >
                    <CardHeader
                      className="cursor-pointer bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#ef4444] flex items-center justify-center text-white font-bold">
                            {module.order_index}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-[#1e3a5f]">{module.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        {expandedModules.has(module.id) ? (
                          <ChevronUp className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                    </CardHeader>

                    {expandedModules.has(module.id) && (
                      <CardContent className="p-0">
                        {module.lessons.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <p>No lessons in this module yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <PlayCircle className="h-5 w-5 text-[#ef4444]" />
                                  <div>
                                    <p className="font-medium text-[#1e3a5f]">{lesson.title}</p>
                                    <p className="text-sm text-gray-500">{lesson.duration}</p>
                                  </div>
                                </div>
                                {lesson.video_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white bg-transparent"
                                    onClick={() => router.push(`/videos/watch/${lesson.video_url}`)}
                                  >
                                    Watch
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
