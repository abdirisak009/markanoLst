"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  Code,
  Lock,
  CheckCircle,
  Play,
  ChevronDown,
  Send,
  Loader2,
  Target,
  Sparkles,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Layers,
  Maximize2,
  Minimize2,
  Flame,
  Trophy,
  Zap,
  Star,
  Clock,
  Search,
  Bell,
  Settings,
  User,
  Home,
  Menu,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Module {
  id: number
  name: string
  description: string
  order_index: number
  is_active: boolean
  track_id: number
  lessons_count?: number
  lessons?: Lesson[]
}

interface Level {
  id: number
  name: string
  description: string
  order_index: number
  is_active: boolean
  module_id?: number
  lessons: Lesson[]
  modules?: Module[] // Modules within this level
}

interface Lesson {
  id: number
  title: string
  lesson_type: string
  video_url: string
  video_duration: number
  content: string
  order_index: number
  is_required: boolean
  level_id?: number
  module_id?: number
  progress?: {
    status: string
    progress_percentage: number
    last_position: number
    watch_time: number
  }
}

interface Track {
  id: number
  name: string
  description: string
  color: string
}

interface LevelRequest {
  id: number
  current_level_id: number
  next_level_id: number
  status: string
  rejection_reason?: string
}

const getVideoEmbedInfo = (url: string): { type: "direct" | "youtube" | "vimeo" | "cloudflare" | "unknown"; embedUrl: string } => {
  if (!url) return { type: "unknown", embedUrl: "" }
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (youtubeMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1&autoplay=1&controls=1&showinfo=0&iv_load_policy=3&fs=1&cc_load_policy=0&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`,
    }
  }
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/)
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` }
  }
  // Cloudflare Stream URLs
  if (url.includes("cloudflarestream.com") || url.includes("videodelivery.net") || url.includes("/iframe")) {
    // If it's already an iframe URL, use it directly
    if (url.includes("/iframe")) {
      return { type: "cloudflare", embedUrl: url }
    }
    // Extract video ID from Cloudflare Stream URL
    const streamMatch = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)/)
    if (streamMatch) {
      // Extract customer subdomain
      const customerMatch = url.match(/customer-([a-zA-Z0-9]+)\.cloudflarestream\.com/)
      if (customerMatch) {
        return {
          type: "cloudflare",
          embedUrl: `https://customer-${customerMatch[1]}.cloudflarestream.com/${streamMatch[1]}/iframe`,
        }
      }
      return {
        type: "cloudflare",
        embedUrl: `https://iframe.videodelivery.net/${streamMatch[1]}`,
      }
    }
    // If it's just a video ID (alphanumeric string)
    if (/^[a-zA-Z0-9]+$/.test(url.trim())) {
      return {
        type: "cloudflare",
        embedUrl: `https://iframe.videodelivery.net/${url.trim()}`,
      }
    }
  }
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return { type: "direct", embedUrl: url }
  }
  return { type: "direct", embedUrl: url }
}

