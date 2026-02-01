"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Banknote, Loader2, CheckCircle2, User, Mail, Search, Wallet, Clock, CheckCircle, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
  instructor_balance?: number
}

export default function AdminInstructorPayoutsPage() {
  const [payments, setPayments] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all")
  const [search, setSearch] = useState("")
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

  const searchLower = search.trim().toLowerCase()
  const filteredPayments = useMemo(() => {
    if (!searchLower) return payments
    return payments.filter(
      (p) =>
        p.instructor_name?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        (p.payment_details?.toLowerCase().includes(searchLower) ?? false) ||
        p.amount_requested.toString().includes(searchLower)
    )
  }, [payments, searchLower])

  const pendingCount = payments.filter((p) => p.status === "pending").length
  const paidCount = payments.filter((p) => p.status === "paid").length
  const pendingTotal = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount_requested, 0)

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
    <div className="min-h-screen bg-slate-50/80">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#2596be]/10 border border-[#2596be]/20">
                    <Banknote className="h-6 w-6 text-[#2596be]" />
                  </div>
                  Instructor Payouts
                </h1>
                <p className="text-slate-500 mt-1 text-sm max-w-xl">
                  View and process instructor payout requests. Approve requests to mark as paid; the amount is then deducted from the instructor&apos;s balance.
                </p>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-100">
                    <Wallet className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total requests</p>
                    <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
                    <p className="text-xs text-slate-500">${pendingTotal.toFixed(2)} to process</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Paid</p>
                    <p className="text-2xl font-bold text-emerald-700">{paidCount}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters + Search */}
            <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by instructor name, email, account or amount..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(
                      [
                        { id: "all" as const, label: "All" },
                        { id: "pending" as const, label: "Pending" },
                        { id: "paid" as const, label: "Paid" },
                      ] as const
                    ).map(({ id, label }) => (
                      <Button
                        key={id}
                        variant={filter === id ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "rounded-xl font-medium",
                          filter === id && "bg-[#2596be] hover:bg-[#1e7a9e]"
                        )}
                        onClick={() => setFilter(id)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table card */}
            <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-semibold text-slate-900">Payout requests</CardTitle>
                <CardDescription>
                  Approve pending requests to mark as paid. The instructor&apos;s available balance will be reduced by the paid amount.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-[#2596be]" />
                  </div>
                ) : filteredPayments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                          <th className="text-left py-4 px-5 font-semibold text-slate-600">Instructor</th>
                          <th className="text-left py-4 px-5 font-semibold text-slate-600 hidden md:table-cell">Account</th>
                          <th className="text-right py-4 px-5 font-semibold text-slate-600">Amount</th>
                          <th className="text-left py-4 px-5 font-semibold text-slate-600">Requested</th>
                          <th className="text-center py-4 px-5 font-semibold text-slate-600">Status</th>
                          <th className="text-right py-4 px-5 font-semibold text-slate-600">Balance</th>
                          <th className="text-right py-4 px-5 font-semibold text-slate-600 pr-5">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((p, i) => (
                          <tr
                            key={p.id}
                            className={cn(
                              "border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/50",
                              i % 2 === 1 && "bg-slate-50/30"
                            )}
                          >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-2">
                                <div className="h-9 w-9 rounded-full bg-[#2596be]/10 flex items-center justify-center shrink-0">
                                  <User className="h-4 w-4 text-[#2596be]" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{p.instructor_name}</p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {p.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-slate-600 hidden md:table-cell max-w-[200px] truncate" title={p.payment_details ?? ""}>
                              {p.payment_details || "—"}
                            </td>
                            <td className="py-4 px-5 text-right">
                              <span className="font-semibold text-[#2596be]">${p.amount_requested.toFixed(2)}</span>
                            </td>
                            <td className="py-4 px-5 text-slate-600">
                              {new Date(p.requested_at).toLocaleDateString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                                  p.status === "paid"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                )}
                              >
                                {p.status === "paid" ? (
                                  <>
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Paid
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3.5 w-3.5" />
                                    Pending
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              {typeof p.instructor_balance === "number" ? (
                                <span className="font-medium text-emerald-700">${p.instructor_balance.toFixed(2)}</span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-4 px-5 text-right pr-5">
                              {p.status === "pending" && (
                                <Button
                                  size="sm"
                                  className="rounded-lg bg-[#2596be] hover:bg-[#1e7a9e] font-medium"
                                  onClick={() => openMarkPaid(p)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                  Approve
                                </Button>
                              )}
                              {p.status === "paid" && p.confirmed_received_at && (
                                <span className="text-xs text-emerald-600 font-medium">Confirmed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="p-4 rounded-2xl bg-slate-100 mb-4">
                      <Banknote className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">No payout requests</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                      {search.trim()
                        ? "No results match your search. Try a different term or clear the filter."
                        : "When instructors request payouts, they will appear here. You can filter by Pending or Paid."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve modal */}
      {modalPayout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg">Approve payout</CardTitle>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setModalPayout(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                Approving will mark <strong>${modalPayout.amount_requested.toFixed(2)}</strong> as paid. This amount will be deducted from the instructor&apos;s balance.
              </p>
              <div className="rounded-xl bg-slate-50 p-4 space-y-2">
                <p className="font-medium text-slate-900">{modalPayout.instructor_name}</p>
                <p className="text-sm text-slate-600">${modalPayout.amount_requested.toFixed(2)}</p>
                {modalPayout.payment_details && (
                  <p className="text-sm text-slate-500">Account: {modalPayout.payment_details}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Payment reference (optional)</Label>
                <Input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. bank transfer reference"
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Admin notes (optional)</Label>
                <Input
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal note"
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 rounded-xl bg-[#2596be] hover:bg-[#1e7a9e] font-medium"
                  disabled={markingId !== null}
                  onClick={handleMarkPaid}
                >
                  {markingId !== null ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve (Mark paid)
                    </>
                  )}
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setModalPayout(null)}>
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
