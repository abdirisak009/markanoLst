"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Users,
  TrendingUp,
  Loader2,
  Plus,
  LayoutDashboard,
  FileCheck,
  AlertTriangle,
  Percent,
  Wallet,
  BarChart3,
} from "lucide-react"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DashboardStats {
  courses_count: number
  enrollments_count: number
  students_count: number
  recent_activity: Array<{ type: string; title: string; at: string }>
}

interface RevenueData {
  revenue_share_percent: number | null
  available_balance: number
  this_month_earned: number
  revenue_by_month: Array<{ month: string; month_label: string; amount: number }>
}

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [agreementStatus, setAgreementStatus] = useState<{ must_accept: boolean; accepted: boolean; agreement_accepted_at: string | null } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/instructor/dashboard", { credentials: "include" }),
      fetch("/api/instructor/revenue", { credentials: "include" }),
    ])
      .then(([resDashboard, resRevenue]) => {
        if (resDashboard.status === 401) {
          window.location.href = "/instructor/login?redirect=/instructor/dashboard"
          return [null, null] as [DashboardStats | null, RevenueData | null]
        }
        return Promise.all([
          resDashboard.ok ? resDashboard.json() : null,
          resRevenue.ok ? resRevenue.json() : null,
        ]) as Promise<[DashboardStats | null, RevenueData | null]>
      })
      .then(([data, rev]) => {
        if (data) setStats(data)
        if (rev) setRevenue(rev)
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch("/api/instructor/agreement", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAgreementStatus({ must_accept: d.must_accept, accepted: d.accepted, agreement_accepted_at: d.agreement_accepted_at }))
      .catch(() => {})
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {agreementStatus?.must_accept && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex flex-wrap items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-800">Instructor Agreement required</p>
            <p className="text-sm text-amber-700">You must accept the Instructor Agreement before creating lessons, publishing courses, or receiving payouts.</p>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 rounded-xl">
            <Link href="/instructor/agreement">Accept Agreement</Link>
          </Button>
        </div>
      )}
      {agreementStatus?.accepted && agreementStatus.agreement_accepted_at && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 flex items-center gap-2 text-sm text-emerald-800">
          <FileCheck className="h-4 w-4 shrink-0" />
          <span>Agreement accepted on {new Date(agreementStatus.agreement_accepted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
          <Link href="/instructor/agreement" className="text-emerald-600 hover:underline ml-auto">View</Link>
        </div>
      )}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
        <Card className="border-0 shadow-xl shadow-[#016b62]/10 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Percent className="h-4 w-4 text-[#016b62]" />
              </div>
              Revenue Sharing %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#016b62]">{revenue?.revenue_share_percent != null ? `${revenue.revenue_share_percent}%` : "—"}</p>
            <Button variant="link" className="p-0 h-auto text-[#016b62] font-medium mt-2" asChild>
              <Link href="/instructor/revenue">View revenue →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-[#016b62]/10 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Wallet className="h-4 w-4 text-[#016b62]" />
              </div>
              This Month Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#016b62]">${(revenue?.this_month_earned ?? 0).toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Available balance: ${(revenue?.available_balance ?? 0).toFixed(2)}</p>
            <Button variant="link" className="p-0 h-auto text-[#016b62] font-medium mt-2" asChild>
              <Link href="/instructor/revenue">Request payout →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {(revenue?.revenue_by_month?.length ?? 0) > 0 && (
        <Card className="border-0 shadow-xl shadow-[#016b62]/10 rounded-2xl overflow-hidden bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#016b62]">
              <BarChart3 className="h-5 w-5 text-[#016b62]" />
              Revenue by month
            </CardTitle>
            <CardDescription>Your earnings per month (last 12 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue?.revenue_by_month ?? []} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis dataKey="month_label" tick={{ fontSize: 12 }} className="text-slate-600" />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} className="text-slate-600" />
                  <Tooltip formatter={(v: number) => [`$${Number(v).toFixed(2)}`, "Revenue"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.month_label} />
                  <Bar dataKey="amount" fill="#016b62" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

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
