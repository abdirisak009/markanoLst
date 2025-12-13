"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Calculator,
  AlertCircle,
} from "lucide-react"

interface FinancialData {
  summary: {
    totalIncome: number
    totalGroupExpenses: number
    totalGeneralExpenses: number
    totalExpenses: number
    netBalance: number
  }
  payments: any[]
  groupExpenses: any[]
  generalExpenses: any[]
  classStats: Array<{
    id: number
    class_name: string
    total_students: number
    paid_students: number
    unpaid_students: number
    total_collected: string
  }>
  groupStats: Array<{
    id: number
    group_name: string
    class_name: string
    cost_per_member: string
    total_members: number
    paid_members: number
    unpaid_members: number
    total_collected: string
    expected_total: string
  }>
}

export default function FinancialReportPage() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [paymentStatus, setPaymentStatus] = useState<"all" | "paid" | "unpaid">("all")
  const [groups, setGroups] = useState<any[]>([])
  const [activeView, setActiveView] = useState<"summary" | "classes" | "groups">("summary")

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

  const filteredPayments = (() => {
    let payments = data?.payments || []

    // Filter by class
    if (selectedClass !== "all") {
      payments = payments.filter((p) => {
        const group = groups.find((g) => g.id === p.group_id)
        return group && String(group.class_id) === selectedClass
      })
    }

    // Filter by group
    if (selectedGroup !== "all") {
      payments = payments.filter((p) => String(p.group_id) === selectedGroup)
    }

    return payments
  })()

  const allGroupMembers = (() => {
    if (!data?.groupStats) return []

    const members: any[] = []

    // Filter groups by class if selected
    const relevantGroups = data.groupStats.filter((group) => {
      if (selectedClass !== "all") {
        const fullGroup = groups.find((g) => String(g.id) === String(group.id))
        return fullGroup && String(fullGroup.class_id) === selectedClass
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
    selectedClass === "all"
      ? selectedGroup === "all"
        ? data?.groupExpenses || []
        : data?.groupExpenses.filter((e) => String(e.group_id) === selectedGroup) || []
      : selectedGroup === "all"
        ? data?.groupExpenses.filter((e) => {
            const group = groups.find((g) => g.id === e.group_id)
            return group && String(group.class_id) === selectedClass
          }) || []
        : data?.groupExpenses.filter((e) => String(e.group_id) === selectedGroup) || []

  console.log("[v0] Filtered payments count:", filteredPayments.length)
  console.log(
    "[v0] Payment amounts:",
    filteredPayments.map((p) => p.amount_paid),
  )

  const totalGroupExpenses = filteredGroupExpenses.reduce((sum, e) => sum + Number.parseFloat(e.amount), 0)
  const filteredGeneralExpenses =
    selectedGroup === "all" && selectedClass === "all" ? data?.summary.totalGeneralExpenses || 0 : 0
  const filteredTotalExpenses = totalGroupExpenses + filteredGeneralExpenses
  const filteredNetBalance = filteredTotalIncome - filteredTotalExpenses

  console.log("[v0] Filtered total income:", filteredTotalIncome)
  console.log("[v0] Total group expenses:", totalGroupExpenses)
  console.log("[v0] Net balance:", filteredNetBalance)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) return <div>Error loading report</div>

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
                          <tr key={group.id} className="text-sm">
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

                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setSelectedGroup("all")
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Classes</option>
                  {data?.classStats.map((classStat) => (
                    <option key={classStat.id} value={String(classStat.id)}>
                      {classStat.class_name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={selectedClass !== "all"}
                >
                  <option value="all">{selectedClass === "all" ? "All Groups" : "All Groups in Class"}</option>
                  {groups
                    .filter((group) => selectedClass === "all" || String(group.class_id) === selectedClass)
                    .map((group) => (
                      <option key={group.id} value={String(group.id)}>
                        {group.name}
                      </option>
                    ))}
                </select>

                {(selectedClass !== "all" || selectedGroup !== "all" || paymentStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSelectedClass("all")
                      setSelectedGroup("all")
                      setPaymentStatus("all")
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

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
                        : selectedClass !== "all"
                          ? "From selected class"
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
                        {selectedClass !== "all" || selectedGroup !== "all" ? "From selected filter" : "All expenses"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700">Net Balance</CardTitle>
                      <DollarSign className="h-4 w-4 text-blue-600" />
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
            </div>

            {/* Added filtered totals summary at bottom when filters are active */}
            {(selectedClass !== "all" || selectedGroup !== "all") && (
              <div className="mt-8 mb-4">
                <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calculator className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedClass !== "all"
                              ? `${data?.classStats.find((c) => String(c.id) === selectedClass)?.class_name} Total`
                              : `${groups.find((g) => String(g.id) === selectedGroup)?.name} Total`}
                          </h3>
                          <p className="text-sm text-gray-600">Based on current filter selection</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-900">${filteredTotalIncome.toFixed(2)}</div>
                        <p className="text-sm text-blue-600 mt-1">Income from {filteredPayments.length} payment(s)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payments Table */}
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
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="text-sm">
                          <td className="py-3">{payment.student_name || payment.student_id}</td>
                          <td className="py-3">{payment.group_name}</td>
                          <td className="py-3 font-medium text-green-600">
                            ${Number.parseFloat(payment.amount_paid).toFixed(2)}
                          </td>
                          <td className="py-3 text-gray-600">{new Date(payment.paid_at).toLocaleDateString()}</td>
                          <td className="py-3">{payment.payment_method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* General Expenses Table - Only show when "All Groups" selected */}
            {selectedGroup === "all" && selectedClass === "all" && (
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
                            <td className="py-3 text-gray-600">
                              {new Date(expense.expense_date).toLocaleDateString()}
                            </td>
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
                          <td className="py-3 text-gray-600">{new Date(expense.expense_date).toLocaleDateString()}</td>
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

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          button,
          nav,
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
