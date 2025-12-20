"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  Loader2,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react"

// Added Badge component for Unpaid Students table
import { Badge } from "@/components/ui/badge"
// Added Table components for Unpaid Students table
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FinancialData {
  summary: {
    totalIncome: number
    totalGroupExpenses: number
    totalGeneralExpenses: number
    totalExpenses: number
    netBalance: number
  }
  payments: Payment[]
  // Added unpaidStudents array
  unpaidStudents: UnpaidStudent[]
  groupExpenses: any[]
  generalExpenses: any[]
  classStats: any[]
  groupStats: any[]
}

interface Payment {
  id: number
  payment_id?: number // Added payment_id as fallback
  student_id: number
  student_name?: string
  group_id: number
  group_name?: string
  amount_paid: number
  payment_method?: string
  notes?: string
  payment_date?: string
  created_at?: string
}

// Added UnpaidStudent interface after Payment interface
interface UnpaidStudent {
  student_id: string
  group_id: number
  class_id: number
  student_name: string
  group_name: string
  amount_due: number
  class_name: string
}

function formatDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return "N/A"
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return "N/A"
    return date.toLocaleDateString()
  } catch {
    return "N/A"
  }
}

function formatDateKey(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return "unknown"
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return "unknown"
    return date.toISOString().split("T")[0]
  } catch {
    return "unknown"
  }
}

