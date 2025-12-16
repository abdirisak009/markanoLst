"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  User,
  GraduationCap,
  Trophy,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  Video,
  Timer,
  Star,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"

interface Assignment {
  id: number
  title: string
  description: string
  max_marks: number
  due_date: string
  period: string
  marks_obtained: number | null
  percentage: number | null
  grade: string | null
  submitted_at: string | null
}

interface StudentInfo {
  student_id: string
  full_name: string
  phone: string
  gender: string
  status: string
  class_name: string
  class_id: number
  university_name: string
  university_abbr: string
  rank: number | null
  total_students: number
}

interface Statistics {
  total_assignments: number
  graded_assignments: number
  pending_assignments: number
  total_marks_obtained: number
  total_max_marks: number
  average_percentage: number
  class_rank: number | null
  total_students_in_class: number
}

interface VideoProgress {
  videos_watched: number
  total_videos: number
  total_watch_time: number
}

export default function StudentPerformancePage() {
  const [studentId, setStudentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [videoProgress, setVideoProgress] = useState<VideoProgress | null>(null)

  const searchPerformance = async () => {
    if (!studentId.trim()) {
      setError("Fadlan geli Student ID-kaaga")
      return
    }

    setLoading(true)
    setError("")
    setStudent(null)
    setAssignments([])
    setStatistics(null)
    setVideoProgress(null)

    try {
      const res = await fetch("/api/students/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch performance")
      }

      setStudent(data.student)
      setAssignments(data.assignments)
      setStatistics(data.statistics)
      setVideoProgress(data.video_progress)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wax khalad ah ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "bg-gray-100 text-gray-600"
    switch (grade.toUpperCase()) {
      case "A+":
      case "A":
        return "bg-emerald-100 text-emerald-700"
      case "A-":
      case "B+":
        return "bg-green-100 text-green-700"
      case "B":
      case "B-":
        return "bg-blue-100 text-blue-700"
      case "C+":
      case "C":
        return "bg-yellow-100 text-yellow-700"
      case "C-":
      case "D":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-red-100 text-red-700"
    }
  }

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { label: "Aad u Fiican", color: "text-emerald-500", icon: Star }
    if (percentage >= 80) return { label: "Fiican", color: "text-green-500", icon: Award }
    if (percentage >= 70) return { label: "Wanaagsan", color: "text-blue-500", icon: TrendingUp }
    if (percentage >= 60) return { label: "Caadi", color: "text-yellow-500", icon: Target }
    return { label: "Waa inaad dadaashaa", color: "text-orange-500", icon: AlertCircle }
  }

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes} daqiiqo`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#013565] via-[#024a8a] to-[#0369a1] p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 sm:space-y-6 pt-4 sm:pt-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#ff1b4a]/20 rounded-full blur-2xl scale-150"></div>
              <Image
                src="/images/ll.png"
                alt="Markano Logo"
                width={120}
                height={120}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          <div className="space-y-2 px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
              Buundadaada & Natiijadaada
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              Geli Student ID-kaaga si aad u aragto buundadaada assignments-ka iyo horummarkaaga
            </p>
          </div>
        </div>

        {/* Search Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#013565] via-[#ff1b4a] to-[#013565]"></div>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Geli Student ID-kaaga (tusaale: 136001)"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value)
                    setError("")
                  }}
                  onKeyDown={(e) => e.key === "Enter" && searchPerformance()}
                  className="pl-10 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-[#013565] rounded-xl"
                />
              </div>
              <Button
                onClick={searchPerformance}
                disabled={loading}
                className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-[#013565] to-[#024a8a] hover:from-[#012a52] hover:to-[#013565] text-white rounded-xl text-base sm:text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Raadinta...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Raadi
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top duration-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {student && statistics && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            {/* Student Info Card */}
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#013565] to-[#024a8a] p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="flex-1 text-white">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{student.full_name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className="bg-white/20 text-white border-0 text-xs sm:text-sm">
                        ID: {student.student_id}
                      </Badge>
                      <Badge className="bg-[#ff1b4a] text-white border-0 text-xs sm:text-sm">
                        {student.class_name}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-0 text-xs sm:text-sm">
                        {student.university_abbr || student.university_name}
                      </Badge>
                    </div>
                  </div>
                  {statistics.class_rank && (
                    <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center shadow-lg">
                      <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-1" />
                      <p className="text-2xl sm:text-3xl font-bold text-white">#{statistics.class_rank}</p>
                      <p className="text-[10px] sm:text-xs text-white/80">
                        ka mid ah {statistics.total_students_in_class}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Average Score */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden group hover:scale-105 transition-transform duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{statistics.average_percentage}%</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80">Celceliska Guud</p>
                  <div className="mt-2">
                    <Progress value={statistics.average_percentage} className="h-1.5 bg-white/30" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Marks */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-[#013565] to-[#024a8a] text-white overflow-hidden group hover:scale-105 transition-transform duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      {statistics.total_marks_obtained}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80">Buundo la helay</p>
                  <p className="text-[10px] sm:text-xs text-white/60 mt-1">ka mid ah {statistics.total_max_marks}</p>
                </CardContent>
              </Card>

              {/* Graded Assignments */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden group hover:scale-105 transition-transform duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{statistics.graded_assignments}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80">La qiimeeyay</p>
                  <p className="text-[10px] sm:text-xs text-white/60 mt-1">ka mid ah {statistics.total_assignments}</p>
                </CardContent>
              </Card>

              {/* Pending */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden group hover:scale-105 transition-transform duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{statistics.pending_assignments}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80">Sugaya Qiimeyn</p>
                </CardContent>
              </Card>
            </div>

            {/* Video Progress */}
            {videoProgress && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 sm:p-5">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Video className="w-5 h-5" />
                    Horumarka Video-yada
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5">
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <Video className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-xl sm:text-2xl font-bold text-purple-700">{videoProgress.videos_watched}</p>
                      <p className="text-[10px] sm:text-xs text-purple-600">Video la daawday</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-xl sm:text-2xl font-bold text-purple-700">{videoProgress.total_videos}</p>
                      <p className="text-[10px] sm:text-xs text-purple-600">Wadarta Video-yada</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-xl sm:text-2xl font-bold text-purple-700">
                        {formatWatchTime(videoProgress.total_watch_time)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-purple-600">Wakhtiga Daawashada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Level */}
            {statistics.average_percentage > 0 && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  {(() => {
                    const level = getPerformanceLevel(statistics.average_percentage)
                    const IconComponent = level.icon
                    return (
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center ${level.color}`}
                        >
                          <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                            Heerkaaga: <span className={level.color}>{level.label}</span>
                          </h3>
                          <p className="text-sm text-gray-600">
                            {statistics.average_percentage >= 80
                              ? "Waad mahadsantahay! Shaqadaada waa fiican. Sii wad!"
                              : statistics.average_percentage >= 60
                                ? "Waxaad samaysaa shaqo wanaagsan. Dadaal dheeraad ah ayaad u baahan tahay."
                                : "Waxaad u baahan tahay inaad si adag u shaqeyso. La hadal macalinkaaga."}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Assignments List */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#013565] to-[#024a8a] text-white p-4 sm:p-5">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="w-5 h-5" />
                  Assignments-kaaga ({assignments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {assignments.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Weli ma jiraan assignments</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {assignments.map((assignment, index) => (
                      <div key={assignment.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#013565]/10 flex items-center justify-center shrink-0">
                              <span className="text-sm sm:text-base font-bold text-[#013565]">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                                {assignment.title}
                              </h4>
                              {assignment.description && (
                                <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                                  {assignment.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <Badge variant="outline" className="text-[10px] sm:text-xs">
                                  Max: {assignment.max_marks}
                                </Badge>
                                {assignment.period && (
                                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                                    {assignment.period}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 ml-11 sm:ml-0">
                            {assignment.marks_obtained !== null ? (
                              <>
                                <div className="text-right">
                                  <p className="text-lg sm:text-xl font-bold text-[#013565]">
                                    {assignment.marks_obtained}/{assignment.max_marks}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-gray-500">
                                    {assignment.percentage?.toFixed(0)}%
                                  </p>
                                </div>
                                <Badge
                                  className={`${getGradeColor(assignment.grade)} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                                >
                                  {assignment.grade || "N/A"}
                                </Badge>
                              </>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-600 text-xs sm:text-sm">
                                <Clock className="w-3 h-3 mr-1" />
                                Sugaya
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center py-4">
              <p className="text-white/60 text-xs sm:text-sm">
                Powered by <span className="text-[#ff1b4a] font-semibold">Markano</span> Learning Management System
              </p>
            </div>
          </div>
        )}

        {/* Initial State - Before Search */}
        {!student && !loading && !error && (
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardContent className="py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#013565]/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-[#013565]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Geli Student ID-kaaga</h3>
              <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                Geli Student ID-kaaga sanduuqa sare si aad u aragto buundadaada iyo horummarkaaga assignments-ka
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
