"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Check, X, DollarSign, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

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

      if (groupRes.ok && paymentsRes.ok && expensesRes.ok) {
        const groupData = await groupRes.json()
        const paymentsData = await paymentsRes.json()
        const expensesData = await expensesRes.json()
        setGroup(groupData)
        setPayments(paymentsData)
        setExpenses(expensesData)
        setPaymentForm((prev) => ({ ...prev, amount_paid: String(groupData.cost_per_member) }))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
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

      if (res.ok) {
        setSelectedStudent(null)
        setPaymentForm({ amount_paid: String(group?.cost_per_member || 0), payment_method: "cash", notes: "" })
        fetchGroupAndPayments()
      }
    } catch (error) {
      console.error("Error recording payment:", error)
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

  const paidCount = payments.filter((p) => p.has_paid).length
  const unpaidCount = payments.length - paidCount
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Groups
        </Button>

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
                      {!payment.has_paid && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedStudent(payment.student_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Record Payment
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
      </div>
    </div>
  )
}
