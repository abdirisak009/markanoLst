"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Loader2, Send, CheckCircle2, Banknote } from "lucide-react"
import { toast } from "sonner"

interface Payout {
  id: number
  amount_requested: number
  status: string
  requested_at: string
  paid_at: string | null
  payment_reference: string | null
  confirmed_received_at: string | null
}

interface RevenueData {
  total_earned: number
  total_paid: number
  available_balance: number
  revenue_share_percent: number | null
  payment_details: string | null
  payouts: Payout[]
}

export default function InstructorRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestAmount, setRequestAmount] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState("")
  const [savingDetails, setSavingDetails] = useState(false)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)

  useEffect(() => {
    fetchRevenue()
  }, [])

  useEffect(() => {
    if (data?.payment_details != null) setPaymentDetails(data.payment_details)
  }, [data?.payment_details])

  const fetchRevenue = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/instructor/revenue", { credentials: "include" })
      if (res.status === 401) {
        window.location.href = "/instructor/login?redirect=/instructor/revenue"
        return
      }
      if (!res.ok) throw new Error("Failed to load")
      const json = await res.json()
      setData(json)
    } catch {
      toast.error("Failed to load revenue")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(requestAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    if (data && amount > data.available_balance) {
      toast.error("Amount exceeds available balance")
      return
    }
    setRequesting(true)
    try {
      const res = await fetch("/api/instructor/revenue/request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed")
      toast.success("Payout request submitted. Admin will process it.")
      setRequestAmount("")
      fetchRevenue()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to submit")
    } finally {
      setRequesting(false)
    }
  }

  const handleSavePaymentDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingDetails(true)
    try {
      const res = await fetch("/api/instructor/revenue/payment-details", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_details: paymentDetails }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed")
      toast.success("Payment details saved. Admin will use this to send your payout.")
      fetchRevenue()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSavingDetails(false)
    }
  }

  const handleConfirmReceipt = async (payoutId: number) => {
    if (!confirm("Confirm that you received this payout?")) return
    setConfirmingId(payoutId)
    try {
      const res = await fetch("/api/instructor/revenue/confirm-receipt", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payout_id: payoutId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed")
      toast.success("Receipt confirmed.")
      fetchRevenue()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to confirm")
    } finally {
      setConfirmingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#e63946]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Revenue</h1>
        <p className="text-slate-500 mt-1">
          Your share from course sales ({data?.revenue_share_percent ?? 0}%). Request payout when ready; admin will pay to your account.
        </p>
      </div>

      <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <div className="p-2 rounded-xl bg-[#e63946]/10">
              <DollarSign className="h-5 w-5 text-[#e63946]" />
            </div>
            Revenue overview
          </CardTitle>
          <CardDescription>Earnings, payouts, and available balance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border-0 bg-gradient-to-br from-slate-50 to-slate-100 p-5 shadow-inner">
              <p className="text-sm font-medium text-slate-500">Total earned</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                ${(data?.total_earned ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border-0 bg-gradient-to-br from-slate-50 to-slate-100 p-5 shadow-inner">
              <p className="text-sm font-medium text-slate-500">Total paid</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                ${(data?.total_paid ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border-0 bg-gradient-to-br from-emerald-50 to-green-100 p-5 shadow-inner ring-1 ring-emerald-200/50">
              <p className="text-sm font-medium text-emerald-700">Available balance</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">
                ${(data?.available_balance ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          {(data?.available_balance ?? 0) > 0 && (
            <form onSubmit={handleRequestPayout} className="flex flex-wrap items-end gap-3">
              <div>
                <Label className="text-xs text-gray-500">Request payout amount</Label>
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  max={data?.available_balance}
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-32"
                />
              </div>
              <Button type="submit" disabled={requesting} className="bg-[#e63946] hover:bg-[#d62839]">
                {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Request payout
              </Button>
            </form>
          )}

          <div className="rounded-xl bg-slate-50/80 p-5">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-[#e63946]" />
              Payment details (bank / mobile money)
            </h3>
            <p className="text-sm text-slate-500 mb-3">
              Admin will send your payout to this account. Keep it up to date.
            </p>
            <form onSubmit={handleSavePaymentDetails} className="flex flex-col gap-3">
              <Textarea
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                placeholder="e.g. Bank: XYZ, Account: 1234567890 or Mobile: 252612345678"
                rows={3}
                className="resize-none rounded-xl border-slate-200"
              />
              <Button type="submit" variant="outline" size="sm" disabled={savingDetails} className="rounded-xl w-fit">
                {savingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </form>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Payout history</h3>
            {data?.payouts?.length ? (
              <ul className="space-y-2">
                {data.payouts.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                  >
                    <div>
                      <span className="font-medium">${p.amount_requested.toFixed(2)}</span>
                      <span className="text-slate-500 text-sm ml-2">
                        {p.status === "pending" ? "Pending" : "Paid"}
                        {p.paid_at && ` · ${new Date(p.paid_at).toLocaleDateString()}`}
                      </span>
                      {p.payment_reference && (
                        <p className="text-xs text-slate-500">Ref: {p.payment_reference}</p>
                      )}
                    </div>
                    {p.status === "paid" && !p.confirmed_received_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfirmReceipt(p.id)}
                        disabled={confirmingId === p.id}
                      >
                        {confirmingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                        Confirm receipt
                      </Button>
                    )}
                    {p.confirmed_received_at && (
                      <span className="text-sm text-green-600">Received</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">No payout requests yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
