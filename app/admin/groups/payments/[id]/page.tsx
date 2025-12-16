"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Check,
  X,
  DollarSign,
  Plus,
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface Payment {
  student_id: string
  full_name: string
  gender: string
  payment_id: number | null
  amount_paid: number | null
  paid_at: string | null
  payment_method: string | null
  notes: string | null
  has_paid: boolean
}

interface Group {
  id: number
  name: string
  cost_per_member: number
  is_paid: boolean
  class_id: string // Assuming class_id is part of the Group interface
}

interface Expense {
  id: number
  description: string
  amount: number
  date: string
}

export default function GroupPaymentsPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: "",
    payment_method: "cash",
    notes: "",
  })
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    date: "",
  })
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [showManageModal, setShowManageModal] = useState(false)
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [selectedNewStudents, setSelectedNewStudents] = useState<string[]>([])
  const [removingMember, setRemovingMember] = useState<string | null>(null)
  const [showAlternativePayment, setShowAlternativePayment] = useState(false)
  const [alternativePaymentForm, setAlternativePaymentForm] = useState({
    student_id: "",
    amount: "",
    method: "cash",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    fetchGroupAndPayments()
  }, [groupId])

  const fetchGroupAndPayments = async () => {
    try {
      const [groupRes, paymentsRes, expensesRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/payments`),
        fetch(`/api/groups/${groupId}/expenses`),
      ])

      console.log("[v0] Group API response status:", groupRes.status)
      console.log("[v0] Payments API response status:", paymentsRes.status)
      console.log("[v0] Expenses API response status:", expensesRes.status)

      if (groupRes.ok) {
        const groupData = await groupRes.json()
        console.log("[v0] Group data loaded:", groupData)
        setGroup(groupData)
        setPaymentForm((prev) => ({
          ...prev,
          amount_paid: String(groupData.cost_per_member || 0),
        }))
      } else {
        console.error("[v0] Group API failed:", await groupRes.text())
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        console.log("[v0] Payments data loaded:", paymentsData.length, "payments")
        setPayments(paymentsData)
      } else {
        console.error("[v0] Payments API failed:", await paymentsRes.text())
        setPayments([])
      }

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        console.log("[v0] Expenses data loaded:", expensesData.length, "expenses")
        setExpenses(expensesData)
      } else {
        console.error("[v0] Expenses API failed:", await expensesRes.text())
        setExpenses([])
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      alert("Failed to load payment data. Please check your internet connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async (studentId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          ...paymentForm,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const payment = payments.find((p) => p.student_id === studentId)
        setReceiptData({
          studentName: payment?.full_name,
          studentId: studentId,
          groupName: group?.name,
          amount: paymentForm.amount_paid,
          paymentMethod: paymentForm.payment_method,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
        })
        setShowReceipt(true)

        setSelectedStudent(null)
        setPaymentForm({
          amount_paid: String(group?.cost_per_member || 0),
          payment_method: "cash",
          notes: "",
        })

        toast({
          title: "Payment Recorded",
          description: `Payment recorded successfully for ${payment?.full_name}`,
        })

        fetchGroupAndPayments()
      } else {
        toast({
          title: "Payment Failed",
          description: data.error || data.details || "Failed to record payment. Please try again.",
          variant: "destructive",
        })
        console.error("[v0] Payment error:", data)
      }
    } catch (error) {
      console.error("Error recording payment:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to server. Please check your internet connection and try again.",
        variant: "destructive",
      })
    }
  }

  const handleRecordExpense = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          ...expenseForm,
        }),
      })

      if (res.ok) {
        setExpenseForm({ description: "", amount: "", date: "" })
        setShowExpenseModal(false)
        fetchGroupAndPayments()
      }
    } catch (error) {
      console.error("Error recording expense:", error)
    }
  }

  const printReceipt = () => {
    window.print()
  }

  const handleMarkAsUnpaid = async (paymentId: number, studentName: string) => {
    if (!confirm(`Are you sure you want to mark ${studentName} as unpaid? This will delete the payment record.`)) {
      return
    }

    try {
      console.log("[v0] Marking payment as unpaid, payment_id:", paymentId)

      const response = await fetch(`/api/groups/${groupId}/payments?payment_id=${paymentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete payment")
      }

      alert("Payment has been reversed successfully!")
      fetchGroupAndPayments()
    } catch (error) {
      console.error("[v0] Error marking as unpaid:", error)
      alert("Failed to reverse payment. Please try again.")
    }
  }

  const fetchAvailableStudents = async () => {
    if (!group) return

    try {
      const response = await fetch(`/api/university-students?class_id=${group.class_id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`)
      }
      const students = await response.json()

      if (!Array.isArray(students)) {
        console.error("[v0] Students response is not an array:", students)
        setAllStudents([])
        return
      }

      // Filter out students already in the group
      const currentMemberIds = payments.map((p) => p.student_id)
      const available = students.filter((s: any) => !currentMemberIds.includes(s.student_id))
      setAllStudents(available)
    } catch (error) {
      console.error("[v0] Error fetching students:", error)
      setAllStudents([])
    }
  }

  const handleAddMembers = async () => {
    if (selectedNewStudents.length === 0) return

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: selectedNewStudents,
          class_id: group?.class_id, // Use group.class_id instead of payments[0]?.class_id
          leader_student_id: "admin",
        }),
      })

      if (!response.ok) throw new Error("Failed to add members")

      alert(`Successfully added ${selectedNewStudents.length} member(s)`)
      setSelectedNewStudents([])
      await fetchGroupAndPayments()
      await fetchAvailableStudents()
    } catch (error) {
      console.error("[v0] Error adding members:", error)
      alert("Failed to add members. Please try again.")
    }
  }

  const handleRemoveMember = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this group?`)) return

    setRemovingMember(studentId)
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${studentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove member")

      alert(`Successfully removed ${studentName} from the group`)
      await fetchGroupAndPayments()
      await fetchAvailableStudents()
    } catch (error) {
      console.error("[v0] Error removing member:", error)
      alert("Failed to remove member. Please try again.")
    } finally {
      setRemovingMember(null)
    }
  }

  const handleAlternativePayment = async () => {
    if (!alternativePaymentForm.student_id || !alternativePaymentForm.amount) {
      toast({
        title: "Missing Information",
        description: "Please select a student and enter an amount",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Alternative payment - Starting payment record")
      console.log("[v0] Alternative payment - Data:", alternativePaymentForm)

      const response = await fetch(`/api/groups/${groupId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: alternativePaymentForm.student_id,
          amount_paid: Number.parseFloat(alternativePaymentForm.amount),
          payment_method: alternativePaymentForm.method,
          notes: alternativePaymentForm.notes,
          recorded_by: "admin",
        }),
      })

      console.log("[v0] Alternative payment - Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Alternative payment - Error response:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to record payment")
      }

      const result = await response.json()
      console.log("[v0] Alternative payment - Success:", result)

      const student = payments.find((p) => p.student_id === alternativePaymentForm.student_id)

      toast({
        title: "Payment Recorded Successfully",
        description: `Payment of $${alternativePaymentForm.amount} recorded for ${student?.full_name}`,
      })

      setShowAlternativePayment(false)
      setAlternativePaymentForm({
        student_id: "",
        amount: "",
        method: "cash",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      })

      await fetchGroupAndPayments()
    } catch (error) {
      console.error("[v0] Alternative payment - Error:", error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const paidCount = payments.filter((p) => p.has_paid).length
  const unpaidCount = payments.length - paidCount
  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const netBalance = totalCollected - totalExpenses

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#013565]/5 via-white to-[#ff1b4a]/5">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#013565]/20 border-t-[#013565] mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#013565] animate-pulse" />
            </div>
          </div>
          <p className="text-[#013565] font-medium mt-4">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#013565]/5 via-slate-50 to-[#ff1b4a]/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/groups")}
            className="flex items-center gap-2 border-[#013565]/20 text-[#013565] hover:bg-[#013565] hover:text-white transition-all duration-300 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Groups
          </Button>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAlternativePayment(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
            >
              <DollarSign className="w-4 h-4" />
              Quick Payment
            </Button>

            <Button
              onClick={() => {
                setShowManageModal(true)
                fetchAvailableStudents()
              }}
              className="bg-gradient-to-r from-[#013565] to-[#013565]/80 hover:from-[#013565]/90 hover:to-[#013565] text-white flex items-center gap-2 shadow-lg shadow-[#013565]/25 transition-all duration-300 hover:scale-105"
            >
              <Users className="w-4 h-4" />
              Manage Group
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-[#013565] via-[#013565]/90 to-[#013565] p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{group?.name}</h1>
                <p className="text-white/80 mt-1">Payment Tracking Dashboard</p>
              </div>
            </div>

            {/* Cost badge */}
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Banknote className="w-4 h-4 text-white/80" />
              <span className="text-white/90 text-sm">Cost per member:</span>
              <span className="text-white font-bold">${group?.cost_per_member}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Paid */}
              <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-emerald-600 text-sm font-medium">Paid</p>
                <p className="text-3xl font-bold text-emerald-700">{paidCount}</p>
              </div>

              {/* Unpaid */}
              <div className="group bg-gradient-to-br from-[#ff1b4a]/10 to-[#ff1b4a]/5 rounded-2xl p-5 border border-[#ff1b4a]/20 hover:shadow-lg hover:shadow-[#ff1b4a]/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff1b4a] to-[#ff1b4a]/80 flex items-center justify-center shadow-lg shadow-[#ff1b4a]/30 group-hover:scale-110 transition-transform duration-300">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-[#ff1b4a] text-sm font-medium">Unpaid</p>
                <p className="text-3xl font-bold text-[#ff1b4a]">{unpaidCount}</p>
              </div>

              {/* Total Collected */}
              <div className="group bg-gradient-to-br from-[#013565]/10 to-[#013565]/5 rounded-2xl p-5 border border-[#013565]/20 hover:shadow-lg hover:shadow-[#013565]/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#013565] to-[#013565]/80 flex items-center justify-center shadow-lg shadow-[#013565]/30 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-[#013565] text-sm font-medium">Total Collected</p>
                <p className="text-3xl font-bold text-[#013565]">${totalCollected.toFixed(2)}</p>
              </div>

              {/* Total Expenses */}
              <div className="group bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-amber-600 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-amber-700">${totalExpenses.toFixed(2)}</p>
              </div>

              {/* Net Balance */}
              <div
                className={`group rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 col-span-2 md:col-span-1 ${
                  netBalance >= 0
                    ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50 hover:shadow-lg hover:shadow-emerald-500/10"
                    : "bg-gradient-to-br from-[#ff1b4a]/10 to-[#ff1b4a]/5 border-[#ff1b4a]/20 hover:shadow-lg hover:shadow-[#ff1b4a]/10"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                      netBalance >= 0
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30"
                        : "bg-gradient-to-br from-[#ff1b4a] to-[#ff1b4a]/80 shadow-[#ff1b4a]/30"
                    }`}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className={`text-sm font-medium ${netBalance >= 0 ? "text-emerald-600" : "text-[#ff1b4a]"}`}>
                  Net Balance
                </p>
                <p className={`text-3xl font-bold ${netBalance >= 0 ? "text-emerald-700" : "text-[#ff1b4a]"}`}>
                  ${netBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#013565] to-[#013565]/90 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-white/80" />
              <h2 className="text-lg font-bold text-white">Payment Records</h2>
            </div>
            <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
              {payments.length} members
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#013565]/5 to-[#013565]/10 border-b border-[#013565]/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#013565] uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#013565] uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#013565] uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#013565] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#013565] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#013565] uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#013565] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment, index) => (
                  <tr key={payment.student_id} className="hover:bg-[#013565]/5 transition-all duration-200 group">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-[#013565] transition-colors">
                        {payment.full_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                        {payment.student_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.has_paid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm">
                          <Check className="w-3 h-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#ff1b4a] to-[#ff1b4a]/80 text-white shadow-sm">
                          <X className="w-3 h-3" />
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        {payment.amount_paid ? `$${payment.amount_paid}` : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 flex items-center gap-1.5">
                        {payment.paid_at ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(payment.paid_at).toLocaleDateString()}
                          </>
                        ) : (
                          "-"
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!payment.has_paid ? (
                        <Button
                          size="sm"
                          onClick={() => setSelectedStudent(payment.student_id)}
                          className="bg-gradient-to-r from-[#013565] to-[#013565]/80 hover:from-[#013565]/90 hover:to-[#013565] text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          <CreditCard className="w-4 h-4 mr-1.5" />
                          Record Payment
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsUnpaid(payment.payment_id!, payment.full_name)}
                          disabled={removingMember === payment.student_id}
                          className="border-[#ff1b4a]/30 text-[#ff1b4a] hover:bg-[#ff1b4a] hover:text-white hover:border-[#ff1b4a] transition-all duration-300"
                        >
                          {removingMember === payment.student_id ? "Removing..." : "Mark as Unpaid"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-white/80" />
              <h2 className="text-lg font-bold text-white">Expenses</h2>
            </div>
            <Button
              onClick={() => setShowExpenseModal(true)}
              size="sm"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-b border-amber-200/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    Amount ($)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                          <Receipt className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-gray-500">No expenses recorded yet</p>
                        <Button
                          onClick={() => setShowExpenseModal(true)}
                          size="sm"
                          variant="outline"
                          className="border-amber-300 text-amber-600 hover:bg-amber-50"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add First Expense
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense, index) => (
                    <tr key={expense.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{expense.description}</td>
                      <td className="px-6 py-4 text-sm font-bold text-amber-600">${expense.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showManageModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#013565] to-[#013565]/90 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Manage Group Members</h2>
                    <p className="text-white/70 text-sm">{group?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowManageModal(false)
                    setSelectedNewStudents([])
                  }}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Current Members Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#013565]">Current Members</h3>
                      <span className="bg-[#013565]/10 text-[#013565] text-sm font-bold px-3 py-1 rounded-full">
                        {payments.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                      {payments.map((payment) => (
                        <div
                          key={payment.student_id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-[#013565]/20 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                payment.has_paid
                                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                  : "bg-gradient-to-br from-[#ff1b4a] to-[#ff1b4a]/80"
                              }`}
                            >
                              {payment.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{payment.full_name}</p>
                              <p className="text-sm text-gray-500 font-mono">{payment.student_id}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveMember(payment.student_id, payment.full_name)}
                            disabled={removingMember === payment.student_id}
                            className="border-[#ff1b4a]/30 text-[#ff1b4a] hover:bg-[#ff1b4a] hover:text-white hover:border-[#ff1b4a] transition-all duration-300"
                          >
                            {removingMember === payment.student_id ? "..." : "Remove"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Members Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-emerald-600">Add New Members</h3>
                      <span className="bg-emerald-100 text-emerald-600 text-sm font-bold px-3 py-1 rounded-full">
                        {allStudents.length} available
                      </span>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                      {allStudents.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">No available students to add</p>
                        </div>
                      ) : (
                        allStudents.map((student) => (
                          <label
                            key={student.student_id}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                              selectedNewStudents.includes(student.student_id)
                                ? "bg-emerald-50 border-2 border-emerald-500 shadow-md"
                                : "bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-sm"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedNewStudents.includes(student.student_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedNewStudents([...selectedNewStudents, student.student_id])
                                } else {
                                  setSelectedNewStudents(selectedNewStudents.filter((id) => id !== student.student_id))
                                }
                              }}
                              className="w-5 h-5 text-emerald-600 rounded-lg border-2 border-gray-300 focus:ring-emerald-500"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{student.full_name}</p>
                              <p className="text-sm text-gray-500 font-mono">{student.student_id}</p>
                            </div>
                            {selectedNewStudents.includes(student.student_id) && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            )}
                          </label>
                        ))
                      )}
                    </div>

                    {selectedNewStudents.length > 0 && (
                      <Button
                        onClick={handleAddMembers}
                        className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add {selectedNewStudents.length} Selected Member(s)
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowManageModal(false)
                    setSelectedNewStudents([])
                  }}
                  className="w-full border-gray-300 hover:bg-gray-100"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#013565] to-[#013565]/90 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Record Payment</h2>
                    <p className="text-white/70 text-sm">
                      {payments.find((p) => p.student_id === selectedStudent)?.full_name}
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleRecordPayment(selectedStudent)
                }}
                className="p-6 space-y-5"
              >
                <div>
                  <label className="block text-sm font-bold text-[#013565] mb-2">Amount Paid ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={paymentForm.amount_paid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#013565]/20 focus:border-[#013565] transition-all text-lg font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#013565] mb-2">Payment Method</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#013565]/20 focus:border-[#013565] transition-all bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="evc">EVC Plus</option>
                    <option value="edahab">eDahab</option>
                    <option value="sahal">Sahal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#013565] mb-2">Notes (Optional)</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#013565]/20 focus:border-[#013565] transition-all resize-none"
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedStudent(null)
                      setPaymentForm({
                        amount_paid: String(group?.cost_per_member || 0),
                        payment_method: "cash",
                        notes: "",
                      })
                    }}
                    className="flex-1 border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Record Expense</h2>
                    <p className="text-white/70 text-sm">Add a new expense entry</p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleRecordExpense()
                }}
                className="p-6 space-y-5"
              >
                <div>
                  <label className="block text-sm font-bold text-amber-700 mb-2">Description</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    placeholder="e.g., Project materials"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-amber-700 mb-2">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-lg font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-amber-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowExpenseModal(false)
                      setExpenseForm({ description: "", amount: "", date: "" })
                    }}
                    className="flex-1 border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Record Expense
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showReceipt && receiptData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white animate-in fade-in duration-200">
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden print:shadow-none animate-in zoom-in-95 duration-300"
              id="receipt"
            >
              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-[#013565] to-[#013565]/90 px-6 py-6 text-center print:bg-white print:text-black">
                <div className="w-16 h-16 rounded-2xl bg-white/10 print:bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-8 h-8 text-white print:text-[#013565]" />
                </div>
                <h2 className="text-2xl font-bold text-white print:text-[#013565]">Payment Receipt</h2>
                <p className="text-white/70 print:text-gray-500 text-sm mt-1">Markano Online Learning</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Receipt Date:</span>
                    <span className="font-bold text-gray-900">{receiptData.date}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-bold text-gray-900">{receiptData.time}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Student Name:</span>
                    <span className="font-bold text-gray-900">{receiptData.studentName}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Student ID:</span>
                    <span className="font-bold text-gray-900 font-mono">{receiptData.studentId}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Group:</span>
                    <span className="font-bold text-gray-900">{receiptData.groupName}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="font-bold text-gray-900 capitalize">{receiptData.paymentMethod}</span>
                  </div>

                  {/* Amount - Highlighted */}
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-bold">Amount Paid:</span>
                      <span className="text-3xl font-bold text-emerald-600">${receiptData.amount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>Thank you for your payment!</p>
                  <p className="mt-2 text-xs">This is an official receipt from Markano Online Learning</p>
                </div>

                <div className="flex gap-3 mt-6 print:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReceipt(false)}
                    className="flex-1 border-gray-300 hover:bg-gray-100"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={printReceipt}
                    className="flex-1 bg-gradient-to-r from-[#013565] to-[#013565]/80 hover:from-[#013565]/90 hover:to-[#013565] text-white shadow-lg"
                  >
                    Print Receipt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAlternativePayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Quick Payment</h2>
                      <p className="text-white/70 text-sm">Fast payment entry</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAlternativePayment(false)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#013565] mb-2">Select Student</label>
                  <select
                    value={alternativePaymentForm.student_id}
                    onChange={(e) =>
                      setAlternativePaymentForm((prev) => ({
                        ...prev,
                        student_id: e.target.value,
                        amount: group?.cost_per_member ? String(group.cost_per_member) : prev.amount,
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                  >
                    <option value="">Choose a student...</option>
                    {payments
                      .filter((p) => !p.has_paid)
                      .map((payment) => (
                        <option key={payment.student_id} value={payment.student_id}>
                          {payment.full_name} ({payment.student_id})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#013565] mb-2">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={alternativePaymentForm.amount}
                    onChange={(e) => setAlternativePaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg font-bold text-center"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#013565] mb-2">Payment Method</label>
                  <select
                    value={alternativePaymentForm.method}
                    onChange={(e) => setAlternativePaymentForm((prev) => ({ ...prev, method: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="evc">EVC Plus</option>
                    <option value="edahab">eDahab</option>
                    <option value="sahal">Sahal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#013565] mb-2">Notes (Optional)</label>
                  <textarea
                    value={alternativePaymentForm.notes}
                    onChange={(e) => setAlternativePaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    rows={2}
                    placeholder="Any notes..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAlternativePayment(false)}
                    className="flex-1 border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAlternativePayment}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
