"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Store,
  Search,
  Filter,
  Grid3X3,
  List,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  TrendingUp,
  Users,
  Target,
} from "lucide-react"

interface Submission {
  id: number
  group_id: number
  group_name?: string
  business_name: string
  product_name: string
  revenue_target: number
  status: string
  platform_selected: string
  current_step: number
  submitted_at: string
  created_at: string
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/ecommerce-wizard/admin/submissions")
      const data = await res.json()
      if (data.submissions) {
        setSubmissions(data.submissions)
      }
    } catch (err) {
      console.error("Error fetching submissions:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.group_id?.toString().includes(searchQuery)

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status === "submitted").length,
    inProgress: submissions.filter((s) => s.status === "in_progress").length,
    totalRevenue: submissions.reduce((acc, s) => acc + (Number(s.revenue_target) || 0), 0),
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#9ed674]/20 text-[#9ed674]">
            <CheckCircle2 className="w-3 h-3" /> Submitted
          </span>
        )
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            <AlertCircle className="w-3 h-3" /> Draft
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1d4041] to-[#0f1419] border-b border-[#1d4041]/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Store className="w-8 h-8 text-[#9ed674]" />
                E-commerce Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Manage and review group submissions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#9ed674]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#9ed674]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-gray-400">Total Groups</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#9ed674]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#9ed674]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.submitted}</p>
                  <p className="text-xs text-gray-400">Submitted</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                  <p className="text-xs text-gray-400">In Progress</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#9ed674]/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#9ed674]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Total Revenue Target</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by business name, product, or group ID..."
                className="pl-10 bg-[#1a2129] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#1a2129] border border-[#1d4041]/50 text-white focus:border-[#9ed674]"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="in_progress">In Progress</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1a2129] rounded-lg p-1 border border-[#1d4041]/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-[#1d4041] text-[#9ed674]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-[#1d4041] text-[#9ed674]" : "text-gray-400 hover:text-white"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#9ed674] border-t-transparent rounded-full" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No submissions found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                onClick={() => router.push(`/ecommerce-wizard/admin/${submission.group_id}`)}
                className="group bg-[#1a2129]/50 rounded-2xl border border-[#1d4041]/30 overflow-hidden
                          hover:border-[#9ed674]/50 hover:shadow-lg hover:shadow-[#9ed674]/10 
                          transition-all duration-300 cursor-pointer"
              >
                {/* Card Header - Like Product Image */}
                <div className="relative h-32 bg-gradient-to-br from-[#1d4041] to-[#0f1419] p-4">
                  <div className="absolute top-4 right-4">{getStatusBadge(submission.status)}</div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                      <Store className="w-7 h-7 text-[#9ed674]" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 text-right">
                    <p className="text-xs text-gray-400">Group</p>
                    <p className="text-2xl font-bold text-white">#{submission.group_id}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[#9ed674] transition-colors">
                    {submission.business_name || "Unnamed Business"}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {submission.product_name || "No product specified"}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[#1d4041]/30">
                    <div className="flex items-center gap-1 text-[#9ed674]">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        ${Number(submission.revenue_target || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Step {submission.current_step || 1}/8
                    </div>
                  </div>
                </div>

                {/* Hover Action */}
                <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button className="w-full bg-[#1d4041] hover:bg-[#9ed674]/20 text-white">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a2129]/50 rounded-xl border border-[#1d4041]/30 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#1d4041]/30">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Group</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Business</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Revenue Target</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Progress</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d4041]/30">
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-[#1d4041]/20 transition-colors cursor-pointer"
                    onClick={() => router.push(`/ecommerce-wizard/admin/${submission.group_id}`)}
                  >
                    <td className="px-4 py-4">
                      <span className="text-white font-semibold">#{submission.group_id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-white">{submission.business_name || "-"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-400">{submission.product_name || "-"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[#9ed674]">${Number(submission.revenue_target || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-[#1d4041]/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#9ed674]"
                            style={{ width: `${((submission.current_step || 1) / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{submission.current_step || 1}/8</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(submission.status)}</td>
                    <td className="px-4 py-4">
                      <Button size="sm" variant="ghost" className="text-[#9ed674] hover:bg-[#9ed674]/10">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
