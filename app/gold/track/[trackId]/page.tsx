"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { toast } from "sonner"

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

export default function TrackLessonsPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = use(params)
  const router = useRouter()
  const [track, setTrack] = useState<Track | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLevels, setExpandedLevels] = useState<number[]>([])
  const [studentId, setStudentId] = useState<number | null>(null)
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null)

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

      // Fetch all lessons
      const lessonsRes = await fetch("/api/gold/lessons")
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
      }

      // Combine data
      const levelsWithLessons = levelsData.map((level: Level) => {
        const levelLessons = lessonsData
          .filter((l: Lesson) => l.level_id === level.id)
          .map((lesson: Lesson) => {
            const progress = progressData.find((p: { lesson_id: number }) => p.lesson_id === lesson.id)
            return { ...lesson, progress }
          })
          .sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)

        return { ...level, lessons: levelLessons }
      })

      setLevels(levelsWithLessons)

      // Auto-expand first unlocked level
      if (levelsWithLessons.length > 0) {
        const firstUnlocked = levelsWithLessons.find(
          (l: Level) =>
            !currentLevelId || l.id === currentLevelId || l.order_index <= (enrollment?.current_level_order || 1),
        )
        if (firstUnlocked) {
          setExpandedLevels([firstUnlocked.id])
        }
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
    const currentLevel = levels.find((l) => l.id === currentLevelId)
    if (!currentLevel) return level.order_index === 1
    return level.order_index <= currentLevel.order_index
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
            const expanded = expandedLevels.includes(level.id)
            const progress = getLevelProgress(level)

            return (
              <Card
                key={level.id}
                className={`overflow-hidden transition-all ${
                  unlocked
                    ? "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                    : "bg-slate-900/50 border-slate-800 opacity-60"
                }`}
              >
                <CardHeader
                  className={`cursor-pointer ${unlocked ? "hover:bg-slate-700/30" : ""}`}
                  onClick={() => unlocked && toggleLevel(level.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                          unlocked
                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                            : "bg-slate-700 text-slate-500"
                        }`}
                      >
                        {unlocked ? index + 1 : <Lock className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          {level.name}
                          {progress === 100 && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          {level.lessons?.length || 0} cashar
                          {unlocked && progress > 0 && ` • ${progress}% la dhammeeyay`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {unlocked && (
                        <div className="w-24">
                          <Progress value={progress} className="h-2 bg-slate-700" />
                        </div>
                      )}
                      {unlocked &&
                        (expanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        ))}
                    </div>
                  </div>
                </CardHeader>

                {expanded && unlocked && (
                  <CardContent className="pt-0 border-t border-slate-700/50">
                    <div className="space-y-2 mt-4">
                      {level.lessons?.map((lesson, lessonIndex) => {
                        const LessonIcon = getLessonIcon(lesson.lesson_type)
                        const isCompleted = lesson.progress?.status === "completed"
                        const isInProgress =
                          lesson.progress?.status === "in_progress" && (lesson.progress?.progress_percentage || 0) > 0

                        return (
                          <Link key={lesson.id} href={`/gold/lesson/${lesson.id}`}>
                            <div
                              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                                isCompleted
                                  ? "bg-green-500/10 border border-green-500/20 hover:bg-green-500/20"
                                  : isInProgress
                                    ? "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
                                    : "bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50"
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
                                <Play className={`h-5 w-5 ${isCompleted ? "text-green-400" : "text-slate-400"}`} />
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </main>
    </div>
  )
}
