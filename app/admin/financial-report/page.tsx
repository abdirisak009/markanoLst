"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  Wallet,
  Download,
  Loader2,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  ChevronDown,
  X,
  FileSpreadsheet,
} from "lucide-react"

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
  paid_at?: string // Added for Excel export
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
  full_name?: string // Added for Excel export
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

  const exportToExcel = () => {
    // Determine what data to export based on payment status
    let csvContent = ""

    if (paymentStatus === "unpaid") {
      // Export unpaid students
      csvContent = "Student ID,Magaca Ardayga,Fasalka,Kooxda,Lacagta La Rabo\n"
      filteredUnpaidStudents.forEach((student) => {
        csvContent += `"${student.student_id}","${student.full_name || "N/A"}","${student.class_name || "N/A"}","${student.group_name || "N/A"}","$${Number(student.amount_due || 0).toFixed(2)}"\n`
      })
    } else {
      // Export payments (paid or all)
      csvContent = "Student ID,Magaca Ardayga,Kooxda,Lacagta,Habka Lacag Bixinta,Taariikhda\n"
      filteredPayments.forEach((payment) => {
        const paymentDate = formatDate(payment.paid_at || payment.payment_date)
        csvContent += `"${payment.student_id}","${payment.student_name || "N/A"}","${payment.group_name || "N/A"}","$${Number(payment.amount_paid).toFixed(2)}","${payment.payment_method || "N/A"}","${paymentDate}"\n`
      })
    }

    // Create and download the file
    const BOM = "\uFEFF" // UTF-8 BOM for proper encoding
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    const fileName =
      paymentStatus === "unpaid"
        ? `ardayda-aan-bixin-${new Date().toISOString().split("T")[0]}.csv`
        : `lacag-bixinnada-${new Date().toISOString().split("T")[0]}.csv`

    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
    const duplicateIds = new Set<number>()

    if (!data?.payments) return { duplicatePaymentIds: duplicateIds, duplicateCount: 0 }

    data.payments.forEach((payment) => {
      // Get unique payment ID with fallback
      const paymentId = payment.id || payment.payment_id || 0
      if (!paymentId) return // Skip if no valid ID

      const dateKey = formatDateKey(payment.paid_at || payment.payment_date || payment.created_at)
      // Create key based on student_id, amount, and date (same day = duplicate)
      const key = `${payment.student_id}-${Number(payment.amount_paid).toFixed(2)}-${dateKey}`

      if (!paymentsByKey.has(key)) {
        paymentsByKey.set(key, [payment])
      } else {
        const existingPayments = paymentsByKey.get(key)!
        existingPayments.push(payment)
        // Mark ALL payments with this key as duplicates (including the first one)
        existingPayments.forEach((p) => {
          const pId = p.id || p.payment_id || 0
          if (pId) duplicateIds.add(pId)
        })
      }
    })

    return { duplicatePaymentIds: duplicateIds, duplicateCount: duplicateIds.size }
  }, [data])

  const filteredPayments = useMemo(() => {
    if (!data || !data.payments) return []

    return (data.payments || []).filter((payment) => {
      const paymentId = payment.id || payment.payment_id || 0

      // Duplicate filter
      if (showDuplicatesOnly && !duplicatePaymentIds.has(paymentId)) return false

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
        : (data?.groupExpenses || []).filter((e) => String(e.group_id) === selectedGroup)
      : selectedGroup === "all"
        ? (data?.groupExpenses || []).filter((e) => {
            const group = groups.find((g) => g.id === e.group_id)
            return group && selectedClasses.includes(String(group.class_id))
          })
        : (data?.groupExpenses || []).filter((e) => String(e.group_id) === selectedGroup)

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
        {/* Header - Translated to Somali */}
        <div className="mb-8 flex items-center justify-between print:mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">Warbixinta Maaliyadda</h1>
            <p className="mt-1 text-gray-600">Dhammaystiran oo dhan oo ku saabsan dakhliga iyo kharashka</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel Soo Dag
            </Button>
            <Button onClick={exportToPDF} disabled={exporting}>
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Waa la soo dejinayaa...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  PDF Soo Dag
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 print:hidden">
          <Button variant={activeView === "summary" ? "default" : "outline"} onClick={() => setActiveView("summary")}>
            <Wallet className="mr-2 h-4 w-4" />
            Kooban
          </Button>
          <Button variant={activeView === "classes" ? "default" : "outline"} onClick={() => setActiveView("classes")}>
            <Users className="mr-2 h-4 w-4" />
            Fasallada
          </Button>
          <Button variant={activeView === "groups" ? "default" : "outline"} onClick={() => setActiveView("groups")}>
            <Users className="mr-2 h-4 w-4" />
            Kooxaha
          </Button>
        </div>

        {activeView === "classes" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Xogta Lacag Bixinta Fasallada</CardTitle>
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
                            <p className="text-sm text-gray-600">Wadarta Ardayda</p>
                            <p className="text-xl font-semibold">{classStat.total_students}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">La Bixiyay</p>
                            <p className="text-xl font-semibold text-green-600">{classStat.paid_students}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-sm text-gray-600">Aan Bixin</p>
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
                            ? `${((classStat.paid_students / classStat.total_students) * 100).toFixed(1)}% waa bixiyay`
                            : "Arday ma jiro"}
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
                <CardTitle>Xogta Lacag Bixinta Kooxaha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="pb-3 font-medium">Magaca Kooxda</th>
                        <th className="pb-3 font-medium">Fasalka</th>
                        <th className="pb-3 font-medium text-center">Wadarta Xubnaha</th>
                        <th className="pb-3 font-medium text-center">Bixiyay</th>
                        <th className="pb-3 font-medium text-center">Aan Bixin</th>
                        <th className="pb-3 font-medium text-right">La Ururiyay</th>
                        <th className="pb-3 font-medium text-right">La Filayo</th>
                        <th className="pb-3 font-medium text-center">Xaaladda</th>
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
            <div className="mb-6 print:hidden">
              <div className="flex flex-wrap items-center gap-4">
                <Filter className="h-4 w-4 text-gray-500" />

                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as "all" | "paid" | "unpaid")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Dhammaan Ardayda</option>
                  <option value="paid">Lacag Bixiyay</option>
                  <option value="unpaid">Aan Bixin</option>
                </select>

                <div className="relative">
                  <button
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center gap-2 min-w-[200px] justify-between"
                  >
                    <span className="text-sm">
                      {selectedClasses.length === 0
                        ? "Dhammaan Fasallada"
                        : `${selectedClasses.length} Fasal${selectedClasses.length > 1 ? "al" : ""} La Doortay`}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showClassDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {showClassDropdown && (
                    <div className="absolute z-10 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                        <span className="text-sm font-medium text-gray-700">Dooro Fasallada</span>
                        {selectedClasses.length > 0 && (
                          <button
                            onClick={clearClassSelections}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Nadiifi Dhamaan
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
                  <option value="all">{selectedClasses.length > 0 ? "Dhammaan Kooxaha" : "Dhammaan Kooxaha"}</option>
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
                  <span className="text-sm font-medium text-gray-700">Tus Kuwa Labanlaab ah</span>
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
                    Nadiifi Filters
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
                      ? `${selectedClasses.length} Fasal${selectedClasses.length > 1 ? "al" : ""} La Doortay`
                      : selectedGroup !== "all"
                        ? `Kooxda: ${groups.find((g) => String(g.id) === selectedGroup)?.name || ""}`
                        : "Natiijada La Shaandheeyay"}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600">Wadarta Dakhliga</div>
                    <div className="text-2xl font-bold text-green-600">${filteredTotalIncome.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Arday Bixiyay</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredPayments.filter((p) => p.amount_paid > 0).length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Arday Aan Bixin</div>
                    <div className="text-2xl font-bold text-red-600">
                      {filteredPayments.filter((p) => p.amount_paid <= 0).length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{payment.student_name}</h3>
                    <span className="text-2xl font-bold text-green-600">${Number(payment.amount_paid).toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Fasalka</p>
                        <p className="text-xl font-semibold">{payment.group_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Habka Lacag Bixinta</p>
                        <p className="text-xl font-semibold text-green-600">{payment.payment_method}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
