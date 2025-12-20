"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Video,
  SkipForward,
  CheckCircle,
  AlertTriangle,
  Search,
  Download,
  Users,
  TrendingUp,
  Eye,
  FastForward,
  Filter,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VideoAnalytics {
  video_id: number
  video_title: string
  category: string
  student_id: string
  student_name: string
  university_name: string
  class_name: string
  watch_duration: number
  total_duration: number
  completion_percentage: number
  skipped_count: number
  speed_attempts: number
  watched_at: string
  total_skips: number
  total_skipped_seconds: number
  skip_events: any[]
}

interface Class {
  id: number
  name: string
}

export default function VideoBehaviorReportPage() {
  const [analytics, setAnalytics] = useState<VideoAnalytics[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState("all")
  const [behaviorFilter, setBehaviorFilter] = useState<"all" | "good" | "skipped">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [analyticsRes, classesRes] = await Promise.all([fetch("/api/videos/analytics"), fetch("/api/classes")])

      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(Array.isArray(data) ? data : [])
      }

      if (classesRes.ok) {
        const data = await classesRes.json()
        setClasses(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Group analytics by student to get overall behavior
  const studentBehavior = useMemo(() => {
    const studentMap = new Map<
      string,
      {
        student_id: string
        student_name: string
        class_name: string
        university_name: string
        total_videos: number
        completed_videos: number
        total_skips: number
        total_skipped_seconds: number
        total_watch_time: number
        avg_completion: number
        videos: VideoAnalytics[]
      }
    >()

    analytics.forEach((record) => {
      const existing = studentMap.get(record.student_id) || {
        student_id: record.student_id,
        student_name: record.student_name || "Unknown",
        class_name: record.class_name || "N/A",
        university_name: record.university_name || "N/A",
        total_videos: 0,
        completed_videos: 0,
        total_skips: 0,
        total_skipped_seconds: 0,
        total_watch_time: 0,
        avg_completion: 0,
        videos: [],
      }

      existing.total_videos += 1
      existing.completed_videos += record.completion_percentage >= 80 ? 1 : 0
      existing.total_skips += record.total_skips || 0
      existing.total_skipped_seconds += record.total_skipped_seconds || 0
      existing.total_watch_time += record.watch_duration || 0
      existing.videos.push(record)

      studentMap.set(record.student_id, existing)
    })

    // Calculate average completion
    studentMap.forEach((student) => {
      const totalCompletion = student.videos.reduce((sum, v) => sum + (v.completion_percentage || 0), 0)
      student.avg_completion = student.total_videos > 0 ? totalCompletion / student.total_videos : 0
    })

    return Array.from(studentMap.values())
  }, [analytics])

  // Filter students
  const filteredStudents = useMemo(() => {
    return studentBehavior.filter((student) => {
      // Class filter
      if (selectedClass !== "all" && student.class_name !== selectedClass) {
        return false
      }

      // Behavior filter
      if (behaviorFilter === "good" && student.total_skips > 0) {
        return false
      }
      if (behaviorFilter === "skipped" && student.total_skips === 0) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return student.student_id.toLowerCase().includes(query) || student.student_name.toLowerCase().includes(query)
      }

      return true
    })
  }, [studentBehavior, selectedClass, behaviorFilter, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const totalStudents = filteredStudents.length
    const goodBehavior = filteredStudents.filter((s) => s.total_skips === 0).length
    const skippedBehavior = filteredStudents.filter((s) => s.total_skips > 0).length
    const avgCompletion =
      totalStudents > 0 ? filteredStudents.reduce((sum, s) => sum + s.avg_completion, 0) / totalStudents : 0
    const totalSkips = filteredStudents.reduce((sum, s) => sum + s.total_skips, 0)

    return {
      totalStudents,
      goodBehavior,
      skippedBehavior,
      avgCompletion,
      totalSkips,
    }
  }, [filteredStudents])

  // Get unique class names from analytics
  const uniqueClasses = useMemo(() => {
    const classSet = new Set<string>()
    analytics.forEach((record) => {
      if (record.class_name) {
        classSet.add(record.class_name)
      }
    })
    return Array.from(classSet).sort()
  }, [analytics])

  // Export to Excel
  const exportToExcel = () => {
    const headers = [
      "Student ID",
      "Magaca Ardayga",
      "Fasalka",
      "Jaamacadda",
      "Tirada Videos",
      "La Dhammeeyay",
      "Celceliska %",
      "Tirada Booditaanada",
      "Waqtiga La Booday (min)",
      "Dabeecadda",
    ]

    const rows = filteredStudents.map((student) => [
      student.student_id,
      student.student_name,
      student.class_name,
      student.university_name,
      student.total_videos,
      student.completed_videos,
      `${student.avg_completion.toFixed(1)}%`,
      student.total_skips,
      Math.round(student.total_skipped_seconds / 60),
      student.total_skips === 0 ? "Si Fiican" : "Wuu Bootiyay",
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `video-behavior-report-${new Date().toISOString().split("T")[0]}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#1e3a5f] rounded-xl">
            <Video className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">Warbixinta Dabeecadda Video-ga</h1>
            <p className="text-gray-600">Raadi ardayda bootiyay iyo kuwa si fiican u daawday</p>
          </div>
        </div>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Excel Soo Dag
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-white border-2 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Wadarta Ardayda</p>
                <p className="text-2xl font-bold text-[#1e3a5f]">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Si Fiican U Daawday</p>
                <p className="text-2xl font-bold text-green-600">{stats.goodBehavior}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <SkipForward className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Wax Bootiyay</p>
                <p className="text-2xl font-bold text-red-600">{stats.skippedBehavior}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Celceliska Completion</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgCompletion.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FastForward className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Wadarta Booditaanada</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalSkips}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-white">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-700">Shaandhee:</span>
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Raadi magaca ama ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Dooro Fasalka" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Dhammaan Fasallada</SelectItem>
                {uniqueClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={behaviorFilter === "all" ? "default" : "outline"}
                onClick={() => setBehaviorFilter("all")}
                className={behaviorFilter === "all" ? "bg-[#1e3a5f]" : ""}
              >
                Dhammaan
              </Button>
              <Button
                variant={behaviorFilter === "good" ? "default" : "outline"}
                onClick={() => setBehaviorFilter("good")}
                className={
                  behaviorFilter === "good" ? "bg-green-600 hover:bg-green-700" : "text-green-600 border-green-300"
                }
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Si Fiican
              </Button>
              <Button
                variant={behaviorFilter === "skipped" ? "default" : "outline"}
                onClick={() => setBehaviorFilter("skipped")}
                className={behaviorFilter === "skipped" ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-300"}
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Bootiyay
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-[#1e3a5f] flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Liiska Ardayda ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold text-[#1e3a5f]">Student ID</TableHead>
                  <TableHead className="font-bold text-[#1e3a5f]">Magaca</TableHead>
                  <TableHead className="font-bold text-[#1e3a5f]">Fasalka</TableHead>
                  <TableHead className="font-bold text-[#1e3a5f] text-center">Videos</TableHead>
                  <TableHead className="font-bold text-[#1e3a5f] text-center">La Dhammeeyay</TableHead>
                  <TableHead className="font-bold text-[#1e3a5f] text-center">Celceliska</TableHead>
                  <TableHead className="font-bold text-[#1e3a5f] text-center">Booditaanada</TableHead>
                  <TableHead className="font-bold text-[#1e3a5f] text-center">Waqtiga La Booday</TableHead>
                  <TableHead className="font-bold text-[#1e3a5f] text-center">Dabeecadda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Xog lama helin
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.student_id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.student_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {student.class_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{student.total_videos}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">
                          {student.completed_videos}/{student.total_videos}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-medium ${
                            student.avg_completion >= 80
                              ? "text-green-600"
                              : student.avg_completion >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {student.avg_completion.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.total_skips > 0 ? (
                          <span className="text-red-600 font-bold flex items-center justify-center gap-1">
                            <SkipForward className="h-4 w-4" />
                            {student.total_skips}
                          </span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.total_skipped_seconds > 0 ? (
                          <span className="text-red-600">{Math.round(student.total_skipped_seconds / 60)} daqiiqo</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.total_skips === 0 ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Si Fiican
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Wuu Bootiyay
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
