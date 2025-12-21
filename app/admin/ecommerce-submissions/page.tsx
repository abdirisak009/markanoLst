"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  ShoppingBag,
  Search,
  Eye,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Store,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Filter,
  X,
  Download,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Submission {
  id: number
  group_id: number
  group_name: string
  class_id: number
  class_name: string
  business_name: string
  platform_selected: string
  custom_store_name: string | null
  custom_store_url: string | null
  status: string
  current_step: number
  revenue_target: number | null
  product_name: string | null
  created_at: string
  updated_at: string
  submitted_at: string | null
  leader_name: string | null
}

interface ClassOption {
  id: number
  name: string
}

export default function EcommerceSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/ecommerce-submissions")
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique platforms for filter
  const platforms = useMemo(() => {
    const uniquePlatforms = [...new Set(submissions.map((s) => s.platform_selected).filter(Boolean))]
    return uniquePlatforms
  }, [submissions])

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        sub.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.group_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.class_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.leader_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.product_name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || sub.status === statusFilter
      const matchesClass = classFilter === "all" || sub.class_id?.toString() === classFilter
      const matchesPlatform = platformFilter === "all" || sub.platform_selected === platformFilter

      return matchesSearch && matchesStatus && matchesClass && matchesPlatform
    })
  }, [submissions, searchQuery, statusFilter, classFilter, platformFilter])

  const stats = useMemo(
    () => ({
      total: filteredSubmissions.length,
      submitted: filteredSubmissions.filter((s) => s.status === "submitted").length,
      inProgress: filteredSubmissions.filter((s) => s.status === "in_progress" || s.status === "draft").length,
      completed: filteredSubmissions.filter((s) => s.status === "completed" || s.status === "approved").length,
      totalRevenue: filteredSubmissions.reduce((sum, s) => sum + (s.revenue_target || 0), 0),
    }),
    [filteredSubmissions],
  )

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setClassFilter("all")
    setPlatformFilter("all")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || classFilter !== "all" || platformFilter !== "all"

  const exportToExcel = () => {
    const headers = [
      "Ganacsiga",
      "Kooxda",
      "Fasalka",
      "Hogaamiyaha",
      "Platform",
      "Xaaladda",
      "Step",
      "Dakhliga La Rabo",
      "Taariikhda",
    ]
    const rows = filteredSubmissions.map((s) => [
      s.business_name || "Aan la magacaabin",
      s.group_name,
      s.class_name,
      s.leader_name || "-",
      s.platform_selected || "-",
      s.status,
      `${s.current_step}/8`,
      s.revenue_target ? `$${s.revenue_target}` : "-",
      s.updated_at ? new Date(s.updated_at).toLocaleDateString() : "-",
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `ecommerce-submissions-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            La Gudbiyay
          </span>
        )
      case "in_progress":
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Socda
          </span>
        )
      case "completed":
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            La Dhammeeyay
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
            <AlertCircle className="w-3.5 h-3.5" />
            {status || "Aan la garanayn"}
          </span>
        )
    }
  }

  const getProgressColor = (step: number) => {
    const progress = (step / 8) * 100
    if (progress >= 100) return "from-emerald-500 to-green-500"
    if (progress >= 75) return "from-blue-500 to-indigo-500"
    if (progress >= 50) return "from-amber-500 to-orange-500"
    return "from-red-500 to-rose-500"
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-[#e63946] via-[#d62839] to-[#c1121f] rounded-2xl shadow-lg shadow-[#e63946]/25">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">E-commerce Wizard</h1>
            <p className="text-gray-500 mt-0.5">Raadi oo hubi qorshooyinka ganacsiga ardayda</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToExcel} className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Excel Soo Dag
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Wadarta",
            value: stats.total,
            icon: Package,
            color: "from-[#013565] to-[#024a8c]",
            bgColor: "bg-[#013565]/5",
          },
          {
            label: "La Gudbiyay",
            value: stats.submitted,
            icon: CheckCircle2,
            color: "from-blue-500 to-indigo-600",
            bgColor: "bg-blue-50",
          },
          {
            label: "Socda",
            value: stats.inProgress,
            icon: Clock,
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-amber-50",
          },
          {
            label: "La Dhammeeyay",
            value: stats.completed,
            icon: Target,
            color: "from-emerald-500 to-green-600",
            bgColor: "bg-emerald-50",
          },
          {
            label: "Dakhli La Rabo",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "from-violet-500 to-purple-600",
            bgColor: "bg-violet-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 group`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Raadi magaca ganacsiga, kooxda, ama hogaamiyaha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] bg-gray-50/50 transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 ${showFilters ? "bg-[#013565] text-white hover:bg-[#013565]/90" : ""}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-[#e63946] text-white text-xs flex items-center justify-center">
                {[statusFilter !== "all", classFilter !== "all", platformFilter !== "all"].filter(Boolean).length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="gap-2 text-[#e63946] hover:text-[#c1121f] hover:bg-[#e63946]/10"
            >
              <X className="w-4 h-4" />
              Nadiifi
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xaaladda</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] bg-white text-gray-900"
              >
                <option value="all">Dhammaan Xaaladaha</option>
                <option value="submitted">La Gudbiyay</option>
                <option value="in_progress">Socda</option>
                <option value="draft">Qoraal</option>
                <option value="completed">La Dhammeeyay</option>
                <option value="approved">La Ansixiyay</option>
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fasalka</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] bg-white text-gray-900"
              >
                <option value="all">Dhammaan Fasallada</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] bg-white text-gray-900"
              >
                <option value="all">Dhammaan Platforms</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#e63946] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Waa la soo rarrayaa...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Wax qoraal ah lama helin</h3>
            <p className="text-gray-500 max-w-sm">
              Qoraaladu waxay halkan ka soo muuqan doonaan marka ardaydu dhamaystiraan wizard-ka
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4 gap-2 bg-transparent">
                <X className="w-4 h-4" />
                Nadiifi Filters-ka
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#013565] to-[#024a8c]">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Ganacsiga
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Kooxda
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Horumar
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Xaaladda
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Taariikhda
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
                    Ficil
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.map((submission, index) => (
                  <tr
                    key={submission.id}
                    className={`hover:bg-gray-50/80 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e63946]/10 to-[#e63946]/5 flex items-center justify-center border border-[#e63946]/10">
                          <Store className="w-5 h-5 text-[#e63946]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {submission.business_name || "Aan la magacaabin"}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            {submission.product_name && (
                              <>
                                <Package className="w-3 h-3" />
                                {submission.product_name}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{submission.group_name}</p>
                        <p className="text-xs text-gray-500">{submission.class_name}</p>
                        {submission.leader_name && (
                          <p className="text-xs text-[#e63946] flex items-center gap-1 mt-0.5">
                            <Users className="w-3 h-3" />
                            {submission.leader_name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#013565]/5 text-[#013565] text-sm font-medium border border-[#013565]/10">
                          <Sparkles className="w-3.5 h-3.5" />
                          {submission.platform_selected || "Aan la dooran"}
                        </span>
                        {submission.custom_store_name && (
                          <span className="text-xs text-gray-500">{submission.custom_store_name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[100px]">
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getProgressColor(submission.current_step)} rounded-full transition-all duration-500`}
                              style={{ width: `${(submission.current_step / 8) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[40px]">
                          {submission.current_step}/8
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(submission.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {submission.updated_at
                            ? new Date(submission.updated_at).toLocaleDateString("so-SO", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : new Date(submission.created_at).toLocaleDateString("so-SO", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/ecommerce-submissions/${submission.group_id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#e63946] to-[#d62839] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#e63946]/25 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <Eye className="w-4 h-4" />
                        Eeg
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredSubmissions.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 px-2">
          <p>
            Waxaa la muujinayaa <span className="font-semibold text-gray-900">{filteredSubmissions.length}</span> ka mid
            ah <span className="font-semibold text-gray-900">{submissions.length}</span> qoraal
          </p>
          <p className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Celceliska horumar:{" "}
            <span className="font-semibold text-gray-900">
              {Math.round(
                (filteredSubmissions.reduce((sum, s) => sum + s.current_step, 0) / (filteredSubmissions.length || 1)) *
                  12.5,
              )}
              %
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
