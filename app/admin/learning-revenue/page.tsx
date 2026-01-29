"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DollarSign, BookOpen, Loader2, User } from "lucide-react"
import { toast } from "sonner"

interface CourseRevenue {
  course_id: number
  course_title: string
  slug: string
  instructor_id: number | null
  instructor_name: string | null
  total_amount: number
  payment_count: number
}

interface LearningRevenueData {
  by_course: CourseRevenue[]
  total_amount: number
}

export default function AdminLearningRevenuePage() {
  const [data, setData] = useState<LearningRevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenue()
  }, [])

  const fetchRevenue = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/learning-revenue", { credentials: "include" })
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-[#e63946]" />
              Learning Courses Revenue
            </h1>
            <p className="text-gray-500 mt-1">
              Revenue from Learning Courses (completed/approved course payments). Per course and total.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-[#e63946]" />
              </div>
            ) : (
              <>
                <Card className="mt-6 border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Total revenue</CardTitle>
                    <CardDescription>All completed Learning Course payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-[#e63946]">
                      ${(data?.total_amount ?? 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="mt-6 border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Revenue by course
                    </CardTitle>
                    <CardDescription>Amount and count per course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data?.by_course?.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-gray-500">
                              <th className="py-2 pr-4">Course</th>
                              <th className="py-2 pr-4">Instructor</th>
                              <th className="py-2 pr-4 text-right">Payments</th>
                              <th className="py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.by_course.map((r) => (
                              <tr key={r.course_id} className="border-b last:border-0">
                                <td className="py-2 pr-4">
                                  <span className="font-medium text-gray-800">{r.course_title}</span>
                                  {r.slug && (
                                    <span className="text-gray-400 text-xs ml-1">/{r.slug}</span>
                                  )}
                                </td>
                                <td className="py-2 pr-4 flex items-center gap-1">
                                  {r.instructor_name ? (
                                    <>
                                      <User className="h-3 w-3 text-gray-400" />
                                      {r.instructor_name}
                                    </>
                                  ) : (
                                    <span className="text-gray-400">System</span>
                                  )}
                                </td>
                                <td className="py-2 pr-4 text-right">{r.payment_count}</td>
                                <td className="py-2 text-right font-medium">
                                  ${r.total_amount.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No revenue data yet.</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
