"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Video, Play, Eye, Lock, Search, Sparkles, TrendingUp, BookOpen, Code2, Clock } from "lucide-react"
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

interface CategoryData {
  category: string
  video_count: number
}

export default function VideosPublicPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null)
  const [showVerification, setShowVerification] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchVideos(selectedCategory)
    }
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/videos/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVideos = async (category: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/videos/public?category=${category}`)
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      console.error("Error fetching videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setVideos([])
    setSearchQuery("")
  }

  const handleVideoClick = async (video: VideoData) => {
    if (video.access_type === "watch_universities") {
      setSelectedVideo(video)
      setShowVerification(true)
    } else {
      router.push(`/videos/watch/${video.id}`)
    }
  }

  const verifyStudent = async () => {
    setVerificationError("")
    setVerifying(true)
    try {
      const response = await fetch("/api/videos/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      })

      const data = await response.json()

      if (data.verified) {
        localStorage.setItem("verified_student_id", studentId)
        toast({
          title: "Guul!",
          description: `Soo dhawaw, ${data.student.full_name}`,
        })
        setShowVerification(false)
        if (selectedVideo) {
          router.push(`/videos/watch/${selectedVideo.id}`)
        }
        setStudentId("")
        setSelectedVideo(null)
        setVerificationError("")
      } else {
        setVerificationError(data.message || "Student ID-gan lama helin. Fadlan hubi oo mar kale isku day.")
      }
    } catch (error) {
      console.error("[v0] Error during verification:", error)
      setVerificationError("Cilad ayaa dhacday. Fadlan mar kale isku day.")
    } finally {
      setVerifying(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase()
    if (lower.includes("html") || lower.includes("css")) return Code2
    if (lower.includes("javascript") || lower.includes("react")) return Sparkles
    if (lower.includes("python") || lower.includes("database")) return BookOpen
    return TrendingUp
  }

  const getCategoryGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-orange-500 to-red-500",
      "from-green-500 to-teal-500",
      "from-indigo-500 to-blue-500",
      "from-pink-500 to-rose-500",
    ]
    return gradients[index % gradients.length]
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#013565] via-[#024a8c] to-[#013565] text-white py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#ff1b4a] rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl opacity-10"></div>
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-[#ff1b4a] rounded-full blur-3xl opacity-15 animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#ff1b4a] to-[#ff4d6d] mb-8 shadow-2xl animate-bounce">
              <Video className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
              Maktabada <span className="text-[#ff1b4a]">Muuqaalada</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 text-pretty max-w-2xl mx-auto">
              Baro xawli aad rabto oo leh nuxur muuqaal ah oo la soo koobay
            </p>

            {!selectedCategory && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Sparkles className="h-5 w-5 text-[#ff1b4a]" />
                <span className="text-sm font-medium">Dooro qaybta aad rabto inaad ka bilowdo</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {!selectedCategory ? (
            /* Category Cards - Amazing Design */
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#013565] mb-4">Dooro Qaybta</h2>
                <p className="text-gray-600 text-lg">Raadi qaybta aad wax ka baran rabto</p>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#013565]/10 animate-pulse mb-4">
                    <Video className="h-8 w-8 text-[#013565]" />
                  </div>
                  <p className="text-gray-500">Waa la soo dejinayaa qaybo...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat, index) => {
                    const Icon = getCategoryIcon(cat.category)
                    const gradient = getCategoryGradient(index)

                    return (
                      <Card
                        key={cat.category}
                        onClick={() => handleCategoryClick(cat.category)}
                        className="group cursor-pointer border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden bg-white"
                      >
                        <CardContent className="p-0">
                          {/* Gradient Header */}
                          <div className={`relative h-32 bg-gradient-to-br ${gradient} overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Icon className="h-10 w-10 text-white" />
                              </div>
                            </div>
                            {/* Floating Badge */}
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-gray-800">
                              {cat.video_count} muuqaal
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-[#013565] mb-2 group-hover:text-[#ff1b4a] transition-colors">
                              {cat.category}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">
                              {cat.video_count} muuqaal oo ku saabsan {cat.category.toLowerCase()}
                            </p>

                            <Button className="w-full bg-gradient-to-r from-[#013565] to-[#024a8c] hover:from-[#024a8c] hover:to-[#013565] text-white shadow-lg group-hover:shadow-xl transition-all">
                              <Play className="h-4 w-4 mr-2" />
                              Bilow Daawashada
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {!loading && categories.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <Video className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Qaybo lama helin</p>
                </div>
              )}
            </div>
          ) : (
            /* Videos List */
            <div className="max-w-7xl mx-auto">
              {/* Back Button & Search */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <Button
                  onClick={handleBackToCategories}
                  variant="outline"
                  className="border-[#013565] text-[#013565] hover:bg-[#013565] hover:text-white bg-transparent"
                >
                  ← Dib ugu noqo Qaybo
                </Button>

                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Raadi muuqaalada..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-[#013565] focus:ring-[#013565]/20"
                  />
                </div>
              </div>

              {/* Category Title */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-[#013565] mb-2">{selectedCategory}</h2>
                <p className="text-gray-600">{filteredVideos.length} muuqaal la helay</p>
              </div>

              {/* Videos Grid */}
              {loading ? (
                <div className="text-center py-20">
                  <p className="text-gray-500">Waa la soo dejinayaa muuqaalada...</p>
                </div>
              ) : filteredVideos.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video) => (
                    <Card
                      key={video.id}
                      onClick={() => handleVideoClick(video)}
                      className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden bg-white"
                    >
                      <CardContent className="p-0">
                        {/* Video Thumbnail */}
                        <div className="relative h-48 bg-gradient-to-br from-[#013565] to-[#024a8c] overflow-hidden">
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                              <Play className="h-8 w-8 text-white ml-1" />
                            </div>
                          </div>
                          {/* Duration Badge */}
                          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-md text-white text-xs font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {video.duration}
                          </div>
                          {/* Lock Badge */}
                          {video.access_type === "watch_universities" && (
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#ff1b4a]/90 backdrop-blur-sm rounded-md text-white text-xs font-medium flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Fasalada
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="font-bold text-lg text-[#013565] mb-2 line-clamp-2 group-hover:text-[#ff1b4a] transition-colors">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                          )}
                          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <Eye className="h-4 w-4" />
                            <span>{video.views} daawasho</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <Video className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Muuqaal lama helin</p>
                  <p className="text-gray-400 text-sm mt-1">Isku day raadin kale</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Verification Dialog */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#013565] via-[#024a8c] to-[#013565] text-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#ff1b4a] flex items-center justify-center shadow-xl">
                <Lock className="h-6 w-6 text-white" />
              </div>
              Xaqiijinta Ardayga
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <p className="text-gray-200 leading-relaxed">
              Muuqaalkan kaliya waxaa arki kara ardayda jaamacadaha. Fadlan geli Student ID-kaaga si aad u sii wado.
            </p>
            <div>
              <Label className="text-white font-semibold mb-2 block">Student ID</Label>
              <Input
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value)
                  setVerificationError("")
                }}
                placeholder="Geli Student ID-kaaga"
                onKeyPress={(e) => e.key === "Enter" && !verifying && studentId && verifyStudent()}
                className="bg-white text-gray-900 border-0 placeholder:text-gray-400 focus:ring-2 focus:ring-[#ff1b4a] h-12"
              />
              {verificationError && (
                <div className="mt-3 p-4 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-red-100 leading-relaxed">{verificationError}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVerification(false)
                  setVerificationError("")
                  setStudentId("")
                }}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50"
              >
                Jooji
              </Button>
              <Button
                onClick={verifyStudent}
                disabled={!studentId || verifying}
                className="bg-gradient-to-r from-[#ff1b4a] to-[#ff4d6d] hover:from-[#e01040] hover:to-[#ff3d5d] text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? "Waa la xaqiijinayaa..." : "Xaqiiji & Daawasho"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
