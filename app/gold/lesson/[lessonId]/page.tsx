"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Clock, Award } from "lucide-react"
import { toast } from "sonner"

interface Lesson {
  id: number
  level_id: number
  title: string
  lesson_type: string
  content: string
  video_url: string
  video_duration: number
  order_index: number
  is_required: boolean
  level_name: string
  track_name: string
}

interface LessonProgress {
  status: string
  progress_percentage: number
  watch_time: number
  last_position: number
}

export default function LessonViewerPage() {
  const params = useParams()
  const lessonId = params.lessonId as string
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [siblings, setSiblings] = useState<{ prev: Lesson | null; next: Lesson | null }>({ prev: null, next: null })

  useEffect(() => {
    const storedStudent = localStorage.getItem("gold_student")
    if (!storedStudent) {
      router.push("/gold")
      return
    }
    const student = JSON.parse(storedStudent)
    setStudentId(student.id)
    fetchData(student.id)
  }, [lessonId, router])

  const fetchData = async (studId: number) => {
    try {
      // Fetch lesson details
      const lessonsRes = await fetch("/api/gold/lessons")
      const lessons = await lessonsRes.json()
      const currentLesson = lessons.find((l: Lesson) => l.id === Number.parseInt(lessonId))
      setLesson(currentLesson)

      // Find prev/next lessons in same level
      const sameLevelLessons = lessons
        .filter((l: Lesson) => l.level_id === currentLesson?.level_id)
        .sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)

      const currentIndex = sameLevelLessons.findIndex((l: Lesson) => l.id === Number.parseInt(lessonId))
      setSiblings({
        prev: currentIndex > 0 ? sameLevelLessons[currentIndex - 1] : null,
        next: currentIndex < sameLevelLessons.length - 1 ? sameLevelLessons[currentIndex + 1] : null,
      })

      // Fetch progress
      const progressRes = await fetch(`/api/gold/lesson-progress?studentId=${studId}&lessonId=${lessonId}`)
      const progressData = await progressRes.json()
      setProgress(progressData)

      // Resume from last position
      if (progressData?.last_position && videoRef.current) {
        videoRef.current.currentTime = progressData.last_position
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (newProgress: Partial<LessonProgress>) => {
    if (!studentId) return

    try {
      await fetch("/api/gold/lesson-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          lesson_id: Number.parseInt(lessonId),
          ...newProgress,
        }),
      })
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    setCurrentTime(current)
    setDuration(total)

    const progressPercent = Math.round((current / total) * 100)

    // Update progress every 10 seconds
    if (Math.floor(current) % 10 === 0) {
      updateProgress({
        progress_percentage: progressPercent,
        last_position: Math.floor(current),
        status: progressPercent >= 90 ? "completed" : "in_progress",
      })
    }
  }

  const handleVideoEnd = () => {
    updateProgress({
      status: "completed",
      progress_percentage: 100,
    })
    setProgress((prev) => (prev ? { ...prev, status: "completed", progress_percentage: 100 } : null))
    toast.success("Casharku wuu dhammaatay! Hambalyo!")
  }

  const markAsComplete = async () => {
    await updateProgress({
      status: "completed",
      progress_percentage: 100,
    })
    setProgress((prev) => (prev ? { ...prev, status: "completed", progress_percentage: 100 } : null))
    toast.success("Casharku waa la calaamadeeyay inuu dhammaatay!")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
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

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
          <p className="text-slate-400 mb-4">Casharka lama helin</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Ku Noqo
          </Button>
        </Card>
      </div>
    )
  }

  const isCompleted = progress?.status === "completed"
  const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : progress?.progress_percentage || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-slate-400">
                {lesson.track_name} • {lesson.level_name}
              </p>
              <h1 className="text-lg font-bold text-white">{lesson.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" /> La Dhammeeyay
              </Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-400">Socda</Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {lesson.lesson_type === "video" && lesson.video_url && (
              <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    src={lesson.video_url}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnd}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={() => {
                      if (videoRef.current) setDuration(videoRef.current.duration)
                    }}
                    controls
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Horumar</span>
                    <span className="text-sm text-white">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2 bg-slate-700" />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Article Content */}
            {lesson.lesson_type === "article" && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="prose prose-invert max-w-none">
                    <div
                      className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: lesson.content || "Wali ma jiro qoraal" }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              {siblings.prev ? (
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 bg-transparent"
                  onClick={() => router.push(`/gold/lesson/${siblings.prev?.id}`)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> {siblings.prev.title}
                </Button>
              ) : (
                <div />
              )}
              {siblings.next ? (
                <Button
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => router.push(`/gold/lesson/${siblings.next?.id}`)}
                >
                  {siblings.next.title} <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.back()}>
                  Dhamaystir Level-ka <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Lesson Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Macluumaadka Casharka</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nooca</span>
                  <Badge variant="outline">
                    {lesson.lesson_type === "video"
                      ? "Video"
                      : lesson.lesson_type === "article"
                        ? "Maqaal"
                        : lesson.lesson_type}
                  </Badge>
                </div>
                {lesson.video_duration > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Muddada</span>
                    <span className="text-white flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {Math.floor(lesson.video_duration / 60)} daqiiqo
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Xaaladda</span>
                  {isCompleted ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> La Dhammeeyay
                    </span>
                  ) : (
                    <span className="text-amber-400">{progressPercent}% La Dhammeeyay</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mark Complete Button */}
            {!isCompleted && lesson.lesson_type !== "video" && (
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={markAsComplete}>
                <CheckCircle className="h-4 w-4 mr-2" /> Calaamadee Inuu Dhammaatay
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
