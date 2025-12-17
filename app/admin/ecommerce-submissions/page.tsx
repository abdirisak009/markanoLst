"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Store,
  Package,
} from "lucide-react"

interface Submission {
  id: number
  group_id: number
  group_name: string
  class_name: string
  business_name: string
  platform_selected: string
  status: string
  current_step: number
  created_at: string
  updated_at: string
}

export default function EcommerceSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/ecommerce-submissions")
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.group_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.class_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status === "submitted").length,
    inProgress: submissions.filter((s) => s.status === "in_progress" || s.status === "draft").length,
    completed: submissions.filter((s) => s.status === "completed" || s.status === "approved").length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#e63946]/10 text-[#e63946] border border-[#e63946]/20">
            <CheckCircle2 className="w-3 h-3" />
            Submitted
          </span>
        )
      case "in_progress":
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        )
      case "completed":
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <AlertCircle className="w-3 h-3" />
            {status || "Unknown"}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#e63946] to-[#c1121f] rounded-xl shadow-lg shadow-[#e63946]/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            E-commerce Wizard Submissions
          </h1>
          <p className="text-gray-500 mt-1">Monitor and review student business plans</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Submissions", value: stats.total, icon: Package, color: "from-[#013565] to-[#024a8c]" },
          { label: "Submitted", value: stats.submitted, icon: CheckCircle2, color: "from-[#e63946] to-[#c1121f]" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "from-amber-500 to-orange-500" },
          { label: "Completed", value: stats.completed, icon: Target, color: "from-emerald-500 to-green-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by business name, group, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946]"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-[#e63946] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No submissions found</h3>
            <p className="text-gray-500">Submissions will appear here when students complete the wizard</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#013565] to-[#024a8c] text-white">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Business</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Group</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e63946]/10 to-[#e63946]/5 flex items-center justify-center">
                          <Store className="w-5 h-5 text-[#e63946]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{submission.business_name || "Untitled"}</p>
                          <p className="text-xs text-gray-500">ID: {submission.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{submission.group_name}</p>
                      <p className="text-xs text-gray-500">{submission.class_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#013565]/5 text-[#013565] text-sm font-medium">
                        {submission.platform_selected || "Not selected"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full bg-gradient-to-r from-[#e63946] to-[#ff1b4a] rounded-full"
                            style={{ width: `${(submission.current_step / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{submission.current_step}/8</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(submission.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(submission.updated_at || submission.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/ecommerce-submissions/${submission.group_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e63946] text-white text-sm font-medium hover:bg-[#c1121f] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
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
