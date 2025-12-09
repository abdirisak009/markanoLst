"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Video, Play, Eye, Lock, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"

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

export default function VideosPublicPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null)
  const [showVerification, setShowVerification] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [verificationError, setVerificationError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/videos")
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      console.error("Error fetching videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoClick = async (video: VideoData) => {
    if (video.access_type === "watch_universities") {
      setSelectedVideo(video)
      setShowVerification(true)
    } else {
      openVideo(video)
    }
  }

  const verifyStudent = async () => {
    console.log("[v0] Starting verification for student ID:", studentId)
    setVerificationError("")
    setVerifying(true)
    try {
      const response = await fetch("/api/videos/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      })

      console.log("[v0] Verification response status:", response.status)
      console.log("[v0] Verification response headers:", response.headers.get("Content-Type"))

      const contentType = response.headers.get("Content-Type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Response is not JSON, got:", contentType)
        const text = await response.text()
        console.error("[v0] Response body:", text.substring(0, 200))
        setVerificationError("Server returned an invalid response. Please try again.")
        setVerifying(false)
        return
      }

      const data = await response.json()
      console.log("[v0] Verification response data:", data)

      if (data.verified) {
        console.log("[v0] Student verified successfully:", data.student.full_name)
        localStorage.setItem("verified_student_id", studentId)
        toast({
          title: "Verified!",
          description: `Welcome, ${data.student.full_name}`,
        })
        setShowVerification(false)
        if (selectedVideo) {
          console.log("[v0] Navigating to video watch page:", selectedVideo.id)
          window.location.href = `/videos/watch/${selectedVideo.id}`
        }
        setStudentId("")
        setSelectedVideo(null)
        setVerificationError("")
      } else {
        setVerificationError(data.message || "Student ID not found in our database. Please check and try again.")
      }
    } catch (error) {
      console.error("[v0] Error during verification:", error)
      setVerificationError("Failed to verify student ID. Please try again later.")
    } finally {
      setVerifying(false)
    }
  }

  const openVideo = (video: VideoData) => {
    router.push(`/videos/watch/${video.id}`)
  }

  const categories = ["All", ...Array.from(new Set(videos.map((v) => v.category)))]

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || video.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const videosByCategory = categories.reduce(
    (acc, category) => {
      if (category === "All") return acc
      acc[category] = filteredVideos.filter((v) => v.category === category)
      return acc
    },
    {} as Record<string, VideoData[]>,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section with Homepage Branding */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8c] to-[#1e3a5f] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#ef4444] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ef4444] mb-6 shadow-xl">
              <Video className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">
              Video <span className="text-[#ef4444]">Library</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 text-pretty">
              Learn at your own pace with our curated video content
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-white text-gray-900 border-0 shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category ? "bg-[#1e3a5f] hover:bg-[#2d5a8c] text-white" : "hover:bg-gray-100"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Videos Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading videos...</p>
            </div>
          ) : selectedCategory === "All" && searchQuery === "" ? (
            Object.entries(videosByCategory).map(
              ([category, categoryVideos]) =>
                categoryVideos.length > 0 && (
                  <div key={category} className="mb-12">
                    <h2 className="text-3xl font-bold text-[#1e3a5f] mb-6">{category}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryVideos.map((video) => (
                        <Card
                          key={video.id}
                          className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-[#ef4444]"
                          onClick={() => handleVideoClick(video)}
                        >
                          <CardContent className="p-6">
                            <div className="w-full h-48 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-lg">
                              <Play className="h-16 w-16 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-[#1e3a5f] mb-2 line-clamp-2">{video.title}</h3>
                            {video.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                              <span className="font-medium">{video.duration}</span>
                              <div className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                <span>{video.views}</span>
                              </div>
                            </div>
                            {video.access_type === "watch_universities" && (
                              <div className="flex items-center gap-1.5 text-[#ef4444] text-sm font-medium">
                                <Lock className="h-3.5 w-3.5" />
                                <span>University Students Only</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ),
            )
          ) : (
            <div>
              {filteredVideos.length > 0 && (
                <h2 className="text-3xl font-bold text-[#1e3a5f] mb-6">
                  {selectedCategory === "All" ? "Search Results" : selectedCategory}
                </h2>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <Card
                    key={video.id}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-[#ef4444]"
                    onClick={() => handleVideoClick(video)}
                  >
                    <CardContent className="p-6">
                      <div className="w-full h-48 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-lg">
                        <Play className="h-16 w-16 text-white" />
                      </div>
                      <span className="inline-block px-2.5 py-1 bg-[#ef4444] bg-opacity-10 text-[#ef4444] rounded-md text-xs font-semibold mb-2">
                        {video.category}
                      </span>
                      <h3 className="font-bold text-lg text-[#1e3a5f] mb-2 line-clamp-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span className="font-medium">{video.duration}</span>
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-4 w-4" />
                          <span>{video.views}</span>
                        </div>
                      </div>
                      {video.access_type === "watch_universities" && (
                        <div className="flex items-center gap-1.5 text-[#ef4444] text-sm font-medium">
                          <Lock className="h-3.5 w-3.5" />
                          <span>University Students Only</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredVideos.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Video className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No videos found</p>
            </div>
          )}
        </div>
      </section>

      {/* Verification Dialog */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8c] to-[#1e3a5f] text-white border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#ef4444] flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              Student Verification Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-200">
              This video is only available to university students. Please enter your Student ID to continue.
            </p>
            <div>
              <Label className="text-white font-medium">Student ID</Label>
              <Input
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value)
                  setVerificationError("")
                }}
                placeholder="Enter your student ID"
                onKeyPress={(e) => e.key === "Enter" && verifyStudent()}
                className="mt-1.5 bg-white/95 text-gray-900 border-white/20 focus:border-[#ef4444] placeholder:text-gray-500"
              />
              {verificationError && (
                <div className="mt-2 p-3 bg-red-500/20 border border-red-400/30 rounded-md">
                  <p className="text-sm text-red-100">{verificationError}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVerification(false)
                  setVerificationError("")
                  setStudentId("")
                }}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={verifyStudent}
                disabled={!studentId || verifying}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-lg"
              >
                {verifying ? "Verifying..." : "Verify & Watch"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
