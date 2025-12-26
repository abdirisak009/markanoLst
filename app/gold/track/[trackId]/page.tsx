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

interface Level {
  id: number
  name: string
  description: string
  order_index: number
  is_active: boolean
  lessons: Lesson[]
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
  level_id: number
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

const getVideoEmbedInfo = (url: string): { type: "direct" | "youtube" | "vimeo" | "unknown"; embedUrl: string } => {
  if (!url) return { type: "unknown", embedUrl: "" }
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (youtubeMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1&autoplay=1`,
    }
  }
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/)
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` }
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
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
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

      const levelsRes = await fetch(`/api/gold/levels?trackId=${trackId}`)
      const levelsData = await levelsRes.json()

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
      const safeLevelsData = Array.isArray(levelsData) ? levelsData : []

      const levelsWithLessons = safeLevelsData.map((level: Level) => {
        const levelLessons = safeLessonsData
          .filter((l: Lesson) => l.level_id === level.id)
          .map((lesson: Lesson) => {
            const progress = safeProgressData.find((p: { lesson_id: number }) => p.lesson_id === lesson.id)
            return { ...lesson, progress }
          })
          .sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
        return { ...level, lessons: levelLessons }
      })

      setLevels(levelsWithLessons)

      if (enrollment?.current_level_id) {
        setExpandedLevels([enrollment.current_level_id])
      } else if (levelsWithLessons.length > 0) {
        setExpandedLevels([levelsWithLessons[0].id])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
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

  const getLevelProgress = (level: Level) => {
    if (!level.lessons || level.lessons.length === 0) return 0
    const completed = level.lessons.filter((l) => l.progress?.status === "completed").length
    return Math.round((completed / level.lessons.length) * 100)
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

  const handleSelectLesson = (lesson: Lesson, level: Level) => {
    const unlocked = isLevelUnlocked(level) || isLevelCompleted(level)
    if (!unlocked) {
      toast.error("Level-kan wali laguma ogolaan")
      return
    }
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
      // Update local state
      setLevels((prev) =>
        prev.map((level) => ({
          ...level,
          lessons: level.lessons.map((l) =>
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
    levels.forEach((level) => {
      if (isLevelUnlocked(level) || isLevelCompleted(level)) {
        allLessons.push(...level.lessons)
      }
    })
    const idx = allLessons.findIndex((l) => l.id === selectedLesson.id)
    return {
      prev: idx > 0 ? allLessons[idx - 1] : null,
      next: idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
    }
  }

  const totalLessons = levels.reduce((acc, l) => acc + (l.lessons?.length || 0), 0)
  const completedLessons = levels.reduce(
    (acc, l) => acc + (l.lessons?.filter((ls) => ls.progress?.status === "completed").length || 0),
    0,
  )
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

      <header
        className={`border-b border-white/10 bg-[#0a0a0f]/70 backdrop-blur-2xl sticky top-0 z-50 transition-all duration-500 ${theaterMode ? "opacity-0 hover:opacity-100" : ""}`}
      >
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
                onClick={() => router.push("/gold/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden group"
                style={{
                  background: `linear-gradient(135deg, ${track?.color || "#F59E0B"}50, ${track?.color || "#F59E0B"}80)`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <BookOpen
                  className="h-6 w-6 relative z-10 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: "white" }}
                />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  {track?.name}
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                </h1>
                <p className="text-xs text-slate-400">
                  {levels.length} Levels • {totalLessons} Cashars
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theater Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheaterMode(!theaterMode)}
                className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-300"
                title={theaterMode ? "Exit Theater Mode" : "Theater Mode"}
              >
                {theaterMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <div className="w-28 h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-700 relative"
                      style={{ width: `${overallProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>
                <span className="text-sm font-bold text-white">{overallProgress}%</span>
                <div className="w-px h-4 bg-white/20" />
                <span className="text-xs text-slate-400">
                  {completedLessons}/{totalLessons}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        <aside
          className={`${sidebarCollapsed ? "w-0 lg:w-0" : theaterMode ? "w-0 lg:w-0" : "w-full lg:w-96"} flex-shrink-0 border-r border-white/5 bg-gradient-to-b from-[#0f1419]/90 to-[#0a0a0f]/90 backdrop-blur-xl overflow-hidden transition-all duration-500 absolute lg:relative inset-y-0 left-0 z-40`}
        >
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-5 border-b border-white/5">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 p-5">
                {/* Background glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-400" />
                      Horumarkaaga
                    </h3>
                    <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                      {completedLessons}/{totalLessons}
                    </Badge>
                  </div>

                  {/* Circular Progress */}
                  <div className="flex items-center justify-center mb-5">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="url(#progressGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${overallProgress * 2.64} 264`}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="50%" stopColor="#F97316" />
                            <stop offset="100%" stopColor="#EF4444" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{overallProgress}%</span>
                        <span className="text-xs text-slate-400">Dhamaystir</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10 hover:border-amber-500/30 transition-all duration-300 hover:scale-105">
                      <Zap className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                      <div className="text-xl font-black text-white">{overallProgress}%</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Guud</div>
                    </div>
                    <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-3 text-center border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
                      <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-1" />
                      <div className="text-xl font-black text-green-400">{completedLessons}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Dhamay</div>
                    </div>
                    <div className="bg-amber-500/10 backdrop-blur-sm rounded-xl p-3 text-center border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:scale-105">
                      <Target className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                      <div className="text-xl font-black text-amber-400">{totalLessons - completedLessons}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Haray</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {levels.map((level, levelIdx) => {
                const unlocked = isLevelUnlocked(level)
                const completed = isLevelCompleted(level)
                const progress = getLevelProgress(level)
                const isExpanded = expandedLevels.includes(level.id)
                const { completed: reqCompleted, total: reqTotal } = getRequiredLessonsProgress(level)

                return (
                  <div
                    key={level.id}
                    className={`rounded-2xl overflow-hidden transition-all duration-500 ${
                      unlocked
                        ? "bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border-2 border-amber-500/30 shadow-lg shadow-amber-500/10"
                        : completed
                          ? "bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20"
                          : "bg-white/5 border border-white/10 opacity-60"
                    } hover:shadow-xl transition-shadow`}
                  >
                    {/* Level Header */}
                    <button
                      onClick={() => (unlocked || completed) && toggleLevel(level.id)}
                      className="w-full p-4 flex items-center gap-4 text-left group"
                      disabled={!unlocked && !completed}
                    >
                      <div
                        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 group-hover:scale-110 ${
                          unlocked
                            ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30"
                            : completed
                              ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20"
                              : "bg-white/10 text-slate-500"
                        }`}
                      >
                        {completed ? <CheckCircle className="h-7 w-7" /> : levelIdx + 1}
                        {unlocked && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
                            <Star className="h-2.5 w-2.5 text-amber-900" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-bold text-white truncate">{level.name}</span>
                          {unlocked && (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2 py-0.5 font-bold shadow-lg animate-pulse">
                              Hadda
                            </Badge>
                          )}
                          {completed && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] px-2 py-0.5 font-bold">
                              Dhamay
                            </Badge>
                          )}
                          {!unlocked && !completed && <Lock className="h-4 w-4 text-slate-500" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-700 relative ${
                                completed
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-slate-400">{progress}%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{level.lessons?.length || 0} cashar</p>
                      </div>
                      {(unlocked || completed) && (
                        <div
                          className={`text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <ChevronDown className="h-5 w-5" />
                        </div>
                      )}
                    </button>

                    {/* Lessons List */}
                    {isExpanded && (unlocked || completed) && (
                      <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        {level.lessons.map((lesson, lessonIdx) => {
                          const LessonIcon = getLessonIcon(lesson.lesson_type)
                          const lessonCompleted = lesson.progress?.status === "completed"
                          const isSelected = selectedLesson?.id === lesson.id
                          const lessonProgress = lesson.progress?.progress_percentage || 0

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleSelectLesson(lesson, level)}
                              className={`w-full p-4 rounded-xl flex items-center gap-4 text-left transition-all duration-300 group relative overflow-hidden ${
                                isSelected
                                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/40 shadow-lg shadow-amber-500/10"
                                  : lessonCompleted
                                    ? "bg-green-500/10 hover:bg-green-500/15 border border-green-500/20"
                                    : "bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20"
                              }`}
                            >
                              {/* Glow effect on hover */}
                              <div
                                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isSelected ? "bg-amber-500/5" : "bg-white/5"}`}
                              />

                              {/* Lesson Icon with status */}
                              <div
                                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                                  lessonCompleted
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20"
                                    : isSelected
                                      ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"
                                      : "bg-white/10 group-hover:bg-white/20"
                                }`}
                              >
                                {lessonCompleted ? (
                                  <CheckCircle className="h-6 w-6 text-white" />
                                ) : (
                                  <LessonIcon className={`h-6 w-6 ${isSelected ? "text-white" : "text-slate-400"}`} />
                                )}

                                {/* Playing indicator */}
                                {isSelected && !lessonCompleted && (
                                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center">
                                      <Play className="h-2 w-2 text-white fill-white" />
                                    </span>
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 relative z-10">
                                <div
                                  className={`text-sm font-semibold truncate mb-1 ${
                                    isSelected ? "text-amber-400" : lessonCompleted ? "text-green-400" : "text-white"
                                  }`}
                                >
                                  {lessonIdx + 1}. {lesson.title}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-2 py-0 ${
                                      lesson.lesson_type === "video"
                                        ? "border-blue-500/30 text-blue-400"
                                        : "border-slate-500/30 text-slate-400"
                                    }`}
                                  >
                                    {lesson.lesson_type}
                                  </Badge>
                                  {lesson.video_duration > 0 && (
                                    <span className="text-[10px] text-slate-500">
                                      {formatDuration(lesson.video_duration)}
                                    </span>
                                  )}
                                  {lesson.is_required && (
                                    <Badge className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0 border border-amber-500/30">
                                      Waajib
                                    </Badge>
                                  )}
                                </div>
                                {/* Mini progress bar */}
                                {!lessonCompleted && lessonProgress > 0 && (
                                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                                      style={{ width: `${lessonProgress}%` }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Play button */}
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                  isSelected
                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                                    : "bg-white/5 text-slate-400 group-hover:bg-amber-500/20 group-hover:text-amber-400"
                                }`}
                              >
                                <Play className={`h-5 w-5 ${isSelected ? "fill-white" : ""}`} />
                              </div>
                            </button>
                          )
                        })}

                        {/* Request Next Level Button */}
                        {unlocked && !completed && (
                          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-slate-400">Casharyada waajibka</span>
                              <Badge
                                className={`${reqCompleted >= reqTotal ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}
                              >
                                {reqCompleted}/{reqTotal}
                              </Badge>
                            </div>
                            {hasPendingRequest(level.id) ? (
                              <div className="flex items-center justify-center gap-2 text-amber-400 text-sm py-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Codsiga waa la sugayaa...
                              </div>
                            ) : canRequestNextLevel(level) ? (
                              <Button
                                onClick={() => setRequestDialog({ open: true, levelId: level.id })}
                                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.02]"
                              >
                                <Send className="h-4 w-4 mr-2" /> Codso Level-ka Xiga
                              </Button>
                            ) : (
                              <div className="text-xs text-slate-500 flex items-center justify-center gap-2 py-2">
                                <Lock className="h-4 w-4" /> Dhamee casharyada waajibka ah
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
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
              {/* Video Area */}
              <div className={`flex-1 bg-black relative ${theaterMode ? "h-screen" : ""}`}>
                {/* Video glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent pointer-events-none z-10" />

                {selectedLesson.lesson_type === "video" && videoInfo ? (
                  videoInfo.type === "youtube" || videoInfo.type === "vimeo" ? (
                    <iframe
                      src={videoInfo.embedUrl}
                      className="w-full h-full absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      title={selectedLesson.title}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={videoInfo.embedUrl}
                      className="w-full h-full absolute inset-0 object-contain"
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
                className={`bg-gradient-to-r from-[#0f1419] via-[#12171d] to-[#0f1419] border-t border-white/10 p-5 transition-all duration-500 ${theaterMode ? "absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl opacity-0 hover:opacity-100" : ""}`}
              >
                <div className="max-w-5xl mx-auto">
                  {/* Lesson Title & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          selectedLessonCompleted
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30"
                            : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30"
                        }`}
                      >
                        {selectedLessonCompleted ? (
                          <CheckCircle className="h-7 w-7 text-white" />
                        ) : (
                          <Play className="h-7 w-7 text-white fill-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{selectedLesson.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span className="capitalize">{selectedLesson.lesson_type}</span>
                          {selectedLesson.video_duration > 0 && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span>{formatDuration(selectedLesson.video_duration)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedLessonCompleted ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1.5 text-sm font-bold shadow-lg">
                          <CheckCircle className="h-4 w-4 mr-2" /> Dhamay
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1.5 text-sm font-bold shadow-lg animate-pulse">
                          <Play className="h-4 w-4 mr-2 fill-white" /> Socda
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400 font-medium">{formatTime(currentTime)}</span>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <span className="text-white font-bold">{progressPercent}%</span>
                      </div>
                      <span className="text-slate-400 font-medium">
                        {formatTime(duration || selectedLesson.video_duration || 0)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-300 relative"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-white/30" />
                      </div>
                    </div>
                  </div>

                  {/* Navigation & Actions */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      disabled={!prevLesson}
                      onClick={() =>
                        prevLesson && handleSelectLesson(prevLesson, levels.find((l) => l.id === prevLesson.level_id)!)
                      }
                      className="text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" /> Hore
                    </Button>

                    <div className="flex items-center gap-3">
                      {/* Theater Mode Toggle */}
                      <Button
                        variant="outline"
                        onClick={() => setTheaterMode(!theaterMode)}
                        className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
                      >
                        {theaterMode ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                        {theaterMode ? "Ka Bax" : "Full Screen"}
                      </Button>

                      {(videoInfo?.type === "youtube" ||
                        videoInfo?.type === "vimeo" ||
                        selectedLesson.lesson_type !== "video") &&
                        !selectedLessonCompleted && (
                          <Button
                            onClick={markAsComplete}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" /> Calaamadee Dhamay
                          </Button>
                        )}
                    </div>

                    <Button
                      variant="ghost"
                      disabled={!nextLesson}
                      onClick={() =>
                        nextLesson && handleSelectLesson(nextLesson, levels.find((l) => l.id === nextLesson.level_id)!)
                      }
                      className="text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-30"
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