export default function TrackLearningPage() {
  const params = useParams()
  const trackId = params.trackId as string
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [track, setTrack] = useState<Track | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<number[]>([])
  const [expandedLevels, setExpandedLevels] = useState<number[]>([])
  const [studentId, setStudentId] = useState<number | null>(null)
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null)
  const [currentLevelOrder, setCurrentLevelOrder] = useState<number>(1)
  const [levelRequests, setLevelRequests] = useState<LevelRequest[]>([])
  const [requestingLevel, setRequestingLevel] = useState<number | null>(null)
  const [requestDialog, setRequestDialog] = useState<{ open: boolean; levelId: number | null }>({
    open: false,
    levelId: null,
  })

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theaterMode, setTheaterMode] = useState(false)

  useEffect(() => {
    const storedStudent = localStorage.getItem("gold_student")
    if (!storedStudent) {
      router.push("/gold")
      return
    }
    const student = JSON.parse(storedStudent)
    setStudentId(student.id)
    fetchData(student.id)
  }, [trackId, router])

  const fetchData = async (studId: number) => {
    try {
      const tracksRes = await fetch("/api/gold/tracks")
      const tracks = await tracksRes.json()
      const currentTrack = tracks.find((t: Track) => t.id === Number.parseInt(trackId))
      setTrack(currentTrack)

      // Fetch modules for this track
      const modulesRes = await fetch(`/api/gold/modules?trackId=${trackId}`)
      const modulesData = await modulesRes.json()

      // Fetch levels for this track (legacy support)
      const levelsRes = await fetch(`/api/gold/levels?trackId=${trackId}`)
      const levelsData = await levelsRes.json()

      // Fetch all lessons for this track
      const lessonsRes = await fetch(`/api/gold/lessons?trackId=${trackId}`)
      const lessonsData = await lessonsRes.json()

      const progressRes = await fetch(`/api/gold/lesson-progress?studentId=${studId}`)
      const progressData = await progressRes.json()

      const enrollRes = await fetch(`/api/gold/enrollments?studentId=${studId}`)
      const enrollData = await enrollRes.json()
      const enrollment = enrollData.find((e: { track_id: number }) => e.track_id === Number.parseInt(trackId))
      if (enrollment?.current_level_id) {
        setCurrentLevelId(enrollment.current_level_id)
        setCurrentLevelOrder(enrollment.current_level_order || 1)
      }

      const levelReqRes = await fetch(`/api/gold/level-requests?studentId=${studId}`)
      const levelReqData = await levelReqRes.json()
      setLevelRequests(Array.isArray(levelReqData) ? levelReqData : [])

      const safeProgressData = Array.isArray(progressData) ? progressData : []
      const safeLessonsData = Array.isArray(lessonsData) ? lessonsData : []
      const safeModulesData = Array.isArray(modulesData) ? modulesData : []
      const safeLevelsData = Array.isArray(levelsData) ? levelsData : []

      // Process levels with their modules and lessons
      // Hierarchy: Track → Level → Module → Lesson
      const levelsWithModules = safeLevelsData
        .filter((level: Level) => !level.module_id) // Only levels directly under track
        .map((level: Level) => {
          // Get modules for this level
          const levelModules = safeModulesData
            .filter((module: Module) => module.level_id === level.id)
            .map((module: Module) => {
              // Get lessons for this module
              const moduleLessons = safeLessonsData
                .filter((l: Lesson) => l.module_id === module.id)
                .map((lesson: Lesson) => {
                  const progress = safeProgressData.find((p: { lesson_id: number }) => p.lesson_id === lesson.id)
                  return { ...lesson, progress }
                })
                .sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
              return { ...module, lessons: moduleLessons }
            })
            .sort((a: Module, b: Module) => a.order_index - b.order_index)

        // Get lessons directly under level (without module)
        const levelLessons = safeLessonsData
          .filter((l: Lesson) => l.level_id === level.id && !l.module_id)
          .map((lesson: Lesson) => {
            const progress = safeProgressData.find((p: { lesson_id: number }) => p.lesson_id === lesson.id)
            return { ...lesson, progress }
          })
          .sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)

        return { ...level, modules: levelModules, lessons: levelLessons }
      })

      // Also handle modules that don't belong to any level (directly under track)
      const standaloneModules = safeModulesData
        .filter((module: Module) => {
          // Check if module has lessons that don't belong to any level
          const moduleLessons = safeLessonsData.filter((l: Lesson) => l.module_id === module.id && !l.level_id)
          return moduleLessons.length > 0
        })
        .map((module: Module) => {
          const moduleLessons = safeLessonsData
            .filter((l: Lesson) => l.module_id === module.id && !l.level_id)
            .map((lesson: Lesson) => {
              const progress = safeProgressData.find((p: { lesson_id: number }) => p.lesson_id === lesson.id)
              return { ...lesson, progress }
            })
            .sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
          return { ...module, lessons: moduleLessons }
        })
        .sort((a: Module, b: Module) => a.order_index - b.order_index)

      setModules(standaloneModules)
      setLevels(levelsWithModules)

      // Auto-expand first level
      if (levelsWithModules.length > 0) {
        setExpandedLevels([levelsWithModules[0].id])
        // Auto-expand first module in first level if exists
        if (levelsWithModules[0].modules && levelsWithModules[0].modules.length > 0) {
          setExpandedModules([levelsWithModules[0].modules[0].id])
        }
      } else if (standaloneModules.length > 0) {
        setExpandedModules([standaloneModules[0].id])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const toggleLevel = (levelId: number) => {
    setExpandedLevels((prev) => (prev.includes(levelId) ? prev.filter((id) => id !== levelId) : [...prev, levelId]))
  }

  const isLevelUnlocked = (level: Level) => {
    if (!currentLevelId) return level.order_index === 1
    return level.id === currentLevelId
  }

  const isLevelCompleted = (level: Level) => {
    return level.order_index < currentLevelOrder
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video
      case "article":
        return FileText
      case "code":
        return Code
      default:
        return BookOpen
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return ""
    const mins = Math.floor(seconds / 60)
    return `${mins} daq`
  }

  const getModuleProgress = (module: Module) => {
    if (!module.lessons || module.lessons.length === 0) return 0
    const completed = module.lessons.filter((l) => l.progress?.status === "completed").length
    return Math.round((completed / module.lessons.length) * 100)
  }

  const getLevelProgress = (level: Level) => {
    // Count lessons from modules within level
    const moduleLessonsCount = (level.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
    const moduleCompletedCount = (level.modules || []).reduce(
      (acc, m) => acc + (m.lessons?.filter((ls) => ls.progress?.status === "completed").length || 0),
      0,
    )
    // Count lessons directly under level
    const levelLessonsCount = level.lessons?.length || 0
    const levelCompletedCount = level.lessons?.filter((l) => l.progress?.status === "completed").length || 0
    
    const totalLessons = moduleLessonsCount + levelLessonsCount
    const totalCompleted = moduleCompletedCount + levelCompletedCount
    
    if (totalLessons === 0) return 0
    return Math.round((totalCompleted / totalLessons) * 100)
  }

  const getRequiredLessonsProgress = (level: Level) => {
    if (!level.lessons) return { completed: 0, total: 0 }
    const requiredLessons = level.lessons.filter((l) => l.is_required)
    const completed = requiredLessons.filter((l) => l.progress?.status === "completed").length
    return { completed, total: requiredLessons.length }
  }

  const canRequestNextLevel = (level: Level) => {
    if (level.id !== currentLevelId) return false
    const { completed, total } = getRequiredLessonsProgress(level)
    return total === 0 || completed >= total
  }

  const hasPendingRequest = (levelId: number) => {
    return levelRequests.some((r) => r.current_level_id === levelId && r.status === "pending")
  }

  const handleRequestNextLevel = async (levelId: number) => {
    if (!studentId) return
    setRequestingLevel(levelId)
    try {
      const res = await fetch("/api/gold/level-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, current_level_id: levelId }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to request")
      }
      toast.success("Codsigaaga level-ka xiga waa la diray!")
      setRequestDialog({ open: false, levelId: null })
      fetchData(studentId)
    } catch (error: any) {
      toast.error(error.message || "Khalad ayaa dhacay")
    } finally {
      setRequestingLevel(null)
    }
  }

  const handleSelectLesson = (lesson: Lesson, level: Level | null) => {
    // If lesson is from a level, check if level is unlocked
    if (level) {
    const unlocked = isLevelUnlocked(level) || isLevelCompleted(level)
    if (!unlocked) {
      toast.error("Level-kan wali laguma ogolaan")
      return
    }
    }
    // If lesson is from a module, it's always accessible (modules don't have unlock requirements)
    setSelectedLesson(lesson)
    setCurrentTime(lesson.progress?.last_position || 0)
    setDuration(lesson.video_duration || 0)
    // On mobile, collapse sidebar when lesson selected
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    setCurrentTime(current)
    setDuration(total)

    const progressPercent = Math.round((current / total) * 100)
    if (Math.floor(current) % 10 === 0 && studentId && selectedLesson) {
      updateProgress(progressPercent, current, progressPercent >= 90 ? "completed" : "in_progress")
    }
  }

  const handleVideoEnd = () => {
    if (selectedLesson && studentId) {
      updateProgress(100, duration, "completed")
      toast.success("Casharku wuu dhammaatay! Hambalyo!")
    }
  }

  const updateProgress = async (percent: number, position: number, status: string) => {
    if (!studentId || !selectedLesson) return
    try {
      await fetch("/api/gold/lesson-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          lesson_id: selectedLesson.id,
          progress_percentage: percent,
          last_position: Math.floor(position),
          status,
        }),
      })
      // Update local state for modules
      setModules((prev) =>
        prev.map((module) => ({
          ...module,
          lessons: (module.lessons || []).map((l) =>
            l.id === selectedLesson.id
              ? {
                  ...l,
                  progress: {
                    ...l.progress,
                    status,
                    progress_percentage: percent,
                    last_position: position,
                    watch_time: 0,
                  },
                }
              : l,
          ),
        })),
      )
      // Update local state for levels
      setLevels((prev) =>
        prev.map((level) => ({
          ...level,
          lessons: (level.lessons || []).map((l) =>
            l.id === selectedLesson.id
              ? {
                  ...l,
                  progress: {
                    ...l.progress,
                    status,
                    progress_percentage: percent,
                    last_position: position,
                    watch_time: 0,
                  },
                }
              : l,
          ),
        })),
      )
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const markAsComplete = async () => {
    if (!selectedLesson) return
    await updateProgress(100, duration, "completed")
    setSelectedLesson((prev) =>
      prev
        ? {
            ...prev,
            progress: {
              ...prev.progress,
              status: "completed",
              progress_percentage: 100,
              last_position: 0,
              watch_time: 0,
            },
          }
        : null,
    )
    toast.success("Casharku waa la calaamadeeyay inuu dhammaatay!")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getAdjacentLessons = () => {
    if (!selectedLesson) return { prev: null, next: null }
    const allLessons: Lesson[] = []
    // Add lessons from levels (including modules within levels)
    levels.forEach((level) => {
      if (isLevelUnlocked(level) || isLevelCompleted(level)) {
        // Add lessons from modules within level
        (level.modules || []).forEach((module) => {
          allLessons.push(...(module.lessons || []))
        })
        // Add lessons directly under level
        allLessons.push(...(level.lessons || []))
      }
    })
    // Add lessons from standalone modules
    modules.forEach((module) => {
      allLessons.push(...(module.lessons || []))
    })
    // Sort by order_index
    allLessons.sort((a, b) => a.order_index - b.order_index)
    const idx = allLessons.findIndex((l) => l.id === selectedLesson.id)
    return {
      prev: idx > 0 ? allLessons[idx - 1] : null,
      next: idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
    }
  }

  // Calculate total lessons from levels (including modules within levels) and standalone modules
  const levelLessonsCount = levels.reduce((acc, l) => {
    const levelModuleLessons = (l.modules || []).reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0)
    return acc + (l.lessons?.length || 0) + levelModuleLessons
  }, 0)
  const moduleLessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
  const totalLessons = levelLessonsCount + moduleLessonsCount
  
  const levelCompletedCount = levels.reduce((acc, l) => {
    const levelModuleCompleted = (l.modules || []).reduce(
      (mAcc, m) => mAcc + (m.lessons?.filter((ls) => ls.progress?.status === "completed").length || 0),
      0,
    )
    return acc + (l.lessons?.filter((ls) => ls.progress?.status === "completed").length || 0) + levelModuleCompleted
  }, 0)
  const moduleCompletedCount = modules.reduce(
    (acc, m) => acc + (m.lessons?.filter((ls) => ls.progress?.status === "completed").length || 0),
    0,
  )
  const completedLessons = levelCompletedCount + moduleCompletedCount
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-300" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl animate-ping"
            style={{ animationDuration: "3s" }}
          />
        </div>
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 blur-xl opacity-50 animate-pulse mx-auto" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
              <GraduationCap className="h-12 w-12 text-white animate-bounce" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/30 rounded-full blur-sm" />
          </div>
          <div className="mt-8 space-y-2">
            <p className="text-xl font-bold text-white">Casharyada la soo rarayo</p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const videoInfo = selectedLesson?.video_url ? getVideoEmbedInfo(selectedLesson.video_url) : null
  const { prev: prevLesson, next: nextLesson } = getAdjacentLessons()
  const selectedLessonCompleted = selectedLesson?.progress?.status === "completed"
  const progressPercent =
    duration > 0 ? Math.round((currentTime / duration) * 100) : selectedLesson?.progress?.progress_percentage || 0

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/3 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-1 h-1 bg-amber-400 rounded-full animate-ping" />
        <div className="absolute top-40 right-40 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping delay-300" />
        <div className="absolute bottom-40 left-1/3 w-1 h-1 bg-amber-300 rounded-full animate-ping delay-700" />
      </div>

      {/* Modern Top Navigation Bar */}
      <header
        className={`border-b border-white/10 bg-gradient-to-r from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] backdrop-blur-2xl sticky top-0 z-50 transition-all duration-500 ${theaterMode ? "opacity-0 hover:opacity-100" : ""}`}
      >
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Navigation */}
            <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white hidden sm:block">Markano</span>
              </div>
              <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                  className="text-slate-400 hover:text-white hover:bg-white/10"
                onClick={() => router.push("/gold/dashboard")}
              >
                  <Home className="h-4 w-4 mr-2" />
                  Bogga Hore
              </Button>
                <Button
                  variant="ghost"
                  className="text-white bg-white/10 hover:bg-white/15"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Koorsadayda
                </Button>
              </nav>
            </div>

            {/* Right: Search, Icons, Progress */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden lg:flex items-center relative">
                <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Raadi koorsada..."
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 w-64"
                />
              </div>

              {/* Progress Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-bold text-white">{overallProgress}%</span>
                <span className="text-xs text-slate-400">{completedLessons}/{totalLessons}</span>
            </div>

              {/* Icons */}
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/10"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/10"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30"
                title="Profile"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Theater Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheaterMode(!theaterMode)}
                className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                title={theaterMode ? "Exit Theater Mode" : "Theater Mode"}
              >
                {theaterMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
                    </div>
                  </div>
                </div>

        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white h-auto p-0"
              onClick={() => router.push("/gold/dashboard")}
            >
              Bogga Hore
            </Button>
            <span>/</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white h-auto p-0"
            >
              Koorsadayda
            </Button>
            <span>/</span>
            <span className="text-white font-semibold">{track?.name}</span>
              </div>
          {selectedLesson && (
            <h2 className="text-lg font-bold text-white mt-2">{selectedLesson.title}</h2>
          )}
        </div>
      </header>

      <div className="flex flex-1 relative">
        <aside
          className={`${sidebarCollapsed ? "w-0 lg:w-0" : theaterMode ? "w-0 lg:w-0" : "w-full lg:w-96"} flex-shrink-0 border-r border-white/5 bg-gradient-to-b from-[#0f1419]/90 to-[#0a0a0f]/90 backdrop-blur-xl overflow-hidden transition-all duration-500 absolute lg:relative inset-y-0 left-0 z-40`}
        >
          <div className="h-full overflow-y-auto custom-scrollbar">
            {/* Modern Level/XP Section */}
            <div className="p-5 border-b border-white/5">
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-2xl border border-emerald-500/20 p-5">
                  <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-300">Heerkaaga</h3>
                      <p className="text-lg font-bold text-white">Level {currentLevelOrder || 1}</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-3 py-1 font-bold">
                    Ardayga Firfircoon
                    </Badge>
                  </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-300 font-medium">XP-ga koorsada</span>
                    <span className="text-white font-bold">{completedLessons * 50} / {totalLessons * 50} XP</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {totalLessons * 50 - completedLessons * 50} XP ka maqan Level {currentLevelOrder + 1 || 2}
                  </p>
                      </div>
                    </div>
                  </div>

            {/* Course Overview Cards */}
            <div className="px-5 pb-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <BookOpen className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{totalLessons}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Cashar</div>
                    </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-400">{completedLessons}</div>
                  <div className="text-[10px] text-slate-400 uppercase">La dhammeeyay</div>
                    </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <Clock className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">
                    {Math.floor((totalLessons * 30) / 60)}h {totalLessons * 30 % 60}m
                    </div>
                  <div className="text-[10px] text-slate-400 uppercase">Waqtiga</div>
                  </div>
                </div>

              {/* Overall Progress */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-300 font-semibold">Guud ahaan</span>
                  <span className="text-white font-bold">{overallProgress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {/* Levels Section - Show levels first, then modules within levels, then lessons */}
              {levels.map((level, levelIdx) => {
                const unlocked = isLevelUnlocked(level)
                const completed = isLevelCompleted(level)
                const progress = getLevelProgress(level)
                const isExpanded = expandedLevels.includes(level.id)
                const { completed: reqCompleted, total: reqTotal } = getRequiredLessonsProgress(level)

                return (
                  <div
                    key={level.id}
                    className={`rounded-lg overflow-hidden transition-all ${
                      unlocked
                        ? "bg-white/5 border border-white/10"
                        : completed
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-white/5 border border-white/10 opacity-50"
                    }`}
                  >
                    {/* Level Header - Minimal */}
                    <button
                      onClick={() => (unlocked || completed) && toggleLevel(level.id)}
                      className="w-full p-2.5 flex items-center gap-2.5 text-left"
                      disabled={!unlocked && !completed}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          unlocked
                            ? "bg-amber-500 text-white"
                            : completed
                              ? "bg-green-500 text-white"
                              : "bg-white/10 text-slate-500"
                        }`}
                      >
                        {completed ? <CheckCircle className="h-4 w-4" /> : levelIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-white truncate">{level.name}</span>
                          {unlocked && (
                            <Badge className="bg-amber-500 text-white text-[8px] px-1 py-0">Hadda</Badge>
                          )}
                          {completed && (
                            <Badge className="bg-green-500 text-white text-[8px] px-1 py-0">Dhamay</Badge>
                          )}
                          {!unlocked && !completed && <Lock className="h-3 w-3 text-slate-500" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${completed ? "bg-green-500" : "bg-amber-500"}`}
                              style={{ width: `${progress}%` }}
                            />
                            </div>
                          <span className="text-[10px] text-slate-400">{progress}%</span>
                          </div>
                      </div>
                      {(unlocked || completed) && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    {/* Modules within Level - Always visible when level is expanded */}
                    {isExpanded && (unlocked || completed) && (
                      <div className="px-2 pb-2 space-y-1 border-t border-white/5">
                        {(level.modules || []).map((module, moduleIdx) => {
                          const moduleProgress = getModuleProgress(module)
                          const moduleCompleted = moduleProgress === 100

                          return (
                            <div
                              key={module.id}
                              className={`rounded-md overflow-hidden transition-all ${
                                moduleCompleted
                                  ? "bg-green-500/5 border border-green-500/10"
                                  : "bg-blue-500/5 border border-blue-500/10"
                              }`}
                            >
                              {/* Module Header - No collapse/expand, just display */}
                              <div className="w-full p-2 flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                    moduleCompleted
                                      ? "bg-green-500 text-white"
                                      : "bg-blue-500 text-white"
                                  }`}
                                >
                                  {moduleCompleted ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <Layers className="h-3 w-3" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[11px] font-medium text-white truncate">{module.name}</span>
                                    {moduleCompleted && (
                                      <Badge className="bg-green-500 text-white text-[7px] px-1 py-0">Dhamay</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${moduleCompleted ? "bg-green-500" : "bg-blue-500"}`}
                                        style={{ width: `${moduleProgress}%` }}
                                      />
                                    </div>
                                    <span className="text-[9px] text-slate-400">{moduleProgress}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Lessons within Module - Always visible */}
                              <div className="px-2 pb-2 space-y-0.5 border-t border-white/5">
                                {module.lessons?.map((lesson, lessonIdx) => {
                                  const LessonIcon = getLessonIcon(lesson.lesson_type)
                                  const lessonCompleted = lesson.progress?.status === "completed"
                                  const isSelected = selectedLesson?.id === lesson.id

                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => handleSelectLesson(lesson, level)}
                                      className={`w-full p-1.5 rounded-md flex items-center gap-2 text-left transition-all ${
                                        isSelected
                                          ? "bg-blue-500/15 border border-blue-500/30"
                                          : lessonCompleted
                                            ? "bg-green-500/5 border border-green-500/10"
                                            : "bg-white/5 border border-transparent hover:border-white/10"
                                      }`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                                          lessonCompleted
                                            ? "bg-green-500 text-white"
                                            : isSelected
                                              ? "bg-blue-500 text-white"
                                              : "bg-white/10 text-slate-400"
                                        }`}
                                      >
                                        {lessonCompleted ? (
                                          <CheckCircle className="h-2.5 w-2.5" />
                                        ) : (
                                          <LessonIcon className="h-2.5 w-2.5" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div
                                          className={`text-[10px] font-medium truncate ${
                                            isSelected ? "text-blue-300" : lessonCompleted ? "text-green-300" : "text-white"
                                          }`}
                                        >
                                          {lessonIdx + 1}. {lesson.title}
                                        </div>
                                        {lesson.video_duration > 0 && (
                                          <span className="text-[8px] text-slate-500 mt-0.5 block">
                                            {formatDuration(lesson.video_duration)}
                                          </span>
                                        )}
                                      </div>
                                      <Play className={`h-3 w-3 flex-shrink-0 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}

                        {/* Lessons directly under level (without module) */}
                        {level.lessons && level.lessons.length > 0 && (
                          <div className="space-y-0.5">
                            {level.lessons.map((lesson, lessonIdx) => {
                              const LessonIcon = getLessonIcon(lesson.lesson_type)
                              const lessonCompleted = lesson.progress?.status === "completed"
                              const isSelected = selectedLesson?.id === lesson.id

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleSelectLesson(lesson, level)}
                                  className={`w-full p-1.5 rounded-md flex items-center gap-2 text-left transition-all ${
                                    isSelected
                                      ? "bg-amber-500/15 border border-amber-500/30"
                                      : lessonCompleted
                                        ? "bg-green-500/5 border border-green-500/10"
                                        : "bg-white/5 border border-transparent hover:border-white/10"
                                  }`}
                                >
                                  <div
                                    className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                                      lessonCompleted
                                        ? "bg-green-500 text-white"
                                        : isSelected
                                          ? "bg-amber-500 text-white"
                                          : "bg-white/10 text-slate-400"
                                    }`}
                                  >
                                    {lessonCompleted ? (
                                      <CheckCircle className="h-2.5 w-2.5" />
                                    ) : (
                                      <LessonIcon className="h-2.5 w-2.5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`text-[10px] font-medium truncate ${
                                        isSelected ? "text-amber-300" : lessonCompleted ? "text-green-300" : "text-white"
                                      }`}
                                    >
                                      {lessonIdx + 1}. {lesson.title}
                                    </div>
                                    {lesson.video_duration > 0 && (
                                      <span className="text-[8px] text-slate-500 mt-0.5 block">
                                        {formatDuration(lesson.video_duration)}
                                      </span>
                                    )}
                                  </div>
                                  <Play className={`h-3 w-3 flex-shrink-0 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                                </button>
                              )
                            })}
                          </div>
                        )}
                              </div>
                    )}
                  </div>
                )
              })}

              {/* Standalone Modules (not under any level) - Minimal */}
              {modules.map((module, moduleIdx) => {
                const progress = getModuleProgress(module)
                const isExpanded = expandedModules.includes(module.id)
                const moduleCompleted = progress === 100

                return (
                  <div
                    key={module.id}
                    className={`rounded-lg overflow-hidden transition-all ${
                      moduleCompleted
                        ? "bg-green-500/5 border border-green-500/10"
                        : "bg-blue-500/5 border border-blue-500/10"
                    }`}
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-2.5 flex items-center gap-2.5 text-left"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          moduleCompleted ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                        }`}
                      >
                        {moduleCompleted ? <CheckCircle className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-white truncate">{module.name}</span>
                          {moduleCompleted && (
                            <Badge className="bg-green-500 text-white text-[8px] px-1 py-0">Dhamay</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${moduleCompleted ? "bg-green-500" : "bg-blue-500"}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">{progress}%</span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-2 pb-2 space-y-0.5 border-t border-white/5">
                        {module.lessons?.map((lesson, lessonIdx) => {
                          const LessonIcon = getLessonIcon(lesson.lesson_type)
                          const lessonCompleted = lesson.progress?.status === "completed"
                          const isSelected = selectedLesson?.id === lesson.id

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleSelectLesson(lesson, null)}
                              className={`w-full p-1.5 rounded-md flex items-center gap-2 text-left ${
                                isSelected
                                  ? "bg-blue-500/15 border border-blue-500/30"
                                  : lessonCompleted
                                    ? "bg-green-500/5 border border-green-500/10"
                                    : "bg-white/5 border border-transparent hover:border-white/10"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                                  lessonCompleted
                                    ? "bg-green-500 text-white"
                                    : isSelected
                                      ? "bg-blue-500 text-white"
                                      : "bg-white/10 text-slate-400"
                                }`}
                              >
                                {lessonCompleted ? (
                                  <CheckCircle className="h-2.5 w-2.5" />
                                ) : (
                                  <LessonIcon className="h-2.5 w-2.5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-[10px] font-medium truncate ${
                                    isSelected ? "text-blue-300" : lessonCompleted ? "text-green-300" : "text-white"
                                  }`}
                                >
                                  {lessonIdx + 1}. {lesson.title}
                                </div>
                                {lesson.video_duration > 0 && (
                                  <span className="text-[8px] text-slate-500 mt-0.5 block">
                                    {formatDuration(lesson.video_duration)}
                                  </span>
                                )}
                              </div>
                              <Play className={`h-3 w-3 flex-shrink-0 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Continue Lesson Button */}
            {selectedLesson && (
              <div className="p-5 border-t border-white/5 sticky bottom-0 bg-gradient-to-t from-[#0a0a0f] to-transparent">
                <Button
                  onClick={() => {
                    if (selectedLesson) {
                      const currentLevel = levels.find((l) => l.lessons.some((les) => les.id === selectedLesson.id))
                      if (currentLevel) handleSelectLesson(selectedLesson, currentLevel)
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 py-6 text-base"
                >
                  <Play className="h-5 w-5 mr-2 fill-white" />
                  Sii wad casharka
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`lg:hidden fixed bottom-6 left-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 ${theaterMode ? "hidden" : ""}`}
        >
          {sidebarCollapsed ? <Layers className="h-6 w-6" /> : <X className="h-6 w-6" />}
        </button>

        <main
          className={`flex-1 flex flex-col min-h-0 transition-all duration-500 ${theaterMode ? "absolute inset-0 z-30" : ""}`}
        >
          {selectedLesson ? (
            <div className="flex-1 flex flex-col">
              {/* Video Area - Full Fit Frame */}
              <div className={`flex-1 bg-black relative ${theaterMode ? "h-screen" : ""}`}>
                {selectedLesson.lesson_type === "video" && videoInfo ? (
                  videoInfo.type === "youtube" || videoInfo.type === "vimeo" || videoInfo.type === "cloudflare" ? (
                    <div 
                      className="absolute inset-0 w-full h-full select-none video-container"
                      onContextMenu={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        return false
                      }}
                      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    >
                    <iframe
                      src={videoInfo.embedUrl}
                        className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      title={selectedLesson.title}
                        style={{ 
                          border: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          pointerEvents: 'auto',
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          return false
                        }}
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      {/* Invisible overlay to prevent right-click and inspection - allows video interaction */}
                      <div 
                        className="absolute inset-0 z-30"
                        style={{ 
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          touchAction: 'manipulation',
                          background: 'transparent',
                          pointerEvents: 'none'
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          return false
                        }}
                        onDragStart={(e) => e.preventDefault()}
                        onSelectStart={(e) => e.preventDefault()}
                      />
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      src={videoInfo.embedUrl}
                      className="absolute inset-0 w-full h-full object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleVideoEnd}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          setDuration(videoRef.current.duration)
                          if (selectedLesson.progress?.last_position) {
                            videoRef.current.currentTime = selectedLesson.progress.last_position
                          }
                        }
                      }}
                      controls
                      autoPlay
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f1419] to-[#0a0a0f]">
                    <div className="text-center max-w-3xl p-8">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                        <FileText className="h-10 w-10 text-amber-400" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-6">{selectedLesson.title}</h2>
                      <div
                        className="prose prose-invert prose-lg text-slate-300 text-left max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedLesson.content || "Wali ma jiro content" }}
                      />
                    </div>
                  </div>
                )}

                {/* Theater mode toggle overlay */}
                {theaterMode && (
                  <button
                    onClick={() => setTheaterMode(false)}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 flex items-center justify-center transition-all duration-300 opacity-0 hover:opacity-100"
                  >
                    <Minimize2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div
                className={`bg-gradient-to-r from-[#0f1419] via-[#12171d] to-[#0f1419] border-t-2 border-white/10 p-6 transition-all duration-500 shadow-2xl ${theaterMode ? "absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl opacity-0 hover:opacity-100" : ""}`}
              >
                <div className="max-w-5xl mx-auto">
                  {/* Enhanced Lesson Title & Status */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl ${
                          selectedLessonCompleted
                            ? "bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 shadow-green-500/40 hover:shadow-green-500/60"
                            : "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/40 hover:shadow-amber-500/60 animate-pulse"
                        } hover:scale-110`}
                      >
                        {selectedLessonCompleted ? (
                          <CheckCircle className="h-8 w-8 text-white" />
                        ) : (
                          <Play className="h-8 w-8 text-white fill-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-white mb-1">{selectedLesson.title}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge className="bg-slate-800/50 text-slate-300 border border-slate-700/50 px-3 py-1">
                          <span className="capitalize">{selectedLesson.lesson_type}</span>
                          </Badge>
                          {selectedLesson.video_duration > 0 && (
                            <>
                              <span className="text-slate-500">•</span>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-medium">{formatDuration(selectedLesson.video_duration)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedLessonCompleted ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-5 py-2 text-sm font-bold shadow-xl shadow-green-500/30">
                          <CheckCircle className="h-4 w-4 mr-2" /> Dhamay
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-5 py-2 text-sm font-bold shadow-xl shadow-amber-500/30 animate-pulse">
                          <Play className="h-4 w-4 mr-2 fill-white" /> Socda
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-300 font-semibold">{formatTime(currentTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30">
                        <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
                        <span className="text-white font-extrabold text-base">{progressPercent}%</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 font-semibold">
                        {formatTime(duration || selectedLesson.video_duration || 0)}
                      </span>
                    </div>
                    </div>
                    <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500 relative"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-xl shadow-white/40 border-2 border-amber-500" />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Navigation & Actions */}
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      disabled={!prevLesson}
                      onClick={() =>
                        prevLesson && handleSelectLesson(prevLesson, levels.find((l) => l.id === prevLesson.level_id)!)
                      }
                      className="border-2 border-slate-700/50 text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 hover:text-white transition-all duration-300 disabled:opacity-30 font-semibold px-5 py-6"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" /> Hore
                    </Button>

                    <div className="flex items-center gap-3">
                      {/* Theater Mode Toggle */}
                      <Button
                        variant="outline"
                        onClick={() => setTheaterMode(!theaterMode)}
                        className="border-2 border-slate-700/50 text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 hover:text-white transition-all duration-300 font-semibold px-5 py-6"
                      >
                        {theaterMode ? <Minimize2 className="h-5 w-5 mr-2" /> : <Maximize2 className="h-5 w-5 mr-2" />}
                        {theaterMode ? "Ka Bax" : "Full Screen"}
                      </Button>

                      {(videoInfo?.type === "youtube" ||
                        videoInfo?.type === "vimeo" ||
                        videoInfo?.type === "cloudflare" ||
                        selectedLesson.lesson_type !== "video") &&
                        !selectedLessonCompleted && (
                          <Button
                            onClick={markAsComplete}
                            className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white font-bold shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 px-5 py-6"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" /> Calaamadee Dhamay
                          </Button>
                        )}
                    </div>

                    <Button
                      variant="outline"
                      disabled={!nextLesson}
                      onClick={() =>
                        nextLesson && handleSelectLesson(nextLesson, levels.find((l) => l.id === nextLesson.level_id)!)
                      }
                      className="border-2 border-slate-700/50 text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 hover:text-white transition-all duration-300 disabled:opacity-30 font-semibold px-5 py-6"
                    >
                      Xiga <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0f1419]/50 via-[#0a0a0f] to-[#0f1419]/50 relative overflow-hidden">
              {/* Background effects */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-500" />
              </div>

              <div className="text-center p-8 relative z-10">
                <div className="relative mb-8">
                  <div className="absolute inset-0 w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 blur-2xl opacity-30 animate-pulse" />
                  <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto border-2 border-amber-500/30 backdrop-blur-sm">
                    <Play className="h-14 w-14 text-amber-400" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white mb-3">Dooro Cashar</h2>
                <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                  Ka dooro cashar liiska bidixda ah si aad u bilowdo daawashada. Casharyada aad dhamaysatid waxay ku
                  calaamadmi doonaan <span className="text-green-400 font-semibold">cagaar</span>.
                </p>

                {/* Helpful tips */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Socda</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Dhamay</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Lock className="h-3 w-3 text-slate-600" />
                    <span>Xidhan</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Request Next Level Dialog */}
      <Dialog open={requestDialog.open} onOpenChange={(open) => setRequestDialog({ open, levelId: null })}>
        <DialogContent className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Award className="h-6 w-6 text-amber-400" />
              Codso Level-ka Xiga
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Waxaad dhamaysatay casharyada waajibka ah. Hadda waxaad codsan kartaa level-ka xiga.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              variant="ghost"
              onClick={() => setRequestDialog({ open: false, levelId: null })}
              className="hover:bg-white/10"
            >
              Ka Noqo
            </Button>
            <Button
              onClick={() => requestDialog.levelId && handleRequestNextLevel(requestDialog.levelId)}
              disabled={requestingLevel !== null}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
            >
              {requestingLevel ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Codso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(251, 191, 36, 0.4), rgba(249, 115, 22, 0.4));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(251, 191, 36, 0.6), rgba(249, 115, 22, 0.6));
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
