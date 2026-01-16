"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, BookOpen, Award, ChevronRight, ArrowLeft, Layers, GripVertical, PlayCircle, Search, Filter, X } from "lucide-react"
import Link from "next/link"

interface Track {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  color: string
  estimated_duration?: string
  start_date?: string
  end_date?: string
  is_active: boolean
  order_index: number
  levels_count: number
  lessons_count: number
  enrolled_students: number
}

interface Module {
  id: number
  track_id: number
  name: string
  description: string
  order_index: number
  is_active: boolean
  levels_count: number
  lessons_count: number
}

interface Level {
  id: number
  track_id: number
  module_id: number | null
  name: string
  description: string
  order_index: number
  is_active: boolean
  lessons_count: number
  exercises_count: number
}

const ICONS = ["BookOpen", "Code", "Palette", "TrendingUp", "Globe", "Briefcase", "Heart", "Star"]
const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#6366F1"]

export default function TracksManagementPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrackDialog, setShowTrackDialog] = useState(false)
  const [showModuleDialog, setShowModuleDialog] = useState(false)
  const [showLevelDialog, setShowLevelDialog] = useState(false)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  
  // Search and Filter States
  const [trackSearch, setTrackSearch] = useState("")
  const [levelSearch, setLevelSearch] = useState("")
  const [trackFilter, setTrackFilter] = useState<"all" | "active" | "inactive">("all")
  const [levelFilter, setLevelFilter] = useState<"all" | "active" | "inactive">("all")

  const [trackForm, setTrackForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "BookOpen",
    color: "#3B82F6",
    start_date: "",
    end_date: "",
    is_active: true,
    order_index: 0,
  })

  const [moduleForm, setModuleForm] = useState({
    track_id: 0,
    name: "",
    description: "",
    order_index: 0,
    is_active: true,
  })

  const [levelForm, setLevelForm] = useState({
    track_id: 0,
    module_id: 0,
    name: "",
    description: "",
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchTracks()
  }, [])

  useEffect(() => {
    if (selectedTrack) {
      fetchLevels(selectedTrack.id)
    } else {
      setLevels([])
    }
  }, [selectedTrack])

  const fetchLevels = async (trackId: number) => {
    try {
      const response = await fetch(`/api/gold/levels?trackId=${trackId}`)
      const data = await response.json()
      setLevels(data.filter((l: Level) => !l.module_id)) // Only levels directly under track
    } catch (error) {
      console.error("Error fetching levels:", error)
      setLevels([])
    }
  }

  useEffect(() => {
    if (selectedTrack) {
      fetchLevels(selectedTrack.id)
    } else {
      setLevels([])
    }
  }, [selectedTrack])

  const fetchTracks = async () => {
    try {
      const res = await fetch("/api/gold/tracks")
      const data = await res.json()
      setTracks(data)
    } catch (error) {
      console.error("Error fetching tracks:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const fetchModules = async (trackId: number) => {
    try {
      const res = await fetch(`/api/gold/modules?trackId=${trackId}`)
      const data = await res.json()
      setModules(data)
    } catch (error) {
      console.error("Error fetching modules:", error)
    }
  }

  // Filtered tracks
  const filteredTracks = tracks.filter((track) => {
    const matchesSearch = track.name.toLowerCase().includes(trackSearch.toLowerCase()) ||
                         (track.description || "").toLowerCase().includes(trackSearch.toLowerCase())
    const matchesFilter = trackFilter === "all" || 
                         (trackFilter === "active" && track.is_active) ||
                         (trackFilter === "inactive" && !track.is_active)
    return matchesSearch && matchesFilter
  })

  // Filtered levels
  const filteredLevels = levels.filter((level) => {
    if (!selectedTrack || level.track_id !== selectedTrack.id) return false
    if (level.module_id) return false // Only show levels directly under track
    const matchesSearch = level.name.toLowerCase().includes(levelSearch.toLowerCase()) ||
                         (level.description || "").toLowerCase().includes(levelSearch.toLowerCase())
    const matchesFilter = levelFilter === "all" || 
                         (levelFilter === "active" && level.is_active) ||
                         (levelFilter === "inactive" && !level.is_active)
    return matchesSearch && matchesFilter
  })

  const fetchLessons = async (trackId: number) => {
    try {
      const res = await fetch("/api/gold/lessons")
      const data = await res.json()
      // Filter lessons for this track's modules
      const moduleIds = modules.map((m) => m.id)
      const trackLessons = data.filter((lesson: any) => 
        lesson.module_id && moduleIds.includes(lesson.module_id)
      )
      setLessons(trackLessons)
    } catch (error) {
      console.error("Error fetching lessons:", error)
      setLessons([])
    }
  }

  const handleSaveTrack = async () => {
    try {
      const slug = trackForm.slug || trackForm.name.toLowerCase().replace(/\s+/g, "-")
      const payload = { ...trackForm, slug }

      if (editingTrack) {
        await fetch("/api/gold/tracks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingTrack.id }),
        })
        toast.success("Track waa la cusboonaysiiyay")
      } else {
        await fetch("/api/gold/tracks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Track cusub waa lagu daray")
      }

      setShowTrackDialog(false)
      setEditingTrack(null)
      setTrackForm({
        name: "",
        slug: "",
        description: "",
        icon: "BookOpen",
        color: "#3B82F6",
        start_date: "",
        end_date: "",
        is_active: true,
        order_index: 0,
      })
      fetchTracks()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleSaveLevel = async () => {
    try {
      const payload = { ...levelForm, track_id: selectedTrack?.id }

      if (editingLevel) {
        await fetch("/api/gold/levels", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingLevel.id }),
        })
        toast.success("Level waa la cusboonaysiiyay")
      } else {
        await fetch("/api/gold/levels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Level cusub waa lagu daray")
      }

      setShowLevelDialog(false)
      setEditingLevel(null)
      setLevelForm({ track_id: 0, name: "", description: "", order_index: 0, is_active: true })
      if (selectedTrack) fetchLevels(selectedTrack.id)
      fetchTracks()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleDeleteTrack = async (id: number) => {
    if (!confirm("Ma hubtaa inaad tirtirto track-kan?")) return
    try {
      await fetch(`/api/gold/tracks?id=${id}`, { method: "DELETE" })
      toast.success("Track waa la tirtiray")
      fetchTracks()
      if (selectedTrack?.id === id) setSelectedTrack(null)
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleDeleteLevel = async (id: number) => {
    if (!confirm("Ma hubtaa inaad tirtirto level-kan?")) return
    try {
      await fetch(`/api/gold/levels?id=${id}`, { method: "DELETE" })
      toast.success("Level waa la tirtiray")
      if (selectedTrack) fetchLevels(selectedTrack.id)
      fetchTracks()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const openEditTrack = (track: Track) => {
    setEditingTrack(track)
    setTrackForm({
      name: track.name,
      slug: track.slug,
      description: track.description || "",
      icon: track.icon || "BookOpen",
      color: track.color || "#3B82F6",
      start_date: track.start_date || "",
      end_date: track.end_date || "",
      is_active: track.is_active,
      order_index: track.order_index,
    })
    setShowTrackDialog(true)
  }

  const openEditLevel = (level: Level) => {
    setEditingLevel(level)
    setLevelForm({
      track_id: level.track_id,
      name: level.name,
      description: level.description || "",
      order_index: level.order_index,
      is_active: level.is_active,
    })
    setShowLevelDialog(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/gold">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Tracks & Modules</h1>
                <p className="text-gray-600">Manage learning tracks and their modules</p>
            </div>
          </div>
          <Button
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium shadow-sm hover:shadow-md transition-all rounded-lg px-5"
            onClick={() => {
              setEditingTrack(null)
              setTrackForm({
                name: "",
                slug: "",
                description: "",
                icon: "BookOpen",
                  color: "#DC2626",
                  start_date: "",
                  end_date: "",
                is_active: true,
                order_index: tracks.length,
              })
              setShowTrackDialog(true)
            }}
          >
              <Plus className="h-4 w-4 mr-2" /> Add Track
          </Button>
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel: Tracks List */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Layers className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-lg font-semibold flex items-center gap-2">
                      Tracks
                      <Badge className="bg-gray-100 text-gray-700 border-0 font-medium">
                        {filteredTracks.length}{tracks.length !== filteredTracks.length && ` / ${tracks.length}`}
                      </Badge>
              </CardTitle>
                    <CardDescription className="text-gray-600 text-sm mt-0.5">
                      Select a track to view its modules
                    </CardDescription>
                  </div>
                </div>
              </div>
              
              {/* Search and Filter for Tracks */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tracks..."
                    value={trackSearch}
                    onChange={(e) => setTrackSearch(e.target.value)}
                    className="pl-10 pr-10 bg-white border-gray-300 focus:border-[#DC2626] focus:ring-[#DC2626] rounded-lg"
                  />
                  {trackSearch && (
                    <button
                      onClick={() => setTrackSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2 flex-1">
                    <Button
                      variant={trackFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTrackFilter("all")}
                      className={`text-xs rounded-lg ${trackFilter === "all" ? "bg-[#DC2626] text-white hover:bg-[#B91C1C]" : "border-gray-300"}`}
                    >
                      All
                    </Button>
                    <Button
                      variant={trackFilter === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTrackFilter("active")}
                      className={`text-xs rounded-lg ${trackFilter === "active" ? "bg-green-600 text-white hover:bg-green-700" : "border-gray-300"}`}
                    >
                      Active
                    </Button>
                    <Button
                      variant={trackFilter === "inactive" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTrackFilter("inactive")}
                      className={`text-xs rounded-lg ${trackFilter === "inactive" ? "bg-gray-600 text-white hover:bg-gray-700" : "border-gray-300"}`}
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-[#DC2626]"></div>
                </div>
              ) : tracks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4 font-medium">No tracks yet</p>
                  <Button 
                    onClick={() => setShowTrackDialog(true)} 
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Track
                  </Button>
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No tracks found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter</p>
                </div>
              ) : (
                filteredTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer bg-white ${
                      selectedTrack?.id === track.id
                        ? "border-[#DC2626] border-l-4 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: track.color + "15",
                            border: `2px solid ${track.color}30`
                          }}
                        >
                          <BookOpen className="h-6 w-6" style={{ color: track.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-base truncate">
                            {track.name}
                            </h3>
                            {!track.is_active && (
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1 mb-3">{track.description || "No description"}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="font-medium">{track.levels_count || 0} Levels</span>
                            <span className="font-medium">{track.lessons_count || 0} Lessons</span>
                            <span className="font-medium">{track.enrolled_students || 0} Students</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditTrack(track)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTrack(track.id)
                          }}
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

          {/* Right Panel: Levels List */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Layers className="h-5 w-5 text-gray-700" />
                  </div>
              <div>
                    <CardTitle className="text-gray-900 text-lg font-semibold flex items-center gap-2">
                  {selectedTrack ? `Levels - ${selectedTrack.name}` : "Levels"}
                      {selectedTrack && levels.length > 0 && (
                        <Badge className="bg-gray-100 text-gray-700 border-0 font-medium">
                          {levels.filter((l) => !l.module_id && l.track_id === selectedTrack.id).length}
                        </Badge>
                      )}
                </CardTitle>
                    <CardDescription className="text-gray-600 text-sm mt-0.5">
                      {selectedTrack ? "Manage levels for this track. Click a level to view its modules" : "Select a track to view its levels"}
                </CardDescription>
                  </div>
              </div>
              {selectedTrack && (
                <Button
                  size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm rounded-lg px-4"
                  onClick={() => {
                    setEditingLevel(null)
                    setLevelForm({
                      track_id: selectedTrack.id,
                        module_id: 0,
                      name: "",
                      description: "",
                        order_index: levels.filter((l) => l.track_id === selectedTrack.id).length,
                      is_active: true,
                    })
                    setShowLevelDialog(true)
                  }}
                >
                    <Plus className="h-4 w-4 mr-1.5" /> Add Level
                  </Button>
                )}
              </div>
              
              {/* Search and Filter for Levels */}
              {selectedTrack && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search levels..."
                      value={levelSearch}
                      onChange={(e) => setLevelSearch(e.target.value)}
                      className="pl-10 pr-10 bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg"
                    />
                    {levelSearch && (
                      <button
                        onClick={() => setLevelSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant={levelFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLevelFilter("all")}
                        className={`text-xs rounded-lg ${levelFilter === "all" ? "bg-amber-500 text-white hover:bg-amber-600" : "border-gray-300"}`}
                      >
                        All
                      </Button>
                      <Button
                        variant={levelFilter === "active" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLevelFilter("active")}
                        className={`text-xs rounded-lg ${levelFilter === "active" ? "bg-green-600 text-white hover:bg-green-700" : "border-gray-300"}`}
                      >
                        Active
                      </Button>
                      <Button
                        variant={levelFilter === "inactive" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLevelFilter("inactive")}
                        className={`text-xs rounded-lg ${levelFilter === "inactive" ? "bg-gray-600 text-white hover:bg-gray-700" : "border-gray-300"}`}
                      >
                        Inactive
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {!selectedTrack ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Select a track to view its levels</p>
                </div>
              ) : filteredLevels.length === 0 && levels.filter((l) => l.track_id === selectedTrack.id && !l.module_id).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4 font-medium">No levels yet</p>
                  <p className="text-gray-500 text-sm mb-4">Create your first level, then add modules to it</p>
                  <Button
                    onClick={() => {
                      setEditingLevel(null)
                      setLevelForm({
                        track_id: selectedTrack.id,
                        module_id: 0,
                        name: "",
                        description: "",
                        order_index: 0,
                        is_active: true,
                      })
                      setShowLevelDialog(true)
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Level
                  </Button>
                </div>
              ) : filteredLevels.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No levels found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter</p>
                </div>
              ) : (
                filteredLevels.map((level, index) => {
                  return (
                  <div
                    key={level.id}
                    className="group relative p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      // Navigate to track detail page to see modules for this level
                      window.location.href = `/admin/gold/tracks/${selectedTrack?.id}`
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-white"
                            style={{ backgroundColor: selectedTrack?.color || "#F59E0B" }}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-base truncate">
                              {level.name}
                            </h3>
                            <Badge className="bg-amber-500/10 text-amber-700 text-xs border-0 font-medium">
                              Level
                            </Badge>
                            {!level.is_active && (
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1 mb-2">{level.description || "No description"}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="font-medium">{level.lessons_count || 0} Lessons</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/admin/gold/tracks/${selectedTrack?.id}`}>
                          <Button 
                            size="icon"
                            variant="ghost" 
                            className="h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => {
                            setEditingLevel(level)
                            setLevelForm({
                              track_id: level.track_id,
                              module_id: level.module_id || 0,
                              name: level.name,
                              description: level.description || "",
                              order_index: level.order_index,
                              is_active: level.is_active,
                            })
                            setShowLevelDialog(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          onClick={() => {
                            if (confirm("Ma hubtaa? Dhammaan modules-ka iyo lessons-ka level-kan waa la tirtiri doonaa.")) {
                              handleDeleteLevel(level.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Track Dialog */}
        <Dialog open={showTrackDialog} onOpenChange={setShowTrackDialog}>
          <DialogContent className="bg-white border-gray-200 max-w-lg rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-semibold">
                {editingTrack ? "Edit Track" : "Add New Track"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">Enter track information</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Track Name *</Label>
                <Input
                  className="bg-white border-gray-300 text-gray-900 focus:border-[#DC2626] focus:ring-[#DC2626] rounded-lg"
                  placeholder="e.g., Web Development"
                  value={trackForm.name}
                  onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Description</Label>
                <Textarea
                  className="bg-white border-gray-300 text-gray-900 focus:border-[#DC2626] focus:ring-[#DC2626] rounded-lg"
                  placeholder="Describe what this track covers..."
                  value={trackForm.description}
                  onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium mb-2 block">Taarikhda u Bilaabanayo *</Label>
                  <Input
                    type="date"
                    className="bg-white border-gray-300 text-gray-900 focus:border-[#DC2626] focus:ring-[#DC2626] rounded-lg"
                    value={trackForm.start_date}
                    onChange={(e) => setTrackForm({ ...trackForm, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-medium mb-2 block">Taarikhda uu Dhamanayo *</Label>
                  <Input
                    type="date"
                    className="bg-white border-gray-300 text-gray-900 focus:border-[#DC2626] focus:ring-[#DC2626] rounded-lg"
                    value={trackForm.end_date}
                    onChange={(e) => setTrackForm({ ...trackForm, end_date: e.target.value })}
                    min={trackForm.start_date || undefined}
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Color</Label>
                  <div className="flex gap-2 mt-1">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                      className={`w-9 h-9 rounded-lg transition-all border-2 ${
                        trackForm.color === color 
                          ? "ring-2 ring-[#DC2626] ring-offset-2 scale-110" 
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTrackForm({ ...trackForm, color })}
                      />
                    ))}
                  </div>
                </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="text-gray-700 font-medium">Active</Label>
                <Switch
                  checked={trackForm.is_active}
                  onCheckedChange={(checked) => setTrackForm({ ...trackForm, is_active: checked })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setShowTrackDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg" 
                  onClick={handleSaveTrack}
                >
                  {editingTrack ? "Save Changes" : "Create Track"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Module Dialog */}
        <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
          <DialogContent className="bg-white border-gray-200 max-w-lg rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-semibold">
                {editingModule ? "Edit Module" : "Add New Module"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">Enter module information</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Module Name *</Label>
                <Input
                  className="bg-white border-gray-300 text-gray-900 focus:border-[#1E40AF] focus:ring-[#1E40AF] rounded-lg"
                  placeholder="e.g., Module 1 - Fundamentals"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Description</Label>
                <Textarea
                  className="bg-white border-gray-300 text-gray-900 focus:border-[#1E40AF] focus:ring-[#1E40AF] rounded-lg"
                  placeholder="Describe what this module covers..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Order</Label>
                <Input
                  type="number"
                  className="bg-white border-gray-300 text-gray-900 focus:border-[#1E40AF] focus:ring-[#1E40AF] rounded-lg"
                  value={moduleForm.order_index}
                  onChange={(e) => setModuleForm({ ...moduleForm, order_index: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="text-gray-700 font-medium">Active</Label>
                <Switch
                  checked={moduleForm.is_active}
                  onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_active: checked })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setShowModuleDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-lg"
                  onClick={async () => {
                    try {
                      const payload = { ...moduleForm, track_id: selectedTrack?.id }

                      if (editingModule) {
                        await fetch("/api/gold/modules", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...payload, id: editingModule.id }),
                        })
                        toast.success("Module updated successfully")
                      } else {
                        await fetch("/api/gold/modules", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        })
                        toast.success("Module created successfully")
                      }

                      setShowModuleDialog(false)
                      setEditingModule(null)
                      setModuleForm({ track_id: 0, name: "", description: "", order_index: 0, is_active: true })
                      if (selectedTrack) fetchModules(selectedTrack.id)
                      fetchTracks()
                    } catch (error) {
                      toast.error("An error occurred")
                    }
                  }}
                >
                  {editingModule ? "Save Changes" : "Create Module"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Level Dialog */}
        <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLevel ? "Wax ka Bedel Level" : "Level Cusub"}</DialogTitle>
              <DialogDescription className="text-slate-400">Geli macluumaadka level-ka</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Magaca Level-ka</Label>
                <Input
                  className="bg-slate-900 border-slate-600 text-white mt-1"
                  placeholder="Tusaale: Level 1 - Aasaaska"
                  value={levelForm.name}
                  onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-slate-300">Sharaxaad</Label>
                <Textarea
                  className="bg-slate-900 border-slate-600 text-white mt-1"
                  placeholder="Sharax waxa level-ku ku saabsan yahay..."
                  value={levelForm.description}
                  onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-slate-300">Tartibka (Order)</Label>
                <Input
                  type="number"
                  className="bg-slate-900 border-slate-600 text-white mt-1"
                  value={levelForm.order_index}
                  onChange={(e) => setLevelForm({ ...levelForm, order_index: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Shaqeynayo</Label>
                <Switch
                  checked={levelForm.is_active}
                  onCheckedChange={(checked) => setLevelForm({ ...levelForm, is_active: checked })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 bg-transparent"
                  onClick={() => setShowLevelDialog(false)}
                >
                  Ka Noqo
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleSaveLevel}>
                  {editingLevel ? "Kaydi Isbedelka" : "Abuur Level"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
