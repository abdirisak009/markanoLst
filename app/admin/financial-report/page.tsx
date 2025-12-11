"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Wallet, Download, Loader2, Filter } from "lucide-react"

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
}

export default function FinancialReportPage() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [groups, setGroups] = useState<any[]>([])

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

  const filteredPayments =
    selectedGroup === "all"
      ? data?.payments || []
      : data?.payments.filter((p) => String(p.group_id) === selectedGroup) || []

  const filteredGroupExpenses =
    selectedGroup === "all"
      ? data?.groupExpenses || []
      : data?.groupExpenses.filter((e) => String(e.group_id) === selectedGroup) || []

  const filteredTotalIncome = filteredPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount_paid), 0)
  const totalGroupExpenses = filteredGroupExpenses.reduce((sum, e) => sum + Number.parseFloat(e.amount), 0)
  const filteredGeneralExpenses = selectedGroup === "all" ? data?.summary.totalGeneralExpenses || 0 : 0
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
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Groups</option>
                {groups.map((group) => (
                  <option key={group.id} value={String(group.id)}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
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

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">${filteredTotalIncome.toFixed(2)}</div>
              <p className="text-xs text-green-600">From payments</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Group Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">${totalGroupExpenses.toFixed(2)}</div>
              <p className="text-xs text-orange-600">Project-specific costs</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-700">General Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">${filteredGeneralExpenses.toFixed(2)}</div>
              <p className="text-xs text-red-600">
                {selectedGroup === "all" ? "Defense ceremony, etc." : "Not included in group filter"}
              </p>
            </CardContent>
          </Card>

          <Card
            className={`border-2 ${filteredNetBalance >= 0 ? "border-blue-300 bg-blue-50" : "border-red-300 bg-red-50"}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle
                className={`text-sm font-medium ${filteredNetBalance >= 0 ? "text-blue-700" : "text-red-700"}`}
              >
                Net Balance
              </CardTitle>
              <Wallet className={`h-4 w-4 ${filteredNetBalance >= 0 ? "text-blue-600" : "text-red-600"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${filteredNetBalance >= 0 ? "text-blue-900" : "text-red-900"}`}>
                ${filteredNetBalance.toFixed(2)}
              </div>
              <p className={`text-xs ${filteredNetBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {filteredNetBalance >= 0 ? "Surplus" : "Deficit"}
              </p>
            </CardContent>
          </Card>
        </div>

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
        {selectedGroup === "all" && (
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
                        <td className="py-3 text-gray-600">{new Date(expense.expense_date).toLocaleDateString()}</td>
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
