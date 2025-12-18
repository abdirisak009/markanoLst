"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Video,
  TrendingUp,
  Copy,
  CheckCircle,
  BookOpen,
  DollarSign,
  BarChart3,
  Trophy,
  Eye,
  GraduationCap,
  Layers,
  ArrowUpRight,
  Crown,
  Star,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { cn } from "@/lib/utils"

interface DashboardStats {
  totalStudents: number
  universityStudents: number
  pennStudents: number
  totalVideos: number
  totalViews: number
  totalGroups: number
  totalClasses: number
  topStudents: Array<{
    full_name: string
    student_id: string
    class_name: string
    avg_percentage: number
    assignments_completed: number
  }>
  groupStats: Array<{
    id: number
    group_name: string
    class_name: string
    capacity: number
    member_count: number
    paid_count: number
  }>
  videosByCategory: Array<{
    category: string
    video_count: number
    total_views: number
  }>
  performanceData: Array<{
    date: string
    avg_score: number
    submissions: number
  }>
  classDistribution: Array<{
    class_name: string
    student_count: number
  }>
  paymentSummary: {
    totalCollected: number
    totalExpenses: number
    netBalance: number
  }
}

const BRAND_COLORS = {
  primary: "#013565",
  accent: "#ff1b4a",
  emerald: "#10b981",
  amber: "#f59e0b",
  purple: "#8b5cf6",
}

