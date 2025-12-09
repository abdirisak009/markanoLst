"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Search,
  Video,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  SkipForward,
  Filter,
  ArrowUpDown,
  TrendingDown,
  Award,
} from "lucide-react"

interface SkipEvent {
  skip_from: number
  skip_to: number
  skip_amount: number
  skipped_at: string
}

interface StudentVideoData {
  student_id: string
  student_name: string
  university_name: string
  class_name: string
  total_videos_watched: number
  total_completed: number
  total_in_progress: number
  avg_completion: number
  total_watch_time: number
  total_skips: number
  videos: {
    video_id: number
    video_title: string
    category: string
    completion_percentage: number
    watch_duration: number
    total_duration: number
    skipped_count: number
    last_position: number
    watched_at: string
    is_completed: boolean
    skip_events: SkipEvent[]
  }[]
}

export default function AnalyticsPage() {
  const [studentData, setStudentData] = useState<StudentVideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [classFilter, setClassFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/videos/analytics")
      const rawData = await response.json()

      const studentMap = new Map<string, StudentVideoData>()

      rawData.forEach((item: any) => {
        if (!studentMap.has(item.student_id)) {
          studentMap.set(item.student_id, {
            student_id: item.student_id,
            student_name: item.student_name || "Unknown",
            university_name: item.university_name || "N/A",
            class_name: item.class_name || "N/A",
            total_videos_watched: 0,
            total_completed: 0,
            total_in_progress: 0,
            avg_completion: 0,
            total_watch_time: 0,
            total_skips: 0,
            videos: [],
          })
        }

        const student = studentMap.get(item.student_id)!
        const isCompleted = (item.completion_percentage || 0) >= 95

        student.total_videos_watched++
        if (isCompleted) {
          student.total_completed++
        } else {
          student.total_in_progress++
        }
        student.total_watch_time += item.watch_duration || 0
        student.total_skips += item.skipped_count || 0

        student.videos.push({
          video_id: item.video_id,
          video_title: item.video_title,
          category: item.category,
          completion_percentage: item.completion_percentage || 0,
          watch_duration: item.watch_duration || 0,
          total_duration: item.total_duration || 0,
          skipped_count: item.skipped_count || 0,
          last_position: item.last_position || 0,
          watched_at: item.watched_at,
          is_completed: isCompleted,
          skip_events: item.skip_events || [],
        })
      })

      studentMap.forEach((student) => {
        student.avg_completion =
          student.videos.reduce((sum, v) => sum + v.completion_percentage, 0) / student.videos.length
      })

      setStudentData(Array.from(studentMap.values()))
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const uniqueClasses = Array.from(new Set(studentData.map((s) => s.class_name).filter((c) => c !== "N/A")))

  const filteredStudents = studentData
    .filter(
      (student) =>
        (student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.university_name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (classFilter === "all" || student.class_name === classFilter),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "best":
          return b.avg_completion - a.avg_completion
        case "most_skips":
          return b.total_skips - a.total_skips
        case "most_completed":
          return b.total_completed - a.total_completed
        case "least_progress":
          return a.avg_completion - b.avg_completion
        case "name":
        default:
          return a.student_name.localeCompare(b.student_name)
      }
    })

  const totalStudents = studentData.length
  const totalVideosWatched = studentData.reduce((sum, s) => sum + s.total_videos_watched, 0)
  const totalCompleted = studentData.reduce((sum, s) => sum + s.total_completed, 0)
  const avgCompletion =
    studentData.length > 0 ? studentData.reduce((sum, s) => sum + s.avg_completion, 0) / studentData.length : 0

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-sm mt-1">Comprehensive student performance tracking and insights</p>
          </div>
        </div>

        {/* Stats Grid - Enhanced with gradients and shadows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">Total Students</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalStudents}</div>
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Watching videos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">Videos Watched</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <Video className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{totalVideosWatched}</div>
              <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {totalCompleted} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700">Avg Completion</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{Math.round(avgCompletion)}%</div>
              <Progress value={avgCompletion} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">Total Watch Time</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {formatDuration(studentData.reduce((sum, s) => sum + s.total_watch_time, 0))}
              </div>
              <p className="text-xs text-orange-600 mt-1">Cumulative learning time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card - Enhanced */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-xl font-bold text-slate-800">Student Video Tracking</CardTitle>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, ID, or university..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Filter className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Filter by Class</label>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-full bg-white border-gray-300 hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500 shadow-sm">
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="all" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                          All Classes
                        </SelectItem>
                        {uniqueClasses.map((className) => (
                          <SelectItem
                            key={className}
                            value={className}
                            className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                          >
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <ArrowUpDown className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full bg-white border-gray-300 hover:border-purple-500 focus:border-purple-500 focus:ring-purple-500 shadow-sm">
                        <SelectValue placeholder="Name (A-Z)" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="name" className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer">
                          Name (A-Z)
                        </SelectItem>
                        <SelectItem value="best" className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Award className="h-3 w-3 text-green-600" />
                            Best Performers
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="most_completed"
                          className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-blue-600" />
                            Most Completed
                          </div>
                        </SelectItem>
                        <SelectItem value="most_skips" className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            Most Skips
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="least_progress"
                          className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-3 w-3 text-orange-600" />
                            Least Progress
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(classFilter !== "all" || sortBy !== "name") && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 shadow-md">
                    <Users className="h-3 w-3 mr-1" />
                    {filteredStudents.length} students
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No students found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <Card
                    key={student.student_id}
                    className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-gray-50"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {student.student_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-800">{student.student_name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-mono bg-blue-50 border-blue-200">
                                  ID: {student.student_id}
                                </Badge>
                                {student.avg_completion >= 80 && (
                                  <Badge className="text-xs bg-green-100 text-green-700 border-green-300">
                                    <Award className="h-3 w-3 mr-1" />
                                    Top Performer
                                  </Badge>
                                )}
                                {student.total_skips > 5 && (
                                  <Badge className="text-xs bg-red-100 text-red-700 border-red-300">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    High Skip Rate
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="flex items-center gap-1 text-gray-600">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              {student.university_name}
                            </span>
                            {student.class_name !== "N/A" && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                {student.class_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() =>
                            setExpandedStudent(expandedStudent === student.student_id ? null : student.student_id)
                          }
                          className="border-2 hover:bg-blue-50 hover:border-blue-500 transition-colors shadow-sm"
                        >
                          {expandedStudent === student.student_id ? "Hide Details" : "View Details"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                              <Video className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-medium text-blue-700">Videos</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">{student.total_videos_watched}</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-medium text-green-700">Completed</p>
                          </div>
                          <p className="text-2xl font-bold text-green-900">{student.total_completed}</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                              <PlayCircle className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-medium text-orange-700">In Progress</p>
                          </div>
                          <p className="text-2xl font-bold text-orange-900">{student.total_in_progress}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                              <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-medium text-purple-700">Avg Progress</p>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">{Math.round(student.avg_completion)}%</p>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                              <SkipForward className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-medium text-red-700">Total Skips</p>
                          </div>
                          <p className="text-2xl font-bold text-red-900">{student.total_skips}</p>
                        </div>
                      </div>

                      {expandedStudent === student.student_id && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <Video className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-bold text-lg text-slate-800">Video Watch History</h4>
                          </div>
                          <div className="space-y-4">
                            {student.videos.map((video, idx) => (
                              <div
                                key={idx}
                                className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors shadow-sm"
                              >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Video className="h-5 w-5 text-white" />
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-bold text-slate-800 mb-2">{video.video_title}</h5>
                                        <div className="flex flex-wrap gap-2">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs bg-gray-100 text-gray-700 border border-gray-300"
                                          >
                                            {video.category}
                                          </Badge>
                                          {video.is_completed && (
                                            <Badge className="text-xs bg-green-100 text-green-700 border-green-300">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Completed
                                            </Badge>
                                          )}
                                          {video.skipped_count > 0 && (
                                            <Badge className="text-xs bg-red-100 text-red-700 border-red-300">
                                              <SkipForward className="h-3 w-3 mr-1" />
                                              {video.skipped_count} skips
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {formatDate(video.watched_at)}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-gray-700">
                                      Progress: {Math.round(video.completion_percentage)}%
                                    </span>
                                    <span className="text-gray-600">
                                      {formatDuration(video.watch_duration)} / {formatDuration(video.total_duration)}
                                    </span>
                                  </div>
                                  <Progress value={video.completion_percentage} className="h-3 shadow-inner" />
                                </div>

                                {video.skip_events && video.skip_events.length > 0 && (
                                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                                        <SkipForward className="h-4 w-4 text-red-600" />
                                      </div>
                                      <span className="text-sm font-bold text-gray-800">
                                        Skip Timeline ({video.skip_events.length} events)
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      {video.skip_events.map((skip, skipIdx) => (
                                        <div
                                          key={skipIdx}
                                          className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-3 hover:border-red-300 transition-colors"
                                        >
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                                                <SkipForward className="h-4 w-4 text-white" />
                                              </div>
                                              <div>
                                                <span className="font-mono text-sm font-bold text-red-700 block">
                                                  {formatDuration(skip.skip_from)} → {formatDuration(skip.skip_to)}
                                                </span>
                                                <Badge className="text-xs bg-red-200 text-red-800 border-red-400 mt-1">
                                                  Skipped {formatDuration(skip.skip_amount)}
                                                </Badge>
                                              </div>
                                            </div>
                                            <span className="text-xs text-gray-600 font-medium">
                                              {new Date(skip.skipped_at).toLocaleString()}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
