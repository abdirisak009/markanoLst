"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  ChevronRight,
  Award,
  Zap,
  ArrowLeft,
  Menu,
  X,
  PlayCircle,
  HelpCircle,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Circle,
  Minus,
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CodeEditor } from "@/components/code-editor"

interface Lesson {
  id: number
  title: string
  description: string | null
  video_url: string | null
  video_duration_seconds: number
  xp_reward: number
  order_index: number
  status?: string
  is_unlocked?: boolean
  quizzes?: Array<{
    id: number
    question: string
    question_type: string
    options: string[]
    correct_answer: string
    explanation: string
  }>
  tasks?: Array<{
    id: number
    task_type: string
    title: string
    instructions: string
    is_required: boolean
    programming_language?: string
    starter_code?: string
  }>
  progress?: {
    status: string
    video_watched: boolean
    quiz_completed: boolean
    task_completed: boolean
  } | null
}

interface Module {
  id: number
  title: string
  description: string | null
  order_index: number
  lessons: Lesson[]
}

interface Course {
  id: number
  title: string
  description: string | null
  instructor_name: string
  estimated_duration_minutes: number
  difficulty_level: string
  price: number
  modules: Module[]
  progress: {
    progress_percentage: number
    lessons_completed: number
    total_lessons: number
    current_lesson_id: number | null
    lesson_progress?: Array<{
      lesson_id: number
      status: string
    }>
  }
  enrollment_status?: "approved" | "pending" | "rejected" | "none"
  enrollment_message?: string
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedLessonFull, setSelectedLessonFull] = useState<Lesson | null>(null)
  const [loadingLesson, setLoadingLesson] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState<"video" | "quiz" | "task">("video")
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [collapsedModules, setCollapsedModules] = useState<Set<number>>(new Set())

  useEffect(() => {
    const storedUser = localStorage.getItem("gold_student") || localStorage.getItem("verified_student_id")
    if (!storedUser) {
      router.push("/student-login")
      return
    }

    const user = typeof storedUser === "string" ? JSON.parse(storedUser) : { id: storedUser }
    setUserId(user.id || user)
    fetchCourse(user.id || user)
  }, [courseId, router])

  const fetchCourse = async (userId: number) => {
    try {
      const res = await fetch(`/api/learning/courses/${courseId}?userId=${userId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch course")
      }

      setCourse(data)

      // Check enrollment status for paid courses
      if (data.price > 0 && data.enrollment_status && data.enrollment_status !== "approved") {
        // Enrollment not approved, don't load course content
        toast.error(data.enrollment_message || "Your enrollment is pending approval")
        return
      }

      // Auto-select current lesson or first unlocked lesson only if enrollment is approved
      if (data.enrollment_status === "approved" || data.price === 0) {
        if (data.progress?.current_lesson_id) {
          const currentLesson = findLessonById(data, data.progress.current_lesson_id)
          if (currentLesson) {
            setSelectedLesson(currentLesson)
            // Immediately show basic lesson info
            setSelectedLessonFull({
              ...currentLesson,
              quizzes: [],
              tasks: [],
              progress: null,
            })
            setCurrentStep("video")
            // Then fetch full details
            fetchLessonDetails(currentLesson.id)
          }
        } else {
          // Find first unlocked lesson
          const firstUnlocked = findFirstUnlockedLesson(data)
          if (firstUnlocked) {
            setSelectedLesson(firstUnlocked)
            // Immediately show basic lesson info
            setSelectedLessonFull({
              ...firstUnlocked,
              quizzes: [],
              tasks: [],
              progress: null,
            })
            setCurrentStep("video")
            // Then fetch full details
            fetchLessonDetails(firstUnlocked.id)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error)
      toast.error("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  const findLessonById = (courseData: Course, lessonId: number): Lesson | null => {
    for (const module of courseData.modules) {
      const lesson = module.lessons.find((l) => l.id === lessonId)
      if (lesson) return lesson
    }
    return null
  }

  const findFirstUnlockedLesson = (courseData: Course): Lesson | null => {
    for (const module of courseData.modules) {
      for (const lesson of module.lessons) {
        if (isLessonUnlocked(courseData, lesson.id)) {
          return lesson
        }
      }
    }
    return null
  }

  const getLessonStatus = (lessonId: number): "completed" | "in_progress" | "locked" => {
    if (!course?.progress?.lesson_progress) {
      // First lesson is always unlocked
      const firstModule = course?.modules[0]
      const firstLesson = firstModule?.lessons[0]
      return firstLesson?.id === lessonId ? "in_progress" : "locked"
    }

    const lessonProgress = course.progress.lesson_progress.find((lp: any) => lp.lesson_id === lessonId)
    if (lessonProgress?.status === "completed") return "completed"
    if (lessonProgress?.status === "in_progress" || lessonProgress?.status === "not_started") return "in_progress"
    return "locked"
  }

  const isLessonUnlocked = (courseData: Course, lessonId: number): boolean => {
    // Find lesson position
    let moduleIndex = -1
    let lessonIndex = -1

    for (let i = 0; i < courseData.modules.length; i++) {
      const lessonIdx = courseData.modules[i].lessons.findIndex((l) => l.id === lessonId)
      if (lessonIdx !== -1) {
        moduleIndex = i
        lessonIndex = lessonIdx
        break
      }
    }

    if (moduleIndex === -1) return false

    // First lesson of first module is always unlocked
    if (moduleIndex === 0 && lessonIndex === 0) return true

    // Check previous lesson
    if (lessonIndex > 0) {
      const prevLesson = courseData.modules[moduleIndex].lessons[lessonIndex - 1]
      return getLessonStatus(prevLesson.id) === "completed"
    }

    // Check last lesson of previous module
    if (moduleIndex > 0) {
      const prevModule = courseData.modules[moduleIndex - 1]
      if (prevModule.lessons.length > 0) {
        const lastLesson = prevModule.lessons[prevModule.lessons.length - 1]
        return getLessonStatus(lastLesson.id) === "completed"
      }
    }

    return false
  }

  const fetchLessonDetails = async (lessonId: number) => {
    if (!userId) {
      // If no userId, still show basic lesson info from course data
      const lesson = findLessonById(course!, lessonId)
      if (lesson) {
        setSelectedLessonFull({
          ...lesson,
          quizzes: [],
          tasks: [],
          progress: null,
        })
        setLoadingLesson(false)
      }
      return
    }

    setLoadingLesson(true)
    try {
      const res = await fetch(`/api/learning/lessons/${lessonId}?userId=${userId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch lesson")
      }

      // Ensure quizzes and tasks are arrays
      let lessonData = {
        ...data,
        quizzes: Array.isArray(data.quizzes) ? data.quizzes : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
      }
      
      console.log('[Frontend] Raw lesson data:', {
        hasQuizzes: !!data.quizzes,
        quizType: typeof data.quizzes,
        quizIsArray: Array.isArray(data.quizzes),
        quizLength: data.quizzes?.length,
        rawQuizzes: data.quizzes
      })
      
      // Parse quiz options if needed
      if (lessonData.quizzes && lessonData.quizzes.length > 0) {
        lessonData.quizzes = lessonData.quizzes.map((quiz: any) => {
          let options = quiz.options
          
          // If options is a string, parse it
          if (typeof options === 'string') {
            try {
              options = JSON.parse(options)
            } catch (e) {
              console.error('[Frontend] Error parsing quiz options:', e, 'Raw:', options)
              options = []
            }
          }
          
          // If options is null or undefined
          if (options === null || options === undefined) {
            // For true_false, we don't need options array, but we can set default
            if (quiz.question_type === 'true_false') {
              options = ['True', 'False']
            } else {
              options = []
            }
          }
          
          // Ensure options is an array
          if (!Array.isArray(options)) {
            console.warn('[Frontend] Quiz options is not an array:', options, 'Converting to array')
            options = []
          }
          
          const parsedQuiz = {
            ...quiz,
            options: options
          }
          
          console.log('[Frontend] Parsed quiz:', {
            id: quiz.id,
            question: quiz.question,
            question_type: quiz.question_type,
            options_count: options.length,
            options: options
          })
          
          return parsedQuiz
        })
      }
      
      setSelectedLessonFull(lessonData)
      setCurrentStep("video") // Reset to video step
      setQuizAnswers({}) // Reset quiz answers
      
      // Log for debugging
      console.log('[Frontend] Final lesson data:', {
        hasQuizzes: lessonData.quizzes && lessonData.quizzes.length > 0,
        quizCount: lessonData.quizzes?.length || 0,
        quizzes: lessonData.quizzes,
        lessonId: lessonId
      })
      
      // Show toast if quizzes found
      if (lessonData.quizzes && lessonData.quizzes.length > 0) {
        toast.success(`Loaded ${lessonData.quizzes.length} quiz question(s)`)
      }
    } catch (error: any) {
      console.error("Error fetching lesson:", error)
      // Fallback: Use basic lesson data from course
      const lesson = findLessonById(course!, lessonId)
      if (lesson) {
        setSelectedLessonFull({
          ...lesson,
          quizzes: [],
          tasks: [],
          progress: null,
        })
        toast.warning("Some lesson details couldn't be loaded, but you can still watch the video")
      } else {
        toast.error(error.message || "Failed to load lesson")
      }
    } finally {
      setLoadingLesson(false)
    }
  }

  const handleLessonClick = (lesson: Lesson) => {
    if (isLessonUnlocked(course!, lesson.id)) {
      setSelectedLesson(lesson)
      setSidebarOpen(false) // Close sidebar on mobile when lesson is selected
      // Immediately show basic lesson info while loading full details
      setSelectedLessonFull({
        ...lesson,
        quizzes: [],
        tasks: [],
        progress: null,
      })
      setCurrentStep("video")
      // Then fetch full details
      fetchLessonDetails(lesson.id)
    } else {
      toast.error("Complete previous lessons to unlock this one")
    }
  }

  // Convert YouTube URL to embed format
  const convertToEmbedUrl = (url: string | null): string | null => {
    if (!url) return null

    // If already an embed URL, return as is
    if (url.includes("youtube.com/embed/")) {
      return url
    }

    // Extract video ID from various YouTube URL formats
    let videoId: string | null = null

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (watchMatch) {
      videoId = watchMatch[1]
    }

    // Format: https://youtu.be/VIDEO_ID
    if (!videoId) {
      const shortMatch = url.match(/youtu\.be\/([^&\n?#]+)/)
      if (shortMatch) {
        videoId = shortMatch[1]
      }
    }

    // If we found a video ID, return embed URL
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }

    // If it's not a YouTube URL, return as is (might be Vimeo or direct video)
    return url
  }

  const handleVideoWatched = async () => {
    if (!userId || !selectedLessonFull) return

    try {
      const res = await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          lesson_id: selectedLessonFull.id,
          video_watched: true,
        }),
      })

      if (res.ok) {
        toast.success("Video marked as watched!")
        // Refresh course data to update progress
        fetchCourse(userId)
        // Update local lesson state
        setSelectedLessonFull({
          ...selectedLessonFull,
          progress: {
            ...selectedLessonFull.progress,
            video_watched: true,
            status: selectedLessonFull.progress?.status || "in_progress",
          } as any,
        })
      }
    } catch (error) {
      toast.error("Failed to update progress")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mb-4"></div>
          <p className="text-gray-300">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <Card className="max-w-md bg-[#0a0a0f] border-[#e63946]/20">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Course Not Found</h2>
            <Button onClick={() => router.push("/profile")} className="bg-[#e63946] hover:bg-[#d62839]">
              Back to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show pending enrollment message
  if (course.price > 0 && course.enrollment_status && course.enrollment_status !== "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="max-w-md bg-[#0a0a0f] border-[#e63946]/20">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/20 rounded-full mb-6">
              <Clock className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Enrollment Pending</h2>
            <p className="text-gray-400 mb-6">
              {course.enrollment_message || "Your enrollment request is pending approval. The course will be available once approved by the administrator."}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/profile")} 
                className="w-full bg-[#e63946] hover:bg-[#d62839]"
              >
                Back to Profile
              </Button>
              <Button 
                onClick={() => fetchCourse(userId!)} 
                variant="outline"
                className="w-full border-[#e63946]/30 text-gray-300 hover:bg-[#e63946]/10"
              >
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex overflow-hidden relative">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#e63946]/20 rounded-full animate-particleFloat"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d62839]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
      {/* Sidebar - Modules & Lessons */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 lg:w-96 bg-gradient-to-b from-[#0f1419] to-[#0a0a0f] border-r border-[#e63946]/20 overflow-y-auto transition-transform duration-500 ease-out relative backdrop-blur-sm animate-slide-in-left`}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-gradient-to-b from-[#0a0a0f]/95 to-[#0a0a0f]/95 backdrop-blur-md border-b border-[#e63946]/20 p-4 z-10 glass-effect">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/profile")}
              className="text-gray-400 hover:text-white hover:bg-[#e63946]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div>
            <h1 className="text-xl font-black text-white mb-1 line-clamp-2">{course.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-[#e63946]/20 text-[#e63946] border-[#e63946]/30 text-xs">
                {course.difficulty_level}
              </Badge>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m
              </span>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-bold">{course.progress.progress_percentage}%</span>
            </div>
            <Progress value={course.progress.progress_percentage} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {course.progress.lessons_completed} / {course.progress.total_lessons} lessons
            </p>
          </div>
        </div>

        {/* Modules & Lessons List */}
        <div className="p-4 space-y-4">
          {course.modules.map((module, moduleIdx) => {
            const isCollapsed = collapsedModules.has(module.id)
            const completedLessons = module.lessons.filter((l) => getLessonStatus(l.id) === "completed").length
            const totalLessons = module.lessons.length
            
            return (
              <div key={module.id} className="animate-fade-in" style={{ animationDelay: `${moduleIdx * 50}ms` }}>
                <button
                  onClick={() => {
                    setCollapsedModules((prev) => {
                      const newSet = new Set(prev)
                      if (newSet.has(module.id)) {
                        newSet.delete(module.id)
                      } else {
                        newSet.add(module.id)
                      }
                      return newSet
                    })
                  }}
                  className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-[#e63946]/20 bg-gradient-to-r from-[#0a0a0f]/50 via-[#0f1419]/50 to-[#0a0a0f]/50 hover:border-[#e63946]/40 hover:bg-gradient-to-r hover:from-[#e63946]/10 hover:via-[#d62839]/5 hover:to-[#e63946]/10 transition-all duration-500 ease-out group relative overflow-hidden"
                >
                  {/* Animated Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/0 via-[#e63946]/5 to-[#e63946]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-3 flex-1 relative z-10">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/10 group-hover:from-[#e63946]/30 group-hover:to-[#d62839]/20 transition-all duration-500 ${isCollapsed ? 'rotate-0' : 'rotate-12'} group-hover:scale-110 shadow-lg shadow-[#e63946]/20`}>
                      <BookOpen className="h-4 w-4 text-[#e63946] transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 group-hover:text-[#e63946] transition-colors duration-300">
                        {module.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e63946] animate-pulse" />
                          {completedLessons}/{totalLessons} lessons
                        </span>
                        <span className="text-[#e63946]">•</span>
                        <span className="font-semibold">{Math.round((completedLessons / totalLessons) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <div className={`p-1.5 rounded-lg bg-[#e63946]/10 group-hover:bg-[#e63946]/20 transition-all duration-300 ${isCollapsed ? '' : 'rotate-180'}`}>
                      <ChevronDown className={`h-5 w-5 text-[#e63946] transition-all duration-500 ease-out group-hover:scale-125 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
                    </div>
                  </div>
                </button>
                <div
                  className={`space-y-2 ml-8 mt-3 overflow-hidden ${
                    isCollapsed 
                      ? "max-h-0 opacity-0 translate-y-[-10px] pointer-events-none" 
                      : "max-h-[2000px] opacity-100 translate-y-0 pointer-events-auto"
                  } transition-all duration-700 ease-out`}
                  style={{
                    transitionTimingFunction: isCollapsed ? 'cubic-bezier(0.4, 0, 1, 1)' : 'cubic-bezier(0, 0, 0.2, 1)'
                  }}
                >
                {module.lessons.map((lesson, lessonIdx) => {
                  const status = getLessonStatus(lesson.id)
                  const unlocked = isLessonUnlocked(course, lesson.id)
                  const isSelected = selectedLesson?.id === lesson.id

                  return (
                    <div
                      key={lesson.id}
                      className={`transition-all duration-500 ease-out ${
                        isCollapsed 
                          ? "opacity-0 translate-x-[-20px] scale-95" 
                          : "opacity-100 translate-x-0 scale-100"
                      }`}
                      style={{
                        transitionDelay: `${lessonIdx * 0.05}s`,
                      }}
                    >
                      <button
                        onClick={() => handleLessonClick(lesson)}
                        disabled={!unlocked}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 ease-out relative overflow-hidden group/lesson ${
                          isSelected
                            ? "bg-gradient-to-r from-[#e63946]/15 to-[#d62839]/10 text-white"
                            : status === "completed"
                              ? "bg-green-500/5 hover:bg-green-500/10 text-gray-300"
                              : unlocked
                                ? "bg-transparent hover:bg-[#e63946]/5 text-gray-300 hover:text-white"
                                : "opacity-50 cursor-not-allowed text-gray-500"
                        }`}
                      >
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/0 via-[#e63946]/5 to-[#e63946]/0 opacity-0 group-hover/lesson:opacity-100 transition-opacity duration-300" />
                        
                        <div className="flex items-start gap-3 relative z-10">
                          <div
                            className={`p-1.5 rounded-md flex-shrink-0 transition-all duration-300 group-hover/lesson:scale-110 ${
                              status === "completed"
                                ? "bg-green-500/20 group-hover/lesson:bg-green-500/30"
                                : unlocked
                                  ? isSelected
                                    ? "bg-[#e63946]/30 group-hover/lesson:bg-[#e63946]/40"
                                    : "bg-[#e63946]/10 group-hover/lesson:bg-[#e63946]/20"
                                  : "bg-gray-800/50"
                            }`}
                          >
                            {status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400 group-hover/lesson:scale-110 transition-transform duration-300" />
                            ) : unlocked && isSelected ? (
                              <div className="relative">
                                <Circle className="h-4 w-4 text-[#e63946] opacity-50" />
                                <Minus className="h-3 w-3 text-[#e63946] absolute top-0.5 left-0.5" strokeWidth={3} />
                              </div>
                            ) : unlocked ? (
                              <Circle className="h-4 w-4 text-[#e63946] opacity-30 group-hover/lesson:opacity-50 transition-opacity duration-300" />
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm font-medium truncate transition-colors duration-300 ${
                                status === "completed" 
                                  ? "text-green-400/80 line-through decoration-2 decoration-green-400 decoration-solid" 
                                  : isSelected 
                                    ? "text-white" 
                                    : "text-gray-300 group-hover/lesson:text-white"
                              }`} style={status === "completed" ? { textDecorationThickness: "2px" } : {}}>
                                {lesson.order_index}. {lesson.title}
                              </p>
                              {isSelected && (
                                <Badge className="bg-[#e63946] text-white text-xs px-2 py-0.5 rounded-full animate-pulse">Current</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 group-hover/lesson:text-gray-300 transition-colors duration-300">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.floor(lesson.video_duration_seconds / 60)}m
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {lesson.xp_reward} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )
                })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content - Video Player */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0a0a0f]/95 to-[#0a0a0f]/95 backdrop-blur-sm border-b border-[#e63946]/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Badge className="bg-[#e63946]/20 text-[#e63946] border-[#e63946]/30">
              {course.progress.progress_percentage}% Complete
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Zap className="h-4 w-4 text-[#e63946]" />
              <span className="font-semibold text-white">
                {course.progress.lessons_completed} / {course.progress.total_lessons}
              </span>
            </div>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0f1419] to-[#0a0a0f]">
          {loadingLesson ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-[#e63946] animate-spin mx-auto mb-4" />
                <p className="text-gray-300">Loading lesson...</p>
              </div>
            </div>
          ) : selectedLessonFull ? (
            <div className="h-full flex flex-col animate-scale-in">
              {/* Video Player */}
              <div className="relative w-full bg-black group" style={{ aspectRatio: "16/9" }}>
                {/* Animated Border Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] rounded-lg opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 animate-gradient" />
                <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl shadow-[#e63946]/20">
                  {selectedLessonFull.video_url ? (
                    <iframe
                      src={convertToEmbedUrl(selectedLessonFull.video_url) || ""}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-[1.01]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      frameBorder="0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0f1419] to-[#0a0a0f]">
                      <div className="text-center animate-float">
                        <PlayCircle className="h-20 w-20 text-gray-600 mx-auto mb-4 animate-pulse" />
                        <p className="text-gray-400">No video available for this lesson</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lesson Content with Tabs */}
              <div className="flex-1 overflow-y-auto p-6 animate-fade-in-up">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content - Left Column (2/3 width) */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Lesson Header */}
                  <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <h2 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent animate-gradient">
                      {selectedLessonFull.title}
                    </h2>
                    {selectedLessonFull.description && (
                      <p className="text-gray-300 text-lg mt-2 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                        {selectedLessonFull.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                      <Badge className="bg-[#e63946]/20 text-[#e63946] border-[#e63946]/30 hover:bg-[#e63946]/30 hover:scale-110 transition-all duration-300 hover-lift">
                        <Clock className="h-3 w-3 mr-1 animate-pulse" />
                        {Math.floor(selectedLessonFull.video_duration_seconds / 60)} minutes
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 hover:scale-110 transition-all duration-300 hover-lift">
                        <Award className="h-3 w-3 mr-1 animate-float" />
                        {selectedLessonFull.xp_reward} XP
                      </Badge>
                    </div>
                  </div>

                  {/* Tabs for Video, Quiz, Task */}
                  <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as "video" | "quiz" | "task")}>
                    <TabsList className="bg-[#0a0a0f] border border-[#e63946]/20 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                      <TabsTrigger
                        value="video"
                        className="data-[state=active]:bg-[#e63946] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#e63946]/50 transition-all duration-300 hover:scale-105"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger
                        value="quiz"
                        className="data-[state=active]:bg-[#e63946] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#e63946]/50 transition-all duration-300 hover:scale-105 text-white"
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Quiz {selectedLessonFull.quizzes && selectedLessonFull.quizzes.length > 0 && `(${selectedLessonFull.quizzes.length})`}
                      </TabsTrigger>
                      {selectedLessonFull.tasks && selectedLessonFull.tasks.length > 0 && (
                        <TabsTrigger
                          value="task"
                          className="data-[state=active]:bg-[#e63946] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#e63946]/50 transition-all duration-300 hover:scale-105"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Task ({selectedLessonFull.tasks.length})
                        </TabsTrigger>
                      )}
                    </TabsList>

                    {/* Video Tab */}
                    <TabsContent value="video" className="mt-6 animate-fade-in-up">
                      <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20 hover:border-[#e63946]/40 transition-all duration-500 hover-lift glass-effect">
                        <CardContent className="p-6">
                          <p className="text-gray-300 text-lg">
                            Watch the video above to learn the concepts. Make sure to watch it completely before
                            proceeding to the quiz.
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Quiz Tab */}
                    <TabsContent value="quiz" className="mt-6 animate-fade-in-up">
                      {selectedLessonFull.quizzes && Array.isArray(selectedLessonFull.quizzes) && selectedLessonFull.quizzes.length > 0 ? (
                        <div className="space-y-4">
                          {selectedLessonFull.quizzes.map((quiz, idx) => (
                            <Card
                              key={quiz.id}
                              className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20 hover:border-[#e63946]/40 transition-all duration-500 hover-lift glass-effect animate-fade-in-up"
                              style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                              <CardContent className="p-6">
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                      Question {idx + 1}: <span className="text-[#e63946]">{quiz.question}</span>
                                    </h3>
                                    {quiz.question_type === "multiple_choice" && (
                                      <div className="space-y-3 mt-6">
                                        {quiz.options && quiz.options.length > 0 ? (
                                          quiz.options.map((option, optIdx) => {
                                            const isSelected = quizAnswers[quiz.id] === option
                                            return (
                                              <label
                                                key={optIdx}
                                                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                                                  isSelected
                                                    ? "border-[#e63946] bg-[#e63946]/20 shadow-lg shadow-[#e63946]/30 scale-[1.02]"
                                                    : "border-[#e63946]/20 bg-[#0a0a0f]/50 hover:border-[#e63946]/40 hover:bg-[#e63946]/10"
                                                } hover:scale-[1.02] hover:shadow-lg hover:shadow-[#e63946]/20`}
                                              >
                                                <input
                                                  type="radio"
                                                  name={`quiz-${quiz.id}`}
                                                  value={option}
                                                  checked={isSelected}
                                                  onChange={(e) => {
                                                    setQuizAnswers((prev) => ({
                                                      ...prev,
                                                      [quiz.id]: e.target.value,
                                                    }))
                                                  }}
                                                  className="w-5 h-5 text-[#e63946] accent-[#e63946] cursor-pointer"
                                                />
                                                <span className="text-white text-lg font-medium flex-1">{option}</span>
                                                {isSelected && (
                                                  <CheckCircle2 className="h-6 w-6 text-[#e63946] animate-scale-in" />
                                                )}
                                              </label>
                                            )
                                          })
                                        ) : (
                                          <p className="text-gray-400">No options available for this question</p>
                                        )}
                                      </div>
                                    )}
                                    {quiz.question_type === "true_false" && (
                                      <div className="grid grid-cols-2 gap-6 mt-6">
                                        <button
                                          onClick={() => {
                                            setQuizAnswers((prev) => ({
                                              ...prev,
                                              [quiz.id]: "True",
                                            }))
                                          }}
                                          className={`p-8 rounded-xl border-2 transition-all duration-300 font-bold text-xl ${
                                            quizAnswers[quiz.id] === "True"
                                              ? "border-[#e63946] bg-[#e63946]/20 text-white shadow-lg shadow-[#e63946]/30 scale-105"
                                              : "border-[#e63946]/30 bg-[#0a0a0f]/50 hover:border-[#e63946] hover:bg-[#e63946]/10 text-white hover:scale-105 hover:shadow-lg hover:shadow-[#e63946]/30"
                                          }`}
                                        >
                                          <div className="flex items-center justify-center gap-3">
                                            <span className="text-2xl">True</span>
                                            {quizAnswers[quiz.id] === "True" && (
                                              <CheckCircle2 className="h-6 w-6 text-[#e63946] animate-scale-in" />
                                            )}
                                          </div>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setQuizAnswers((prev) => ({
                                              ...prev,
                                              [quiz.id]: "False",
                                            }))
                                          }}
                                          className={`p-8 rounded-xl border-2 transition-all duration-300 font-bold text-xl ${
                                            quizAnswers[quiz.id] === "False"
                                              ? "border-[#e63946] bg-[#e63946]/20 text-white shadow-lg shadow-[#e63946]/30 scale-105"
                                              : "border-[#e63946]/30 bg-[#0a0a0f]/50 hover:border-[#e63946] hover:bg-[#e63946]/10 text-white hover:scale-105 hover:shadow-lg hover:shadow-[#e63946]/30"
                                          }`}
                                        >
                                          <div className="flex items-center justify-center gap-3">
                                            <span className="text-2xl">False</span>
                                            {quizAnswers[quiz.id] === "False" && (
                                              <CheckCircle2 className="h-6 w-6 text-[#e63946] animate-scale-in" />
                                            )}
                                          </div>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          <Button
                            onClick={() => {
                              const allAnswered = (selectedLessonFull.quizzes || []).every((q) => quizAnswers[q.id])
                              if (allAnswered) {
                                toast.success("Quiz submitted successfully!")
                                // TODO: Implement quiz submission
                              } else {
                                toast.error("Please answer all questions before submitting")
                              }
                            }}
                            className="w-full bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] hover:from-[#d62839] hover:via-[#c1121f] hover:to-[#d62839] text-white font-bold h-14 text-lg animate-gradient hover:scale-105 transition-all duration-300 shadow-lg shadow-[#e63946]/30 hover:shadow-[#e63946]/50 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <span className="relative z-10">Submit Quiz</span>
                          </Button>
                        </div>
                      ) : (
                        <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20">
                          <CardContent className="p-8 text-center">
                            <HelpCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Quiz Available</h3>
                            <p className="text-gray-400 mb-4">This lesson doesn't have a quiz yet.</p>
                            <p className="text-xs text-gray-500">
                              Debug: quizzes = {selectedLessonFull.quizzes ? JSON.stringify(selectedLessonFull.quizzes) : 'null'}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Task Tab */}
                    {selectedLessonFull.tasks && selectedLessonFull.tasks.length > 0 && (
                      <TabsContent value="task" className="mt-6 animate-fade-in-up">
                        <div className="space-y-4">
                          {selectedLessonFull.tasks.map((task, idx) => (
                            <Card
                              key={task.id}
                              className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20 hover:border-[#e63946]/40 transition-all duration-500 hover-lift glass-effect animate-fade-in-up"
                              style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                              <CardContent className="p-6">
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                      {task.title}
                                    </h3>
                                    <p className="text-gray-300 text-lg">{task.instructions}</p>
                                  </div>
                                  {task.task_type === "coding_practice" ? (
                                    <div className="space-y-4">
                                      <Label className="text-white text-lg font-semibold">Write Your Code</Label>
                                      <div className="rounded-lg overflow-hidden border border-[#e63946]/20 hover:border-[#e63946]/40 transition-all duration-300">
                                        <CodeEditor
                                          value={task.starter_code || ""}
                                          onChange={() => {}}
                                          language={task.programming_language || "javascript"}
                                          height="400px"
                                          theme="vs-dark"
                                        />
                                      </div>
                                      <Button
                                        onClick={() => {
                                          toast.info("Code execution will be implemented")
                                          // TODO: Implement code execution
                                        }}
                                        className="w-full bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] hover:from-[#d62839] hover:via-[#c1121f] hover:to-[#d62839] text-white font-bold h-12 animate-gradient hover:scale-105 transition-all duration-300 shadow-lg shadow-[#e63946]/30 hover:shadow-[#e63946]/50 relative overflow-hidden group"
                                      >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <span className="relative z-10">Run Code</span>
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <Label className="text-white text-lg font-semibold">Your Response</Label>
                                      <Textarea
                                        placeholder="Share your thoughts, reflections, or complete the task..."
                                        className="min-h-[200px] bg-[#0a0a0f] border-[#e63946]/30 text-white focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300"
                                      />
                                    </div>
                                  )}
                                  <Button
                                    onClick={() => {
                                      toast.info("Task submission will be implemented")
                                      // TODO: Implement task submission
                                    }}
                                    className="w-full bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] hover:from-[#d62839] hover:via-[#c1121f] hover:to-[#d62839] text-white font-bold h-12 animate-gradient hover:scale-105 transition-all duration-300 shadow-lg shadow-[#e63946]/30 hover:shadow-[#e63946]/50 relative overflow-hidden group"
                                  >
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <span className="relative z-10">Submit Task</span>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                  </div>
                  
                  {/* Right Column - Action Buttons */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                      {/* Mark as Watched Button */}
                      <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20 hover:border-[#e63946]/40 transition-all duration-500 hover-lift glass-effect">
                        <CardContent className="p-6">
                          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Complete Lesson</h3>
                          <Button
                            onClick={handleVideoWatched}
                            disabled={selectedLessonFull.progress?.video_watched}
                            className="w-full bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] hover:from-[#d62839] hover:via-[#c1121f] hover:to-[#d62839] text-white font-bold h-14 text-base animate-gradient hover:scale-105 transition-all duration-300 shadow-lg shadow-[#e63946]/30 hover:shadow-[#e63946]/50 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <span className="relative z-10 flex items-center justify-center">
                              {selectedLessonFull.progress?.video_watched ? (
                                <>
                                  <CheckCircle2 className="h-5 w-5 mr-2 animate-pulse" />
                                  Video Watched
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                  Mark as Watched
                                </>
                              )}
                            </span>
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Next Lesson Button */}
                      <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20 hover:border-[#e63946]/40 transition-all duration-500 hover-lift glass-effect">
                        <CardContent className="p-6">
                          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Continue Learning</h3>
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Find next lesson
                              let found = false
                              for (const module of course.modules) {
                                for (const lesson of module.lessons) {
                                  if (found && isLessonUnlocked(course, lesson.id)) {
                                    handleLessonClick(lesson)
                                    return
                                  }
                                  if (lesson.id === selectedLessonFull.id) {
                                    found = true
                                  }
                                }
                              }
                              toast.info("No more lessons available")
                            }}
                            className="w-full border-[#e63946]/30 text-[#e63946] hover:bg-[#e63946]/10 hover:border-[#e63946] hover:scale-105 transition-all duration-300 hover-lift glow-on-hover group h-14 text-base font-bold"
                          >
                            Next Lesson
                            <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedLesson ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <Loader2 className="h-24 w-24 text-[#e63946] animate-spin mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Loading Lesson...</h3>
                <p className="text-gray-400">Please wait while we load the lesson content</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <PlayCircle className="h-24 w-24 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Select a Lesson</h3>
                <p className="text-gray-400 mb-6">
                  Choose a lesson from the sidebar to start learning. Complete lessons in order to unlock new content.
                </p>
                <Button
                  onClick={() => {
                    const firstUnlocked = findFirstUnlockedLesson(course)
                    if (firstUnlocked) {
                      handleLessonClick(firstUnlocked)
                    }
                  }}
                  className="bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f]"
                >
                  Start First Lesson
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
