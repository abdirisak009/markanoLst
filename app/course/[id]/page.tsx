"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Home, Video, FileText, Settings, Code, Play, CheckCircle2 } from "lucide-react"
import { getCourse, type Course, type Lesson } from "@/lib/data"

export default function CoursePage() {
  const params = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [activeSection, setActiveSection] = useState<"video" | "materials" | "code">("video")

  useEffect(() => {
    const courseData = getCourse(params.id as string)
    if (courseData) {
      setCourse(courseData)
      // Set first lesson as default
      if (courseData.modules[0]?.lessons[0]) {
        setCurrentLesson(courseData.modules[0].lessons[0])
      }
    }
  }, [params.id])

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Button asChild className="mt-4">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const completedLessonsCount = course.modules.reduce(
    (acc, module) => acc + module.lessons.filter((l) => l.completed).length,
    0,
  )
  const progressPercentage = Math.round((completedLessonsCount / course.lessonsCount) * 100)

  const toggleLessonComplete = (lessonId: string) => {
    setCourse((prev) => {
      if (!prev) return null
      const updated = { ...prev }
      updated.modules = updated.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson,
        ),
      }))
      return updated
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <div className="w-64 bg-[#1e3a5f] text-white p-6 hidden lg:block overflow-y-auto">
          <nav className="space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
              <Home className="h-5 w-5" />
              <span>Homepage</span>
            </Link>
            <button
              onClick={() => setActiveSection("video")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors w-full ${
                activeSection === "video" ? "bg-[#ef4444]" : ""
              }`}
            >
              <Video className="h-5 w-5" />
              <span>Course Video</span>
            </button>
            <button
              onClick={() => setActiveSection("materials")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors w-full ${
                activeSection === "materials" ? "bg-[#ef4444]" : ""
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Course Materials</span>
            </button>
            <button
              onClick={() => setActiveSection("code")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors w-full ${
                activeSection === "code" ? "bg-[#ef4444]" : ""
              }`}
            >
              <Code className="h-5 w-5" />
              <span>Code Practice</span>
            </button>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="mt-8 pt-8 border-t border-white/20">
            <h3 className="font-semibold mb-2">Course Progress</h3>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <p className="text-sm text-gray-300">
              {completedLessonsCount} of {course.lessonsCount} lessons completed
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {/* Course Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">{course.title}</h1>
              <p className="text-gray-600">{course.description}</p>
            </div>

            {activeSection === "video" && currentLesson && (
              <div className="space-y-6">
                {/* Video Player */}
                <Card className="overflow-hidden">
                  <div className="relative aspect-video bg-black">
                    <iframe
                      src={currentLesson.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1e3a5f]">{currentLesson.title}</h2>
                        <p className="text-gray-500">{currentLesson.duration}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`complete-${currentLesson.id}`}
                          checked={currentLesson.completed}
                          onCheckedChange={() => toggleLessonComplete(currentLesson.id)}
                        />
                        <label htmlFor={`complete-${currentLesson.id}`} className="text-sm font-medium cursor-pointer">
                          Mark as complete
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Lecture Notes */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">Lecture Notes</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{currentLesson.transcript}</p>
                  </div>
                </Card>
              </div>
            )}

            {activeSection === "materials" && (
              <Card className="p-6">
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">Course Materials</h3>
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <div key={module.id}>
                      <h4 className="font-semibold text-lg mb-2">{module.title}</h4>
                      <ul className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-2 text-gray-700">
                            <FileText className="h-4 w-4 text-[#ef4444]" />
                            <span>{lesson.title} - Lecture Notes (PDF)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeSection === "code" && (
              <Card className="p-6">
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">Code Practice</h3>
                <p className="text-gray-600 mb-4">
                  Practice exercises will be available here. For now, visit the{" "}
                  <Link href="/code-practice" className="text-[#ef4444] hover:underline">
                    dedicated Code Practice page
                  </Link>
                  .
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Right Sidebar - Modules & Lessons */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto hidden xl:block">
          <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Course Content</h3>
          <div className="space-y-4">
            {course.modules.map((module, moduleIndex) => (
              <div key={module.id}>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <span className="bg-[#1e3a5f] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    {moduleIndex + 1}
                  </span>
                  {module.title}
                </h4>
                <div className="space-y-1 ml-8">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setCurrentLesson(lesson)
                        setActiveSection("video")
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        currentLesson?.id === lesson.id ? "bg-[#ef4444] text-white" : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span className="flex-1 line-clamp-1">{lesson.title}</span>
                      <span className="text-xs">{lesson.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
