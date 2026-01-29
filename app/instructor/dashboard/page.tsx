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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#e63946]" />
      </div>
    )
  }

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                My Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-800">{stats?.courses_count ?? 0}</p>
              <Button variant="link" className="p-0 h-auto text-[#e63946]" asChild>
                <Link href="/instructor/courses">View courses</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-800">{stats?.enrollments_count ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-800">{stats?.students_count ?? 0}</p>
              <Button variant="link" className="p-0 h-auto text-[#e63946]" asChild>
                <Link href="/instructor/students">View students</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent courses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recent_activity?.length ? (
              <ul className="space-y-2">
                {stats.recent_activity.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-600">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    {a.title}
                    <span className="text-slate-400 text-sm">
                      {new Date(a.at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No courses yet. Create your first course to get started.</p>
            )}
            <Button className="mt-4 bg-[#e63946] hover:bg-[#d62839]" asChild>
              <Link href="/instructor/courses">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
