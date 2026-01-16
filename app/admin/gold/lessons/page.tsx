"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Video,
  FileText,
  ArrowLeft,
  Play,
  Clock,
  GripVertical,
  Youtube,
  Link2,
  ExternalLink,
  Cloud,
} from "lucide-react"
import Link from "next/link"

interface Lesson {
  id: number
  level_id: number
  title: string
  lesson_type: string
  content: string
  video_url: string
  video_duration: number
  is_required: boolean
  order_index: number
  level_name: string
  track_name: string
}

interface Level {
  id: number
  name: string
  track_name: string
}

const LESSON_TYPES = [
  { value: "video", label: "Video", icon: Video },
  { value: "text", label: "Text", icon: FileText },
  { value: "mixed", label: "Video + Text", icon: BookOpen },
]

const VIDEO_SOURCES = [
  {
    value: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/watch?v=... ama https://youtu.be/...",
  },
  { value: "vimeo", label: "Vimeo", icon: Video, placeholder: "https://vimeo.com/123456789" },
  { value: "cloudflare", label: "Cloudflare Stream", icon: Cloud, placeholder: "Video ID ama https://customer-xxx.cloudflarestream.com/xxx/iframe" },
  { value: "direct", label: "Direct URL (MP4/WebM)", icon: Link2, placeholder: "https://example.com/video.mp4" },
  { value: "r2", label: "Cloudflare R2", icon: ExternalLink, placeholder: "https://pub-xxx.r2.dev/video.mp4" },
]

const detectVideoSource = (url: string): string => {
  if (!url) return "youtube"
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube"
  if (url.includes("vimeo.com")) return "vimeo"
  if (url.includes("cloudflarestream.com") || url.includes("stream.video")) return "cloudflare"
  if (url.includes("r2.dev")) return "r2"
  return "direct"
}

const getPreviewUrl = (url: string, source: string): string | null => {
  if (!url) return null

  if (source === "youtube") {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
  }

  if (source === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/)
    if (match) return `https://player.vimeo.com/video/${match[1]}`
  }

  if (source === "cloudflare") {
    // Extract video ID from Cloudflare Stream URL or use as-is if it's already an iframe URL
    if (url.includes("/iframe")) {
      return url
    }
    // If it's a full URL, extract the video ID
    const match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)/)
    if (match) {
      // Extract customer subdomain
      const customerMatch = url.match(/customer-([a-zA-Z0-9]+)\.cloudflarestream\.com/)
      if (customerMatch) {
        return `https://customer-${customerMatch[1]}.cloudflarestream.com/${match[1]}/iframe`
      }
      // If no customer subdomain, use default format
      return `https://iframe.videodelivery.net/${match[1]}`
    }
    // If it's just a video ID, construct the iframe URL
    // Note: This requires the customer subdomain, but we'll use the default format
    if (/^[a-zA-Z0-9]+$/.test(url)) {
      return `https://iframe.videodelivery.net/${url}`
    }
    return url
  }

  if (source === "direct" || source === "r2") {
    return url
  }

  return null
}

