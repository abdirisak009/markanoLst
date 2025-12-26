"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Award,
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  Code,
  Lock,
  CheckCircle,
  Play,
  ChevronDown,
  ChevronRight,
  Clock,
  Send,
  Loader2,
  AlertCircle,
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
  video_duration: number
  order_index: number
  is_required: boolean
  level_id: number
  progress?: {
    status: string
    progress_percentage: number
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

export default function TrackLessonsPage() {
  const params = useParams()
  const trackId = params.trackId as string
  const router = useRouter()
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
      // Fetch track info
      const tracksRes = await fetch("/api/gold/tracks")
      const tracks = await tracksRes.json()
      const currentTrack = tracks.find((t: Track) => t.id === Number.parseInt(trackId))
      setTrack(currentTrack)

      // Fetch levels with lessons
      const levelsRes = await fetch(`/api/gold/levels?trackId=${trackId}`)
      const levelsData = await levelsRes.json()

      // Fetch all lessons for this track's levels
      const lessonsRes = await fetch(`/api/gold/lessons?trackId=${trackId}`)
      const lessonsData = await lessonsRes.json()

      // Fetch student progress
      const progressRes = await fetch(`/api/gold/lesson-progress?studentId=${studId}`)
      const progressData = await progressRes.json()

      // Fetch enrollment to get current level
      const enrollRes = await fetch(`/api/gold/enrollments?studentId=${studId}`)
      const enrollData = await enrollRes.json()
      const enrollment = enrollData.find((e: { track_id: number }) => e.track_id === Number.parseInt(trackId))
      if (enrollment?.current_level_id) {
        setCurrentLevelId(enrollment.current_level_id)
        setCurrentLevelOrder(enrollment.current_level_order || 1)
      }

      // Fetch level requests
      const levelReqRes = await fetch(`/api/gold/level-requests?studentId=${studId}`)
      const levelReqData = await levelReqRes.json()
      setLevelRequests(Array.isArray(levelReqData) ? levelReqData : [])

      // Combine data
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

      // Auto-expand current level
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
    return `${mins} daqiiqo`
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Award className="h-12 w-12 text-amber-500 mx-auto animate-pulse" />
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: (track?.color || "#3B82F6") + "20", color: track?.color || "#3B82F6" }}
            >
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{track?.name}</h1>
              <p className="text-sm text-slate-400">{levels.length} Levels</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium">Sida System-ku u Shaqeeyo:</p>
            <ul className="list-disc list-inside mt-1 text-blue-400/80 space-y-1">
              <li>Waxaad daawan kartaa oo keliya level-ka hadda ku jirto</li>
              <li>Marka aad dhameyso casharyada waajibka ah, waxaad codsan kartaa level-ka xiga</li>
              <li>Admin-ku wuxuu ansixin doonaa codsigaaga</li>
            </ul>
          </div>
        </div>

        {levels.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Track-kan wali ma laha casharro</p>
            </CardContent>
          </Card>
        ) : (
          levels.map((level, index) => {
            const unlocked = isLevelUnlocked(level)
            const completed = isLevelCompleted(level)
            const expanded = expandedLevels.includes(level.id)
            const progress = getLevelProgress(level)
            const { completed: reqCompleted, total: reqTotal } = getRequiredLessonsProgress(level)
            const canRequest = canRequestNextLevel(level)
            const pendingReq = hasPendingRequest(level.id)

            return (
              <Card
                key={level.id}
                className={`overflow-hidden transition-all ${
                  unlocked
                    ? "bg-slate-800/50 border-amber-500/30 ring-1 ring-amber-500/20"
                    : completed
                      ? "bg-green-900/20 border-green-500/30"
                      : "bg-slate-900/50 border-slate-800 opacity-60"
                }`}
              >
                <CardHeader
                  className={`cursor-pointer ${unlocked || completed ? "hover:bg-slate-700/30" : ""}`}
                  onClick={() => (unlocked || completed) && toggleLevel(level.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                          unlocked
                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                            : completed
                              ? "bg-green-500/20 text-green-400"
                              : "bg-slate-700 text-slate-500"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : unlocked ? (
                          index + 1
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          {level.name}
                          {unlocked && <Badge className="bg-amber-500/20 text-amber-400 text-xs">Hadda</Badge>}
                          {completed && <Badge className="bg-green-500/20 text-green-400 text-xs">La Dhammeeyay</Badge>}
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          {level.lessons?.length || 0} cashar
                          {unlocked && ` • ${reqCompleted}/${reqTotal} waajib la dhammeeyay`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {(unlocked || completed) && (
                        <div className="w-24">
                          <Progress value={progress} className="h-2 bg-slate-700" />
                        </div>
                      )}
                      {(unlocked || completed) &&
                        (expanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        ))}
                    </div>
                  </div>
                </CardHeader>

                {expanded && (unlocked || completed) && (
                  <CardContent className="pt-0 border-t border-slate-700/50">
                    <div className="space-y-2 mt-4">
                      {level.lessons?.map((lesson, lessonIndex) => {
                        const LessonIcon = getLessonIcon(lesson.lesson_type)
                        const isCompleted = lesson.progress?.status === "completed"
                        const isInProgress =
                          lesson.progress?.status === "in_progress" && (lesson.progress?.progress_percentage || 0) > 0

                        return (
                          <Link key={lesson.id} href={unlocked ? `/gold/lesson/${lesson.id}` : "#"}>
                            <div
                              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                                isCompleted
                                  ? "bg-green-500/10 border border-green-500/20 hover:bg-green-500/20"
                                  : isInProgress
                                    ? "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
                                    : unlocked
                                      ? "bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50"
                                      : "bg-slate-800/30 border border-slate-700/50"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    isCompleted
                                      ? "bg-green-500/20 text-green-400"
                                      : isInProgress
                                        ? "bg-amber-500/20 text-amber-400"
                                        : "bg-slate-700 text-slate-400"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : (
                                    <LessonIcon className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-white">
                                    {lessonIndex + 1}. {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <Badge variant="outline" className="text-xs">
                                      {lesson.lesson_type === "video"
                                        ? "Video"
                                        : lesson.lesson_type === "article"
                                          ? "Maqaal"
                                          : lesson.lesson_type}
                                    </Badge>
                                    {lesson.video_duration > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(lesson.video_duration)}
                                      </span>
                                    )}
                                    {lesson.is_required && (
                                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">Waajib</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {isInProgress && (
                                  <span className="text-sm text-amber-400">
                                    {lesson.progress?.progress_percentage}%
                                  </span>
                                )}
                                {unlocked && (
                                  <Play className={`h-5 w-5 ${isCompleted ? "text-green-400" : "text-slate-400"}`} />
                                )}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    {/* Request Next Level Button */}
                    {unlocked && (
                      <div className="mt-6 pt-4 border-t border-slate-700">
                        {pendingReq ? (
                          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
                            <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                            <p className="text-amber-400 font-medium">Codsigaaga Level-ka xiga waa la sugayaa</p>
                            <p className="text-sm text-amber-400/70 mt-1">Admin-ku wuxuu eegayaa codsigaaga</p>
                          </div>
                        ) : canRequest ? (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => setRequestDialog({ open: true, levelId: level.id })}
                          >
                            <Send className="h-4 w-4 mr-2" /> Codso Level-ka Xiga
                          </Button>
                        ) : (
                          <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                            <Lock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-slate-400">
                              Dhamee casharyada waajibka ah ({reqCompleted}/{reqTotal})
                            </p>
                            <p className="text-sm text-slate-500 mt-1">Ka dib waxaad codsan kartaa level-ka xiga</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </main>

      {/* Request Level Dialog */}
      <Dialog
        open={requestDialog.open}
        onOpenChange={(open) => setRequestDialog({ open, levelId: requestDialog.levelId })}
      >
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-400" />
              Codso Level-ka Xiga
            </DialogTitle>
            <DialogDescription className="text-slate-400">Ma hubtaa inaad codsaneyso level-ka xiga?</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-slate-900/50 rounded-lg space-y-2 text-sm">
            <p className="text-slate-300">Marka aad codsato:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Admin-ku wuxuu eegi doonaa horumarkaaga</li>
              <li>Marka la ansixiyo, waxaad heli doontaa level-ka xiga</li>
              <li>Level-ka hore waa la xidhi doonaa</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 bg-transparent"
              onClick={() => setRequestDialog({ open: false, levelId: null })}
            >
              Ka Noqo
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => requestDialog.levelId && handleRequestNextLevel(requestDialog.levelId)}
              disabled={requestingLevel === requestDialog.levelId}
            >
              {requestingLevel === requestDialog.levelId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Diraya...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Codso
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
