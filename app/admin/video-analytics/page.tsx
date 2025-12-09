"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Search, Video, Users, TrendingUp, Clock } from "lucide-react"

interface AnalyticsData {
  video_id: number
  video_title: string
  category: string
  student_id: string
  student_name: string
  university_name: string
  watch_duration: number
  total_duration: number
  completion_percentage: number
  skipped_count: number
  speed_attempts: number
  watched_at: string
  last_position: number
}

export default function VideoAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/videos/analytics")
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["All", ...Array.from(new Set(analytics.map((a) => a.category).filter(Boolean)))]

  const filteredAnalytics = analytics.filter((item) => {
    const matchesSearch =
      item.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.video_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalVideosWatched = new Set(analytics.map((a) => a.video_id)).size
  const totalStudents = new Set(analytics.map((a) => a.student_id)).size
  const avgCompletion =
    analytics.length > 0 ? analytics.reduce((sum, a) => sum + (a.completion_percentage || 0), 0) / analytics.length : 0
  const totalWatchTime = analytics.reduce((sum, a) => sum + (a.watch_duration || 0), 0)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Video Analytics</h1>
          <p className="text-gray-600 mt-2">Track student video watching progress and engagement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos Watched</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideosWatched}</div>
            <p className="text-xs text-muted-foreground">Unique videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Watching videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgCompletion)}%</div>
            <p className="text-xs text-muted-foreground">Average progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalWatchTime)}</div>
            <p className="text-xs text-muted-foreground">Cumulative time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Watch History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, video, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading analytics...</p>
          ) : filteredAnalytics.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No watch history found</p>
          ) : (
            <div className="space-y-4">
              {filteredAnalytics.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1e3a5f] mb-1">{item.video_title || "Unknown Video"}</h3>
                        <p className="text-sm text-gray-600">
                          {item.student_name || "Unknown Student"} ({item.student_id})
                        </p>
                        {item.university_name && <p className="text-xs text-gray-500 mt-1">{item.university_name}</p>}
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mb-1">
                          {item.category || "N/A"}
                        </span>
                        <p className="text-xs text-gray-500">{formatDate(item.watched_at)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-[#1e3a5f]">
                          {Math.round(item.completion_percentage || 0)}%
                        </span>
                      </div>
                      <Progress value={item.completion_percentage || 0} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {formatDuration(item.watch_duration)} / {formatDuration(item.total_duration)}
                        </span>
                        <span>Last: {formatDuration(item.last_position)}</span>
                      </div>
                      {item.skipped_count > 0 && (
                        <div className="pt-2 mt-2 border-t border-gray-200">
                          <p className="text-xs text-orange-600 font-medium">
                            ⚠️ Skipped forward {item.skipped_count} time{item.skipped_count > 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
