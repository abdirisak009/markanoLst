"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Loader2, TrendingUp, Users, BookOpen, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface Analytics {
  enrollments_count: number
  students_count: number
  completed_count: number
  completion_rate_percent: number
  revenue: number
  by_course: Array<{
    course_id: number
    title: string
    slug: string
    enrollments: number
    completed: number
  }>
}

export default function InstructorAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/instructor/analytics", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/instructor/login?redirect=/instructor/analytics"
          return null
        }
        return res.json()
      })
      .then((d) => {
        if (d) setData(d)
      })
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#e63946]" />
      </div>
    )
  }

  const a = data!

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-[#e63946]" />
          Analytics
        </h1>
        <p className="text-slate-500 mt-1">Enrollments, completion rate, and revenue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Enrollments</p>
                <p className="text-2xl font-bold text-slate-800">{a.enrollments_count ?? 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-[#e63946]/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Students</p>
                <p className="text-2xl font-bold text-slate-800">{a.students_count ?? 0}</p>
              </div>
              <Users className="h-8 w-8 text-[#e63946]/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Completion rate</p>
                <p className="text-2xl font-bold text-slate-800">{a.completion_rate_percent ?? 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#e63946]/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold text-slate-800">${Number(a.revenue ?? 0).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-[#e63946]/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">By course</CardTitle>
          <p className="text-slate-500 text-sm">Enrollments and completions per course</p>
        </CardHeader>
        <CardContent>
          {a.by_course?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600 font-medium">
                    <th className="pb-2 pr-4">Course</th>
                    <th className="pb-2 pr-4">Enrollments</th>
                    <th className="pb-2">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {a.by_course.map((c) => (
                    <tr key={c.course_id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 pr-4 font-medium">{c.title}</td>
                      <td className="py-3 pr-4">{c.enrollments}</td>
                      <td className="py-3">{c.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500">No course data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
