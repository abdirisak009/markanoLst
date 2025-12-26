"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Award,
  BookOpen,
  GraduationCap,
  Layers,
  Play,
  LogOut,
  Clock,
  User,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  Trophy,
  Target,
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Student {
  id: number
  full_name: string
  email: string
  university: string
  field_of_study: string
}

interface Track {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  color: string
  estimated_duration: string
  levels_count: number
  lessons_count: number
  enrolled_students: number
  is_active: boolean
}

interface Application {
  id: number
  track_id: number
  status: string
  applied_at: string
  rejection_reason?: string
  track_name: string
  track_color: string
}

interface Enrollment {
  track_id: number
  track_name: string
  track_slug: string
  track_icon: string
  track_color: string
  track_description: string
  current_level_id: number
  current_level_name: string
  current_level_order: number
  total_levels: number
  completed_lessons: number
  total_lessons: number
  enrollment_status: string
}

interface LevelRequest {
  id: number
  current_level_id: number
  next_level_id: number
  status: string
  rejection_reason?: string
}

export default function GoldDashboardPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [levelRequests, setLevelRequests] = useState<LevelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingTrack, setApplyingTrack] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; track: Track | null }>({
    open: false,
    track: null,
  })

  useEffect(() => {
    const storedStudent = localStorage.getItem("gold_student")
    if (!storedStudent) {
      router.push("/gold")
      return
    }
    const studentData = JSON.parse(storedStudent)
    setStudent(studentData)
    fetchData(studentData.id)
  }, [router])

  const fetchData = async (studentId: number) => {
    try {
      const [tracksRes, applicationsRes, enrollmentsRes, levelRequestsRes] = await Promise.all([
        fetch("/api/gold/tracks"),
        fetch(`/api/gold/applications?studentId=${studentId}`),
        fetch(`/api/gold/enrollments?studentId=${studentId}`),
        fetch(`/api/gold/level-requests?studentId=${studentId}`),
      ])

      const tracksData = await tracksRes.json()
      const applicationsData = await applicationsRes.json()
      const enrollmentsData = await enrollmentsRes.json()
      const levelRequestsData = await levelRequestsRes.json()

      setTracks(Array.isArray(tracksData) ? tracksData : [])
      setApplications(Array.isArray(applicationsData) ? applicationsData : [])
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : [])
      setLevelRequests(Array.isArray(levelRequestsData) ? levelRequestsData : [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const handleApplyForTrack = async (track: Track) => {
    if (!student) return
    setApplyingTrack(track.id)

    try {
      const res = await fetch("/api/gold/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: student.id, track_id: track.id }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to apply")
      }

      toast.success("Codsigaaga waa la diray! Waxaad sugi doontaa ansixinta.")
      setConfirmDialog({ open: false, track: null })
      fetchData(student.id)
    } catch (error: any) {
      toast.error(error.message || "Khalad ayaa dhacay")
    } finally {
      setApplyingTrack(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("gold_student")
    document.cookie = "goldStudentId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/gold")
  }

  const enrolledTrackIds = enrollments.map((e) => e.track_id)
  const appliedTrackIds = applications.map((a) => a.track_id)
  const availableTracks = tracks.filter(
    (t) => !enrolledTrackIds.includes(t.id) && !appliedTrackIds.includes(t.id) && t.is_active !== false,
  )
  const pendingApplications = applications.filter((a) => a.status === "pending")
  const rejectedApplications = applications.filter((a) => a.status === "rejected")

  // Calculate stats
  const totalLessonsCompleted = enrollments.reduce((acc, e) => acc + e.completed_lessons, 0)
  const totalLessons = enrollments.reduce((acc, e) => acc + e.total_lessons, 0)
  const overallProgress = totalLessons > 0 ? Math.round((totalLessonsCompleted / totalLessons) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-dark flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gold-radial opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-500" />

        <div className="text-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 animate-rotate-slow">
              <Sparkles className="h-16 w-16 text-amber-500/30 absolute -top-2 -left-2" />
              <Star className="h-8 w-8 text-amber-400/40 absolute -bottom-1 -right-1" />
            </div>
            <div className="p-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl animate-glow-pulse">
              <Award className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <h2 className="text-xl font-bold text-white">Markano Gold</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[100px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative p-2.5 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Markano</span>
                <span className="text-xl font-bold text-gold-gradient ml-1">Gold</span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl glass border border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{student?.full_name}</p>
                  <p className="text-xs text-white/50">Gold Member</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Hero Section */}
        <section className="animate-slide-up">
          <div className="relative overflow-hidden rounded-3xl glass-gold p-8 sm:p-10">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-full blur-2xl" />
            <Sparkles className="absolute top-6 right-6 h-8 w-8 text-amber-400/30 animate-bounce-subtle" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium Member
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Ku soo dhawoow, <span className="animate-text-shimmer">{student?.full_name?.split(" ")[0]}</span>!
                </h1>
                <p className="text-white/60 text-lg max-w-xl">
                  Sii wad waxbarashadaada. Guusha waxay ku bilaabataa tallaabo yar - qaado talaabadaada maanta.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-3xl font-bold text-amber-400">{enrollments.length}</div>
                  <div className="text-xs text-white/50 mt-1">Tracks</div>
                </div>
                <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-3xl font-bold text-green-400">{totalLessonsCompleted}</div>
                  <div className="text-xs text-white/50 mt-1">Cashars</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        {enrollments.length > 0 && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up delay-100">
            <div className="group p-5 rounded-2xl glass border border-white/10 hover-lift card-shine">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{overallProgress}%</p>
                  <p className="text-xs text-white/50">Guud ahaan</p>
                </div>
              </div>
            </div>
            <div className="group p-5 rounded-2xl glass border border-white/10 hover-lift card-shine">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalLessons}</p>
                  <p className="text-xs text-white/50">Cashars</p>
                </div>
              </div>
            </div>
            <div className="group p-5 rounded-2xl glass border border-white/10 hover-lift card-shine">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20 text-green-400 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalLessonsCompleted}</p>
                  <p className="text-xs text-white/50">La dhameeyay</p>
                </div>
              </div>
            </div>
            <div className="group p-5 rounded-2xl glass border border-white/10 hover-lift card-shine">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {enrollments.reduce((acc, e) => acc + (e.current_level_order || 1), 0)}
                  </p>
                  <p className="text-xs text-white/50">Levels</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <section className="animate-slide-up delay-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Codsiyada Sugaya Ansixinta</h2>
              <Badge className="bg-amber-500/20 text-amber-300 border-0">{pendingApplications.length}</Badge>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApplications.map((app, index) => (
                <div
                  key={app.id}
                  className="group p-5 rounded-2xl glass-gold animate-border-glow hover-lift"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-amber-400 animate-pulse" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-ping" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {app.track_name}
                      </h3>
                      <p className="text-sm text-amber-400/70">Sugaya ansixinta...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rejected Applications */}
        {rejectedApplications.length > 0 && (
          <section className="animate-slide-up delay-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Codsiyada La Diiday</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {rejectedApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl glass border border-red-500/20 hover:border-red-500/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <XCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{app.track_name}</h3>
                      {app.rejection_reason && (
                        <p className="text-sm text-red-400/80 mt-1 flex items-start gap-1">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          {app.rejection_reason}
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                        onClick={() => {
                          const track = tracks.find((t) => t.id === app.track_id)
                          if (track) setConfirmDialog({ open: true, track })
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Dib u Codso
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* My Enrolled Tracks */}
        {enrollments.length > 0 && (
          <section className="animate-slide-up delay-300">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <GraduationCap className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Tracks-kayga</h2>
                <Badge className="bg-green-500/20 text-green-300 border-0">{enrollments.length} Active</Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {enrollments.map((enrollment, index) => {
                const progressPercent =
                  enrollment.total_lessons > 0
                    ? Math.round((enrollment.completed_lessons / enrollment.total_lessons) * 100)
                    : 0

                const pendingLevelReq = levelRequests.find(
                  (lr) => lr.current_level_id === enrollment.current_level_id && lr.status === "pending",
                )

                return (
                  <div
                    key={enrollment.track_id}
                    className="group relative overflow-hidden rounded-2xl glass border border-white/10 hover:border-amber-500/30 transition-all duration-500 hover-lift card-shine"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Progress Bar Top */}
                    <div className="h-1 bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 transition-all duration-1000 progress-glow"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div
                            className="relative w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            style={{
                              background: `linear-gradient(135deg, ${enrollment.track_color || "#3B82F6"}30, ${enrollment.track_color || "#3B82F6"}10)`,
                            }}
                          >
                            <BookOpen className="h-7 w-7" style={{ color: enrollment.track_color || "#3B82F6" }} />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0a0a0f]">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                              {enrollment.track_name}
                            </h3>
                            <p className="text-sm text-white/50">
                              Level {enrollment.current_level_order || 1}: {enrollment.current_level_name || "N/A"}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-0 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      </div>

                      {/* Progress Section */}
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Horumar Level-kan</span>
                          <span className="text-amber-400 font-bold">{progressPercent}%</span>
                        </div>
                        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-full transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                          />
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-transparent rounded-full animate-shimmer"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {enrollment.completed_lessons}/{enrollment.total_lessons} cashar
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            Level {enrollment.current_level_order || 1}/{enrollment.total_levels || 1}
                          </span>
                        </div>
                      </div>

                      {/* Pending Level Request Notice */}
                      {pendingLevelReq && (
                        <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-border-glow">
                          <p className="text-sm text-amber-300 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Codsiga Level-ka xiga waa la sugayaa...
                          </p>
                        </div>
                      )}

                      {/* CTA Button */}
                      <Link href={`/gold/track/${enrollment.track_id}`}>
                        <Button className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-all duration-300">
                          <Play className="h-5 w-5 mr-2 group-hover:animate-bounce-subtle" />
                          Sii Wad Barashada
                          <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Available Tracks to Apply */}
        {availableTracks.length > 0 && (
          <section className="animate-slide-up delay-400">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Layers className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Tracks-ka La Heli Karo</h2>
              <Badge className="bg-blue-500/20 text-blue-300 border-0">{availableTracks.length} Available</Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="group relative overflow-hidden rounded-2xl glass border border-white/10 hover:border-blue-500/30 transition-all duration-500 hover-lift card-shine"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Color Bar */}
                  <div
                    className="h-1.5"
                    style={{
                      background: `linear-gradient(90deg, ${track.color || "#3B82F6"}, ${track.color || "#3B82F6"}80)`,
                    }}
                  />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${track.color || "#3B82F6"}30, ${track.color || "#3B82F6"}10)`,
                        }}
                      >
                        <BookOpen className="h-6 w-6" style={{ color: track.color || "#3B82F6" }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">
                          {track.name}
                        </h3>
                        {track.estimated_duration && (
                          <p className="text-xs text-white/40 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {track.estimated_duration}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/50 line-clamp-2 mb-4">{track.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-white/40 mb-5">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {track.levels_count || 0} Levels
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {track.lessons_count || 0} Cashars
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {track.enrolled_students || 0}
                      </span>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300"
                      onClick={() => setConfirmDialog({ open: true, track })}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Codso Track-kan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {enrollments.length === 0 && availableTracks.length === 0 && pendingApplications.length === 0 && (
          <section className="animate-scale-in">
            <div className="relative overflow-hidden rounded-3xl glass border border-white/10 p-12 text-center">
              <div className="absolute inset-0 bg-gold-radial opacity-30" />
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <Layers className="h-10 w-10 text-white/30" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Wali ma jiro Tracks</h3>
                <p className="text-white/50 max-w-md mx-auto">
                  Hadda wali laguma darin wax tracks ah. Ka sugso update-yo cusub oo soo socda.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Application Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, track: confirmDialog.track })}>
        <DialogContent className="bg-[#0f1419] border border-white/10 text-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Send className="h-5 w-5 text-blue-400" />
              </div>
              Codso Track-ka
            </DialogTitle>
            <DialogDescription className="text-white/60 pt-2">
              Ma hubtaa inaad codsaneyso <span className="text-white font-medium">{confirmDialog.track?.name}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-white/80 font-medium">Marka aad codsato:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                Admin-ku wuxuu eegi doonaa codsigaaga
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                Marka la ansixiyo, waxaad heli doontaa Level 1
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                Level kasta waa inaad dhameyso ka hor inta aadan codsanin kan xiga
              </li>
            </ul>
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 border-white/10 text-white/70 hover:text-white hover:bg-white/5 rounded-xl bg-transparent"
              onClick={() => setConfirmDialog({ open: false, track: null })}
            >
              Ka Noqo
            </Button>
            <Button
              className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/25"
              onClick={() => confirmDialog.track && handleApplyForTrack(confirmDialog.track)}
              disabled={applyingTrack === confirmDialog.track?.id}
            >
              {applyingTrack === confirmDialog.track?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Waa la dirayaa...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Codso
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
