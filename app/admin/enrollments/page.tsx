"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    fetchEnrollments()
  }, [filter])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/enrollments?filter=${filter}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to fetch enrollments")
      }
      const data = await res.json()
      console.log("Fetched enrollments:", data) // Debug log
      setEnrollments(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error fetching enrollments:", error)
      toast.error(error.message || "Failed to load enrollments")
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (enrollmentId: number) => {
    setProcessing(enrollmentId)
    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}/approve`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to approve enrollment")
      }

      toast.success("Enrollment approved and student enrolled!")
      fetchEnrollments()
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
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to reject enrollment")
      }

      toast.success("Enrollment rejected")
      fetchEnrollments()
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
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "completed":
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "failed":
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "offline":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Offline Payment</Badge>
      case "wafi_pay":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Wafi Pay</Badge>
      case "mastercard":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Mastercard</Badge>
      default:
        return <Badge>{method}</Badge>
    }
  }

  const pendingEnrollments = enrollments.filter((e) => e.status === "pending")
  const approvedEnrollments = enrollments.filter((e) => e.status === "completed" || e.status === "approved")
  const rejectedEnrollments = enrollments.filter((e) => e.status === "failed" || e.status === "rejected")

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mb-4"></div>
          <p className="text-gray-300">Loading enrollments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f]">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-[#e63946]" />
                Course Enrollments
              </h1>
              <p className="text-gray-400">Manage and approve course enrollment requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Requests</p>
                      <p className="text-3xl font-black text-white">{enrollments.length}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-[#e63946]/30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-amber-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Pending</p>
                      <p className="text-3xl font-black text-amber-400">{pendingEnrollments.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-400/30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Approved</p>
                      <p className="text-3xl font-black text-green-400">{approvedEnrollments.length}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-400/30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                      <p className="text-3xl font-black text-[#e63946]">
                        ${approvedEnrollments.reduce((sum, e) => sum + Number(e.amount || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-[#e63946]/30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => setFilter("all")}
                variant={filter === "all" ? "default" : "outline"}
                className={filter === "all" ? "bg-[#e63946] hover:bg-[#d62839]" : ""}
              >
                All ({enrollments.length})
              </Button>
              <Button
                onClick={() => setFilter("pending")}
                variant={filter === "pending" ? "default" : "outline"}
                className={filter === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                Pending ({pendingEnrollments.length})
              </Button>
              <Button
                onClick={() => setFilter("approved")}
                variant={filter === "approved" ? "default" : "outline"}
                className={filter === "approved" ? "bg-green-500 hover:bg-green-600" : ""}
              >
                Approved ({approvedEnrollments.length})
              </Button>
              <Button
                onClick={() => setFilter("rejected")}
                variant={filter === "rejected" ? "default" : "outline"}
                className={filter === "rejected" ? "bg-red-500 hover:bg-red-600" : ""}
              >
                Rejected ({rejectedEnrollments.length})
              </Button>
            </div>

            {/* Enrollments List */}
            {enrollments.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No enrollments found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <Card
                    key={enrollment.id}
                    className={`bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-2 ${
                      enrollment.status === "pending"
                        ? "border-amber-500/30 hover:border-amber-500/50"
                        : enrollment.status === "completed" || enrollment.status === "approved"
                          ? "border-green-500/30"
                          : "border-red-500/30"
                    } transition-all duration-300`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          {/* Header with Status */}
                          <div className="flex items-center gap-3 flex-wrap">
                            {getStatusBadge(enrollment.status)}
                            {getPaymentMethodBadge(enrollment.payment_method)}
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(enrollment.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Student Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[#0a0a0f]/50 border border-[#e63946]/10">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-[#e63946]" />
                                <p className="text-xs text-gray-500 uppercase font-semibold">Student</p>
                              </div>
                              <p className="text-white font-semibold text-lg mb-1">
                                {enrollment.user_name || `User #${enrollment.user_id}`}
                              </p>
                              <div className="space-y-1">
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  {enrollment.user_email || "N/A"}
                                </p>
                                {enrollment.user_phone && (
                                  <p className="text-gray-400 text-sm flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    {enrollment.user_phone}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Course Info */}
                            <div className="p-4 rounded-xl bg-[#0a0a0f]/50 border border-[#e63946]/10">
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="h-4 w-4 text-[#e63946]" />
                                <p className="text-xs text-gray-500 uppercase font-semibold">Course</p>
                              </div>
                              <p className="text-white font-semibold text-lg mb-1">
                                {enrollment.course_title || `Course #${enrollment.course_id}`}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <p className="text-2xl font-black text-[#e63946]">
                                  ${Number(enrollment.amount || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {enrollment.notes && (
                            <div className="p-3 rounded-lg bg-[#0a0a0f]/50 border border-[#e63946]/10">
                              <p className="text-xs text-gray-500 mb-1">Notes:</p>
                              <p className="text-sm text-gray-300">{enrollment.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {enrollment.status === "pending" && (
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleApprove(enrollment.id)}
                              disabled={processing === enrollment.id}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white min-w-[140px]"
                            >
                              {processing === enrollment.id ? (
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
                            <Button
                              onClick={() => handleReject(enrollment.id)}
                              disabled={processing === enrollment.id}
                              variant="destructive"
                              className="min-w-[140px]"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
