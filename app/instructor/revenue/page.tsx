"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Loader2, Send, CheckCircle2, Banknote } from "lucide-react"
import { toast } from "sonner"

type PayoutMethod = "paypal" | "cards" | "evc_plus" | "bank_transfer"

interface Payout {
  id: number
  amount_requested: number
  status: string
  requested_at: string
  paid_at: string | null
  payment_reference: string | null
  confirmed_received_at: string | null
  payment_method?: string | null
  payment_method_details?: string | null
}

interface RevenueData {
  total_earned: number
  total_paid: number
  available_balance: number
  this_month_earned: number
  this_year_earned: number
  revenue_share_percent: number | null
  minimum_payout_amount: number | null
  payment_details: string | null
  payouts: Payout[]
}

export default function InstructorRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestAmount, setRequestAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PayoutMethod>("evc_plus")
  const [evcPhone, setEvcPhone] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccountName, setBankAccountName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [cardsNote, setCardsNote] = useState("")
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
    const minPayout = data?.minimum_payout_amount
    if (minPayout != null && amount < minPayout) {
      toast.error(`Minimum payout amount is $${minPayout.toFixed(2)}. Request at least that amount.`)
      return
    }
    if (paymentMethod === "evc_plus" && !evcPhone.trim()) {
      toast.error("Enter the EVC Plus number to send to.")
      return
    }
    if (paymentMethod === "paypal" && !paypalEmail.trim()) {
      toast.error("Enter your PayPal email.")
      return
    }
    if (paymentMethod === "bank_transfer" && (!bankName.trim() || !bankAccountNumber.trim())) {
      toast.error("Enter bank name and account number.")
      return
    }
    const methodDetails: Record<string, string> = {}
    if (paymentMethod === "evc_plus") methodDetails.evc_phone = evcPhone.trim()
    if (paymentMethod === "paypal") methodDetails.paypal_email = paypalEmail.trim()
    if (paymentMethod === "bank_transfer") {
      methodDetails.bank_name = bankName.trim()
      methodDetails.account_name = bankAccountName.trim()
      methodDetails.account_number = bankAccountNumber.trim()
    }
    if (paymentMethod === "cards") methodDetails.note = cardsNote.trim()

    setRequesting(true)
    try {
      const res = await fetch("/api/instructor/revenue/request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          payment_method: paymentMethod,
          payment_method_details: methodDetails,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed")
      toast.success("Payout request submitted. Admin will process it.")
      setRequestAmount("")
      setEvcPhone("")
      setPaypalEmail("")
      setBankName("")
      setBankAccountName("")
      setBankAccountNumber("")
      setCardsNote("")
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

  const hasBalance = (data?.available_balance ?? 0) > 0
    const METHOD_LABELS: Record<PayoutMethod, string> = { evc_plus: "EVC Plus", paypal: "PayPal", bank_transfer: "Bank transfer", cards: "Cards" }

    return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#016b62] via-[#0d9488] to-[#14b8a6] px-6 py-8 sm:px-8 sm:py-10 shadow-2xl shadow-emerald-900/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">My Revenue</h1>
              <p className="text-emerald-100/90 mt-1.5 text-sm sm:text-base max-w-xl">
                Your share from course sales. Request payout when ready; admin will pay to your chosen method.
              </p>
              {data?.revenue_share_percent != null && (
                <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium backdrop-blur-sm">
                  <DollarSign className="h-4 w-4" />
                  {data.revenue_share_percent}% revenue share
                </span>
              )}
            </div>
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>
        </div>

      {loading && !data ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-200/80 h-28" />
            ))}
          </div>
          <div className="rounded-2xl bg-slate-200/80 h-64" />
          <div className="rounded-2xl bg-slate-200/80 h-40" />
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
          <p className="text-slate-600 mb-4">Failed to load revenue.</p>
          <Button onClick={fetchRevenue} className="bg-[#016b62] hover:bg-[#0d9488] rounded-xl">Retry</Button>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-[#2596be]/20 transition-all duration-300">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">This month</p>
              <p className="text-xl sm:text-2xl font-bold text-[#016b62] mt-1">${(data.this_month_earned ?? 0).toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-1">Bishaan</p>
            </div>
            <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-[#3c62b3]/20 transition-all duration-300">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">This year</p>
              <p className="text-xl sm:text-2xl font-bold text-[#3c62b3] mt-1">${(data.this_year_earned ?? 0).toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-1">Sannadkan</p>
            </div>
            <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg shadow-slate-200/50 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total earned</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">${(data.total_earned ?? 0).toFixed(2)}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg shadow-slate-200/50 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total paid</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">${(data.total_paid ?? 0).toFixed(2)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 sm:p-5 shadow-xl shadow-emerald-500/25 border border-emerald-400/30">
              <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Available</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">${(data.available_balance ?? 0).toFixed(2)}</p>
              <p className="text-xs text-emerald-100/80 mt-1">Ready to withdraw</p>
            </div>
          </div>

          {/* Request payout card */}
          <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-50/50 px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#016b62]/10">
                  <Send className="h-5 w-5 text-[#016b62]" />
                </span>
                Request payout
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter amount and choose how you want to receive it. Admin will process your request.
              </p>
            </div>
            <div className="p-6 space-y-5">
              {!hasBalance && (
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 px-4 py-3">
                  <span className="text-amber-500 text-lg">!</span>
                  <p className="text-sm text-amber-800">
                    Insufficient balance. Available: <strong>${(data.available_balance ?? 0).toFixed(2)}</strong>. You need earnings to request a payout.
                  </p>
                </div>
              )}
              <form onSubmit={handleRequestPayout} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-slate-700 font-medium">Amount ($)</Label>
                    {data.minimum_payout_amount != null && (
                      <p className="text-xs text-slate-500 mt-0.5">Min: ${data.minimum_payout_amount.toFixed(2)}</p>
                    )}
                    <Input
                      type="number"
                      min={data.minimum_payout_amount ?? 0.01}
                      step={0.01}
                      max={data.available_balance}
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder={data.minimum_payout_amount != null ? data.minimum_payout_amount.toFixed(2) : "0.00"}
                      className="mt-2 h-12 rounded-xl border-slate-200 focus:border-[#016b62] focus:ring-[#016b62]/20 text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium block mb-2">Payment method</Label>
                    <div className="flex flex-wrap gap-2">
                      {(["evc_plus", "paypal", "bank_transfer", "cards"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            paymentMethod === m
                              ? "bg-[#016b62] text-white shadow-lg shadow-[#016b62]/25"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {METHOD_LABELS[m]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {paymentMethod === "evc_plus" && (
                  <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                    <Label className="text-slate-700 font-medium">EVC Plus number</Label>
                    <p className="text-xs text-slate-500 mt-0.5">Phone number where you will receive the money</p>
                    <Input type="tel" value={evcPhone} onChange={(e) => setEvcPhone(e.target.value)} placeholder="e.g. 252612345678" className="mt-2 h-11 rounded-xl" />
                  </div>
                )}
                {paymentMethod === "paypal" && (
                  <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                    <Label className="text-slate-700 font-medium">PayPal email</Label>
                    <Input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="your@email.com" className="mt-2 h-11 rounded-xl" />
                  </div>
                )}
                {paymentMethod === "bank_transfer" && (
                  <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-700 font-medium">Bank name</Label>
                      <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank name" className="mt-2 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium">Account name</Label>
                      <Input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} placeholder="Account holder" className="mt-2 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium">Account number</Label>
                      <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="Account number" className="mt-2 rounded-xl" />
                    </div>
                  </div>
                )}
                {paymentMethod === "cards" && (
                  <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                    <Label className="text-slate-700 font-medium">Note (optional)</Label>
                    <Input value={cardsNote} onChange={(e) => setCardsNote(e.target.value)} placeholder="Details for card payout" className="mt-2 rounded-xl" />
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={requesting || !hasBalance}
                  className="w-full sm:w-auto min-w-[200px] h-12 rounded-xl bg-gradient-to-r from-[#016b62] to-[#0d9488] hover:from-[#0d9488] hover:to-[#14b8a6] text-white font-semibold shadow-lg shadow-[#016b62]/25 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
                >
                  {requesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-5 w-5 mr-2" />Request payout</>}
                </Button>
              </form>
            </div>
          </div>

          {/* Payment details card */}
          <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-50/50 px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-slate-200/80">
                  <Banknote className="h-5 w-5 text-slate-600" />
                </span>
                Payment details
              </h2>
              <p className="text-sm text-slate-500 mt-1">Bank or mobile money. Admin will use this to send your payout.</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSavePaymentDetails} className="space-y-3">
                <Textarea
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder="e.g. Bank: XYZ, Account: 1234567890 or Mobile: 252612345678"
                  rows={3}
                  className="resize-none rounded-xl border-slate-200 focus:border-[#016b62] focus:ring-[#016b62]/20"
                />
                <Button type="submit" variant="outline" disabled={savingDetails} className="rounded-xl border-[#016b62]/30 text-[#016b62] hover:bg-[#016b62]/5">
                  {savingDetails ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save
                </Button>
              </form>
            </div>
          </div>

          {/* Payout history */}
          <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-50/50 px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Payout history</h2>
              <p className="text-sm text-slate-500 mt-1">Your withdrawal requests and status</p>
            </div>
            <div className="p-6">
              {data.payouts?.length ? (
                <ul className="space-y-3">
                  {data.payouts.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-4 px-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors border border-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-slate-800">${p.amount_requested.toFixed(2)}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${p.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {p.status === "pending" ? "Pending" : "Paid"}
                        </span>
                        {p.paid_at && <span className="text-slate-500 text-sm">{new Date(p.paid_at).toLocaleDateString()}</span>}
                        {p.payment_reference && <span className="text-xs text-slate-400">Ref: {p.payment_reference}</span>}
                      </div>
                      {p.status === "paid" && !p.confirmed_received_at && (
                        <Button size="sm" variant="outline" onClick={() => handleConfirmReceipt(p.id)} disabled={confirmingId === p.id} className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                          {confirmingId === p.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}Confirm receipt
                        </Button>
                      )}
                      {p.confirmed_received_at && <span className="text-sm font-medium text-emerald-600">Received</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-10 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                  <Banknote className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No payout requests yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
