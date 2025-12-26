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
import { Plus, Pencil, Trash2, BookOpen, Award, ChevronRight, ArrowLeft, Layers, GripVertical } from "lucide-react"
import Link from "next/link"

interface Track {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  color: string
  estimated_duration: string
  is_active: boolean
  order_index: number
  levels_count: number
  lessons_count: number
  enrolled_students: number
}

interface Level {
  id: number
  track_id: number
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
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrackDialog, setShowTrackDialog] = useState(false)
  const [showLevelDialog, setShowLevelDialog] = useState(false)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

  const [trackForm, setTrackForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "BookOpen",
    color: "#3B82F6",
    estimated_duration: "",
    is_active: true,
    order_index: 0,
  })

  const [levelForm, setLevelForm] = useState({
    track_id: 0,
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

  const fetchLevels = async (trackId: number) => {
    try {
      const res = await fetch(`/api/gold/levels?trackId=${trackId}`)
      const data = await res.json()
      setLevels(data)
    } catch (error) {
      console.error("Error fetching levels:", error)
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
        estimated_duration: "",
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
      estimated_duration: track.estimated_duration || "",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/gold">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Maamulka Tracks & Levels</h1>
              <p className="text-slate-400">Abuur iyo maamul waddooyinka waxbarashada</p>
            </div>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingTrack(null)
              setTrackForm({
                name: "",
                slug: "",
                description: "",
                icon: "BookOpen",
                color: "#3B82F6",
                estimated_duration: "",
                is_active: true,
                order_index: tracks.length,
              })
              setShowTrackDialog(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Track Cusub
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tracks List */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="h-5 w-5" /> Tracks ({tracks.length})
              </CardTitle>
              <CardDescription className="text-slate-400">Guji track si aad u aragto levels-kiisa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-slate-400 text-center py-8">Loading...</p>
              ) : tracks.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">Wali ma jiro track</p>
                  <Button onClick={() => setShowTrackDialog(true)} className="bg-blue-600">
                    <Plus className="h-4 w-4 mr-2" /> Ku Dar Track
                  </Button>
                </div>
              ) : (
                tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedTrack?.id === track.id
                        ? "bg-slate-700/50 border-blue-500"
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                    }`}
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: track.color + "20", color: track.color }}
                        >
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white flex items-center gap-2">
                            {track.name}
                            {!track.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-1">{track.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{track.levels_count || 0} Levels</span>
                            <span>{track.lessons_count || 0} Lessons</span>
                            <span>{track.enrolled_students || 0} Ardayda</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-blue-400"
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
                          className="text-slate-400 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTrack(track.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Levels List */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {selectedTrack ? `Levels - ${selectedTrack.name}` : "Levels"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {selectedTrack ? "Maamul levels-ka track-kan" : "Dooro track si aad u aragto levels-kiisa"}
                </CardDescription>
              </div>
              {selectedTrack && (
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setEditingLevel(null)
                    setLevelForm({
                      track_id: selectedTrack.id,
                      name: "",
                      description: "",
                      order_index: levels.length,
                      is_active: true,
                    })
                    setShowLevelDialog(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Level
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {!selectedTrack ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Dooro track bidix si aad u aragto levels-kiisa</p>
                </div>
              ) : levels.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">Track-kan wali ma leh levels</p>
                  <Button
                    onClick={() => {
                      setEditingLevel(null)
                      setLevelForm({
                        track_id: selectedTrack.id,
                        name: "",
                        description: "",
                        order_index: 0,
                        is_active: true,
                      })
                      setShowLevelDialog(true)
                    }}
                    className="bg-purple-600"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Ku Dar Level
                  </Button>
                </div>
              ) : (
                levels.map((level, index) => (
                  <div
                    key={level.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-slate-600" />
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-white flex items-center gap-2">
                            {level.name}
                            {!level.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>{level.lessons_count || 0} Cashar</span>
                            <span>{level.exercises_count || 0} Tamriino</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/gold/lessons?levelId=${level.id}`}>
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-green-400">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-blue-400"
                          onClick={() => openEditLevel(level)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-red-400"
                          onClick={() => handleDeleteLevel(level.id)}
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
        </div>

        {/* Track Dialog */}
        <Dialog open={showTrackDialog} onOpenChange={setShowTrackDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTrack ? "Wax ka Bedel Track" : "Track Cusub"}</DialogTitle>
              <DialogDescription className="text-slate-400">Geli macluumaadka track-ka</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Magaca Track-ka</Label>
                <Input
                  className="bg-slate-900 border-slate-600 text-white mt-1"
                  placeholder="Tusaale: Web Development"
                  value={trackForm.name}
                  onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-slate-300">Sharaxaad</Label>
                <Textarea
                  className="bg-slate-900 border-slate-600 text-white mt-1"
                  placeholder="Sharax waxa track-ku ku saabsan yahay..."
                  value={trackForm.description}
                  onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Muddada</Label>
                  <Input
                    className="bg-slate-900 border-slate-600 text-white mt-1"
                    placeholder="Tusaale: 3 Bilood"
                    value={trackForm.estimated_duration}
                    onChange={(e) => setTrackForm({ ...trackForm, estimated_duration: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Midabka</Label>
                  <div className="flex gap-2 mt-1">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-lg transition-all ${trackForm.color === color ? "ring-2 ring-white scale-110" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTrackForm({ ...trackForm, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Shaqeynayo</Label>
                <Switch
                  checked={trackForm.is_active}
                  onCheckedChange={(checked) => setTrackForm({ ...trackForm, is_active: checked })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 bg-transparent"
                  onClick={() => setShowTrackDialog(false)}
                >
                  Ka Noqo
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSaveTrack}>
                  {editingTrack ? "Kaydi Isbedelka" : "Abuur Track"}
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
