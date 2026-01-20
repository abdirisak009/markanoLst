"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  DollarSign,
  Loader2,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

interface Payment {
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
  course_title?: string
}

export default function OfflinePaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/offline-payments")
      if (!res.ok) throw new Error("Failed to fetch payments")
      const data = await res.json()
      setPayments(data)
    } catch (error: any) {
      toast.error(error.message || "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (paymentId: number) => {
    setProcessing(paymentId)
    try {
      const res = await fetch(`/api/admin/offline-payments/${paymentId}/approve`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to approve payment")
      }

      toast.success("Payment approved and student enrolled!")
      fetchPayments()
    } catch (error: any) {
      toast.error(error.message || "Failed to approve payment")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (paymentId: number) => {
    if (!confirm("Are you sure you want to reject this payment?")) return

    setProcessing(paymentId)
    try {
      const res = await fetch(`/api/admin/offline-payments/${paymentId}/reject`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to reject payment")
      }

      toast.success("Payment rejected")
      fetchPayments()
    } catch (error: any) {
      toast.error(error.message || "Failed to reject payment")
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
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const pendingPayments = payments.filter((p) => p.status === "pending")
  const completedPayments = payments.filter((p) => p.status === "completed")

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mb-4"></div>
          <p className="text-gray-300">Loading payments...</p>
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
                <Banknote className="h-8 w-8 text-[#e63946]" />
                Offline Payment Management
              </h1>
              <p className="text-gray-400">Approve or reject offline payment requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Pending Payments</p>
                      <p className="text-3xl font-black text-amber-400">{pendingPayments.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-400/30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Completed</p>
                      <p className="text-3xl font-black text-green-400">{completedPayments.length}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-400/30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                      <p className="text-3xl font-black text-[#e63946]">
                        ${pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-[#e63946]/30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Payments */}
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                Pending Payments ({pendingPayments.length})
              </h2>

              {pendingPayments.length === 0 ? (
                <Card className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20">
                  <CardContent className="p-8 text-center">
                    <Banknote className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No pending payments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.map((payment) => (
                    <Card
                      key={payment.id}
                      className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-2 border-amber-500/30 hover:border-amber-500/50 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              {getStatusBadge(payment.status)}
                              <span className="text-gray-400 text-sm">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500">Student</p>
                                  <p className="text-white font-semibold">{payment.user_name || `User #${payment.user_id}`}</p>
                                  <p className="text-xs text-gray-400">{payment.user_email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500">Course</p>
                                  <p className="text-white font-semibold">{payment.course_title || `Course #${payment.course_id}`}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-[#e63946]" />
                                <div>
                                  <p className="text-xs text-gray-500">Amount</p>
                                  <p className="text-2xl font-black text-[#e63946]">${Number(payment.amount).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>

                            {payment.notes && (
                              <div className="p-3 rounded-lg bg-[#0a0a0f]/50 border border-[#e63946]/10">
                                <p className="text-xs text-gray-500 mb-1">Notes:</p>
                                <p className="text-sm text-gray-300">{payment.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleApprove(payment.id)}
                              disabled={processing === payment.id}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            >
                              {processing === payment.id ? (
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
                              onClick={() => handleReject(payment.id)}
                              disabled={processing === payment.id}
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Payments */}
            {completedPayments.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  Completed Payments ({completedPayments.length})
                </h2>
                <div className="space-y-2">
                  {completedPayments.slice(0, 5).map((payment) => (
                    <Card
                      key={payment.id}
                      className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/20"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {getStatusBadge(payment.status)}
                            <div>
                              <p className="text-white font-semibold">{payment.user_name || `User #${payment.user_id}`}</p>
                              <p className="text-sm text-gray-400">{payment.course_title || `Course #${payment.course_id}`}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#e63946]">${Number(payment.amount).toFixed(2)}</p>
                            <p className="text-xs text-gray-400">
                              {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
