"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  DollarSign,
  Loader2,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Search,
  Eye,
  Filter,
  RefreshCw,
  MoreVertical,
} from "lucide-react"
import { toast } from "sonner"

interface Enrollment {
  id: number
  user_id: number
  course_id: number
  amount: number
  payment_method: string
  status: string
  payment_reference: string | null
  notes: string | null
  created_at: string
  paid_at: string | null
  user_name?: string
  user_email?: string
  user_phone?: string
  course_title?: string
  course_price?: number
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    fetchEnrollments()
  }, [filter])

  useEffect(() => {
    filterEnrollments()
  }, [searchQuery, enrollments])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/enrollments?filter=${filter}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to fetch enrollments")
      }
      const data = await res.json()
      setEnrollments(Array.isArray(data) ? data : [])
      setFilteredEnrollments(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error fetching enrollments:", error)
      toast.error(error.message || "Failed to load enrollments")
      setEnrollments([])
      setFilteredEnrollments([])
    } finally {
      setLoading(false)
    }
  }

  const filterEnrollments = () => {
    if (!searchQuery.trim()) {
      setFilteredEnrollments(enrollments)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = enrollments.filter(
      (e) =>
        e.user_name?.toLowerCase().includes(query) ||
        e.user_email?.toLowerCase().includes(query) ||
        e.user_phone?.toLowerCase().includes(query) ||
        e.course_title?.toLowerCase().includes(query) ||
        e.payment_reference?.toLowerCase().includes(query) ||
        e.notes?.toLowerCase().includes(query)
    )
    setFilteredEnrollments(filtered)
  }

  const handleApprove = async (enrollmentId: number) => {
    setProcessing(enrollmentId)
    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}/approve`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to approve enrollment")
      }

      toast.success("Enrollment approved and student enrolled!")
      fetchEnrollments()
      setIsDetailOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to approve enrollment")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (enrollmentId: number) => {
    if (!confirm("Are you sure you want to reject this enrollment request?")) return

    setProcessing(enrollmentId)
    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}/reject`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to reject enrollment")
      }

      toast.success("Enrollment rejected")
      fetchEnrollments()
      setIsDetailOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to reject enrollment")
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 font-medium">
            <Clock className="h-3 w-3 mr-1.5" />
            Pending
          </Badge>
        )
      case "completed":
      case "approved":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-medium">
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Approved
          </Badge>
        )
      case "failed":
      case "rejected":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-medium">
            <XCircle className="h-3 w-3 mr-1.5" />
            Rejected
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    const methods: Record<string, { label: string; className: string }> = {
      offline: { label: "Offline", className: "bg-blue-50 text-blue-700 border-blue-200" },
      wafi_pay: { label: "Wafi Pay", className: "bg-purple-50 text-purple-700 border-purple-200" },
      mastercard: { label: "Mastercard", className: "bg-amber-50 text-amber-700 border-amber-200" },
      visa: { label: "Visa", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    }

    const methodInfo = methods[method] || { label: method, className: "bg-gray-50 text-gray-700 border-gray-200" }
    return <Badge className={methodInfo.className}>{methodInfo.label}</Badge>
  }

  const pendingEnrollments = enrollments.filter((e) => e.status === "pending")
  const approvedEnrollments = enrollments.filter((e) => e.status === "completed" || e.status === "approved")
  const rejectedEnrollments = enrollments.filter((e) => e.status === "failed" || e.status === "rejected")
  const totalRevenue = approvedEnrollments.reduce((sum, e) => sum + Number(e.amount || 0), 0)

  const openDetailModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setIsDetailOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#e63946] border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading enrollments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-[#e63946] to-[#d62839] rounded-lg shadow-md">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                Course Enrollments
              </h1>
                  <p className="text-gray-600 text-base">Manage and approve course enrollment requests</p>
                </div>
                <Button
                  onClick={fetchEnrollments}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-2 font-medium">Total Requests</p>
                      <p className="text-3xl lg:text-4xl font-bold text-gray-900">{enrollments.length}</p>
                      <p className="text-xs text-gray-400 mt-1">All time</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <TrendingUp className="h-7 w-7 text-[#e63946]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-2 font-medium">Pending</p>
                      <p className="text-3xl lg:text-4xl font-bold text-amber-600">{pendingEnrollments.length}</p>
                      <p className="text-xs text-gray-400 mt-1">Awaiting review</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <Clock className="h-7 w-7 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-2 font-medium">Approved</p>
                      <p className="text-3xl lg:text-4xl font-bold text-green-600">{approvedEnrollments.length}</p>
                      <p className="text-xs text-gray-400 mt-1">Completed</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-7 w-7 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-2 font-medium">Total Revenue</p>
                      <p className="text-3xl lg:text-4xl font-bold text-[#e63946]">
                        ${totalRevenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">From approved</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <DollarSign className="h-7 w-7 text-[#e63946]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="bg-white border border-gray-200 shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, phone, course, or reference..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#e63946] focus:ring-[#e63946] h-11"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setFilter("all")}
                variant={filter === "all" ? "default" : "outline"}
                      className={
                        filter === "all"
                          ? "bg-[#e63946] hover:bg-[#d62839] text-white border-0 shadow-sm"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                      }
              >
                      <Filter className="h-4 w-4 mr-2" />
                All ({enrollments.length})
              </Button>
              <Button
                onClick={() => setFilter("pending")}
                variant={filter === "pending" ? "default" : "outline"}
                      className={
                        filter === "pending"
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                      }
              >
                Pending ({pendingEnrollments.length})
              </Button>
              <Button
                onClick={() => setFilter("approved")}
                variant={filter === "approved" ? "default" : "outline"}
                      className={
                        filter === "approved"
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                      }
              >
                Approved ({approvedEnrollments.length})
              </Button>
              <Button
                onClick={() => setFilter("rejected")}
                variant={filter === "rejected" ? "default" : "outline"}
                      className={
                        filter === "rejected"
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                      }
              >
                Rejected ({rejectedEnrollments.length})
              </Button>
            </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Table */}
            {filteredEnrollments.length === 0 ? (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <GraduationCap className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">No enrollments found</p>
                  <p className="text-gray-400 text-sm">
                    {searchQuery ? "Try adjusting your search query" : "No enrollment requests at this time"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-[#013565] to-[#024a8c] hover:bg-gradient-to-r hover:from-[#013565] hover:to-[#024a8c] border-none">
                        <TableHead className="text-white font-bold text-sm uppercase tracking-wider h-14">
                          ID
                        </TableHead>
                        <TableHead className="text-white font-bold text-sm uppercase tracking-wider">
                          Student
                        </TableHead>
                        <TableHead className="text-white font-bold text-sm uppercase tracking-wider">
                          Course
                        </TableHead>
                        <TableHead className="text-white font-bold text-sm uppercase tracking-wider">
                          Amount
                        </TableHead>
                        <TableHead className="text-white font-bold text-sm uppercase tracking-wider">
                          Payment Method
                        </TableHead>
                        <TableHead className="text-white font-bold text-sm uppercase tracking-wider">
                          Status
                        </TableHead>
                        <TableHead className="text-white font-bold text-sm uppercase tracking-wider">
                          Date
                        </TableHead>
                        <TableHead className="text-white font-bold text-sm uppercase tracking-wider text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEnrollments.map((enrollment, index) => (
                        <TableRow
                    key={enrollment.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <TableCell className="font-semibold text-gray-900 py-4">
                            #{enrollment.id}
                          </TableCell>
                          <TableCell className="py-4">
                            <div>
                              <p className="text-gray-900 font-semibold text-sm">
                                {enrollment.user_name || `User #${enrollment.user_id}`}
                              </p>
                              <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1">
                                <Mail className="h-3 w-3" />
                                {enrollment.user_email || "N/A"}
                              </p>
                              {enrollment.user_phone && (
                                <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-0.5">
                                  <Phone className="h-3 w-3" />
                                  {enrollment.user_phone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-[#e63946]" />
                              <span className="text-gray-900 font-medium text-sm">
                                {enrollment.course_title || `Course #${enrollment.course_id}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-[#e63946] font-bold text-base">
                              ${Number(enrollment.amount || 0).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">{getPaymentMethodBadge(enrollment.payment_method)}</TableCell>
                          <TableCell className="py-4">{getStatusBadge(enrollment.status)}</TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(enrollment.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDetailModal(enrollment)}
                                className="text-[#e63946] hover:bg-red-50 hover:text-[#e63946] h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {enrollment.status === "pending" && (
                                <>
                                  <Button
                                    onClick={() => handleApprove(enrollment.id)}
                                    disabled={processing === enrollment.id}
                                    className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-sm font-medium shadow-sm"
                                    title="Approve Enrollment"
                                  >
                                    {processing === enrollment.id ? (
                                      <>
                                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReject(enrollment.id)}
                                    disabled={processing === enrollment.id}
                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-3 text-sm font-medium"
                                    title="Reject Enrollment"
                                  >
                                    <XCircle className="h-3 w-3 mr-1.5" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogContent className="max-w-2xl bg-white text-gray-900">
                {selectedEnrollment && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                        <GraduationCap className="h-6 w-6 text-[#e63946]" />
                        Enrollment Details
                      </DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Complete information about this enrollment request
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      {/* Status and Payment Method */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {getStatusBadge(selectedEnrollment.status)}
                        {getPaymentMethodBadge(selectedEnrollment.payment_method)}
                      </div>

                      {/* Student Information */}
                      <div className="p-5 rounded-lg bg-gray-50 border border-gray-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                          <User className="h-5 w-5 text-[#e63946]" />
                          Student Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-500 text-sm mb-1 font-medium">Full Name</p>
                            <p className="text-gray-900 font-semibold">
                              {selectedEnrollment.user_name || `User #${selectedEnrollment.user_id}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm mb-1 font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </p>
                            <p className="text-gray-900">{selectedEnrollment.user_email || "N/A"}</p>
                          </div>
                          {selectedEnrollment.user_phone && (
                            <div>
                              <p className="text-gray-500 text-sm mb-1 font-medium flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone
                              </p>
                              <p className="text-gray-900">{selectedEnrollment.user_phone}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Course Information */}
                      <div className="p-5 rounded-lg bg-gray-50 border border-gray-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                          <BookOpen className="h-5 w-5 text-[#e63946]" />
                          Course Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-500 text-sm mb-1 font-medium">Course Title</p>
                            <p className="text-gray-900 font-semibold text-lg">
                              {selectedEnrollment.course_title || `Course #${selectedEnrollment.course_id}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm mb-1 font-medium">Amount</p>
                            <p className="text-[#e63946] font-bold text-2xl">
                              ${Number(selectedEnrollment.amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="p-5 rounded-lg bg-gray-50 border border-gray-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                          <DollarSign className="h-5 w-5 text-[#e63946]" />
                          Payment Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-500 text-sm mb-1 font-medium">Payment Reference</p>
                            <p className="text-gray-900 font-mono text-sm">
                              {selectedEnrollment.payment_reference || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm mb-1 font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Created At
                            </p>
                            <p className="text-gray-900">
                              {new Date(selectedEnrollment.created_at).toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {selectedEnrollment.paid_at && (
                            <div>
                              <p className="text-gray-500 text-sm mb-1 font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Paid At
                                </p>
                              <p className="text-gray-900">
                                {new Date(selectedEnrollment.paid_at).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                </p>
                              </div>
                          )}
                            </div>
                          </div>

                          {/* Notes */}
                      {selectedEnrollment.notes && (
                        <div className="p-5 rounded-lg bg-gray-50 border border-gray-200">
                          <h3 className="text-lg font-bold mb-2 text-gray-900">Notes</h3>
                          <p className="text-gray-700">{selectedEnrollment.notes}</p>
                            </div>
                          )}
                        </div>

                    <DialogFooter className="flex gap-2">
                      {selectedEnrollment.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleReject(selectedEnrollment.id)}
                            disabled={processing === selectedEnrollment.id}
                            variant="destructive"
                            className="flex-1"
                          >
                            {processing === selectedEnrollment.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </>
                            )}
                          </Button>
                            <Button
                            onClick={() => handleApprove(selectedEnrollment.id)}
                            disabled={processing === selectedEnrollment.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                            {processing === selectedEnrollment.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Approve & Enroll
                                </>
                              )}
                            </Button>
                        </>
                      )}
                            <Button
                        onClick={() => setIsDetailOpen(false)}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                        Close
                            </Button>
                    </DialogFooter>
                  </>
                        )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
