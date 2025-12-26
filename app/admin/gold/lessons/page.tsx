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
import { Plus, Pencil, Trash2, BookOpen, Video, FileText, ArrowLeft, Play, Clock, GripVertical } from "lucide-react"
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
  { value: "text", label: "Qoraal (Text)", icon: FileText },
  { value: "mixed", label: "Video + Qoraal", icon: BookOpen },
]

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
      setLevels(data)
    } catch (error) {
      console.error("Error fetching levels:", error)
    }
  }

  const fetchLessons = async (levelId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/gold/lessons?levelId=${levelId}`)
      const data = await res.json()
      setLessons(data)
    } catch (error) {
      console.error("Error fetching lessons:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllLessons = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/gold/lessons")
      const data = await res.json()
      setLessons(data)
    } catch (error) {
      console.error("Error fetching lessons:", error)
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
        toast.success("Casharku waa la cusboonaysiiyay")
      } else {
        await fetch("/api/gold/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Cashar cusub waa lagu daray")
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
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Ma hubtaa inaad tirtirto casharkan?")) return
    try {
      await fetch(`/api/gold/lessons?id=${id}`, { method: "DELETE" })
      toast.success("Casharku waa la tirtiray")
      if (selectedLevelId) fetchLessons(selectedLevelId)
      else fetchAllLessons()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
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
              <h1 className="text-2xl font-bold text-white">Maamulka Casharka</h1>
              <p className="text-slate-400">Abuur iyo maamul casharka waxbarashada</p>
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
            <Plus className="h-4 w-4 mr-2" /> Cashar Cusub
          </Button>
        </div>

        {/* Level Filter */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="text-slate-300 whitespace-nowrap">Filter by Level:</Label>
              <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
                <SelectTrigger className="w-64 bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Dhammaan Levels" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="" className="text-white">
                    Dhammaan Levels
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
              <BookOpen className="h-5 w-5" /> Casharka ({lessons.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-slate-400 text-center py-8">Loading...</p>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Wali ma jiro cashar</p>
                <Button onClick={() => setShowDialog(true)} className="bg-green-600">
                  <Plus className="h-4 w-4 mr-2" /> Ku Dar Cashar
                </Button>
              </div>
            ) : (
              lessons.map((lesson, index) => (
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
                            <Badge className="bg-amber-500/20 text-amber-400 text-xs">Waajib</Badge>
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
              <DialogTitle>{editingLesson ? "Wax ka Bedel Cashar" : "Cashar Cusub"}</DialogTitle>
              <DialogDescription className="text-slate-400">Geli macluumaadka casharka</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="bg-slate-900">
                <TabsTrigger value="basic">Aasaaska</TabsTrigger>
                <TabsTrigger value="content">Nuxurka</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div>
                  <Label className="text-slate-300">Cinwaanka Casharka</Label>
                  <Input
                    className="bg-slate-900 border-slate-600 text-white mt-1"
                    placeholder="Tusaale: Hordhac HTML"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                {!selectedLevelId && (
                  <div>
                    <Label className="text-slate-300">Level-ka</Label>
                    <Select
                      value={form.level_id.toString()}
                      onValueChange={(v) => setForm({ ...form, level_id: Number.parseInt(v) })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                        <SelectValue placeholder="Dooro Level" />
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
                  <Label className="text-slate-300">Nooca Casharka</Label>
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
                    <Label className="text-slate-300">Tartibka (Order)</Label>
                    <Input
                      type="number"
                      className="bg-slate-900 border-slate-600 text-white mt-1"
                      value={form.order_index}
                      onChange={(e) => setForm({ ...form, order_index: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-6">
                    <Label className="text-slate-300">Waajib (Required)</Label>
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
                      <Label className="text-slate-300">Video URL</Label>
                      <Input
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder="https://..."
                        value={form.video_url}
                        onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Dhererka Video-ga (seconds)</Label>
                      <Input
                        type="number"
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder="300"
                        value={form.video_duration}
                        onChange={(e) => setForm({ ...form, video_duration: Number.parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </>
                )}

                {(form.lesson_type === "text" || form.lesson_type === "mixed") && (
                  <div>
                    <Label className="text-slate-300">Qoraalka Casharka</Label>
                    <Textarea
                      className="bg-slate-900 border-slate-600 text-white mt-1 min-h-[200px]"
                      placeholder="Qor nuxurka casharka halkan..."
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
                Ka Noqo
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSave}>
                {editingLesson ? "Kaydi Isbedelka" : "Abuur Cashar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
