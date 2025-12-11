"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Wallet, Download, Loader2 } from "lucide-react"

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

  useEffect(() => {
    fetchReport()
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

  const exportToPDF = async () => {
    setExporting(true)
    try {
      // Using browser print for PDF export
      window.print()
    } catch (error) {
      console.error("[v0] Error exporting PDF:", error)
    } finally {
      setExporting(false)
    }
  }

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
          <Button onClick={exportToPDF} disabled={exporting} className="print:hidden">
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

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">${data.summary.totalIncome.toFixed(2)}</div>
              <p className="text-xs text-green-600">From all payments</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Group Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">${data.summary.totalGroupExpenses.toFixed(2)}</div>
              <p className="text-xs text-orange-600">Project-specific costs</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-700">General Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">${data.summary.totalGeneralExpenses.toFixed(2)}</div>
              <p className="text-xs text-red-600">Defense ceremony, etc.</p>
            </CardContent>
          </Card>

          <Card
            className={`border-2 ${data.summary.netBalance >= 0 ? "border-blue-300 bg-blue-50" : "border-red-300 bg-red-50"}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle
                className={`text-sm font-medium ${data.summary.netBalance >= 0 ? "text-blue-700" : "text-red-700"}`}
              >
                Net Balance
              </CardTitle>
              <Wallet className={`h-4 w-4 ${data.summary.netBalance >= 0 ? "text-blue-600" : "text-red-600"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.summary.netBalance >= 0 ? "text-blue-900" : "text-red-900"}`}>
                ${data.summary.netBalance.toFixed(2)}
              </div>
              <p className={`text-xs ${data.summary.netBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {data.summary.netBalance >= 0 ? "Surplus" : "Deficit"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payments Received ({data.payments.length})</CardTitle>
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
                  {data.payments.map((payment) => (
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

        {/* General Expenses Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>General Expenses ({data.generalExpenses.length})</CardTitle>
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
                  {data.generalExpenses.map((expense) => (
                    <tr key={expense.id} className="text-sm">
                      <td className="py-3">{expense.description}</td>
                      <td className="py-3">{expense.category || "-"}</td>
                      <td className="py-3 font-medium text-red-600">${Number.parseFloat(expense.amount).toFixed(2)}</td>
                      <td className="py-3 text-gray-600">{new Date(expense.expense_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Group Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Group-Specific Expenses ({data.groupExpenses.length})</CardTitle>
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
                  {data.groupExpenses.map((expense) => (
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