const CHART_COLORS = ["#013565", "#ff1b4a", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"]

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
    const adminUser = localStorage.getItem("adminUser")
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser)
        setUserRole(user.role)
      } catch (e) {
        setUserRole(null)
      }
    }
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = (type: string, url: string) => {
    const link = `${window.location.origin}${url}`
    navigator.clipboard.writeText(link)
    setCopiedLink(type)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#013565]/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#013565] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-[#013565] font-medium animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-6 sm:pb-8 px-2 sm:px-0">
      {/* Header Section - Made responsive with smaller text on mobile */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#013565] via-[#024a8a] to-[#013565] p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-[#ff1b4a]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 shrink-0">
              <img src="/images/ll.png" alt="Markano Logo" className="w-full h-full object-contain drop-shadow-lg" />
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-[#ff1b4a]/30 blur-xl rounded-full -z-10"></div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Welcome to Markano</h1>
              <p className="text-white/60 text-xs sm:text-sm font-medium tracking-wide">LEARNING MANAGEMENT SYSTEM</p>
            </div>
          </div>
          <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-2xl">
            Your comprehensive learning management dashboard. Monitor student progress, track performance, and manage
            your educational platform.
          </p>
        </div>
      </div>

      {/* Copy Links Section - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#013565]/20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#013565] to-[#024a8a] flex items-center justify-center shadow-lg shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#013565] text-base sm:text-lg truncate">Student Group View</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      Share with students to check their group
                    </p>
                  </div>
                </div>
                <code className="text-[10px] sm:text-xs bg-white/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[#013565] font-mono block truncate">
                  {typeof window !== "undefined" ? `${window.location.origin}/student/group` : "/student/group"}
                </code>
              </div>
              <Button
                onClick={() => copyLink("group", "/student/group")}
                className={cn(
                  "shrink-0 transition-all duration-300 w-full sm:w-auto",
                  copiedLink === "group" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#013565] hover:bg-[#024a8a]",
                )}
                size="sm"
              >
                {copiedLink === "group" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#ff1b4a]/20 bg-gradient-to-br from-red-50 to-pink-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#ff1b4a] to-[#ff4d6d] flex items-center justify-center shadow-lg shrink-0">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#ff1b4a] text-base sm:text-lg truncate">Student Performance</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Check marks and assignments progress</p>
                  </div>
                </div>
                <code className="text-[10px] sm:text-xs bg-white/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[#ff1b4a] font-mono block truncate">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/student/performance`
                    : "/student/performance"}
                </code>
              </div>
              <Button
                onClick={() => copyLink("performance", "/student/performance")}
                className={cn(
                  "shrink-0 transition-all duration-300 w-full sm:w-auto",
                  copiedLink === "performance"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-[#ff1b4a] hover:bg-[#e01640]",
                )}
                size="sm"
              >
                {copiedLink === "performance" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shrink-0">
                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-emerald-600 text-base sm:text-lg truncate">E-commerce Wizard</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Share with groups to fill business plan</p>
                  </div>
                </div>
                <code className="text-[10px] sm:text-xs bg-white/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-emerald-600 font-mono block truncate">
                  {typeof window !== "undefined" ? `${window.location.origin}/ecommerce-wizard` : "/ecommerce-wizard"}
                </code>
              </div>
              <Button
                onClick={() => copyLink("ecommerce", "/ecommerce-wizard")}
                className={cn(
                  "shrink-0 transition-all duration-300 w-full sm:w-auto",
                  copiedLink === "ecommerce"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-emerald-500 hover:bg-emerald-600",
                )}
                size="sm"
              >
                {copiedLink === "ecommerce" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - 2 columns on mobile, 3 on tablet, 6 on desktop */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 ${userRole === "superadmin" || userRole === "admin" ? "lg:grid-cols-6" : "lg:grid-cols-5"} gap-2 sm:gap-3 lg:gap-4`}
      >
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#013565] to-[#024a8a] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Students</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#013565]">{stats?.totalStudents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#ff1b4a] to-[#ff4d6d] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Videos</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#ff1b4a]">{stats?.totalVideos || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Views</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">
                  {stats?.totalViews?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Groups</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats?.totalGroups || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Classes</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{stats?.totalClasses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(userRole === "superadmin" || userRole === "admin") && (
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide truncate">Balance</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-600">
                    ${stats?.paymentSummary?.netBalance?.toFixed(0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row - Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Performing Students */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-[#013565]">Top Performing Students</CardTitle>
                  <p className="text-[10px] sm:text-xs text-gray-500">Based on assignment marks</p>
                </div>
              </div>
              <Link href="/admin/performance">
                <Button variant="ghost" size="sm" className="text-[#013565] hover:bg-[#013565]/10 text-xs sm:text-sm">
                  View All <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
            <div className="space-y-2 sm:space-y-3">
              {stats?.topStudents?.slice(0, 5).map((student, index) => (
                <div
                  key={student.student_id}
                  className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-transparent hover:from-[#013565]/5 transition-all group"
                >
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg shrink-0 text-xs sm:text-sm",
                      index === 0
                        ? "bg-gradient-to-br from-amber-400 to-amber-600"
                        : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-500"
                          : index === 2
                            ? "bg-gradient-to-br from-amber-600 to-amber-800"
                            : "bg-gradient-to-br from-[#013565] to-[#024a8a]",
                    )}
                  >
                    {index < 3 ? <Crown className="w-4 h-4 sm:w-5 sm:h-5" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#013565] truncate text-sm sm:text-base">{student.full_name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                      {student.class_name} • {student.assignments_completed} assignments
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-base sm:text-lg font-bold",
                        student.avg_percentage >= 90
                          ? "text-emerald-600"
                          : student.avg_percentage >= 70
                            ? "text-[#013565]"
                            : "text-amber-600",
                      )}
                    >
                      {student.avg_percentage}%
                    </p>
                    <div className="flex items-center gap-0.5 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-2 h-2 sm:w-3 sm:h-3",
                            i < Math.round(student.avg_percentage / 20)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.topStudents || stats.topStudents.length === 0) && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No performance data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Video Views by Category */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#ff1b4a] to-[#ff4d6d] flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-[#013565]">Video Views by Category</CardTitle>
                  <p className="text-[10px] sm:text-xs text-gray-500">Distribution of video engagement</p>
                </div>
              </div>
              <Link href="/admin/video-analytics">
                <Button variant="ghost" size="sm" className="text-[#013565] hover:bg-[#013565]/10 text-xs sm:text-sm">
                  Analytics <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
            {stats?.videosByCategory && stats.videosByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
                <BarChart data={stats.videosByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: "#374151" }} width={80} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      backgroundColor: "white",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} views`, "Views"]}
                  />
                  <Bar dataKey="total_views" fill="#013565" radius={[0, 8, 8, 0]} name="Views" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <Video className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No video data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* More Charts Row - Full width on mobile, 2/3 + 1/3 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Performance Trend */}
        <Card className="lg:col-span-2 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg text-[#013565]">Performance Trend</CardTitle>
                <p className="text-[10px] sm:text-xs text-gray-500">Average scores over the last 30 days</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
            {stats?.performanceData && stats.performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
                <AreaChart data={stats.performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#013565" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#013565" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: "#6b7280" }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "#6b7280" }}
                    tickFormatter={(value) => `${value}%`}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      backgroundColor: "white",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Avg Score"]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="avg_score"
                    stroke="#013565"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No performance data in the last 30 days</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Distribution */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg text-[#013565]">Students by Class</CardTitle>
                <p className="text-[10px] sm:text-xs text-gray-500">Distribution overview</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
            {stats?.classDistribution && stats.classDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
                <PieChart>
                  <Pie
                    data={stats.classDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="student_count"
                    nameKey="class_name"
                    paddingAngle={2}
                  >
                    {stats.classDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      backgroundColor: "white",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [`${value} students`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No class data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Groups Overview - Responsive grid for group cards */}
      <Card className="hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#013565] to-[#024a8a] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg text-[#013565]">Groups Overview</CardTitle>
                <p className="text-[10px] sm:text-xs text-gray-500">Member distribution and payment status</p>
              </div>
            </div>
            <Link href="/admin/groups">
              <Button variant="ghost" size="sm" className="text-[#013565] hover:bg-[#013565]/10 text-xs sm:text-sm">
                Manage Groups <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {stats?.groupStats?.map((group) => (
              <div
                key={group.id}
                className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg hover:border-[#013565]/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                  <h4 className="font-bold text-[#013565] truncate text-sm sm:text-base">{group.group_name}</h4>
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-[#013565]/10 text-[#013565] shrink-0">
                    {group.class_name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-500">Members</p>
                    <p className="font-bold text-base sm:text-lg text-[#013565]">
                      {group.member_count}/{group.capacity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Paid</p>
                    <p
                      className={cn(
                        "font-bold text-base sm:text-lg",
                        group.paid_count === group.member_count && group.member_count > 0
                          ? "text-emerald-600"
                          : "text-amber-600",
                      )}
                    >
                      {group.paid_count}/{group.member_count}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#013565] to-[#024a8a] rounded-full transition-all duration-500"
                    style={{ width: `${group.capacity > 0 ? (group.member_count / group.capacity) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {(!stats?.groupStats || stats.groupStats.length === 0) && (
              <div className="col-span-full text-center py-6 sm:py-8 text-gray-500">
                <Layers className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No groups created yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - 2x2 grid on all sizes, responsive padding */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Link href="/admin/all-students" className="group">
          <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-[#013565]/20">
            <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#013565] to-[#024a8a] flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#013565] mb-0.5 sm:mb-1 text-xs sm:text-sm lg:text-base">
                Manage Students
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">View and track all learners</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/videos" className="group">
          <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-[#ff1b4a]/20">
            <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#ff1b4a] to-[#ff4d6d] flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#ff1b4a] mb-0.5 sm:mb-1 text-xs sm:text-sm lg:text-base">Manage Videos</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Upload and organize content</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/performance" className="group">
          <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-emerald-500/20">
            <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="font-bold text-emerald-600 mb-0.5 sm:mb-1 text-xs sm:text-sm lg:text-base">Performance</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Enter and track marks</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/financial-report" className="group">
          <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-amber-500/20">
            <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="font-bold text-amber-600 mb-0.5 sm:mb-1 text-xs sm:text-sm lg:text-base">
                Financial Report
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">View revenue and expenses</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
