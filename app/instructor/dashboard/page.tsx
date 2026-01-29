"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  Loader2,
  Plus,
  LayoutDashboard,
} from "lucide-react"
import { toast } from "sonner"

interface DashboardStats {
  courses_count: number
  enrollments_count: number
  students_count: number
  recent_activity: Array<{ type: string; title: string; at: string }>
}

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/instructor/dashboard", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/instructor/login?redirect=/instructor/dashboard"
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data) setStats(data)
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#e63946]" />
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your courses and activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#e63946]/10">
                <BookOpen className="h-4 w-4 text-[#e63946]" />
              </div>
              My Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{stats?.courses_count ?? 0}</p>
            <Button variant="link" className="p-0 h-auto text-[#e63946] font-medium mt-2" asChild>
              <Link href="/instructor/courses">View courses →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{stats?.enrollments_count ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{stats?.students_count ?? 0}</p>
            <Button variant="link" className="p-0 h-auto text-[#e63946] font-medium mt-2" asChild>
              <Link href="/instructor/students">View students →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <LayoutDashboard className="h-5 w-5 text-[#e63946]" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your recent courses</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recent_activity?.length ? (
            <ul className="space-y-3">
              {stats.recent_activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700 font-medium">{a.title}</span>
                  <span className="text-slate-400 text-sm ml-auto">
                    {new Date(a.at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 py-4">No courses yet. Create your first course to get started.</p>
          )}
          <Button className="mt-6 bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white shadow-lg shadow-[#e63946]/25 rounded-xl" asChild>
            <Link href="/instructor/courses">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
