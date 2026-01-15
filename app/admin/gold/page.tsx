"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Award, Plus, Settings, GraduationCap, Layers, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Stats {
  totalTracks: number
  totalLevels: number
  totalLessons: number
  totalStudents: number
  activeEnrollments: number
  pendingRequests: number
  completedLessons: number
}

export default function GoldAdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalTracks: 0,
    totalLevels: 0,
    totalLessons: 0,
    totalStudents: 0,
    activeEnrollments: 0,
    pendingRequests: 0,
    completedLessons: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [tracksRes, studentsRes, requestsRes] = await Promise.all([
        fetch("/api/gold/tracks"),
        fetch("/api/gold/students"),
        fetch("/api/gold/level-requests?status=pending"),
      ])

      const tracks = await tracksRes.json()
      const students = await studentsRes.json()
      const requests = await requestsRes.json()

      setStats({
        totalTracks: tracks.length || 0,
        totalLevels: tracks.reduce((sum: number, t: any) => sum + Number(t.levels_count || 0), 0),
        totalLessons: tracks.reduce((sum: number, t: any) => sum + Number(t.lessons_count || 0), 0),
        totalStudents: students.length || 0,
        activeEnrollments: tracks.reduce((sum: number, t: any) => sum + Number(t.enrolled_students || 0), 0),
        pendingRequests: requests.length || 0,
        completedLessons: 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: "Tracks", value: stats.totalTracks, icon: Layers, color: "bg-blue-500", href: "/admin/gold/tracks" },
    { title: "Levels", value: stats.totalLevels, icon: Award, color: "bg-purple-500", href: "/admin/gold/tracks" },
    { title: "Lessons", value: stats.totalLessons, icon: BookOpen, color: "bg-green-500", href: "/admin/gold/lessons" },
    { title: "Students", value: stats.totalStudents, icon: Users, color: "bg-amber-500", href: "/admin/gold/students" },
    {
      title: "Enrollments",
      value: stats.activeEnrollments,
      icon: GraduationCap,
      color: "bg-cyan-500",
      href: "/admin/gold/students",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: Clock,
      color: "bg-red-500",
      href: "/admin/gold/requests",
    },
  ]

  const quickActions = [
    { title: "Add New Track", icon: Plus, href: "/admin/gold/tracks", color: "bg-blue-600" },
    { title: "Manage Students", icon: Users, href: "/admin/gold/students", color: "bg-green-600" },
    { title: "Level Requests", icon: AlertCircle, href: "/admin/gold/requests", color: "bg-amber-600" },
    { title: "Settings", icon: Settings, href: "/admin/gold/settings", color: "bg-gray-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl">
                <Award className="h-8 w-8 text-white" />
              </div>
              Markano Gold
            </h1>
            <p className="text-slate-400 mt-1">Modern Learning Program Management</p>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
              Back to Admin
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <Link key={index} href={stat.href}>
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div
                    className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{loading ? "..." : stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">Start your tasks today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button
                    className={`${action.color} hover:opacity-90 w-full h-auto py-4 flex flex-col items-center gap-2`}
                  >
                    <action.icon className="h-6 w-6" />
                    <span className="text-sm">{action.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tracks Overview */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Tracks</CardTitle>
                <CardDescription className="text-slate-400">Learning paths</CardDescription>
              </div>
              <Link href="/admin/gold/tracks">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-slate-400 text-center py-4">Loading...</p>
                ) : stats.totalTracks === 0 ? (
                  <div className="text-center py-8">
                    <Layers className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No tracks yet</p>
                    <Link href="/admin/gold/tracks">
                      <Button size="sm" className="mt-3 bg-blue-600">
                        Add Track
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href="/admin/gold/tracks">
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-700">
                      View all tracks ({stats.totalTracks})
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">New Students</CardTitle>
                <CardDescription className="text-slate-400">Recently enrolled students</CardDescription>
              </div>
              <Link href="/admin/gold/students">
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-slate-400 text-center py-4">Loading...</p>
                ) : stats.totalStudents === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No students yet</p>
                  </div>
                ) : (
                  <Link href="/admin/gold/students">
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-700">
                      View all students ({stats.totalStudents})
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Level Requests Alert */}
        {stats.pendingRequests > 0 && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-white font-medium">{stats.pendingRequests} Pending Requests</p>
                  <p className="text-slate-400 text-sm">Students are waiting for approval to the next level</p>
                </div>
              </div>
              <Link href="/admin/gold/requests">
                <Button className="bg-amber-600 hover:bg-amber-700">View Requests</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
