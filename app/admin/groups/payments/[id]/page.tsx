"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, X, DollarSign, Plus, Users } from "lucide-react"
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

export default function GroupPaymentsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const groupId = params.id

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

      const response = await fetch(`/api/groups/${params.id}/payments?payment_id=${paymentId}`, {
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

  const paidCount = payments.filter((p) => p.has_paid).length
  const unpaidCount = payments.length - paidCount
  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const netBalance = totalCollected - totalExpenses

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/admin/groups")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Groups
          </Button>

          <Button
            onClick={() => {
              setShowManageModal(true)
              fetchAvailableStudents()
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Manage Group
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{group?.name} - Payment Tracking</h1>
          <p className="text-gray-600">Cost per member: ${group?.cost_per_member}</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-lg p-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Paid</p>
                  <p className="text-2xl font-bold text-green-900">{paidCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-lg p-3">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">Unpaid</p>
                  <p className="text-2xl font-bold text-red-900">{unpaidCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-3">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Collected</p>
                  <p className="text-2xl font-bold text-blue-900">${totalCollected.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 rounded-lg p-3">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Total Expenses</p>
                  <p className="text-2xl font-bold text-yellow-900">${totalExpenses.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-lg p-3">
                  <DollarSign className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Net Balance</p>
                  <p className="text-2xl font-bold text-gray-900">${netBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Payment Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment, index) => (
                  <tr key={payment.student_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.student_id}</td>
                    <td className="px-6 py-4">
                      {payment.has_paid ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Check className="w-3 h-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <X className="w-3 h-3" />
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.amount_paid ? `$${payment.amount_paid}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {!payment.has_paid ? (
                        <Button
                          size="sm"
                          onClick={() => setSelectedStudent(payment.student_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Record Payment
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsUnpaid(payment.payment_id!, payment.full_name)}
                          disabled={removingMember === payment.student_id}
                          className="border-red-600 text-red-600 hover:bg-red-50"
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

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-6">
          <div className="px-6 py-4 bg-gradient-to-r from-yellow-600 to-red-600 text-white flex items-center justify-between">
            <h2 className="text-lg font-bold">Expenses</h2>
            <Button
              onClick={() => setShowExpenseModal(true)}
              size="sm"
              className="bg-white text-yellow-600 hover:bg-gray-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount ($)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No expenses recorded yet
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense, index) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${expense.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showManageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Group Members</h2>
                <button
                  onClick={() => {
                    setShowManageModal(false)
                    setSelectedNewStudents([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Members Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Members ({payments.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.student_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{payment.full_name}</p>
                          <p className="text-sm text-gray-600">{payment.student_id}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(payment.student_id, payment.full_name)}
                          disabled={removingMember === payment.student_id}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          {removingMember === payment.student_id ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Members Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Add New Members ({allStudents.length} available)
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {allStudents.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No available students to add</p>
                    ) : (
                      allStudents.map((student) => (
                        <label
                          key={student.student_id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
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
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{student.full_name}</p>
                            <p className="text-sm text-gray-600">{student.student_id}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  {selectedNewStudents.length > 0 && (
                    <Button onClick={handleAddMembers} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                      Add {selectedNewStudents.length} Selected Member(s)
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowManageModal(false)
                    setSelectedNewStudents([])
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Payment</h2>
              <p className="text-gray-600 mb-4">
                Recording payment for:{" "}
                <span className="font-semibold">
                  {payments.find((p) => p.student_id === selectedStudent)?.full_name}
                </span>
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleRecordPayment(selectedStudent)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={paymentForm.amount_paid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
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
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Confirm Payment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Expense</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleRecordExpense()
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Project materials"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowExpenseModal(false)
                      setExpenseForm({ description: "", amount: "", date: "" })
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Record Expense
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showReceipt && receiptData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:bg-white">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 print:shadow-none" id="receipt">
              <div className="text-center mb-6 print:mb-4">
                <h2 className="text-2xl font-bold text-gray-900 print:text-xl">Payment Receipt</h2>
                <p className="text-gray-500 text-sm mt-1">Markano Online Learning</p>
              </div>

              <div className="border-t border-b border-gray-200 py-6 space-y-4 print:py-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt Date:</span>
                  <span className="font-semibold">{receiptData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{receiptData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student Name:</span>
                  <span className="font-semibold">{receiptData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-semibold">{receiptData.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Group:</span>
                  <span className="font-semibold">{receiptData.groupName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold capitalize">{receiptData.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
                  <span className="text-gray-900 font-bold">Amount Paid:</span>
                  <span className="font-bold text-green-600">${receiptData.amount}</span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500 print:mt-4">
                <p>Thank you for your payment!</p>
                <p className="mt-2 text-xs">This is an official receipt from Markano Online Learning</p>
              </div>

              <div className="flex gap-3 mt-6 print:hidden">
                <Button type="button" variant="outline" onClick={() => setShowReceipt(false)} className="flex-1">
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={printReceipt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Print Receipt
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
