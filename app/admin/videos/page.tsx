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
import { Video, Plus, Edit, Trash2, Play, Eye, Lock } from "lucide-react"
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <Video className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Videos</h1>
            <p className="text-gray-600">Manage course videos and materials</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#dc2626] hover:bg-[#b91c1c]">
              <Plus className="h-4 w-4 mr-2" />
              Post Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVideo ? "Edit Video" : "Post New Video"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Video Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to HTML"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the video content"
                  rows={3}
                />
              </div>

              <div>
                <Label>Video URL *</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 15:30"
                  />
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
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
                <Label>Access Type</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, access_type: "open" })}
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      formData.access_type === "open"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Eye
                        className={`h-5 w-5 ${formData.access_type === "open" ? "text-green-600" : "text-gray-500"}`}
                      />
                      <span
                        className={`font-medium ${formData.access_type === "open" ? "text-green-700" : "text-gray-700"}`}
                      >
                        Open
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Anyone can watch</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, access_type: "watch_universities" })}
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      formData.access_type === "watch_universities"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Lock
                        className={`h-5 w-5 ${formData.access_type === "watch_universities" ? "text-blue-600" : "text-gray-500"}`}
                      />
                      <span
                        className={`font-medium ${formData.access_type === "watch_universities" ? "text-blue-700" : "text-gray-700"}`}
                      >
                        Watch Universities
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">University students only</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#dc2626] hover:bg-[#b91c1c]">
                  {editingVideo ? "Update Video" : "Post Video"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Input
          placeholder="Search by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading videos...</p>
          </CardContent>
        </Card>
      ) : filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No videos found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Play className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-[#1e3a5f]">{video.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{video.category}</span>
                          <span>{video.duration}</span>
                          <span>{video.views} views</span>
                          {video.access_type === "watch_universities" && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Lock className="h-3 w-3" />
                              Universities Only
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {video.description && <p className="text-gray-600 text-sm mt-2 ml-15">{video.description}</p>}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(video)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
