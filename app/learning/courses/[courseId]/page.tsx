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
  User,
  List,
  Star,
  MessageCircle,
  Download,
  FolderOpen,
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CodeEditor } from "@/components/code-editor"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { LessonVideoPlayer } from "@/components/lesson-video-player"
import { getImageSrc } from "@/lib/utils"
import { getYoutubeVideoId, isYoutubeUrl, buildPrivacyEnhancedEmbedUrl } from "@/lib/youtube-embed"
import Link from "next/link"

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
  thumbnail_url?: string | null
  instructor_name: string
  estimated_duration_minutes: number
  difficulty_level: string
  price: number
  is_featured?: boolean
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
  const [courseInfoTab, setCourseInfoTab] = useState<"overview" | "curriculum" | "instructor" | "reviews">("overview")
  const [courseContentExpanded, setCourseContentExpanded] = useState<Set<number>>(new Set())
  const [lessonDetailTab, setLessonDetailTab] = useState<"overview" | "resources" | "notes" | "discussions">("overview")
  const [focusMode, setFocusMode] = useState(true)
  const [enrollAuthModalOpen, setEnrollAuthModalOpen] = useState(false)

  useEffect(() => {
    const mods = course?.modules ?? []
    if (mods.length) {
      setCollapsedModules(new Set(mods.map((m) => m.id)))
    }
  }, [course?.id])

  useEffect(() => {
    const mods = course?.modules ?? []
    const firstId = mods[0]?.id
    if (firstId != null) {
      setCourseContentExpanded(new Set([firstId]))
    }
  }, [course?.id])

  useEffect(() => {
    const storedUser = localStorage.getItem("gold_student") || localStorage.getItem("verified_student_id")
    if (storedUser) {
      try {
        const user = typeof storedUser === "string" ? JSON.parse(storedUser) : { id: storedUser }
        const id = user?.id ?? user
        if (id) {
          setUserId(id)
          fetchCourse(id)
          return
        }
      } catch (_) {}
    }
    // Guest: fetch course without userId so user can see course info
    fetchCourse()
  }, [courseId, router])

  // Ka dib login/register (modal xirantahay), dib u eeg userId si badhanka uu dhakhso u noqdo "Go to Payment"
  useEffect(() => {
    if (enrollAuthModalOpen) return
    const storedUser = localStorage.getItem("gold_student")
    if (!storedUser) return
    try {
      const user = typeof storedUser === "string" ? JSON.parse(storedUser) : { id: storedUser }
      const id = user?.id ?? user
      if (id) {
        setUserId(id)
        fetchCourse(id)
      }
    } catch (_) {}
  }, [enrollAuthModalOpen])

  const fetchCourse = async (userId?: number) => {
    try {
      const url = userId
        ? `/api/learning/courses/${courseId}?userId=${userId}`
        : `/api/learning/courses/${courseId}`
      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch course")
      }

      // Normalize progress for guest (no userId)
      const totalLessons = (data.modules || []).reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)
      if (!data.progress || typeof data.progress !== "object" || Object.keys(data.progress).length === 0) {
        data.progress = {
          progress_percentage: 0,
          lessons_completed: 0,
          total_lessons: totalLessons,
          current_lesson_id: null,
          lesson_progress: [],
        }
      }

      setCourse(data)

      // Guest: no need to select lesson or load content
      if (!userId) {
        setLoading(false)
        return
      }

      // Check enrollment status for paid courses
      if (data.price > 0 && data.enrollment_status && data.enrollment_status !== "approved") {
        toast.error(data.enrollment_message || "Your enrollment is pending approval")
        setLoading(false)
        return
      }

      // Auto-select current lesson or first unlocked lesson only if enrollment is approved
      if (data.enrollment_status === "approved" || data.price === 0) {
        if (data.progress?.current_lesson_id) {
          const currentLesson = findLessonById(data, data.progress.current_lesson_id)
          if (currentLesson) {
            setSelectedLesson(currentLesson)
            setSelectedLessonFull({
              ...currentLesson,
              quizzes: [],
              tasks: [],
              progress: null,
            })
            setCurrentStep("video")
            fetchLessonDetails(currentLesson.id)
          }
        } else {
          const firstUnlocked = findFirstUnlockedLesson(data)
          if (firstUnlocked) {
            setSelectedLesson(firstUnlocked)
            setSelectedLessonFull({
              ...firstUnlocked,
              quizzes: [],
              tasks: [],
              progress: null,
            })
            setCurrentStep("video")
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
    for (const module of courseData?.modules ?? []) {
      const lesson = (module.lessons ?? []).find((l) => l.id === lessonId)
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
    const lessonProgressList = course?.progress?.lesson_progress ?? []
    if (lessonProgressList.length === 0) {
      const firstModule = course?.modules?.[0]
      const firstLesson = firstModule?.lessons?.[0]
      return firstLesson?.id === lessonId ? "in_progress" : "locked"
    }

    const lessonProgress = lessonProgressList.find((lp: any) => lp.lesson_id === lessonId)
    if (lessonProgress?.status === "completed") return "completed"
    if (lessonProgress?.status === "in_progress" || lessonProgress?.status === "not_started") return "in_progress"
    return "locked"
  }

  const isLessonUnlocked = (courseData: Course, lessonId: number): boolean => {
    const modules = courseData?.modules ?? []
    let moduleIndex = -1
    let lessonIndex = -1

    for (let i = 0; i < modules.length; i++) {
      const lessonIdx = (modules[i].lessons ?? []).findIndex((l) => l.id === lessonId)
      if (lessonIdx !== -1) {
        moduleIndex = i
        lessonIndex = lessonIdx
        break
      }
    }

    if (moduleIndex === -1) return false

    // First lesson of first module is always unlocked
    if (moduleIndex === 0 && lessonIndex === 0) return true

    if (lessonIndex > 0) {
      const prevLesson = modules[moduleIndex].lessons?.[lessonIndex - 1]
      return prevLesson ? getLessonStatus(prevLesson.id) === "completed" : false
    }

    if (moduleIndex > 0) {
      const prevModule = modules[moduleIndex - 1]
      const prevLessons = prevModule?.lessons ?? []
      if (prevLessons.length > 0) {
        const lastLesson = prevLessons[prevLessons.length - 1]
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

  // Clean embed URL: YouTube → privacy-enhanced nocookie + params; others (Vimeo, etc.) as-is.
  const convertToEmbedUrl = (url: string | null | undefined): string | null => {
    if (url == null || typeof url !== "string") return null
    try {
      const videoId = getYoutubeVideoId(url)
      if (isYoutubeUrl(url) && videoId) {
        return buildPrivacyEnhancedEmbedUrl(videoId)
      }
      return url
    } catch {
      return url
    }
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

  const handleMarkComplete = async () => {
    if (!userId || !selectedLessonFull) return
    const isCompleted = getLessonStatus(selectedLessonFull.id) === "completed"
    if (isCompleted) return

    try {
      const res = await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          lesson_id: selectedLessonFull.id,
          video_watched: true,
          quiz_completed: true,
          task_completed: true,
        }),
      })

      if (res.ok) {
        setSelectedLessonFull({
          ...selectedLessonFull,
          progress: {
            ...selectedLessonFull.progress,
            status: "completed",
            video_watched: true,
            quiz_completed: true,
            task_completed: true,
          } as any,
        })
        await fetchCourse(userId)
        toast.success("Lesson marked as complete!")
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || "Failed to update progress")
      }
    } catch (error) {
      toast.error("Failed to update progress")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#e0f2f4] via-[#f0f9f8] to-[#e8f4f8]">
        <Navbar />
        {/* Banner skeleton */}
        <div className="w-full h-12 bg-gradient-to-r from-[#2596be]/20 to-[#3c62b3]/20 animate-pulse" />
        {/* Content skeleton – responsive mobile */}
        <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 sm:pt-10 pb-24 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left column skeleton */}
            <div className="lg:col-span-7 space-y-6 lg:pl-6 lg:border-l-4 lg:border-[#2596be]/20">
              <div className="h-8 w-40 rounded-full bg-[#2596be]/20 animate-pulse" />
              <div className="h-12 sm:h-14 md:h-16 w-full max-w-xl rounded-xl bg-gradient-to-r from-[#2596be]/25 via-[#2596be]/15 to-[#3c62b3]/25 animate-pulse" />
              <div className="flex gap-3">
                <div className="h-1.5 w-24 rounded-full bg-[#2596be]/25 animate-pulse" />
                <div className="h-1.5 w-12 rounded-full bg-[#3c62b3]/20 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-[#2596be]/15 animate-pulse" />
                <div className="h-24 md:h-32 w-full rounded-2xl bg-white/80 border border-[#2596be]/10 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-[#2596be]/15 animate-pulse" />
                <div className="aspect-video w-full rounded-3xl bg-[#2596be]/15 border-2 border-[#2596be]/10 animate-pulse flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-white/60 animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-11 w-24 rounded-xl bg-white/90 border border-[#2596be]/15 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white/90 border border-[#2596be]/15 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
            </div>
            {/* Right column – price card skeleton */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-3xl border-2 border-[#2596be]/20 shadow-xl overflow-hidden animate-pulse">
                  <div className="h-1.5 bg-gradient-to-r from-[#2596be]/30 to-[#3c62b3]/30" />
                  <div className="aspect-video w-full bg-[#2596be]/15" />
                  <div className="p-6 space-y-5">
                    <div className="h-10 w-28 rounded-lg bg-[#2596be]/20" />
                    <div className="h-4 w-24 rounded bg-[#2596be]/15" />
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#2596be]/15" />
                          <div className="h-4 flex-1 max-w-[120px] rounded bg-[#2596be]/10" />
                        </div>
                      ))}
                    </div>
                    <div className="h-14 w-full rounded-xl bg-gradient-to-r from-[#2596be]/25 to-[#3c62b3]/25" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafb] via-[#ffffff] to-[#f8fafb] pb-20 lg:pb-0">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
          <Card className="max-w-md w-full bg-white border-[#e2e8f0] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-center">
              <BookOpen className="h-16 w-16 text-[#2596be]/40 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#2596be] mb-2">Course Not Found</h2>
              <p className="text-[#64748b] mb-6">This course may have been removed or the link is incorrect.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => router.push("/")} variant="outline" className="border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10">
                  Back to Home
                </Button>
                <Button onClick={() => router.push("/profile")} className="bg-[#2596be] hover:bg-[#1e7a9e] text-white">
                  My Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  // Shared "course info" view: used for guest and for enrollment pending (like self-learning page)
  const showCourseInfoView = !userId || (course.price > 0 && course.enrollment_status && course.enrollment_status !== "approved")
  const isEnrolled = !!userId && course?.enrollment_status === "approved"
  const isPendingApproval = !!userId && course?.price > 0 && course?.enrollment_status === "pending"
  const isPendingEnrollment = !!userId && course.price > 0 && course.enrollment_status && course.enrollment_status !== "approved"

  if (showCourseInfoView) {
    const thumbSrc = course.thumbnail_url ? (getImageSrc(course.thumbnail_url) || course.thumbnail_url) : ""
    const modules = course.modules ?? []
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
    const priceLabel = course.price == null || course.price === 0 ? "Free" : `$${Number(course.price).toFixed(2)}`
    const durationHours = Math.floor(course.estimated_duration_minutes / 60)
    const durationMins = course.estimated_duration_minutes % 60
    const durationText = durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`

    const firstLesson = modules[0]?.lessons?.[0] as { video_url?: string | null; video_duration_seconds?: number } | undefined
    const introVideoUrl = firstLesson?.video_url ? convertToEmbedUrl(firstLesson.video_url) : null
    const previewDuration = firstLesson?.video_duration_seconds != null ? `${Math.floor(firstLesson.video_duration_seconds / 60)}:${String(firstLesson.video_duration_seconds % 60).padStart(2, "0")}` : "2:45"
    const learnItems = [
      { icon: BookOpen, title: "Design Fundamentals", desc: "Master typography, color theory, and Visual Hierarchy." },
      { icon: Zap, title: "Modern UI Tools", desc: "Learn Figma and Pioneer new approaches to advanced level." },
      { icon: HelpCircle, title: "UX Research", desc: "Conduct user interviews and perform usability testing." },
      { icon: FileText, title: "Design Systems", desc: "Build scalable, atomic design systems for enterprise teams." },
    ]

    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#e0f2f4] via-[#f0f9f8] to-[#e8f4f8]">
        <Navbar />
        <AuthModal open={enrollAuthModalOpen} onOpenChange={setEnrollAuthModalOpen} defaultTab="login" defaultRegisterRole="student" returnUrl={`/learning/courses/${courseId}`} />

        {/* Full-width banner — compact on mobile */}
        <div className="w-full bg-gradient-to-r from-[#2596be] via-[#2a8bb5] to-[#3c62b3] text-white py-2 md:py-3 px-3 md:px-4 text-center shadow-lg border-b-2 border-[#2596be]/40">
          <p className="text-xs md:text-sm font-bold tracking-wide">
            ✦ New course — Enroll today
          </p>
        </div>

        {/* Full-width content area – responsive mobile app style (xogta oo idil loo arko) */}
        <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 sm:pt-10 pb-40 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
            {/* Left column – full width feel, left accent on lg */}
            <div className="lg:col-span-7 space-y-8 lg:pl-6 lg:border-l-4 lg:border-[#2596be]/40">
              <Badge className="bg-[#2596be]/20 text-[#0c4a6e] border-2 border-[#2596be]/40 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-md">
                New Course Launch
              </Badge>
              {/* Course title – mobile-first, gradient */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.2] tracking-tight bg-gradient-to-r from-[#2596be] via-[#1a6b8a] to-[#3c62b3] bg-clip-text text-transparent drop-shadow-sm break-words">
                {course.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-gradient-to-r from-[#2596be] to-[#3c62b3] rounded-full shadow-md" />
                <div className="w-12 h-1.5 bg-[#3c62b3]/60 rounded-full" />
              </div>
              {/* About this course – full text visible, no truncation, beautiful reading */}
              <div className="w-full overflow-visible">
                <h2 className="text-lg font-bold text-[#2596be] mb-3 uppercase tracking-wider">About this course</h2>
                <div className="bg-white/90 rounded-2xl border-2 border-[#2596be]/15 shadow-[0_12px_40px_rgba(37,150,190,0.08)] p-6 md:p-8">
                  <p className="text-[#334155] text-base md:text-lg leading-[1.85] tracking-tight whitespace-pre-wrap break-words max-w-none">
                    {(course.description || "The most comprehensive course on modern interface design. Learn industry-standard tools and workflows to build stunning digital products that users love.").trim()}
                  </p>
                </div>
              </div>
              {/* Intro video – professional block */}
              <div className="w-full">
                <p className="text-xs font-bold uppercase tracking-widest text-[#2596be] mb-3 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Course preview · Intro video ({previewDuration})
                </p>
                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border-2 border-[#2596be]/20 shadow-[0_20px_60px_rgba(37,150,190,0.12)] bg-[#0f172a] aspect-video ring-2 ring-[#2596be]/10 select-none" onContextMenu={(e) => e.preventDefault()}>
                  {introVideoUrl ? (
                    <iframe src={introVideoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen frameBorder="0" title="Course preview" />
                  ) : thumbSrc ? (
                    <>
                      <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <button type="button" className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-white transition-all duration-300">
                          <Play className="h-10 w-10 text-[#2596be] ml-1" fill="#2596be" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20">
                      <button type="button" className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                        <Play className="h-10 w-10 text-[#2596be] ml-1" fill="#2596be" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs – professional full-width on small screens */}
              <Tabs value={courseInfoTab} onValueChange={(v) => setCourseInfoTab(v as "overview" | "curriculum" | "instructor" | "reviews")}>
                <TabsList className="bg-white border-2 border-[#2596be]/25 shadow-[0_8px_24px_rgba(37,150,190,0.1)] rounded-2xl p-1.5 w-full sm:w-auto inline-flex gap-1 flex-wrap overflow-x-auto scrollbar-hide md:overflow-visible">
                  {(["overview", "curriculum", "instructor", "reviews"] as const).map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2596be] data-[state=active]:to-[#2a7a9e] data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-md text-[#64748b] capitalize transition-all data-[state=inactive]:hover:bg-[#2596be]/10 data-[state=inactive]:hover:text-[#2596be]"
                    >
                      {tab === "overview" && "Overview"}
                      {tab === "curriculum" && "Curriculum"}
                      {tab === "instructor" && "Instructor"}
                      {tab === "reviews" && "Reviews"}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="overview" className="mt-8">
                  <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] mb-4 md:mb-6">What you&apos;ll learn</h2>
                  <div className="flex sm:grid sm:grid-cols-2 gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0 snap-x snap-mandatory touch-pan-x">
                    {learnItems.map((item, i) => (
                      <div key={i} className="flex-shrink-0 w-[min(85vw,280px)] sm:flex-shrink sm:w-auto snap-center bg-white rounded-2xl border-2 border-[#2596be]/20 p-5 md:p-6 shadow-[0_8px_24px_rgba(37,150,190,0.1)] hover:shadow-[0_16px_40px_rgba(37,150,190,0.18)] hover:border-[#2596be]/35 active:scale-[0.99] transition-all duration-300 touch-target">
                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#2596be]/10 flex items-center justify-center mb-3">
                          <item.icon className="h-5 w-5 text-[#2596be]" />
                        </div>
                        <h3 className="font-bold text-[#0f172a] mb-1 text-sm md:text-base">{item.title}</h3>
                        <p className="text-[#64748b] text-xs md:text-sm leading-relaxed line-clamp-2">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="curriculum" className="mt-8" id="curriculum">
                  <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Course Content</h2>
                  <div className="space-y-3">
                    {modules.map((mod, i) => {
                      const isExpanded = courseContentExpanded.has(mod.id)
                      const modLessons = mod.lessons || []
                      const modDuration = modLessons.reduce((a: number, l: any) => a + (l.video_duration_seconds || 0), 0)
                      return (
                        <div key={mod.id} className="bg-white rounded-2xl border-2 border-[#2596be]/20 overflow-hidden shadow-[0_8px_24px_rgba(37,150,190,0.08)] hover:shadow-[0_16px_40px_rgba(37,150,190,0.15)] hover:border-[#2596be]/35 transition-all duration-300">
                          <button type="button" onClick={() => setCourseContentExpanded((prev) => { const n = new Set(prev); if (n.has(mod.id)) n.delete(mod.id); else n.add(mod.id); return n })} className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#f8fafc] transition-colors">
                            <span className="font-bold text-[#0f172a]">Module {i + 1}: {mod.title}</span>
                            <span className="text-sm text-[#64748b]">{modLessons.length} Lessons · {Math.floor(modDuration / 60)}m</span>
                            <ChevronDown className={`h-5 w-5 text-[#2596be] flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                          {isExpanded && (
                            <div className="border-t border-[#e2e8f0] px-5 pb-5 pt-2">
                              <ul className="space-y-2">
                                {modLessons.map((les: any) => (
                                  <li key={les.id} className="flex items-center gap-3 py-2 text-[#475569]">
                                    <span className="w-2 h-2 rounded-full bg-[#2596be] flex-shrink-0" />
                                    {les.title}
                                    {les.video_duration_seconds != null && <span className="text-xs text-[#64748b] ml-auto">{Math.floor(les.video_duration_seconds / 60)}:{(les.video_duration_seconds % 60).toString().padStart(2, "0")}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
                <TabsContent value="instructor" className="mt-8" id="instructor">
                  <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Meet your instructor</h2>
                  <div className="bg-white rounded-2xl border-2 border-[#2596be]/20 p-6 flex gap-5 items-start shadow-[0_8px_24px_rgba(37,150,190,0.1)] hover:shadow-[0_16px_40px_rgba(37,150,190,0.18)] hover:border-[#2596be]/35 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-[#2596be]/20 flex items-center justify-center flex-shrink-0">
                      <Award className="h-8 w-8 text-[#2596be]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2596be] text-lg">{course.instructor_name || "Instructor"}</h3>
                      <p className="text-[#64748b] text-sm mt-1">Building courses to help you learn. Expert in this field.</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="mt-8">
                  <h2 className="text-xl font-bold text-[#0f172a] mb-4">Student Reviews</h2>
                  <p className="text-[#64748b] mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> 4.9/5 (ratings)
                  </p>
                  <p className="text-[#64748b] text-sm">See full reviews in the section below.</p>
                  <Link href="#reviews" className="inline-block mt-3 text-[#2596be] font-medium hover:underline">View all reviews →</Link>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right column — price card: desktop only; mobile uses sticky bottom bar */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-3xl border-[3px] border-[#2596be] shadow-[0_20px_60px_rgba(37,150,190,0.3)] overflow-hidden hover:shadow-[0_28px_72px_rgba(37,150,190,0.4)] transition-all duration-300">
                  <div className="h-1.5 bg-gradient-to-r from-[#2596be] via-[#3c62b3] to-[#2596be]" />
                  {thumbSrc ? (
                    <div className="relative w-full aspect-video bg-[#0f172a] overflow-hidden">
                      <img src={thumbSrc} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-[#2596be]/50" />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-3xl font-extrabold text-[#0f172a] mb-5">{priceLabel}</p>
                    <h3 className="text-xs font-bold text-[#0f172a] mb-4 uppercase tracking-[0.2em]">Course Includes</h3>
                    <ul className="space-y-3.5 text-sm text-[#475569]">
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2596be]/15 flex items-center justify-center flex-shrink-0 border border-[#2596be]/20">
                          <BookOpen className="h-5 w-5 text-[#2596be]" />
                        </div>
                        <span>{course.modules?.length ?? 0} {course.modules?.length === 1 ? "Module" : "Modules"}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2596be]/15 flex items-center justify-center flex-shrink-0 border border-[#2596be]/20">
                          <List className="h-5 w-5 text-[#2596be]" />
                        </div>
                        <span>{totalLessons} {totalLessons === 1 ? "Lesson" : "Lessons"}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2596be]/15 flex items-center justify-center flex-shrink-0 border border-[#2596be]/20">
                          <Award className="h-5 w-5 text-[#2596be]" />
                        </div>
                        <span>Course Certificate</span>
                      </li>
                    </ul>
                    {isEnrolled ? (
                      <div className="mt-6 space-y-2">
                        <Button variant="outline" className="w-full rounded-xl border-emerald-300 bg-emerald-50 text-emerald-700 cursor-default font-semibold" disabled>
                          <CheckCircle2 className="w-5 h-5 mr-2 inline-block" />
                          Enrolled
                        </Button>
                        <Button onClick={() => router.push("/profile")} variant="outline" className="w-full border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10 rounded-xl">My Profile</Button>
                        <Button onClick={() => router.push("/")} variant="ghost" className="w-full text-[#64748b] rounded-xl">Back to Home</Button>
                      </div>
                    ) : isPendingApproval ? (
                      <div className="mt-6 space-y-2">
                        <Button variant="outline" className="w-full rounded-xl border-[#94a3b8] text-[#64748b] cursor-default" disabled>Pending Approval</Button>
                        <Button onClick={() => router.push("/")} variant="outline" className="w-full border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10 rounded-xl">Back to Home</Button>
                        <Button onClick={() => router.push("/profile")} className="w-full bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl">My Profile</Button>
                        <Button onClick={() => fetchCourse(userId!)} variant="ghost" className="w-full text-[#64748b] rounded-xl">Refresh</Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          if (userId) {
                            router.push(`/learning/payment/${course.id}`)
                          } else {
                            setEnrollAuthModalOpen(true)
                          }
                        }}
                        className="w-full mt-6 bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#1e7a9e] hover:to-[#2d5a9e] text-white rounded-xl font-bold py-6 text-lg shadow-[0_8px_24px_rgba(37,150,190,0.4)] hover:shadow-[0_12px_32px_rgba(37,150,190,0.5)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all border-2 border-[#2596be]/50"
                      >
                        {userId ? "Go to Payment" : "Enroll Now"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: sticky bottom CTA bar (above bottom nav) — amazing app-style */}
        <div className="lg:hidden fixed left-0 right-0 bottom-0 z-40 safe-area-bottom" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)" }}>
          <div className="mx-4 mb-2 rounded-2xl bg-white border-2 border-[#2596be]/30 shadow-[0_-8px_32px_rgba(37,150,190,0.2)] overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Price</p>
                <p className="text-2xl font-black text-[#0f172a]">{priceLabel}</p>
              </div>
              {isEnrolled ? (
                <Button variant="outline" className="rounded-xl border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold shrink-0" disabled>
                  <CheckCircle2 className="w-5 h-5 mr-2 inline-block" />
                  Enrolled
                </Button>
              ) : isPendingApproval ? (
                <Button variant="outline" className="rounded-xl border-[#94a3b8] text-[#64748b] font-semibold shrink-0" disabled>Pending</Button>
              ) : (
                <Button
                  onClick={() => {
                    if (userId) {
                      router.push(`/learning/payment/${course.id}`)
                    } else {
                      setEnrollAuthModalOpen(true)
                    }
                  }}
                  className="shrink-0 rounded-xl font-bold py-6 px-6 bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#1e7a9e] hover:to-[#2d5a9e] text-white shadow-lg border-2 border-[#2596be]/50"
                >
                  {userId ? "Go to Payment" : "Enroll Now"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isPendingApproval && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
            <div className="rounded-2xl border-2 border-[#3c62b3]/40 bg-white shadow-lg p-5 flex items-start gap-4">
              <Clock className="h-6 w-6 text-[#3c62b3] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[#2596be] text-lg mb-1">Enrollment Pending</h3>
                <p className="text-[#64748b] text-sm">{course.enrollment_message || "Your enrollment request is pending approval."}</p>
              </div>
            </div>
          </div>
        )}

        {/* Student Reviews — horizontal scroll on mobile */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16" id="reviews">
          <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] mb-2">Student Reviews</h2>
          <p className="text-[#64748b] mb-6 md:mb-8 flex items-center gap-2 text-sm md:text-base">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> 4.9/5 (ratings)
          </p>
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 snap-x snap-mandatory touch-pan-x">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-[min(85vw,320px)] md:flex-shrink md:w-auto snap-center bg-white rounded-2xl border border-[#e2e8f0] p-5 md:p-6 shadow-sm hover:shadow-lg hover:border-[#2596be]/20 transition-all duration-300 touch-target">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[#475569] text-sm leading-relaxed mb-4">&quot;Great course, clear structure and practical content.&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2596be]/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-[#2596be]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0f172a] text-sm">Student {i}</p>
                    <p className="text-xs text-[#64748b]">Learner</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — compact on mobile */}
        <footer className="border-t border-[#e2e8f0] bg-white/80 backdrop-blur-sm mt-8 md:mt-20 py-6 md:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
            <Link href="/" className="text-lg font-bold text-[#2596be] hover:text-[#1e7a9e] transition-colors">EduMaster</Link>
            <nav className="flex flex-wrap gap-4 sm:gap-8 text-sm font-medium text-[#64748b] justify-center">
              <Link href="/" className="hover:text-[#2596be] transition-colors">Terms</Link>
              <Link href="/" className="hover:text-[#2596be] transition-colors">Privacy</Link>
              <Link href="/" className="hover:text-[#2596be] transition-colors">Support</Link>
              <Link href="/" className="hover:text-[#2596be] transition-colors">Twitter</Link>
            </nav>
            <p className="text-sm text-[#64748b] text-center sm:text-left">© {new Date().getFullYear()} EduMaster Academy. All rights reserved.</p>
          </div>
        </footer>
        <MobileBottomNav />
      </div>
    )
  }

  const getNextLesson = (): Lesson | null => {
    let found = false
    for (const mod of course?.modules ?? []) {
      for (const les of mod?.lessons ?? []) {
        if (found && isLessonUnlocked(course, les.id)) return les
        if (selectedLesson && les.id === selectedLesson.id) found = true
      }
    }
    return null
  }
  const nextLesson = getNextLesson()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col pb-20 lg:pb-0">
      <div className="flex-1 flex overflow-hidden min-h-0">
      {/* Left Sidebar — light + opacity, frosted */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 lg:w-[320px] overflow-y-auto transition-transform duration-300
          bg-[#f0f9ff]/85 backdrop-blur-xl border-r border-[#2596be]/10 shadow-[4px_0_24px_rgba(37,150,190,0.08)]`}
      >
        <div className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-[#2596be]/10 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-[#2596be] flex items-center gap-2 font-medium">Courses</Link>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-[#2596be]">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-[#2596be] uppercase text-xs font-bold tracking-wider mb-4">
            <List className="h-4 w-4" />
            Course Content
          </div>
        </div>
        <div className="p-3 space-y-1 bg-transparent">
          {(course.modules ?? []).map((module) => {
            const modLessons = module.lessons ?? []
            const isCollapsed = collapsedModules.has(module.id)
            const completedLessons = modLessons.filter((l) => getLessonStatus(l.id) === "completed").length
            const totalLessons = modLessons.length
            return (
              <div key={module.id}>
                <button
                  onClick={() => setCollapsedModules((prev) => {
                    const next = new Set(prev)
                    if (next.has(module.id)) next.delete(module.id)
                    else next.add(module.id)
                    return next
                  })}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-gray-600 hover:bg-white/60 hover:text-[#2596be] hover:shadow-sm transition-all duration-200 font-medium"
                >
                  <span className="text-xs font-bold uppercase tracking-wider truncate">Module {module.order_index}: {module.title}</span>
                  <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform text-[#2596be]/80 ${isCollapsed ? "" : "rotate-180"}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0" : "max-h-[2000px]"}`}>
                  {modLessons.map((lesson) => {
                    const status = getLessonStatus(lesson.id)
                    const unlocked = isLessonUnlocked(course, lesson.id)
                    const isSelected = selectedLesson?.id === lesson.id
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => unlocked && handleLessonClick(lesson)}
                        disabled={!unlocked}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                          isSelected
                            ? "bg-[#2596be] text-white shadow-lg shadow-[#2596be]/25"
                            : status === "completed"
                              ? "text-gray-500 hover:bg-white/50 hover:text-[#2596be]"
                              : unlocked
                                ? "text-[#0f172a] hover:bg-white/60 hover:text-[#2596be] hover:shadow-sm"
                                : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                          {status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : isSelected ? (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          ) : unlocked ? (
                            <Circle className="h-4 w-4 text-[#2596be]/60" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </span>
                        <span className="text-sm truncate flex-1">{lesson.title}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{Math.floor((lesson.video_duration_seconds ?? 0) / 60)}m</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main — light background, brand colors */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Bar — dark blue */}
        <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 bg-[#1e3a5f] border-b border-[#2d4a6f] flex-shrink-0 shadow-md">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-300 hover:text-white hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <h1 className="text-sm md:text-base font-bold text-white truncate">{course.title}</h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-gray-300 uppercase font-semibold">Course Progress</span>
              <span className="text-sm font-bold text-white">{course?.progress?.progress_percentage ?? 0}%</span>
            </div>
            <Progress value={course?.progress?.progress_percentage ?? 0} className="w-20 h-2 [&>div]:bg-[#2596be] bg-white/20 hidden sm:block" />
            <Button
              onClick={() => nextLesson && handleLessonClick(nextLesson)}
              disabled={!nextLesson}
              className="bg-[#2596be] hover:bg-[#1e7a9e] text-white font-semibold rounded-xl px-4 py-2 shadow-lg"
            >
              Next Lesson
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/25">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Video + Lesson Content */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {loadingLesson ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-[#2596be] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading lesson...</p>
              </div>
            </div>
          ) : selectedLessonFull ? (
            <div className="h-full flex flex-col">
              <div className="px-4 md:px-6 pt-4">
                <nav className="text-xs text-gray-500 flex items-center gap-2">
                  <Link href="/" className="hover:text-[#2596be] font-medium">Courses</Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-gray-600 truncate">{course.title}</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-[#2596be] font-semibold truncate">Current Lesson</span>
                </nav>
              </div>
              <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-[#0f172a]">
                  {selectedLessonFull.title}
                </h2>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <span>Focus Mode</span>
                  <span className="text-xs text-gray-500">Hide distractions</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={focusMode}
                    onClick={() => setFocusMode(!focusMode)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${focusMode ? "bg-[#2596be]" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${focusMode ? "left-5" : "left-0.5"}`} />
                  </button>
                </label>
              </div>
              <div className="w-full" style={{ aspectRatio: "16/9" }}>
                <LessonVideoPlayer
                  videoUrl={selectedLessonFull.video_url}
                  embedUrlForNonYoutube={convertToEmbedUrl(selectedLessonFull.video_url)}
                  onMarkWatched={handleMarkComplete}
                  containerClassName="rounded-b-none rounded-t-xl"
                />
              </div>

              <div className="px-4 md:px-6 py-4 flex-1 bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(37,150,190,0.06)] -mt-1 relative z-10">
                <Tabs value={lessonDetailTab} onValueChange={(v) => setLessonDetailTab(v as "overview" | "resources" | "notes" | "discussions")}>
                  <TabsList className="bg-gray-100/80 border-b border-[#2596be]/15 rounded-t-xl p-0 h-auto gap-0 w-full justify-start flex-wrap">
                    <Button
                      onClick={handleMarkComplete}
                      disabled={!userId || getLessonStatus(selectedLessonFull?.id ?? 0) === "completed"}
                      className="rounded-t-lg border-b-2 border-transparent px-4 py-3 uppercase text-xs font-semibold tracking-wider mr-1 h-auto bg-[#2596be] hover:bg-[#1e7a9e] text-white disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {selectedLessonFull && getLessonStatus(selectedLessonFull.id) === "completed" ? (
                        <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5 inline" /> Completed</>
                      ) : (
                        "Complete"
                      )}
                    </Button>
                    {(["overview", "resources", "notes", "discussions"] as const).map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-[#2596be] data-[state=active]:text-[#2596be] data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-500 data-[state=active]:font-semibold px-4 py-3 uppercase text-xs font-medium tracking-wider"
                      >
                        {tab === "overview" && "Overview"}
                        {tab === "resources" && "Resources"}
                        {tab === "notes" && "Notes"}
                        {tab === "discussions" && "Discussions"}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedLessonFull.description || "In this lesson we cover the key concepts. Watch the video and complete any quizzes or tasks to earn progress."}
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                          <li>Key concepts from this lesson</li>
                          <li>Practice with quizzes and tasks</li>
                        </ul>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-[#2596be]" /> — Watching now</span>
                          <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-[#2596be]" /> Instructor rating</span>
                        </div>
                        <Button variant="outline" className="border-[#2596be] text-[#2596be] hover:bg-[#2596be]/10 rounded-xl">
                          Support Center
                        </Button>
                      </div>
                      <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border-2 border-[#2596be]/15 shadow-[0_8px_24px_rgba(37,150,190,0.08)] p-5">
                          <Badge className="bg-[#2596be] text-white text-xs mb-3">Top educator</Badge>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-[#2596be]/10 flex items-center justify-center border border-[#2596be]/20">
                              <Award className="h-6 w-6 text-[#2596be]" />
                            </div>
                            <div>
                              <p className="font-bold text-[#0f172a]">{course.instructor_name || "Instructor"}</p>
                              <p className="text-xs text-gray-500">Course instructor</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            Building courses to help you learn. Expert in this field.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-[#2596be] text-[#2596be] hover:bg-[#2596be]/10 rounded-lg flex-1">View Profile</Button>
                            <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg p-2"><MessageCircle className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#2596be] mb-3">Lesson Attachments</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-[#2596be]/10 hover:border-[#2596be]/30 shadow-sm transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center border border-red-100"><FileText className="h-5 w-5 text-red-500" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0f172a] truncate">Lesson_Notes.pdf</p>
                            <p className="text-xs text-gray-500">—</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#2596be]"><Download className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-[#2596be]/10 hover:border-[#2596be]/30 shadow-sm transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-[#2596be]/10 flex items-center justify-center border border-[#2596be]/20"><FolderOpen className="h-5 w-5 text-[#2596be]" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0f172a] truncate">Resources pack</p>
                            <p className="text-xs text-gray-500">—</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#2596be]"><Download className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                    {nextLesson && (
                      <div className="mt-8">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#2596be] mb-3">Next Up</h3>
                        <button
                          onClick={() => handleLessonClick(nextLesson)}
                          className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-[#2596be]/15 hover:border-[#2596be]/30 shadow-sm hover:shadow-md transition-all text-left"
                        >
                          <div className="w-24 h-14 rounded-lg bg-[#2596be]/10 flex items-center justify-center flex-shrink-0 border border-[#2596be]/20">
                            <Play className="h-6 w-6 text-[#2596be]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#0f172a] truncate">{nextLesson.title}</p>
                            <p className="text-xs text-gray-500">Lecture • {Math.floor(nextLesson.video_duration_seconds / 60)} min</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-[#2596be] flex-shrink-0" />
                        </button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="resources" className="mt-6">
                    <div className="bg-white rounded-2xl border-2 border-[#2596be]/10 p-8 text-center shadow-sm">
                      <FileText className="h-12 w-12 text-[#2596be]/40 mx-auto mb-3" />
                      <p className="text-gray-600">Resources for this lesson will appear here.</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="notes" className="mt-6">
                    <div className="bg-white rounded-2xl border-2 border-[#2596be]/15 p-6 shadow-sm">
                      <Label className="text-[#0f172a] font-semibold">Your notes</Label>
                      <Textarea placeholder="Add notes for this lesson..." className="mt-2 bg-[#f8fafc] border-[#2596be]/20 text-[#0f172a] placeholder:text-gray-400 min-h-[120px] rounded-xl focus:border-[#2596be]" />
                    </div>
                  </TabsContent>
                  <TabsContent value="discussions" className="mt-6">
                    <div className="bg-white rounded-2xl border-2 border-[#2596be]/10 p-8 text-center shadow-sm">
                      <MessageCircle className="h-12 w-12 text-[#2596be]/40 mx-auto mb-3" />
                      <p className="text-gray-600">Discussions for this lesson will appear here.</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 pt-6 border-t border-[#2596be]/15">
                  <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as "video" | "quiz" | "task")}>
                    <TabsList className="bg-gray-100 border border-[#2596be]/15 p-1 rounded-xl">
                      <TabsTrigger value="video" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white rounded-lg px-4 text-gray-600 font-medium">Video</TabsTrigger>
                      <TabsTrigger value="quiz" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white rounded-lg px-4 text-gray-600 font-medium">Quiz {selectedLessonFull.quizzes?.length ? `(${selectedLessonFull.quizzes.length})` : ""}</TabsTrigger>
                      {selectedLessonFull.tasks && selectedLessonFull.tasks.length > 0 && (
                        <TabsTrigger value="task" className="data-[state=active]:bg-[#2596be] data-[state=active]:text-white rounded-lg px-4 text-gray-600 font-medium">Task ({selectedLessonFull.tasks.length})</TabsTrigger>
                      )}
                    </TabsList>
                    <TabsContent value="video" className="mt-4">
                      <div className="flex flex-wrap gap-4">
                        <Button onClick={handleVideoWatched} disabled={!!selectedLessonFull.progress?.video_watched} className="bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl shadow-md">
                          {selectedLessonFull.progress?.video_watched ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Watched</> : "Mark as Watched"}
                        </Button>
                        {nextLesson && (
                          <Button variant="outline" onClick={() => handleLessonClick(nextLesson)} className="border-[#2596be] text-[#2596be] hover:bg-[#2596be]/10 rounded-xl">
                            Next Lesson <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="quiz" className="mt-4">
                      {selectedLessonFull.quizzes && Array.isArray(selectedLessonFull.quizzes) && selectedLessonFull.quizzes.length > 0 ? (
                        <div className="space-y-4">
                          {selectedLessonFull.quizzes.map((quiz) => (
                            <div key={quiz.id} className="bg-white border-2 border-[#2596be]/15 rounded-2xl p-6 shadow-sm">
                              <h3 className="text-lg font-bold text-[#2596be] mb-4">Question: <span className="text-[#0f172a]">{quiz.question}</span></h3>
                              {quiz.question_type === "multiple_choice" && quiz.options && quiz.options.length > 0 && (
                                <div className="space-y-2">
                                  {quiz.options.map((option, optIdx) => {
                                    const isSelected = quizAnswers[quiz.id] === option
                                    return (
                                      <label
                                        key={optIdx}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                                          isSelected ? "border-[#2596be] bg-[#2596be]/10" : "border-gray-200 bg-gray-50 hover:border-[#2596be]/40"
                                        }`}
                                      >
                                        <input type="radio" name={`quiz-${quiz.id}`} value={option} checked={isSelected} onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [quiz.id]: e.target.value }))} className="text-[#2596be] accent-[#2596be]" />
                                        <span className="text-[#0f172a] flex-1 font-medium">{option}</span>
                                        {isSelected && <CheckCircle2 className="h-5 w-5 text-[#2596be]" />}
                                      </label>
                                    )
                                  })}
                                </div>
                              )}
                              {quiz.question_type === "true_false" && (
                                <div className="grid grid-cols-2 gap-3">
                                  {(["True", "False"] as const).map((val) => (
                                    <button key={val} onClick={() => setQuizAnswers((prev) => ({ ...prev, [quiz.id]: val }))} className={`p-4 rounded-xl border-2 font-medium transition-colors ${quizAnswers[quiz.id] === val ? "border-[#2596be] bg-[#2596be] text-white" : "border-gray-200 bg-gray-50 text-[#0f172a] hover:border-[#2596be]/50"}`}>{val}</button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          <Button onClick={() => { const allAnswered = (selectedLessonFull.quizzes || []).every((q) => quizAnswers[q.id]); if (allAnswered) toast.success("Quiz submitted!"); else toast.error("Answer all questions first."); }} className="w-full bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl h-12 font-semibold shadow-md">Submit Quiz</Button>
                        </div>
                      ) : (
                        <div className="bg-white border-2 border-[#2596be]/10 rounded-2xl p-8 text-center shadow-sm">
                          <HelpCircle className="h-12 w-12 text-[#2596be]/40 mx-auto mb-3" />
                          <p className="text-gray-600">No quiz for this lesson.</p>
                        </div>
                      )}
                    </TabsContent>

                    {selectedLessonFull.tasks && selectedLessonFull.tasks.length > 0 && (
                      <TabsContent value="task" className="mt-4">
                        <div className="space-y-4">
                          {selectedLessonFull.tasks.map((task) => (
                            <div key={task.id} className="bg-white border-2 border-[#2596be]/15 rounded-2xl p-6 shadow-sm">
                              <h3 className="text-lg font-bold text-[#2596be] mb-2">{task.title}</h3>
                              <p className="text-gray-600 mb-4">{task.instructions}</p>
                              {task.task_type === "coding_practice" ? (
                                <>
                                  <Label className="text-[#0f172a] font-semibold">Write Your Code</Label>
                                  <div className="mt-2 rounded-xl overflow-hidden border-2 border-[#2596be]/15">
                                    <CodeEditor value={task.starter_code || ""} onChange={() => {}} language={task.programming_language || "javascript"} height="300px" theme="vs-dark" />
                                  </div>
                                  <Button onClick={() => toast.info("Code execution will be implemented")} className="mt-4 bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl">Run Code</Button>
                                </>
                              ) : (
                                <>
                                  <Label className="text-[#0f172a] font-semibold">Your Response</Label>
                                  <Textarea placeholder="Share your thoughts..." className="mt-2 bg-[#f8fafc] border-[#2596be]/20 text-[#0f172a] placeholder:text-gray-400 min-h-[120px] rounded-xl focus:border-[#2596be]" />
                                </>
                              )}
                              <Button onClick={() => toast.info("Task submission will be implemented")} className="mt-4 w-full bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl shadow-md">Submit Task</Button>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              </div>
            </div>
          ) : selectedLesson ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <Loader2 className="h-16 w-16 text-[#2596be] animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#0f172a] mb-2">Loading Lesson...</h3>
                <p className="text-gray-600">Please wait while we load the lesson content.</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md bg-white rounded-2xl border-2 border-[#2596be]/15 shadow-lg p-8">
                <PlayCircle className="h-16 w-16 text-[#2596be] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#0f172a] mb-2">Select a Lesson</h3>
                <p className="text-gray-600 mb-6">
                  Choose a lesson from the sidebar to start learning. Complete lessons in order to unlock new content.
                </p>
                <Button
                  onClick={() => { const firstUnlocked = findFirstUnlockedLesson(course); if (firstUnlocked) handleLessonClick(firstUnlocked); }}
                  className="bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl shadow-md"
                >
                  Start First Lesson
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <MobileBottomNav />
    </div>
  )
}
