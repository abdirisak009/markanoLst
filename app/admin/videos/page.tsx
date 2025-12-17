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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Video,
  Plus,
  Edit,
  Trash2,
  Play,
  Eye,
  Lock,
  Clock,
  Users,
  Search,
  Building2,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
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
  class_access?: { class_id: number; university_id: number }[]
}

interface University {
  id: number
  name: string
  abbreviation: string
}

interface Class {
  id: number
  name: string
  university_id: number
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    duration: "",
    category: "",
    access_type: "open",
  })

  // University & Class selection state
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null)
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([])
  const [expandedUniversities, setExpandedUniversities] = useState<number[]>([])

  useEffect(() => {
    fetchVideos()
    fetchUniversities()
    fetchClasses()
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

  const fetchUniversities = async () => {
    try {
      const response = await fetch("/api/universities")
      const data = await response.json()
      console.log("[v0] Universities fetched:", data)
      setUniversities(data)
    } catch (error) {
      console.error("Error fetching universities:", error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      console.log("[v0] Classes fetched:", data)
      setClasses(data)
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const getClassesForUniversity = (universityId: number) => {
    return classes.filter((c) => c.university_id === universityId)
  }

  const toggleUniversityExpand = (universityId: number) => {
    setExpandedUniversities((prev) =>
      prev.includes(universityId) ? prev.filter((id) => id !== universityId) : [...prev, universityId],
    )
  }

  const toggleClassSelection = (classId: number, universityId: number) => {
    setSelectedClassIds((prev) => {
      // Ensure prev is always an array
      const currentIds = Array.isArray(prev) ? prev : []
      if (currentIds.includes(classId)) {
        return currentIds.filter((id) => id !== classId)
      } else {
        return [...currentIds, classId]
      }
    })
  }

  const selectAllClassesForUniversity = (universityId: number) => {
    const universityClasses = getClassesForUniversity(universityId)
    const currentIds = Array.isArray(selectedClassIds) ? selectedClassIds : []
    const allSelected = universityClasses.every((c) => currentIds.includes(c.id))

    if (allSelected) {
      // Deselect all
      setSelectedClassIds((prev) => {
        const prevIds = Array.isArray(prev) ? prev : []
        return prevIds.filter((id) => !universityClasses.map((c) => c.id).includes(id))
      })
    } else {
      // Select all
      const newIds = universityClasses.map((c) => c.id).filter((id) => !currentIds.includes(id))
      setSelectedClassIds((prev) => {
        const prevIds = Array.isArray(prev) ? prev : []
        return [...prevIds, ...newIds]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation for universities access type
    if (formData.access_type === "watch_universities" && selectedClassIds.length === 0) {
      toast({
        title: "Khalad",
        description: "Fadlan dooro ugu yaraan hal fasal",
        variant: "destructive",
      })
      return
    }

    try {
      const payload = {
        ...formData,
        id: editingVideo?.id,
        class_access:
          formData.access_type === "watch_universities"
            ? selectedClassIds.map((classId) => {
                const classItem = classes.find((c) => c.id === classId)
                return {
                  class_id: classId,
                  university_id: classItem?.university_id,
                }
              })
            : [],
      }

      const response = await fetch("/api/videos", {
        method: editingVideo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Guul",
          description: `Video-ga ${editingVideo ? "waa la cusbooneysiiyey" : "waa la keydiyey"} si guul leh`,
        })
        setDialogOpen(false)
        resetForm()
        fetchVideos()
      }
    } catch (error) {
      toast({
        title: "Khalad",
        description: "Waa la waayey in video-ga la keydiyo",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Ma hubtaa inaad tirtireyso video-gan?")) return

    try {
      const response = await fetch(`/api/videos?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Guul", description: "Video-ga waa la tirtiray" })
        fetchVideos()
      }
    } catch (error) {
      toast({
        title: "Khalad",
        description: "Waa la waayey in video-ga la tirtiro",
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
    setSelectedClassIds([])
    setExpandedUniversities([])
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
    // Load existing class access if any
    if (video.class_access) {
      setSelectedClassIds(video.class_access.map((ca) => ca.class_id))
      const uniIds = [...new Set(video.class_access.map((ca) => ca.university_id))]
      setExpandedUniversities(uniIds)
    }
    setDialogOpen(true)
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getSelectedClassCount = (universityId: number) => {
    const universityClasses = getClassesForUniversity(universityId)
    return universityClasses.filter((c) => selectedClassIds.includes(c.id)).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#013565] to-[#024a8c] flex items-center justify-center shadow-lg shadow-[#013565]/25">
            <Video className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#013565]">Muuqaalada</h1>
            <p className="text-gray-500">Maamul muuqaalada koorsada</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-[#ff1b4a] to-[#ff4d6d] hover:from-[#e01040] hover:to-[#ff3d5d] text-white shadow-lg shadow-[#ff1b4a]/25 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Kudar Muuqaal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-xl font-bold text-[#013565]">
                {editingVideo ? "Wax ka Bedel Muuqaalka" : "Kudar Muuqaal Cusub"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div>
                <Label className="text-sm font-semibold text-[#013565]">Cinwaanka Muuqaalka *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="tusaale., Hordhac HTML"
                  required
                  className="mt-1.5 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-[#013565]">Faahfaahin</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Faahfaahin kooban oo ku saabsan muuqaalka"
                  rows={3}
                  className="mt-1.5 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-[#013565]">URL-ka Muuqaalka *</Label>
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
                  <Label className="text-sm font-semibold text-[#013565]">Muddada</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="tusaale., 15:30"
                    className="mt-1.5 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-[#013565]">Qaybta *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-1.5 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20">
                      <SelectValue placeholder="Dooro qaybta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HTML & CSS">HTML & CSS</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Other">Kale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Access Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[#013565]">Nooca Gelitaanka</Label>
                {/* Debug info */}
                <p className="text-xs text-gray-400">Current access_type: {formData.access_type}</p>
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
                        Furan
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Qof walba wuu daawan karaa</p>
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
                        Fasalada Gaar ah
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Kaliya ardayda dooratay</p>
                  </button>
                </div>
              </div>

              {/* University & Class Selection - Only show when access_type is watch_universities */}
              {formData.access_type === "watch_universities" && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#013565]" />
                      <Label className="text-sm font-semibold text-[#013565]">Dooro Fasalada</Label>
                    </div>
                    {selectedClassIds.length > 0 && (
                      <span className="px-3 py-1 bg-[#ff1b4a] text-white text-xs font-semibold rounded-full">
                        {selectedClassIds.length} fasal la doortay
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {universities.map((university) => {
                      const universityClasses = getClassesForUniversity(university.id)
                      const selectedCount = getSelectedClassCount(university.id)
                      const isExpanded = expandedUniversities.includes(university.id)
                      const allSelected =
                        universityClasses.length > 0 && universityClasses.every((c) => selectedClassIds.includes(c.id))

                      return (
                        <div key={university.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          {/* University Header */}
                          <div
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleUniversityExpand(university.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#013565] to-[#024a8c] flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-[#013565]">{university.name}</p>
                                <p className="text-xs text-gray-500">{universityClasses.length} fasal</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {selectedCount > 0 && (
                                <span className="px-2 py-0.5 bg-[#013565]/10 text-[#013565] text-xs font-medium rounded">
                                  {selectedCount} la doortay
                                </span>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Classes List */}
                          {isExpanded && universityClasses.length > 0 && (
                            <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                              {/* Select All Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectAllClassesForUniversity(university.id)
                                }}
                                className={`w-full mb-3 p-2 rounded-lg border-2 border-dashed transition-all text-sm font-medium ${
                                  allSelected
                                    ? "border-[#ff1b4a] bg-[#ff1b4a]/5 text-[#ff1b4a]"
                                    : "border-gray-300 hover:border-[#013565] text-gray-600 hover:text-[#013565]"
                                }`}
                              >
                                {allSelected ? "Ka saar Dhammaan" : "Dooro Dhammaan Fasalada"}
                              </button>

                              <div className="grid grid-cols-2 gap-2">
                                {universityClasses.map((classItem) => {
                                  const isSelected = selectedClassIds.includes(classItem.id)
                                  return (
                                    <div
                                      key={classItem.id}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleClassSelection(classItem.id, university.id)
                                      }}
                                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                        isSelected
                                          ? "border-[#ff1b4a] bg-[#ff1b4a]/10"
                                          : "border-gray-200 hover:border-[#013565]/50 bg-white"
                                      }`}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        className={
                                          isSelected ? "border-[#ff1b4a] data-[state=checked]:bg-[#ff1b4a]" : ""
                                        }
                                      />
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <GraduationCap
                                          className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-[#ff1b4a]" : "text-gray-400"}`}
                                        />
                                        <span
                                          className={`text-sm truncate ${isSelected ? "font-medium text-[#ff1b4a]" : "text-gray-700"}`}
                                        >
                                          {classItem.name}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="px-6">
                  Jooji
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#ff1b4a] to-[#ff4d6d] hover:from-[#e01040] hover:to-[#ff3d5d] text-white px-6"
                >
                  {editingVideo ? "Cusboonaysii" : "Kaydi Muuqaalka"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Raadi cinwaan ama qayb..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
        />
      </div>

      {/* Videos List */}
      {loading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#013565]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Video className="h-6 w-6 text-[#013565]" />
            </div>
            <p className="text-gray-500">Waa la soo dejinayaa...</p>
          </CardContent>
        </Card>
      ) : filteredVideos.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-600">Muuqaal lama helin</p>
            <p className="text-sm mt-1">Isku day raadin kale ama kudar muuqaal cusub</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVideos.map((video) => (
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
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-[#013565]/10 text-[#013565] rounded-md text-xs font-semibold">
                            {video.category}
                          </span>
                          {video.access_type === "watch_universities" && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-[#ff1b4a]/10 text-[#ff1b4a] rounded-md text-xs font-semibold">
                              <Lock className="h-3 w-3" />
                              Fasalada Gaar ah
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
                            {video.views} daawasho
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {video.access_type === "open" ? "Dhammaan Ardayda" : "Ardayda Jaamacadaha"}
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
