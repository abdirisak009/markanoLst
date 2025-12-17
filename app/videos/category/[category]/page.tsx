"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Play,
  Search,
  Clock,
  ArrowLeft,
  User,
  Home,
  Settings,
  ChevronRight,
  Check,
  Circle,
  BookOpen,
  GraduationCap,
  Menu,
  X,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface VideoData {
  id: number
  title: string
  description: string
  url: string
  duration: string
  category: string
  access_type: string
  views: number
}

interface StudentInfo {
  full_name: string
  class_name: string
  student_id: string
}

interface VideoProgress {
  video_id: number
  completion_percentage: number
  last_position: number
}

function CategoryVideosContent({ category }: { category: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null)
  const [videoProgress, setVideoProgress] = useState<Record<number, VideoProgress>>({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const isInitialized = useRef(false)
  const hasFetched = useRef(false)

  const handleBackToCategories = () => {
    router.push("/videos")
  }

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const studentId = searchParams.get("student_id")
    const studentName = searchParams.get("student_name")
    const className = searchParams.get("class_name")

    if (!studentId) {
      router.push("/videos")
      return
    }

    setStudentInfo({
      full_name: studentName || "Unknown",
      class_name: className || "",
      student_id: studentId,
    })

    // Fetch all video progress for this student
    fetchVideoProgress(studentId)
  }, [])

  const fetchVideoProgress = async (studentId: string) => {
    try {
      const response = await fetch(`/api/videos/student-progress?student_id=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        const progressMap: Record<number, VideoProgress> = {}
        data.forEach((p: VideoProgress) => {
          progressMap[p.video_id] = p
        })
        setVideoProgress(progressMap)
      }
    } catch (error) {
      console.error("Failed to fetch video progress:", error)
    }
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchVideos = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/videos/public?category=${encodeURIComponent(category)}`)
        if (!response.ok) throw new Error("Failed to fetch videos")
        const data = await response.json()
        setVideos(data)
        if (data.length > 0) {
          setSelectedVideo(data[0])
        }
      } catch (error) {
        console.error("Error fetching videos:", error)
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [category])

  const handleVideoSelect = (video: VideoData) => {
    setSelectedVideo(video)
    setIsPlaying(false)
    setMobileSidebarOpen(false)
  }

  const handleWatchVideo = () => {
    if (!studentInfo || !selectedVideo) return
    setIsPlaying(true)
    trackVideoView()
  }

  const trackVideoView = async () => {
    if (!studentInfo || !selectedVideo) return
    try {
      await fetch("/api/videos/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentInfo.student_id,
          video_id: selectedVideo.id,
          action: "view",
        }),
      })
    } catch (error) {
      console.error("Failed to track video view:", error)
    }
  }

  const getProgressStatus = (videoId: number) => {
    const progress = videoProgress[videoId]
    if (!progress) return "not_started"
    if (progress.completion_percentage >= 95) return "completed"
    if (progress.completion_percentage > 0) return "in_progress"
    return "not_started"
  }

  const getProgressPercentage = (videoId: number) => {
    return videoProgress[videoId]?.completion_percentage || 0
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const completedCount = videos.filter((v) => getProgressStatus(v.id) === "completed").length
  const totalDuration = videos.reduce((acc, v) => {
    const parts = v.duration?.split(":") || ["0", "0"]
    return acc + (Number.parseInt(parts[0]) || 0)
  }, 0)

  // Extract YouTube video ID
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/, /youtube\.com\/embed\/([^&\n?#]+)/]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) return match[1]
    }
    return null
  }

  const selectedVideoYouTubeId = selectedVideo ? extractYouTubeId(selectedVideo.url) : null

  return (
    <div className="min-h-screen bg-[#1e293b] flex">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar - Made responsive with mobile drawer */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarCollapsed ? "lg:w-16" : "w-80"} 
          bg-[#1e293b] border-r border-white/10 flex flex-col 
          transition-all duration-300 ease-in-out
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToCategories}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Home className="h-5 w-5" />
              {!sidebarCollapsed && <span className="font-medium">Markano</span>}
            </button>
            <div className="flex items-center gap-2">
              {/* Close button for mobile */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors hidden lg:block"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Student Info */}
        {studentInfo && !sidebarCollapsed && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b7a] flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{studentInfo.full_name}</p>
                <p className="text-white/50 text-xs">ID: {studentInfo.student_id}</p>
              </div>
            </div>
            {studentInfo.class_name && (
              <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                <GraduationCap className="h-4 w-4 text-[#e63946]" />
                <span className="text-white/70 text-xs">{studentInfo.class_name}</span>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Raadi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm rounded-lg focus:border-[#e63946]/50 focus:ring-[#e63946]/20"
              />
            </div>
          </div>
        )}

        {/* Course Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-white mb-2">
              <BookOpen className="h-5 w-5 text-[#e63946]" />
              <span className="font-bold">{category}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>
                {completedCount}/{videos.length} dhammaystay
              </span>
              <span>{totalDuration}+ daqiiqo</span>
            </div>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#e63946] to-[#ff6b7a] rounded-full transition-all duration-500"
                style={{ width: `${videos.length > 0 ? (completedCount / videos.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Video List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                  <div className="w-6 h-6 rounded-full bg-white/10" />
                  <div className="flex-1 h-4 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2">
              {filteredVideos.map((video, index) => {
                const status = getProgressStatus(video.id)
                const progress = getProgressPercentage(video.id)
                const isSelected = selectedVideo?.id === video.id

                return (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all group hover:bg-white/5 ${
                      isSelected ? "bg-white/10 border-l-2 border-[#e63946]" : "border-l-2 border-transparent"
                    }`}
                  >
                    {/* Progress Circle */}
                    <div className="relative flex-shrink-0">
                      {status === "completed" ? (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      ) : status === "in_progress" ? (
                        <div className="w-6 h-6 relative">
                          <svg className="w-6 h-6 -rotate-90">
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              fill="transparent"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="2"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              fill="transparent"
                              stroke="#e63946"
                              strokeWidth="2"
                              strokeDasharray={`${(progress / 100) * 62.83} 62.83`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-2.5 w-2.5 text-[#e63946] ml-0.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                          <Circle className="h-2 w-2 text-white/30 group-hover:text-white/50" />
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <Play
                            className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                              isSelected ? "text-[#e63946]" : "text-white/40"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-white/80"}`}
                            >
                              {index + 1}. {video.title}
                            </p>
                            <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {video.duration}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="p-4 border-t border-white/10">
          <Button
            onClick={handleBackToCategories}
            variant="ghost"
            className={`${sidebarCollapsed ? "w-8 h-8 p-0" : "w-full"} text-white/60 hover:text-white hover:bg-white/10`}
          >
            <ArrowLeft className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Dib u Noqo</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-[#1e293b] border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {selectedVideo && (
              <span className="text-white/60 text-xs sm:text-sm">
                Lesson {filteredVideos.findIndex((v) => v.id === selectedVideo.id) + 1} of {filteredVideos.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleWatchVideo}
              className="bg-gradient-to-r from-[#e63946] to-[#ff4d5a] hover:from-[#d62839] hover:to-[#e63946] text-white px-3 sm:px-6 text-sm"
            >
              <span className="hidden sm:inline">Bilow Daawashada</span>
              <span className="sm:hidden">Bilow</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </header>

        {/* Video Preview Area - Made responsive */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedVideo ? (
            <>
              {/* Video Thumbnail/Preview */}
              <div className="relative flex-1 bg-gradient-to-br from-[#1e293b] via-[#2d3a4f] to-[#1e293b] flex items-center justify-center overflow-hidden p-2 sm:p-4">
                {/* Background Pattern */}
                {!isPlaying && (
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-[#1e293b] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-[#e63946] rounded-full blur-3xl"></div>
                  </div>
                )}

                {/* YouTube Thumbnail or Embed */}
                {selectedVideoYouTubeId && (
                  <div className="relative z-10 w-full max-w-5xl mx-auto">
                    <div className="relative aspect-video rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                      {isPlaying ? (
                        // Embedded YouTube Player
                        <iframe
                          src={`https://www.youtube.com/embed/${selectedVideoYouTubeId}?autoplay=1&rel=0&modestbranding=1`}
                          title={selectedVideo.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        // Thumbnail with Play Button
                        <>
                          <img
                            src={`https://img.youtube.com/vi/${selectedVideoYouTubeId}/maxresdefault.jpg`}
                            alt={selectedVideo.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                `https://img.youtube.com/vi/${selectedVideoYouTubeId}/hqdefault.jpg`
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <button
                              onClick={handleWatchVideo}
                              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-[#e63946]/80 hover:scale-110 transition-all duration-300 group"
                            >
                              <Play className="h-7 w-7 sm:h-10 sm:w-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>

                          {/* Video Progress Indicator */}
                          {getProgressStatus(selectedVideo.id) !== "not_started" && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                              <div
                                className="h-full bg-[#e63946]"
                                style={{ width: `${getProgressPercentage(selectedVideo.id)}%` }}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {!selectedVideoYouTubeId && (
                  <div className="text-center text-white/60">
                    <Play className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Video URL not available</p>
                  </div>
                )}
              </div>

              {/* Video Info Bar - Made responsive */}
              <div className="bg-[#1e293b] border-t border-white/10 p-4 sm:p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 truncate sm:whitespace-normal">
                        {selectedVideo.title}
                      </h1>
                      {selectedVideo.description && (
                        <p className="text-white/60 text-xs sm:text-sm line-clamp-2">{selectedVideo.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/50 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {selectedVideo.duration}
                      </div>
                      {getProgressStatus(selectedVideo.id) === "completed" && (
                        <div className="flex items-center gap-1.5 text-green-400">
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Dhammaystay</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {studentInfo && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#e63946] font-semibold text-sm sm:text-base">Guul!</p>
                          <p className="text-white/60 text-xs sm:text-sm">Soo dhawaw, {studentInfo.full_name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/40 text-xs sm:text-sm">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {selectedVideo.duration}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center p-4">
                <Play className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Dooro muuqaal si aad u bilowdo daawashada</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function CategoryVideosPage({ params }: { params: { category: string } }) {
  const decodedCategory = decodeURIComponent(params.category)

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1e293b] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946]"></div>
        </div>
      }
    >
      <CategoryVideosContent category={decodedCategory} />
    </Suspense>
  )
}
