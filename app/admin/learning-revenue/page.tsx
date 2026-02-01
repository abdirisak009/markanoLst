"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DollarSign,
  BookOpen,
  Loader2,
  User,
  GraduationCap,
  Search,
  Filter,
  FileDown,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CourseRevenue {
  course_id: number
  course_title: string
  slug: string
  instructor_id: number | null
  instructor_name: string | null
  total_amount: number
  payment_count: number
}

interface InstructorRevenue {
  instructor_id: number
  instructor_name: string
  total_amount: number
  payment_count: number
  course_count: number
}

interface StudentRevenue {
  user_id: number
  student_name: string
  student_email: string | null
  total_amount: number
  payment_count: number
  course_count: number
}

interface LearningRevenueData {
  by_course: CourseRevenue[]
  by_instructor: InstructorRevenue[]
  by_student: StudentRevenue[]
  total_amount: number
}

type ViewTab = "all" | "instructor" | "student" | "course"

export default function AdminLearningRevenuePage() {
  const [data, setData] = useState<LearningRevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewTab>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const printRef = useRef<HTMLDivElement>(null)

  const fetchRevenue = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/learning-revenue?${params.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setData(json)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load learning revenue")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRevenue()
  }, [dateFrom, dateTo, search])

  const handleSearch = () => setSearch(searchInput.trim())
  const handlePrintPdf = () => {
    if (!printRef.current) return
    const prevTitle = document.title
    document.title = "Learning Revenue - Markano"
    window.print()
    document.title = prevTitle
  }

  const tabs: { id: ViewTab; label: string; icon: typeof User }[] = [
    { id: "all", label: "Overview", icon: DollarSign },
    { id: "instructor", label: "By Instructor", icon: User },
    { id: "student", label: "By Student", icon: GraduationCap },
    { id: "course", label: "By Course", icon: BookOpen },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <div className="print:hidden">
          <AdminSidebar />
        </div>
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto" ref={printRef}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 print:mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-7 w-7 text-[#2596be]" />
                  Learning Courses Revenue
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Revenue from Learning Courses (completed/approved payments). By instructor, student, and course.
                </p>
              </div>
              <Button
                onClick={handlePrintPdf}
                variant="outline"
                className="rounded-xl border-[#2596be]/40 text-[#2596be] hover:bg-[#2596be]/10 shrink-0 print:hidden"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export / Print PDF
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6 border border-gray-200 shadow-sm print:hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#2596be]" />
                  Filters
                </CardTitle>
                <CardDescription>Filter by date range and search by name or course</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-gray-600">From date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="pl-9 h-10 rounded-xl border-gray-200 w-40"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-gray-600">To date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="pl-9 h-10 rounded-xl border-gray-200 w-40"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                  <Label className="text-xs font-semibold text-gray-600">Search (name, course)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-9 h-10 rounded-xl border-gray-200"
                      />
                    </div>
                    <Button onClick={handleSearch} className="h-10 rounded-xl bg-[#2596be] hover:bg-[#1e7a9e] text-white px-4">
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 print:hidden">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all",
                    view === id
                      ? "bg-[#2596be] text-white shadow-lg shadow-[#2596be]/25"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#2596be]/40 hover:bg-[#2596be]/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[#2596be]" />
              </div>
            ) : (
              <>
                {/* Total revenue card */}
                <Card className="mb-6 border-2 border-[#2596be]/20 bg-gradient-to-br from-white to-[#2596be]/5 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-[#2596be]">
                      <DollarSign className="h-5 w-5" />
                      Total revenue
                    </CardTitle>
                    <CardDescription>All completed Learning Course payments in selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      ${(data?.total_amount ?? 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                {/* By Instructor */}
                {(view === "all" || view === "instructor") && (
                  <Card className="mb-6 border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-[#2596be]" />
                        Revenue by instructor
                      </CardTitle>
                      <CardDescription>Amount and payment count per instructor</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.by_instructor?.length ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {data.by_instructor.map((r) => (
                            <div
                              key={r.instructor_id}
                              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#2596be]/20 transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-11 w-11 rounded-xl bg-[#2596be]/10 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-[#2596be]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{r.instructor_name}</p>
                                    <p className="text-xs text-gray-500">{r.course_count} course(s) · {r.payment_count} payment(s)</p>
                                  </div>
                                </div>
                                <p className="text-lg font-bold text-[#2596be] shrink-0">${r.total_amount.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 py-6 text-center">No instructor revenue data yet.</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* By Student */}
                {(view === "all" || view === "student") && (
                  <Card className="mb-6 border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-[#2596be]" />
                        Revenue by student
                      </CardTitle>
                      <CardDescription>Amount and payment count per student (payer)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.by_student?.length ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {data.by_student.map((r) => (
                            <div
                              key={r.user_id}
                              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#2596be]/20 transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <GraduationCap className="h-5 w-5 text-emerald-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{r.student_name}</p>
                                    {r.student_email && <p className="text-xs text-gray-500 truncate">{r.student_email}</p>}
                                    <p className="text-xs text-gray-500">{r.course_count} course(s) · {r.payment_count} payment(s)</p>
                                  </div>
                                </div>
                                <p className="text-lg font-bold text-emerald-600 shrink-0">${r.total_amount.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 py-6 text-center">No student revenue data yet.</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* By Course */}
                {(view === "all" || view === "course") && (
                  <Card className="mb-6 border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[#2596be]" />
                        Revenue by course
                      </CardTitle>
                      <CardDescription>Amount and payment count per course</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.by_course?.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 text-left text-gray-500">
                                <th className="py-3 pr-4 font-semibold">Course</th>
                                <th className="py-3 pr-4 font-semibold">Instructor</th>
                                <th className="py-3 pr-4 text-right font-semibold">Payments</th>
                                <th className="py-3 text-right font-semibold">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.by_course.map((r) => (
                                <tr key={r.course_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80">
                                  <td className="py-3 pr-4">
                                    <span className="font-medium text-gray-800">{r.course_title}</span>
                                    {r.slug && <span className="text-gray-400 text-xs ml-1">/{r.slug}</span>}
                                  </td>
                                  <td className="py-3 pr-4 flex items-center gap-1">
                                    {r.instructor_name ? (
                                      <>
                                        <User className="h-3.5 w-3.5 text-gray-400" />
                                        {r.instructor_name}
                                      </>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>
                                  <td className="py-3 pr-4 text-right">{r.payment_count}</td>
                                  <td className="py-3 text-right font-semibold text-[#2596be]">
                                    ${r.total_amount.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 py-6 text-center">No course revenue data yet.</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
      </div>
    </div>
    </div>
  )
}
