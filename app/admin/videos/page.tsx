"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video, Plus, Edit, Trash2, Play, Eye, Lock, Clock, Users, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideoData {
  id: number
  title: string
  description: string
  url: string
  duration: string
  category: string
  access_type: string
  views: number
  uploaded_at: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    duration: "",
    category: "",
    access_type: "open",
  })

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
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingVideo ? "/api/videos" : "/api/videos"
      const method = editingVideo ? "PUT" : "POST"
      const payload = editingVideo ? { ...formData, id: editingVideo.id } : formData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Video ${editingVideo ? "updated" : "created"} successfully`,
        })
        setDialogOpen(false)
        resetForm()
        fetchVideos()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const response = await fetch(`/api/videos?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Success", description: "Video deleted successfully" })
        fetchVideos()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      duration: "",
      category: "",
      access_type: "open",
    })
    setEditingVideo(null)
  }

  const openEditDialog = (video: VideoData) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      url: video.url,
      duration: video.duration,
      category: video.category,
      access_type: video.access_type || "open",
    })
    setDialogOpen(true)
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categories = Array.from(new Set(videos.map((v) => v.category)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#013565] to-[#024a8c] flex items-center justify-center shadow-lg shadow-[#013565]/25">
            <Video className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#013565]">Videos</h1>
            <p className="text-gray-500">Manage course videos and materials</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-[#ff1b4a] to-[#ff4d6d] hover:from-[#e01040] hover:to-[#ff3d5d] text-white shadow-lg shadow-[#ff1b4a]/25 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-xl font-bold text-[#013565]">
                {editingVideo ? "Edit Video" : "Post New Video"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div>
                <Label className="text-sm font-semibold text-[#013565]">Video Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to HTML"
                  required
                  className="mt-1.5 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-[#013565]">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the video content"
                  rows={3}
                  className="mt-1.5 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-[#013565]">Video URL *</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                  className="mt-1.5 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-[#013565]">Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 15:30"
                    className="mt-1.5 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-[#013565]">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-1.5 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HTML & CSS">HTML & CSS</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[#013565]">Access Type</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, access_type: "open" })}
                    className={`flex-1 p-4 border-2 rounded-xl transition-all ${
                      formData.access_type === "open"
                        ? "border-[#013565] bg-[#013565]/5 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Eye
                        className={`h-5 w-5 ${formData.access_type === "open" ? "text-[#013565]" : "text-gray-500"}`}
                      />
                      <span
                        className={`font-semibold ${formData.access_type === "open" ? "text-[#013565]" : "text-gray-700"}`}
                      >
                        Open
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Anyone can watch</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, access_type: "watch_universities" })}
                    className={`flex-1 p-4 border-2 rounded-xl transition-all ${
                      formData.access_type === "watch_universities"
                        ? "border-[#ff1b4a] bg-[#ff1b4a]/5 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Lock
                        className={`h-5 w-5 ${formData.access_type === "watch_universities" ? "text-[#ff1b4a]" : "text-gray-500"}`}
                      />
                      <span
                        className={`font-semibold ${formData.access_type === "watch_universities" ? "text-[#ff1b4a]" : "text-gray-700"}`}
                      >
                        Universities Only
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">University students only</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="px-6">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#ff1b4a] to-[#ff4d6d] hover:from-[#e01040] hover:to-[#ff3d5d] text-white px-6"
                >
                  {editingVideo ? "Update Video" : "Post Video"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
        />
      </div>

      {loading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#013565]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Video className="h-6 w-6 text-[#013565]" />
            </div>
            <p className="text-gray-500">Loading videos...</p>
          </CardContent>
        </Card>
      ) : filteredVideos.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-600">No videos found</p>
            <p className="text-sm mt-1">Try adjusting your search or add a new video</p>
          </CardContent>
        </Card>
      ) : (
        /* Enhanced video cards with modern design */
        <div className="grid gap-4">
          {filteredVideos.map((video, index) => (
            <Card
              key={video.id}
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Video thumbnail/icon section */}
                  <div className="w-48 bg-gradient-to-br from-[#013565] to-[#024a8c] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                    <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 bg-[#013565]/10 text-[#013565] rounded-md text-xs font-semibold">
                            {video.category}
                          </span>
                          {video.access_type === "watch_universities" && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-[#ff1b4a]/10 text-[#ff1b4a] rounded-md text-xs font-semibold">
                              <Lock className="h-3 w-3" />
                              Universities Only
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-[#013565] group-hover:text-[#ff1b4a] transition-colors">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{video.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {video.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {video.access_type === "open" ? "All Students" : "University Students"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(video)}
                          className="border-[#013565]/20 text-[#013565] hover:bg-[#013565] hover:text-white hover:border-[#013565]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(video.id)}
                          className="border-[#ff1b4a]/20 text-[#ff1b4a] hover:bg-[#ff1b4a] hover:text-white hover:border-[#ff1b4a]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
