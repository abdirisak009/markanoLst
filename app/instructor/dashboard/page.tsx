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

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#016b62]">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your courses and activity</p>
      </div>

      {loading && !stats ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-2xl overflow-hidden bg-white">
                <CardHeader className="pb-2">
                  <div className="h-5 w-24 bg-slate-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-10 w-16 bg-slate-200 rounded" />
                  <div className="h-4 w-28 bg-slate-100 rounded mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="rounded-2xl overflow-hidden bg-white">
            <CardHeader>
              <div className="h-6 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-48 bg-slate-100 rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                ))}
              </div>
              <div className="h-12 w-40 bg-slate-200 rounded-xl mt-4" />
            </CardContent>
          </Card>
        </div>
      ) : (
      <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl shadow-[#016b62]/10 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#016b62]/10">
                <BookOpen className="h-4 w-4 text-[#016b62]" />
              </div>
              Learning Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#016b62]">{stats?.courses_count ?? 0}</p>
            <Button variant="link" className="p-0 h-auto text-[#016b62] font-medium mt-2" asChild>
              <Link href="/instructor/courses">View learning courses →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-[#016b62]/10 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#fcad21]/20">
                <TrendingUp className="h-4 w-4 text-[#016b62]" />
              </div>
              Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#016b62]">{stats?.enrollments_count ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-[#016b62]/10 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#016b62]/10">
                <Users className="h-4 w-4 text-[#016b62]" />
              </div>
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#016b62]">{stats?.students_count ?? 0}</p>
            <Button variant="link" className="p-0 h-auto text-[#016b62] font-medium mt-2" asChild>
              <Link href="/instructor/students">View students →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-xl shadow-[#016b62]/10 rounded-2xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#016b62]">
            <LayoutDashboard className="h-5 w-5 text-[#016b62]" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your recent courses</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recent_activity?.length ? (
            <ul className="space-y-3">
              {stats.recent_activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-[#f8faf9] hover:bg-[#fcf6f0] transition-colors">
                  <BookOpen className="h-4 w-4 text-[#016b62]" />
                  <span className="text-gray-700 font-medium">{a.title}</span>
                  <span className="text-gray-500 text-sm ml-auto">
                    {new Date(a.at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-4">No courses yet. Create your first course to get started.</p>
          )}
          <Button className="mt-6 bg-[#016b62] hover:bg-[#014d44] text-white shadow-lg rounded-xl" asChild>
            <Link href="/instructor/courses">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </CardContent>
      </Card>
      </div>
      )}
    </main>
  )
}
