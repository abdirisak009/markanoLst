"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Award, BookOpen, GraduationCap, Layers, Play, ChevronRight, LogOut, Clock, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
}

interface Enrollment {
  track_id: number
  track_name: string
  track_slug: string
  track_icon: string
  track_color: string
  track_description: string
  current_level_name: string
  current_level_order: number
  total_levels: number
  completed_lessons: number
  total_lessons: number
  enrollment_status: string
}

export default function GoldDashboardPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

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
      const [tracksRes, enrollmentsRes] = await Promise.all([
        fetch("/api/gold/tracks"),
        fetch(`/api/gold/enrollments?studentId=${studentId}`),
      ])

      const tracksData = await tracksRes.json()
      const enrollmentsData = await enrollmentsRes.json()

      setTracks(tracksData)
      setEnrollments(enrollmentsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (trackId: number) => {
    if (!student) return
    try {
      await fetch("/api/gold/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: student.id, track_id: trackId }),
      })
      toast.success("Waxaad ku biirtay track-ka!")
      fetchData(student.id)
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("gold_student")
    router.push("/gold")
  }

  const enrolledTrackIds = enrollments.map((e) => e.track_id)
  const availableTracks = tracks.filter((t) => !enrolledTrackIds.includes(t.id) && t.is_active !== false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Award className="h-12 w-12 text-amber-500 mx-auto animate-pulse" />
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl">
              <Award className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Markano Gold</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-white">{student?.full_name}</span>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20">
          <h1 className="text-2xl font-bold text-white mb-2">
            Ku soo dhawoow, {student?.full_name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-400">
            Sii wad waxbarashadaada. Guusha waxay ku bilaabataa tallaabo yar - qaado talaabadaada maanta.
          </p>
        </div>

        {/* My Tracks */}
        {enrollments.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-amber-400" /> Tracks-kayga
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => {
                const progressPercent =
                  enrollment.total_lessons > 0
                    ? Math.round((enrollment.completed_lessons / enrollment.total_lessons) * 100)
                    : 0

                return (
                  <Card
                    key={enrollment.track_id}
                    className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                              backgroundColor: (enrollment.track_color || "#3B82F6") + "20",
                              color: enrollment.track_color || "#3B82F6",
                            }}
                          >
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{enrollment.track_name}</h3>
                            <p className="text-sm text-slate-400">Level: {enrollment.current_level_name || "N/A"}</p>
                          </div>
                        </div>
                        <Badge
                          className={
                            enrollment.enrollment_status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-slate-500/20 text-slate-400"
                          }
                        >
                          {enrollment.enrollment_status === "active" ? "Socda" : enrollment.enrollment_status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Horumar</span>
                          <span className="text-white font-medium">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2 bg-slate-700" />
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {enrollment.completed_lessons}/{enrollment.total_lessons} cashar
                          </span>
                          <span>
                            Level {enrollment.current_level_order || 1}/{enrollment.total_levels || 1}
                          </span>
                        </div>
                      </div>

                      <Link href={`/gold/track/${enrollment.track_id}`}>
                        <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700 group-hover:bg-amber-500">
                          <Play className="h-4 w-4 mr-2" /> Sii Wad Barashada
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Available Tracks */}
        {availableTracks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-400" /> Tracks-ka La Heli Karo
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTracks.map((track) => (
                <Card
                  key={track.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all overflow-hidden"
                >
                  <div className="h-2" style={{ backgroundColor: track.color || "#3B82F6" }} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: (track.color || "#3B82F6") + "20",
                          color: track.color || "#3B82F6",
                        }}
                      >
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{track.name}</CardTitle>
                        {track.estimated_duration && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3" /> {track.estimated_duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-400 line-clamp-2 mb-4">{track.description}</CardDescription>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span>{track.levels_count || 0} Levels</span>
                      <span>{track.lessons_count || 0} Cashars</span>
                      <span>{track.enrolled_students || 0} Ardayda</span>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleEnroll(track.id)}>
                      Ku Biir <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {enrollments.length === 0 && availableTracks.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Layers className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Wali ma jiro Tracks</h3>
              <p className="text-slate-400">Hadda wali laguma darin wax tracks ah. Ka sugso update-yo</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