export default function LessonsManagementPage() {
  const searchParams = useSearchParams()
  const levelIdParam = searchParams.get("levelId")

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedLevelId, setSelectedLevelId] = useState<string>(levelIdParam || "")

  const [form, setForm] = useState({
    level_id: 0,
    title: "",
    lesson_type: "video",
    content: "",
    video_url: "",
    video_duration: 0,
    is_required: true,
    order_index: 0,
  })

  const [videoSource, setVideoSource] = useState<string>("youtube")
  const [showVideoPreview, setShowVideoPreview] = useState(false)

  useEffect(() => {
    fetchLevels()
  }, [])

  useEffect(() => {
    if (selectedLevelId) {
      fetchLessons(selectedLevelId)
    } else {
      fetchAllLessons()
    }
  }, [selectedLevelId])

  const fetchLevels = async () => {
    try {
      const res = await fetch("/api/gold/levels")
      const data = await res.json()
      setLevels(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching levels:", error)
      setLevels([])
    }
  }

  const fetchLessons = async (levelId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/gold/lessons?levelId=${levelId}`)
      const data = await res.json()
      setLessons(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching lessons:", error)
      setLessons([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllLessons = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/gold/lessons")
      const data = await res.json()
      setLessons(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching lessons:", error)
      setLessons([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const payload = { ...form, level_id: Number.parseInt(selectedLevelId) || form.level_id }

      if (editingLesson) {
        await fetch("/api/gold/lessons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingLesson.id }),
        })
        toast.success("Lesson updated successfully")
      } else {
        await fetch("/api/gold/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("New lesson added")
      }

      setShowDialog(false)
      setEditingLesson(null)
      setForm({
        level_id: 0,
        title: "",
        lesson_type: "video",
        content: "",
        video_url: "",
        video_duration: 0,
        is_required: true,
        order_index: 0,
      })
      if (selectedLevelId) fetchLessons(selectedLevelId)
      else fetchAllLessons()
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return
    try {
      await fetch(`/api/gold/lessons?id=${id}`, { method: "DELETE" })
      toast.success("Lesson deleted")
      if (selectedLevelId) fetchLessons(selectedLevelId)
      else fetchAllLessons()
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setForm({
      level_id: lesson.level_id,
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      video_duration: lesson.video_duration || 0,
      is_required: lesson.is_required,
      order_index: lesson.order_index,
    })
    setVideoSource(detectVideoSource(lesson.video_url || ""))
    setShowDialog(true)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/gold/tracks">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Lesson Management</h1>
              <p className="text-slate-400">Create and manage learning lessons</p>
            </div>
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              setEditingLesson(null)
              setForm({
                level_id: Number.parseInt(selectedLevelId) || 0,
                title: "",
                lesson_type: "video",
                content: "",
                video_url: "",
                video_duration: 0,
                is_required: true,
                order_index: lessons.length,
              })
              setShowDialog(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> New Lesson
          </Button>
        </div>

        {/* Level Filter */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="text-slate-300 whitespace-nowrap">Filter by Level:</Label>
              <Select value={selectedLevelId || "all"} onValueChange={(v) => setSelectedLevelId(v === "all" ? "" : v)}>
                <SelectTrigger className="w-64 bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white">
                    All Levels
                  </SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id.toString()} className="text-white">
                      {level.track_name} - {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLevelId && (
                <Button variant="ghost" className="text-slate-400" onClick={() => setSelectedLevelId("")}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Lessons ({lessons.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-slate-400 text-center py-8">Loading...</p>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No lessons yet</p>
                <Button onClick={() => setShowDialog(true)} className="bg-green-600">
                  <Plus className="h-4 w-4 mr-2" /> Add Lesson
                </Button>
              </div>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-slate-600" />
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            lesson.lesson_type === "video"
                              ? "bg-red-500/20 text-red-400"
                              : lesson.lesson_type === "text"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {getLessonTypeIcon(lesson.lesson_type)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-white flex items-center gap-2">
                          {lesson.title}
                          {lesson.is_required && (
                            <Badge className="bg-amber-500/20 text-amber-400 text-xs">Required</Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>
                            {lesson.track_name} - {lesson.level_name}
                          </span>
                          {lesson.video_duration > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {formatDuration(lesson.video_duration)}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                            {LESSON_TYPES.find((t) => t.value === lesson.lesson_type)?.label || lesson.lesson_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {lesson.video_url && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-green-400"
                          onClick={() => window.open(lesson.video_url, "_blank")}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-400 hover:text-blue-400"
                        onClick={() => openEdit(lesson)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-400 hover:text-red-400"
                        onClick={() => handleDelete(lesson.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Lesson Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Edit Lesson" : "New Lesson"}</DialogTitle>
              <DialogDescription className="text-slate-400">Enter lesson information</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="bg-slate-900">
                <TabsTrigger value="basic">Basics</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div>
                  <Label className="text-slate-300">Lesson Title</Label>
                  <Input
                    className="bg-slate-900 border-slate-600 text-white mt-1"
                    placeholder="Example: Introduction to HTML"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                {!selectedLevelId && (
                  <div>
                    <Label className="text-slate-300">Level</Label>
                    <Select
                      value={form.level_id.toString()}
                      onValueChange={(v) => setForm({ ...form, level_id: Number.parseInt(v) })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {levels.map((level) => (
                          <SelectItem key={level.id} value={level.id.toString()} className="text-white">
                            {level.track_name} - {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label className="text-slate-300">Lesson Type</Label>
                  <Select value={form.lesson_type} onValueChange={(v) => setForm({ ...form, lesson_type: v })}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {LESSON_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Order</Label>
                    <Input
                      type="number"
                      className="bg-slate-900 border-slate-600 text-white mt-1"
                      value={form.order_index}
                      onChange={(e) => setForm({ ...form, order_index: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-6">
                    <Label className="text-slate-300">Required</Label>
                    <Switch
                      checked={form.is_required}
                      onCheckedChange={(checked) => setForm({ ...form, is_required: checked })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-4">
                {(form.lesson_type === "video" || form.lesson_type === "mixed") && (
                  <>
                    <div>
                      <Label className="text-slate-300">Video Type</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {VIDEO_SOURCES.map((source) => (
                          <button
                            key={source.value}
                            type="button"
                            onClick={() => setVideoSource(source.value)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                              videoSource === source.value
                                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                : "border-slate-600 bg-slate-900 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            <source.icon className="h-5 w-5" />
                            <span className="text-xs">{source.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300">Video URL</Label>
                      <Input
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder={VIDEO_SOURCES.find((s) => s.value === videoSource)?.placeholder}
                        value={form.video_url}
                        onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {videoSource === "youtube" && "YouTube link-ka copy garee (watch page ama share link)"}
                        {videoSource === "vimeo" && "Vimeo video link-ka copy garee"}
                        {videoSource === "cloudflare" && "Cloudflare Stream Video ID ama iframe URL (tusaale: 667c06a16d082fba8138317455071200)"}
                        {videoSource === "direct" && "Direct video file URL (MP4, WebM, OGG)"}
                        {videoSource === "r2" && "Cloudflare R2 public URL"}
                      </p>
                    </div>

                    {form.video_url && (
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-600 text-slate-300 bg-transparent"
                          onClick={() => setShowVideoPreview(!showVideoPreview)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {showVideoPreview ? "Hide Preview" : "Show Preview"}
                        </Button>

                        {showVideoPreview && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-slate-600">
                            {videoSource === "youtube" || videoSource === "vimeo" || videoSource === "cloudflare" ? (
                              <iframe
                                src={getPreviewUrl(form.video_url, videoSource) || ""}
                                className="w-full aspect-video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video src={form.video_url} className="w-full aspect-video" controls />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <Label className="text-slate-300">Duration of Video (seconds)</Label>
                      <Input
                        type="number"
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder="300"
                        value={form.video_duration}
                        onChange={(e) => setForm({ ...form, video_duration: Number.parseInt(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Example: 5 minutes = 300 seconds, 10 minutes = 600 seconds
                      </p>
                    </div>
                  </>
                )}

                {(form.lesson_type === "text" || form.lesson_type === "mixed") && (
                  <div>
                    <Label className="text-slate-300">Lesson Content</Label>
                    <Textarea
                      className="bg-slate-900 border-slate-600 text-white mt-1 min-h-[200px]"
                      placeholder="Enter lesson content here..."
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 bg-transparent"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSave}>
                {editingLesson ? "Update Lesson" : "Add Lesson"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
