"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, TrendingUp, Clock, CheckCircle, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function EcommerceDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubmissions()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = submissions.filter(
        (s) =>
          s.business_name?.toLowerCase().includes(search.toLowerCase()) ||
          s.group_name?.toLowerCase().includes(search.toLowerCase()) ||
          s.product_name?.toLowerCase().includes(search.toLowerCase()),
      )
      setFilteredSubmissions(filtered)
    } else {
      setFilteredSubmissions(submissions)
    }
  }, [search, submissions])

  const loadSubmissions = async () => {
    try {
      const res = await fetch("/api/ecommerce-wizard")
      const data = await res.json()
      setSubmissions(data)
      setFilteredSubmissions(data)
    } catch (err) {
      console.error("Error loading submissions:", err)
    }
    setLoading(false)
  }

  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status === "submitted").length,
    inProgress: submissions.filter((s) => s.status === "in_progress").length,
    totalRevenue: submissions.reduce((sum, s) => sum + (Number(s.revenue_target) || 0), 0),
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">E-commerce Dashboard</h1>
          <p className="text-gray-500">Manage all group submissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#1d4041] to-[#2a5a5c] border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Plans</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-[#ef4444]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#ef4444] to-[#dc3636] border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Submitted</p>
                <p className="text-3xl font-bold text-white">{stats.submitted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Revenue Target</p>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by business name, group, or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Submissions Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredSubmissions.map((submission) => (
          <Card key={submission.id} className="hover:shadow-lg transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{submission.business_name || "Untitled Business"}</CardTitle>
                  <p className="text-sm text-gray-500">Group: {submission.group_name}</p>
                </div>
                <Badge className={submission.status === "submitted" ? "bg-[#ef4444] text-white" : "bg-blue-500"}>
                  {submission.status === "submitted" ? "Submitted" : "In Progress"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-medium">{submission.product_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue Target</p>
                <p className="font-bold text-[#1d4041]">${submission.revenue_target?.toLocaleString() || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Platform</p>
                <p className="font-medium">{submission.platform_selected || "N/A"}</p>
              </div>
              <Link href={`/admin/ecommerce-dashboard/${submission.id}`}>
                <Button className="w-full bg-[#1d4041] hover:bg-[#2a5a5c] text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubmissions.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">No submissions found</div>
      )}
    </div>
  )
}
