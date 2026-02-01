"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Revenue</h1>
        <p className="text-slate-500 mt-1">
          Your share from course sales ({data?.revenue_share_percent ?? 0}%). Request payout when ready; admin will pay to your account.
        </p>
      </div>

      {loading && !data ? (
        <div className="space-y-6 animate-pulse">
          <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
            <CardHeader>
              <div className="h-6 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-64 bg-slate-100 rounded mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl bg-slate-100 p-5 h-20" />
                ))}
              </div>
              <div className="h-24 bg-slate-100 rounded-xl" />
              <div className="h-32 bg-slate-100 rounded-xl" />
            </CardContent>
          </Card>
        </div>
      ) : !data ? (
        <Card className="border-0 shadow-xl rounded-2xl bg-white p-8 text-center">
          <p className="text-slate-600 mb-4">Failed to load revenue.</p>
          <Button onClick={fetchRevenue} className="bg-[#e63946] hover:bg-[#d62839]">Retry</Button>
        </Card>
      ) : (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border-0 bg-gradient-to-br from-[#2596be]/10 to-[#2596be]/5 p-5 shadow-inner ring-1 ring-[#2596be]/20">
              <p className="text-sm font-medium text-[#2596be]">Bishaan (This month)</p>
              <p className="text-2xl font-bold text-[#2596be] mt-1">
                ${(data?.this_month_earned ?? 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Waxa aad ku kasbatay bishaan</p>
            </div>
            <div className="rounded-xl border-0 bg-gradient-to-br from-[#3c62b3]/10 to-[#3c62b3]/5 p-5 shadow-inner ring-1 ring-[#3c62b3]/20">
              <p className="text-sm font-medium text-[#3c62b3]">Sannadkan (This year)</p>
              <p className="text-2xl font-bold text-[#3c62b3] mt-1">
                ${(data?.this_year_earned ?? 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Waxa aad ku kasbatay sannadkan</p>
            </div>
          </div>
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

          {/* Request payout — always visible */}
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50/50 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Send className="h-4 w-4 text-[#e63946]" />
              Request payout
            </h3>
            <p className="text-sm text-slate-500">
              Enter the amount you want to withdraw and choose how you want to receive it. Admin will process your request.
            </p>
            {(data?.available_balance ?? 0) <= 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                Insufficient balance. Available: ${(data?.available_balance ?? 0).toFixed(2)}. You need earnings to request a payout.
              </p>
            )}
            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <Label className="text-slate-700">Amount ($)</Label>
                  {data?.minimum_payout_amount != null && (
                    <p className="text-xs text-amber-600 mt-0.5">Minimum: ${data.minimum_payout_amount.toFixed(2)}</p>
                  )}
                  <Input
                    type="number"
                    min={data?.minimum_payout_amount ?? 0.01}
                    step={0.01}
                    max={data?.available_balance}
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder={data?.minimum_payout_amount != null ? data.minimum_payout_amount.toFixed(2) : "0.00"}
                    className="mt-1 w-36 rounded-xl"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-slate-700">Payment method</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(["evc_plus", "paypal", "bank_transfer", "cards"] as const).map((m) => (
                      <label key={m} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === m}
                          onChange={() => setPaymentMethod(m)}
                          className="rounded border-slate-300 text-[#e63946] focus:ring-[#e63946]"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {m === "evc_plus" ? "EVC Plus" : m === "bank_transfer" ? "Bank transfer" : m === "paypal" ? "PayPal" : "Cards"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {paymentMethod === "evc_plus" && (
                <div>
                  <Label className="text-slate-700">Number to send to (EVC Plus)</Label>
                  <p className="text-xs text-slate-500 mt-0.5">Enter the phone number where you will receive the money</p>
                  <Input
                    type="tel"
                    value={evcPhone}
                    onChange={(e) => setEvcPhone(e.target.value)}
                    placeholder="e.g. 252612345678"
                    className="mt-1 max-w-xs rounded-xl"
                  />
                </div>
              )}
              {paymentMethod === "paypal" && (
                <div>
                  <Label className="text-slate-700">PayPal email</Label>
                  <Input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1 max-w-xs rounded-xl"
                  />
                </div>
              )}
              {paymentMethod === "bank_transfer" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-slate-700">Bank name</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Bank name" className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-slate-700">Account name</Label>
                    <Input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} placeholder="Account holder" className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-slate-700">Account number</Label>
                    <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="Account number" className="mt-1 rounded-xl" />
                  </div>
                </div>
              )}
              {paymentMethod === "cards" && (
                <div>
                  <Label className="text-slate-700">Note (optional)</Label>
                  <Input value={cardsNote} onChange={(e) => setCardsNote(e.target.value)} placeholder="Any details for card payout" className="mt-1 max-w-md rounded-xl" />
                </div>
              )}
              <Button
                type="submit"
                disabled={requesting || (data?.available_balance ?? 0) <= 0}
                className="bg-[#e63946] hover:bg-[#d62839] rounded-xl"
              >
                {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" />Request payout</>}
              </Button>
            </form>
          </div>

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
      )}
    </div>
  )
}
