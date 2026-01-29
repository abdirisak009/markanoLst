"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Banknote, Loader2, CheckCircle2, User, Mail } from "lucide-react"
import { toast } from "sonner"

interface Payout {
  id: number
  instructor_id: number
  instructor_name: string
  email: string
  payment_details: string | null
  amount_requested: number
  status: string
  requested_at: string
  paid_at: string | null
  payment_reference: string | null
  confirmed_received_at: string | null
  admin_notes: string | null
  created_at: string
}

export default function AdminInstructorPayoutsPage() {
  const [payments, setPayments] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all")
  const [markingId, setMarkingId] = useState<number | null>(null)
  const [paymentRef, setPaymentRef] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [modalPayout, setModalPayout] = useState<Payout | null>(null)

  useEffect(() => {
    fetchPayouts()
  }, [filter])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const url =
        filter === "all"
          ? "/api/admin/instructor-payouts"
          : `/api/admin/instructor-payouts?status=${filter}`
      const res = await fetch(url, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setPayments(json)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load payouts")
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const openMarkPaid = (p: Payout) => {
    setModalPayout(p)
    setPaymentRef(p.payment_reference ?? "")
    setAdminNotes(p.admin_notes ?? "")
  }

  const handleMarkPaid = async () => {
    if (!modalPayout) return
    setMarkingId(modalPayout.id)
    try {
      const res = await fetch(`/api/admin/instructor-payouts/${modalPayout.id}/mark-paid`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_reference: paymentRef || null,
          admin_notes: adminNotes || null,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed")
      toast.success("Payout marked as paid. Instructor can confirm receipt.")
      setModalPayout(null)
      fetchPayouts()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to mark paid")
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Banknote className="h-6 w-6 text-[#e63946]" />
              Instructor Payouts
            </h1>
            <p className="text-gray-500 mt-1">
              Payout requests from instructors. Mark as paid and add payment reference; money goes to instructor&apos;s account (payment details).
            </p>

            <div className="flex gap-2 mt-4">
              {(["all", "pending", "paid"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  className={filter === f ? "bg-[#e63946] hover:bg-[#d62839]" : ""}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : f === "pending" ? "Pending" : "Paid"}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-[#e63946]" />
              </div>
            ) : (
              <Card className="mt-6 border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Payout requests</CardTitle>
                  <CardDescription>Instructor name, amount, payment details, status</CardDescription>
                </CardHeader>
                <CardContent>
                  {payments.length ? (
                    <div className="space-y-4">
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-gray-800 flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              {p.instructor_name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {p.email}
                            </p>
                            {p.payment_details && (
                              <p className="text-sm text-gray-600 mt-1">
                                Account: {p.payment_details}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              Requested {new Date(p.requested_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-[#e63946]">
                              ${p.amount_requested.toFixed(2)}
                            </span>
                            <span
                              className={
                                p.status === "paid"
                                  ? "text-green-600 text-sm"
                                  : "text-amber-600 text-sm"
                              }
                            >
                              {p.status === "paid" ? "Paid" : "Pending"}
                            </span>
                            {p.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => openMarkPaid(p)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Mark paid
                              </Button>
                            )}
                            {p.status === "paid" && p.confirmed_received_at && (
                              <span className="text-xs text-green-600">Confirmed by instructor</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No payout requests.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {modalPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mark as paid</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setModalPayout(null)}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {modalPayout.instructor_name} · ${modalPayout.amount_requested.toFixed(2)}
              </p>
              {modalPayout.payment_details && (
                <p className="text-sm text-gray-600">Account: {modalPayout.payment_details}</p>
              )}
              <div>
                <Label>Payment reference (optional)</Label>
                <Input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. bank transfer ref"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Admin notes (optional)</Label>
                <Input
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal note"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  disabled={markingId !== null}
                  onClick={handleMarkPaid}
                >
                  {markingId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark paid"}
                </Button>
                <Button variant="outline" onClick={() => setModalPayout(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