export default function FinancialReportPage() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [paymentStatus, setPaymentStatus] = useState<"all" | "paid" | "unpaid">("all")
  const [groups, setGroups] = useState<any[]>([])
  const [activeView, setActiveView] = useState<"summary" | "classes" | "groups">("summary")
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null)
  const [editForm, setEditForm] = useState({
    amount_paid: "",
    payment_method: "Cash",
    notes: "",
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false)

  useEffect(() => {
    fetchReport()
    fetchGroups()
  }, [])

  const fetchReport = async () => {
    try {
      const res = await fetch("/api/financial-report")
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error("[v0] Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups")
      const result = await res.json()
      setGroups(result)
    } catch (error) {
      console.error("[v0] Error fetching groups:", error)
    }
  }

  const exportToPDF = async () => {
    setExporting(true)
    try {
      window.print()
    } catch (error) {
      console.error("[v0] Error exporting PDF:", error)
    } finally {
      setExporting(false)
    }
  }

  const handleEditPayment = async () => {
    if (!editingPayment) return
    setActionLoading(true)
    try {
      const res = await fetch("/api/financial-report", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPayment.id,
          amount_paid: Number.parseFloat(editForm.amount_paid),
          payment_method: editForm.payment_method,
          notes: editForm.notes,
        }),
      })

      if (res.ok) {
        await fetchReport()
        setEditingPayment(null)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update payment")
      }
    } catch (error) {
      console.error("[v0] Error updating payment:", error)
      alert("Failed to update payment")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeletePayment = async () => {
    if (!deletingPayment) return

    console.log("[v0] Deleting payment:", deletingPayment)

    // Use payment_id if id is not available
    const paymentId = deletingPayment.id || deletingPayment.payment_id

    if (!paymentId) {
      alert("Payment ID not found")
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`/api/financial-report?id=${paymentId}`, {
        method: "DELETE",
      })

      const data = await res.json()
      console.log("[v0] Delete response:", data)

      if (res.ok) {
        await fetchReport()
        setDeletingPayment(null)
      } else {
        alert(data.error || "Failed to delete payment")
      }
    } catch (error) {
      console.error("[v0] Error deleting payment:", error)
      alert("Failed to delete payment")
    } finally {
      setActionLoading(false)
    }
  }

  const openEditModal = (payment: Payment) => {
    setEditForm({
      amount_paid: payment.amount_paid.toString(),
      payment_method: payment.payment_method || "Cash",
      notes: payment.notes || "",
    })
    setEditingPayment(payment)
  }

  const { duplicatePaymentIds, duplicateCount } = useMemo(() => {
    const paymentsByKey = new Map<string, Payment[]>()
    const duplicatePaymentIds = new Set<number>()

    data?.payments.forEach((payment) => {
      const dateKey = formatDateKey(payment.payment_date || payment.created_at)
      const key = `${payment.student_id}-${payment.amount_paid}-${dateKey}`

      if (!paymentsByKey.has(key)) {
        paymentsByKey.set(key, [payment])
      } else {
        const existingPayments = paymentsByKey.get(key)!
        existingPayments.push(payment)
        existingPayments.forEach((p) => duplicatePaymentIds.add(p.id))
      }
    })

    return { duplicatePaymentIds, duplicateCount: duplicatePaymentIds.size }
  }, [data])

  const filteredPayments = useMemo(() => {
    if (!data) return []

    return data.payments.filter((payment) => {
      // Duplicate filter
      if (showDuplicatesOnly && !duplicatePaymentIds.has(payment.id)) return false

      // Payment status filter
      if (paymentStatus === "paid" && payment.amount_paid <= 0) return false
      if (paymentStatus === "unpaid" && payment.amount_paid > 0) return false

      // Multiple classes filter
      if (selectedClasses.length > 0) {
        const paymentClassId = String(payment.class_id)
        const isInSelectedClass = selectedClasses.includes(paymentClassId)
        if (!isInSelectedClass) return false
      }

      // Group filter
      if (selectedGroup !== "all" && String(payment.group_id) !== selectedGroup) return false

      return true
    })
  }, [data, selectedClasses, selectedGroup, paymentStatus, showDuplicatesOnly, duplicatePaymentIds])

  const filteredUnpaidStudents = useMemo(() => {
    if (!data || !data.unpaidStudents) return []

    return data.unpaidStudents.filter((student) => {
      // Multiple classes filter
      if (selectedClasses.length > 0) {
        const studentClassId = String(student.class_id)
        if (!selectedClasses.includes(studentClassId)) return false
      }

      // Group filter
      if (selectedGroup !== "all" && String(student.group_id) !== selectedGroup) return false

      return true
    })
  }, [data, selectedClasses, selectedGroup])

  const allGroupMembers = (() => {
    if (!data?.groupStats) return []

    const members: any[] = []

    // Filter groups by class if selected
    const relevantGroups = data.groupStats.filter((group) => {
      if (selectedClasses.length > 0) {
        const fullGroup = groups.find((g) => String(g.id) === String(group.id))
        return fullGroup && selectedClasses.includes(String(fullGroup.class_id))
      }
      return selectedGroup === "all" || String(group.id) === selectedGroup
    })

    relevantGroups.forEach((group) => {
      const paidCount = Number(group.paid_members) || 0
      const unpaidCount = Number(group.unpaid_members) || 0

      members.push({
        group_id: group.id,
        group_name: group.group_name,
        class_name: group.class_name,
        paid_count: paidCount,
        unpaid_count: unpaidCount,
        total_count: paidCount + unpaidCount,
      })
    })

    return members
  })()

  const filteredTotalIncome = (() => {
    if (paymentStatus === "all" || paymentStatus === "paid") {
      return filteredPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount_paid), 0)
    }
    return 0
  })()

  const expectedUnpaidAmount = (() => {
    if (paymentStatus === "unpaid" || paymentStatus === "all") {
      return allGroupMembers.reduce((sum, m) => {
        const group = data?.groupStats.find((g) => g.id === m.group_id)
        const costPerMember = Number(group?.cost_per_member || 0)
        return sum + m.unpaid_count * costPerMember
      }, 0)
    }
    return 0
  })()

  const totalPaidStudents = allGroupMembers.reduce((sum, m) => sum + m.paid_count, 0)
  const totalUnpaidStudents = allGroupMembers.reduce((sum, m) => sum + m.unpaid_count, 0)

  const filteredGroupExpenses =
    selectedClasses.length === 0
      ? selectedGroup === "all"
        ? data?.groupExpenses || []
        : data?.groupExpenses.filter((e) => String(e.group_id) === selectedGroup) || []
      : selectedGroup === "all"
        ? data?.groupExpenses.filter((e) => {
            const group = groups.find((g) => g.id === e.group_id)
            return group && selectedClasses.includes(String(group.class_id))
          }) || []
        : data?.groupExpenses.filter((e) => String(e.group_id) === selectedGroup) || []

  const totalGroupExpenses = filteredGroupExpenses.reduce((sum, e) => sum + Number.parseFloat(e.amount), 0)
  const filteredGeneralExpenses =
    selectedGroup === "all" && selectedClasses.length === 0 ? data?.summary.totalGeneralExpenses || 0 : 0
  const filteredTotalExpenses = totalGroupExpenses + filteredGeneralExpenses
  const filteredNetBalance = filteredTotalIncome - filteredTotalExpenses

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) return <div>Error loading report</div>

  const toggleClassSelection = (classId: string) => {
    setSelectedClasses((prev) => {
      if (prev.includes(classId)) {
        return prev.filter((id) => id !== classId)
      } else {
        return [...prev, classId]
      }
    })
    setSelectedGroup("all")
  }

  const clearClassSelections = () => {
    setSelectedClasses([])
    setSelectedGroup("all")
    setShowClassDropdown(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between print:mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">Financial Report</h1>
            <p className="mt-1 text-gray-600">Comprehensive overview of all income and expenses</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <Button onClick={exportToPDF} disabled={exporting}>
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 print:hidden">
          <Button variant={activeView === "summary" ? "default" : "outline"} onClick={() => setActiveView("summary")}>
            <Wallet className="mr-2 h-4 w-4" />
            Summary
          </Button>
          <Button variant={activeView === "classes" ? "default" : "outline"} onClick={() => setActiveView("classes")}>
            <Users className="mr-2 h-4 w-4" />
            By Class
          </Button>
          <Button variant={activeView === "groups" ? "default" : "outline"} onClick={() => setActiveView("groups")}>
            <Users className="mr-2 h-4 w-4" />
            By Group
          </Button>
        </div>

        {activeView === "classes" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Statistics by Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.classStats.map((classStat) => (
                    <div key={classStat.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{classStat.class_name}</h3>
                        <span className="text-2xl font-bold text-green-600">
                          ${Number(classStat.total_collected).toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Students</p>
                            <p className="text-xl font-semibold">{classStat.total_students}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Paid</p>
                            <p className="text-xl font-semibold text-green-600">{classStat.paid_students}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-sm text-gray-600">Unpaid</p>
                            <p className="text-xl font-semibold text-red-600">{classStat.unpaid_students}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${classStat.total_students > 0 ? (classStat.paid_students / classStat.total_students) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {classStat.total_students > 0
                            ? `${((classStat.paid_students / classStat.total_students) * 100).toFixed(1)}% paid`
                            : "No students"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === "groups" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Statistics by Group</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="pb-3 font-medium">Group Name</th>
                        <th className="pb-3 font-medium">Class</th>
                        <th className="pb-3 font-medium text-center">Total Members</th>
                        <th className="pb-3 font-medium text-center">Paid</th>
                        <th className="pb-3 font-medium text-center">Unpaid</th>
                        <th className="pb-3 font-medium text-right">Collected</th>
                        <th className="pb-3 font-medium text-right">Expected</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.groupStats.map((group) => {
                        const collected = Number(group.total_collected)
                        const expected = Number(group.expected_total)
                        const percentPaid =
                          group.total_members > 0 ? (group.paid_members / group.total_members) * 100 : 0

                        return (
                          <tr key={group.id} className="text-sm hover:bg-gray-50">
                            <td className="py-3 font-medium">{group.group_name}</td>
                            <td className="py-3 text-gray-600">{group.class_name}</td>
                            <td className="py-3 text-center">{group.total_members}</td>
                            <td className="py-3 text-center">
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle className="h-4 w-4" />
                                {group.paid_members}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                <XCircle className="h-4 w-4" />
                                {group.unpaid_members}
                              </span>
                            </td>
                            <td className="py-3 text-right font-semibold text-green-600">${collected.toFixed(2)}</td>
                            <td className="py-3 text-right text-gray-600">${expected.toFixed(2)}</td>
                            <td className="py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentPaid}%` }} />
                                </div>
                                <span className="text-xs text-gray-600">{percentPaid.toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary View (existing content) */}
        {activeView === "summary" && (
          <>
            {/* Filter and Summary Cards */}
            <div className="mb-6 print:hidden">
              <div className="flex flex-wrap items-center gap-4">
                <Filter className="h-4 w-4 text-gray-500" />

                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as "all" | "paid" | "unpaid")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Students</option>
                  <option value="paid">Lacag Bixisay (Paid)</option>
                  <option value="unpaid">Aan Bixin (Unpaid)</option>
                </select>

                <div className="relative">
                  <button
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center gap-2 min-w-[200px] justify-between"
                  >
                    <span className="text-sm">
                      {selectedClasses.length === 0
                        ? "All Classes"
                        : `${selectedClasses.length} Class${selectedClasses.length > 1 ? "es" : ""} Selected`}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showClassDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {showClassDropdown && (
                    <div className="absolute z-10 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                        <span className="text-sm font-medium text-gray-700">Select Classes</span>
                        {selectedClasses.length > 0 && (
                          <button
                            onClick={clearClassSelections}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        {data?.classStats.map((classStat) => (
                          <label
                            key={classStat.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedClasses.includes(String(classStat.id))}
                              onChange={() => toggleClassSelection(String(classStat.id))}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{classStat.class_name}</div>
                              <div className="text-xs text-gray-500">
                                {classStat.total_students} students • $
                                {Number(classStat.total_collected || 0).toFixed(2)} collected
                              </div>
                            </div>
                            <div className="text-xs font-medium text-blue-600">
                              {classStat.paid_count}/{classStat.total_students}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={selectedClasses.length > 0}
                >
                  <option value="all">{selectedClasses.length > 0 ? "All Groups" : "All Groups in Class"}</option>
                  {groups
                    .filter((group) => selectedClasses.length === 0 || selectedClasses.includes(String(group.class_id)))
                    .map((group) => (
                      <option key={group.id} value={String(group.id)}>
                        {group.name}
                      </option>
                    ))}
                </select>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showDuplicatesOnly}
                    onChange={(e) => setShowDuplicatesOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Duplicates Only</span>
                </label>

                {(selectedClasses.length > 0 ||
                  selectedGroup !== "all" ||
                  paymentStatus !== "all" ||
                  showDuplicatesOnly) && (
                  <button
                    onClick={() => {
                      clearClassSelections()
                      setSelectedGroup("all")
                      setPaymentStatus("all")
                      setShowDuplicatesOnly(false)
                    }}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {(selectedClasses.length > 0 || selectedGroup !== "all") && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedClasses.length > 0
                      ? `Selected ${selectedClasses.length} Class${selectedClasses.length > 1 ? "es" : ""}`
                      : selectedGroup !== "all"
                        ? `Group: ${groups.find((g) => String(g.id) === selectedGroup)?.name || ""}`
                        : "Filtered Results"}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Income</div>
                    <div className="text-2xl font-bold text-green-600">${filteredTotalIncome.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Paid Students</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredPayments.filter((p) => p.amount_paid > 0).length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Unpaid Students</div>
                    <div className="text-2xl font-bold text-red-600">
                      {filteredPayments.filter((p) => p.amount_paid <= 0).length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {paymentStatus !== "unpaid" && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">
                      {paymentStatus === "paid" ? "Lacag La Bixiyay" : "Total Income"}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">${filteredTotalIncome.toFixed(2)}</div>
                    <p className="text-xs text-green-600">
                      {paymentStatus === "paid"
                        ? `${totalPaidStudents} students paid`
                        : selectedClasses.length > 0
                          ? "From selected classes"
                          : selectedGroup !== "all"
                            ? "From selected group"
                            : "From all payments"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {paymentStatus !== "paid" && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-red-700">
                      {paymentStatus === "unpaid" ? "Lacag Aan Bixin" : "Expected Unpaid"}
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-900">${expectedUnpaidAmount.toFixed(2)}</div>
                    <p className="text-xs text-red-600">{totalUnpaidStudents} students haven't paid yet</p>
                  </CardContent>
                </Card>
              )}

              {paymentStatus === "all" && (
                <>
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-orange-700">Total Expenses</CardTitle>
                      <TrendingDown className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-900">${filteredTotalExpenses.toFixed(2)}</div>
                      <p className="text-xs text-orange-600">
                        {selectedClasses.length > 0 || selectedGroup !== "all"
                          ? "From selected filter"
                          : "All expenses"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle>Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold ${filteredNetBalance >= 0 ? "text-blue-900" : "text-red-900"}`}
                      >
                        ${filteredNetBalance.toFixed(2)}
                      </div>
                      <p className="text-xs text-blue-600">Income minus expenses</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {showDuplicatesOnly && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-700">Duplicate Payments</CardTitle>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-900">{duplicateCount}</div>
                    <p className="text-xs text-yellow-600">Payments that appear more than once</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {paymentStatus === "unpaid" && (
              <Card className="bg-white border border-gray-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Ardayda Aan Lacagta Bixin ({filteredUnpaidStudents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredUnpaidStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p>Dhammaan ardaydu waa bixiyeen lacagta!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Student ID</TableHead>
                            <TableHead className="font-semibold">Magaca Ardayga</TableHead>
                            <TableHead className="font-semibold">Fasalka</TableHead>
                            <TableHead className="font-semibold">Kooxda</TableHead>
                            <TableHead className="font-semibold text-right">Lacagta La Rabo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUnpaidStudents.map((student, index) => (
                            <TableRow
                              key={`${student.student_id}-${student.group_id}-${index}`}
                              className="hover:bg-red-50"
                            >
                              <TableCell className="font-mono text-sm">{student.student_id}</TableCell>
                              <TableCell className="font-medium">{student.student_name || "N/A"}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {student.class_name}
                                </Badge>
                              </TableCell>
                              <TableCell>{student.group_name}</TableCell>
                              <TableCell className="text-right font-semibold text-red-600">
                                ${Number(student.amount_due || 0).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Unpaid Summary */}
                  {filteredUnpaidStudents.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-red-700">
                          Wadarta Lacagta Aan La Bixin ({filteredUnpaidStudents.length} arday)
                        </span>
                        <span className="text-xl font-bold text-red-600">
                          ${filteredUnpaidStudents.reduce((sum, s) => sum + Number(s.amount_due || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payments Received - only show when not "unpaid" filter */}
            {paymentStatus !== "unpaid" && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Payments Received ({filteredPayments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left text-sm text-gray-600">
                          <th className="pb-3 font-medium">Student</th>
                          <th className="pb-3 font-medium">Group</th>
                          <th className="pb-3 font-medium">Amount</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Method</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredPayments.map((payment) => (
                          <tr key={payment.id} className="text-sm hover:bg-gray-50">
                            <td className="py-3">{payment.student_name || payment.student_id}</td>
                            <td className="py-3">{payment.group_name}</td>
                            <td className="py-3 font-medium text-green-600">
                              ${Number.parseFloat(payment.amount_paid).toFixed(2)}
                            </td>
                            <td className="py-3 text-gray-600">{formatDate(payment.payment_date)}</td>
                            <td className="py-3">{payment.payment_method}</td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => openEditModal(payment)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setDeletingPayment(payment)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* General Expenses Table - Only show when "All Groups" selected */}
            {selectedGroup === "all" && selectedClasses.length === 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>General Expenses ({data?.generalExpenses.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left text-sm text-gray-600">
                          <th className="pb-3 font-medium">Description</th>
                          <th className="pb-3 font-medium">Category</th>
                          <th className="pb-3 font-medium">Amount</th>
                          <th className="pb-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {data?.generalExpenses.map((expense) => (
                          <tr key={expense.id} className="text-sm">
                            <td className="py-3">{expense.description}</td>
                            <td className="py-3">{expense.category || "-"}</td>
                            <td className="py-3 font-medium text-red-600">
                              ${Number.parseFloat(expense.amount).toFixed(2)}
                            </td>
                            <td className="py-3 text-gray-600">{formatDate(expense.expense_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Group Expenses Table */}
            <Card>
              <CardHeader>
                <CardTitle>Group-Specific Expenses ({filteredGroupExpenses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium">Group</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredGroupExpenses.map((expense) => (
                        <tr key={expense.id} className="text-sm">
                          <td className="py-3">{expense.description}</td>
                          <td className="py-3">{expense.group_name}</td>
                          <td className="py-3 font-medium text-orange-600">
                            ${Number.parseFloat(expense.amount).toFixed(2)}
                          </td>
                          <td className="py-3 text-gray-600">{formatDate(expense.expense_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Edit Payment Modal */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Payment</DialogTitle>
            <DialogDescription>
              Update payment details for {editingPayment?.student_name || editingPayment?.student_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                Student:{" "}
                <span className="font-medium text-gray-900">
                  {editingPayment?.student_name || editingPayment?.student_id}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Group: <span className="font-medium text-gray-900">{editingPayment?.group_name}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-700">
                Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={editForm.amount_paid}
                onChange={(e) => setEditForm({ ...editForm, amount_paid: e.target.value })}
                className="bg-white text-gray-900 border-gray-300"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method" className="text-gray-700">
                Payment Method
              </Label>
              <Select
                value={editForm.payment_method}
                onValueChange={(value) => setEditForm({ ...editForm, payment_method: value })}
              >
                <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Cash" className="text-gray-900">
                    Cash
                  </SelectItem>
                  <SelectItem value="Bank Transfer" className="text-gray-900">
                    Bank Transfer
                  </SelectItem>
                  <SelectItem value="Mobile Money" className="text-gray-900">
                    Mobile Money
                  </SelectItem>
                  <SelectItem value="EVC Plus" className="text-gray-900">
                    EVC Plus
                  </SelectItem>
                  <SelectItem value="Zaad" className="text-gray-900">
                    Zaad
                  </SelectItem>
                  <SelectItem value="Other" className="text-gray-900">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700">
                Notes (Optional)
              </Label>
              <Input
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="bg-white text-gray-900 border-gray-300"
                placeholder="Add any notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPayment(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleEditPayment}
              disabled={actionLoading || !editForm.amount_paid}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingPayment} onOpenChange={(open) => !open && setDeletingPayment(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Payment
            </DialogTitle>
            <DialogDescription>Ma hubtaa inaad tirtirto payment-kan? Tani lama noqon karto.</DialogDescription>
          </DialogHeader>

          {deletingPayment && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg my-4">
              <p className="text-sm text-gray-700">
                <strong>Student:</strong> {deletingPayment.student_name || deletingPayment.student_id}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Group:</strong> {deletingPayment.group_name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Amount:</strong>{" "}
                <span className="text-green-600 font-medium">
                  ${Number.parseFloat(deletingPayment.amount_paid).toFixed(2)}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                <strong>Date:</strong> {formatDate(deletingPayment.payment_date)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPayment(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePayment}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
