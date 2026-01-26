"use client"

import { useEffect, useState, useRef } from "react"

// YouTube API type declarations
declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: {
        videoId: string
        events: {
          onReady?: (event: any) => void
          onStateChange?: (event: any) => void
          onPlaybackRateChange?: (event: any) => void
        }
      }) => {
        getDuration: () => number
        getCurrentTime: () => number
        seekTo: (seconds: number, allowSeekAhead: boolean) => void
        getPlaybackRate: () => number
        setPlaybackRate: (rate: number) => void
        playVideo: () => void
        pauseVideo: () => void
      }
      PlayerState: {
        PLAYING: number
        PAUSED: number
        ENDED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Play,
  Clock,
  Video,
  User,
  GraduationCap,
  Hash,
  CheckCircle2,
  AlertTriangle,
  FastForward,
  SkipForward,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"

interface VideoData {
  id: number
  title: string
  description: string
  url: string
  duration: string
  category: string
  access_type: string
}

interface StudentInfo {
  student_id: string
  full_name: string
  class_name: string | null
  university_name: string | null
}

interface TrackingStats {
  totalWatchTime: number
  skipsDetected: number
  speedChanges: number
  currentSpeed: number
  isValidWatch: boolean
}

export default function VideoWatchPage() {
  const params = useParams()
  const router = useRouter()
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [watchProgress, setWatchProgress] = useState(0)
  const [lastPosition, setLastPosition] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [isProgressLoaded, setIsProgressLoaded] = useState(false)
  const [previousPosition, setPreviousPosition] = useState(0)
  const [skipCount, setSkipCount] = useState(0)
  const playerRef = useRef<any>(null)
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [trackingStats, setTrackingStats] = useState<TrackingStats>({
    totalWatchTime: 0,
    skipsDetected: 0,
    speedChanges: 0,
    currentSpeed: 1,
    isValidWatch: true,
  })
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const actualWatchTimeRef = useRef(0)
  const lastSpeedRef = useRef(1)

  useEffect(() => {
    const fetchStudentInfo = async () => {
      const studentId = localStorage.getItem("verified_student_id")
      if (!studentId) return

      try {
        const response = await fetch(`/api/students/${studentId}`)
        if (response.ok) {
          const data = await response.json()
          setStudentInfo(data)
        }
      } catch (error) {
        console.error("Failed to fetch student info:", error)
      }
    }

    fetchStudentInfo()
  }, [])

  useEffect(() => {
    const fetchProgress = async () => {
      const studentId = localStorage.getItem("verified_student_id")
      if (!studentId || !params.id) {
        setIsProgressLoaded(true)
        return
      }

      try {
        const response = await fetch(`/api/videos/progress/${params.id}?student_id=${studentId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.last_position) {
            const position = Number.parseFloat(data.last_position) || 0
            setLastPosition(position)
            setWatchProgress(data.completion_percentage || 0)
            actualWatchTimeRef.current = data.watch_duration || 0
            if (data.completion_percentage >= 95) {
              setIsCompleted(true)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error)
      } finally {
        setIsProgressLoaded(true)
      }
    }

    fetchProgress()
  }, [params.id])

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/videos/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch video")
        const data = await response.json()
        setVideo(data)
      } catch (err) {
        setError("Failed to load video")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchVideo()
    }
  }, [params.id])

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) return match[1]
    }
    return null
  }

  const videoId = extractYouTubeId(video?.url || "")

  useEffect(() => {
    if (!isProgressLoaded || !videoId) return

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      if (videoId) {
        playerRef.current = new window.YT.Player("youtube-player", {
          videoId: videoId,
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onPlaybackRateChange: onPlaybackRateChange, // Added speed change listener
          },
        })
      }
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
      }
    }
  }, [videoId, isProgressLoaded])

  const onPlayerReady = (event: any) => {
    if (lastPosition > 0) {
      event.target.seekTo(lastPosition, true)
    }
    const initialRate = event.target.getPlaybackRate()
    lastSpeedRef.current = initialRate
    setTrackingStats((prev) => ({ ...prev, currentSpeed: initialRate }))
  }

  const onPlaybackRateChange = (event: any) => {
    const newRate = event.data
    console.log(`[v0] Playback speed changed: ${lastSpeedRef.current}x → ${newRate}x`)

    if (newRate > 1) {
      setShowWarning(true)
      setWarningMessage(`Speed-ka ${newRate}x ayaa la adeegsanayaa - progress-ku si tartiib ah ayuu u dhacayaa`)
      setTrackingStats((prev) => ({
        ...prev,
        speedChanges: prev.speedChanges + 1,
        currentSpeed: newRate,
        isValidWatch: newRate <= 1.25,
      }))

      // Log speed change event
      const studentId = localStorage.getItem("verified_student_id")
      if (studentId && video) {
        fetch("/api/videos/skip-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: video.id,
            studentId: studentId,
            eventType: "speed_change",
            speedFrom: lastSpeedRef.current,
            speedTo: newRate,
          }),
        }).catch((error) => console.error("[v0] Failed to log speed event:", error))
      }
    } else {
      setShowWarning(false)
      setTrackingStats((prev) => ({
        ...prev,
        currentSpeed: newRate,
        isValidWatch: true,
      }))
    }

    lastSpeedRef.current = newRate
  }

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      startTracking()
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      stopTracking()
      if (event.data === window.YT.PlayerState.ENDED) {
        const duration = playerRef.current?.getDuration() || 0
        const watchedPercentage = (actualWatchTimeRef.current / duration) * 100

        if (watchedPercentage >= 90) {
          setIsCompleted(true)
          setWatchProgress(100)
        } else {
          setShowWarning(true)
          setWarningMessage(
            `Video-gu wuu dhamaaday laakiin ${Math.round(watchedPercentage)}% keliya ayaa si fiican loo daawaaday. Si loo xaqiijiyo in la dhammeeyey, fadlan dib u daawo qeybaha la booday.`,
          )
        }
      }
    }
  }

  const startTracking = () => {
    if (trackingIntervalRef.current) return
    if (isCompleted) {
      console.log("[v0] Video already completed, skipping tracking")
      return
    }

    trackingIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime()
        const duration = playerRef.current.getDuration()
        const currentSpeed = playerRef.current.getPlaybackRate() || 1

        const timeIncrement = currentSpeed <= 1.25 ? 1 : 0.5 // Slower progress for high speed
        actualWatchTimeRef.current += timeIncrement

        const progress = (currentTime / duration) * 100
        const actualProgress = (actualWatchTimeRef.current / duration) * 100

        if (currentTime > previousPosition + 5 && previousPosition > 0) {
          const skipAmount = currentTime - previousPosition
          console.log(`[v0] Skip detected: jumped ${skipAmount.toFixed(1)}s forward`)

          setSkipCount((prev) => prev + 1)
          setTrackingStats((prev) => ({
            ...prev,
            skipsDetected: prev.skipsDetected + 1,
            isValidWatch: prev.skipsDetected < 3,
          }))

          setShowWarning(true)
          setWarningMessage(`Booditaan la ogaaday: ${skipAmount.toFixed(0)} ilbiriqsi ayaa la booday`)
          setTimeout(() => setShowWarning(false), 3000)

          // Log skip event to database
          const studentId = localStorage.getItem("verified_student_id")
          if (studentId && video) {
            fetch("/api/videos/skip-event", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                videoId: video.id,
                studentId: studentId,
                eventType: "skip",
                skipFrom: Math.floor(previousPosition),
                skipTo: Math.floor(currentTime),
              }),
            }).catch((error) => console.error("[v0] Failed to log skip event:", error))
          }
        }
        setPreviousPosition(currentTime)

        setWatchProgress(progress)
        setLastPosition(Math.floor(currentTime))

        setTrackingStats((prev) => ({
          ...prev,
          totalWatchTime: actualWatchTimeRef.current,
          currentSpeed: currentSpeed,
        }))

        if (actualProgress >= 95 && !isCompleted) {
          setIsCompleted(true)
        }

        if (Math.floor(currentTime) % 10 === 0 && Math.floor(currentTime) > 0) {
          saveProgress(currentTime, duration, progress, actualWatchTimeRef.current)
        }
      }
    }, 1000)
  }

  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
      trackingIntervalRef.current = null

      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime()
        const duration = playerRef.current.getDuration()
        const progress = (currentTime / duration) * 100
        saveProgress(currentTime, duration, progress, actualWatchTimeRef.current)
      }
    }
  }

  const saveProgress = async (currentTime: number, duration: number, progress: number, actualWatchTime: number) => {
    const studentId = localStorage.getItem("verified_student_id")
    if (!studentId || !video) return

    if (isCompleted && progress >= 95) {
      console.log("[v0] Video already completed, skipping save")
      return
    }

    const validatedProgress = Math.min(progress, (actualWatchTime / duration) * 100)

    try {
      await fetch("/api/videos/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: video.id,
          student_id: studentId,
          watch_duration: Math.floor(actualWatchTime),
          total_duration: Math.floor(duration),
          completion_percentage: Math.round(validatedProgress),
          last_position: Math.floor(currentTime),
          skipped_count: trackingStats.skipsDetected,
          speed_changes: trackingStats.speedChanges,
          is_valid_watch: trackingStats.isValidWatch,
        }),
      })
      console.log(
        "[v0] Progress saved - Actual watch:",
        Math.floor(actualWatchTime),
        "s, Skips:",
        trackingStats.skipsDetected,
      )
    } catch (error) {
      console.error("Failed to save progress:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Play className="h-16 w-16 mx-auto mb-4 text-[#1e3a5f] animate-pulse" />
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Video not found"}</p>
          <Button onClick={() => router.push("/videos")} className="bg-[#1e3a5f]">
            Back to Videos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {" "}
      {/* Added padding for sticky footer */}
      <Navbar />
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8c] to-[#1e3a5f] text-white py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-10 w-32 h-32 bg-[#ef4444] rounded-full blur-3xl"></div>
          <div className="absolute bottom-5 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" onClick={() => router.push("/videos")} className="mb-4 text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Video Library
          </Button>

          {studentInfo && (
            <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#ef4444]" />
                  <span className="font-semibold">{studentInfo.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-[#ef4444]" />
                  <span>ID: {studentInfo.student_id}</span>
                </div>
                {studentInfo.class_name && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#ef4444]" />
                    <span>{studentInfo.class_name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {video && (
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1e3a5f] rounded-full text-sm font-semibold mb-3">
                <Video className="h-4 w-4" />
                {video.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">{video.title}</h1>
              <p className="text-gray-200 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {video.duration}
              </p>
            </div>
          )}
        </div>
      </section>
      {showWarning && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="container mx-auto flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">{warningMessage}</p>
          </div>
        </div>
      )}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {videoId ? (
                <>
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <div id="youtube-player" className="absolute top-0 left-0 w-full h-full" />
                  </div>

                  {(watchProgress > 0 || isCompleted) && (
                    <div className="px-6 pt-4 bg-gradient-to-r from-[#1e3a5f]/5 to-[#ef4444]/5">
                      <div className="flex items-center justify-between text-sm text-[#1e3a5f] font-medium mb-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          Horumarka Daawashada
                        </span>
                        <span className="flex items-center gap-2">
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-5 w-5" />
                              La Dhammeeyay
                            </span>
                          )}
                          <span className="text-[#ef4444] font-bold">{Math.round(watchProgress)}%</span>
                        </span>
                      </div>
                      <Progress
                        value={watchProgress}
                        className={`h-2.5 ${isCompleted ? "bg-green-100" : "bg-gray-200"}`}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] flex items-center justify-center">
                  <p className="text-white">Unable to load video</p>
                </div>
              )}

              {video?.description && (
                <div className="p-6 border-t">
                  <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">Faahfaahinta Video-ga</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{video.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-6xl mx-auto">
            {/* Progress bar */}
            <div className="mb-2">
              <Progress value={watchProgress} className={`h-2 ${isCompleted ? "bg-green-100" : "bg-gray-200"}`} />
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {/* Watch time */}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    Waqtiga:{" "}
                    <span className="font-semibold text-[#1e3a5f]">{formatTime(trackingStats.totalWatchTime)}</span>
                  </span>
                </div>

                {/* Current speed */}
                {trackingStats.currentSpeed !== 1 && (
                  <div
                    className={`flex items-center gap-1.5 ${trackingStats.currentSpeed > 1 ? "text-amber-600" : "text-gray-600"}`}
                  >
                    <FastForward className="h-4 w-4" />
                    <span className="font-semibold">{trackingStats.currentSpeed}x</span>
                  </div>
                )}

                {/* Skip count */}
                {trackingStats.skipsDetected > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <SkipForward className="h-4 w-4" />
                    <span>{trackingStats.skipsDetected} booditaan</span>
                  </div>
                )}
              </div>

              {/* Progress percentage and status */}
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    La Dhammeeyay
                  </span>
                ) : (
                  <span className="text-gray-600">
                    Horumar: <span className="font-bold text-[#ef4444]">{Math.round(watchProgress)}%</span>
                  </span>
                )}

                {/* Validity indicator */}
                {!trackingStats.isValidWatch && (
                  <span className="flex items-center gap-1 text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded-full">
                    <AlertTriangle className="h-3 w-3" />
                    Xaqiijinta loo baahan yahay
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
