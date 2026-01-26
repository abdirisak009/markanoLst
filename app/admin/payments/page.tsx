"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, DollarSign, Users, Search, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Group {
  id: number
  name: string
  class_name: string
  university_name: string
  cost_per_member: number
  capacity: number
  member_count: number
  class_id: number // Added class_id for fetching all students
}

interface Payment {
  student_id: string
  student_name: string
  amount_paid: number
  paid_at: string
  payment_method: string
}

interface Member {
  student_id: string
  full_name: string
  gender: string
}

interface Student {
  student_id: string
  full_name: string
  gender: string
}

export default function PaymentManagementPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "EVC Plus",
    notes: "",
  })
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [showBatchModal, setShowBatchModal] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(
        filteredMembers.filter((m) => !payments.find((p) => p.student_id === m.student_id)).map((m) => m.student_id),
      )
    } else {
      setSelectedStudents([])
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupDetails(selectedGroupId)
    }
  }, [selectedGroupId])

  const fetchGroups = async () => {
    try {
      console.log("[v0] Fetching groups...")
      const res = await fetch("/api/groups")

      if (!res.ok) {
        console.error("[v0] Groups API returned error:", res.status)
        setGroups([]) // Set empty array on error
        return
      }

      const data = await res.json()
      console.log("[v0] Groups fetched:", data)

      if (Array.isArray(data)) {
        setGroups(data)
      } else {
        console.error("[v0] Groups data is not an array:", data)
        setGroups([])
      }
    } catch (error) {
      console.error("[v0] Error fetching groups:", error)
      setGroups([]) // Set empty array on error
    }
  }

  const fetchGroupDetails = async (groupId: string) => {
    setLoading(true)
    try {
      console.log("[v0] Fetching group details for:", groupId)

      // Fetch group info
      const groupRes = await fetch(`/api/groups/${groupId}`)
      const groupData = await groupRes.json()
      console.log("[v0] Group data:", groupData)
      setSelectedGroup(groupData)

      // Fetch payments
      const paymentsRes = await fetch(`/api/groups/${groupId}/payments`)
      const paymentsData = await paymentsRes.json()
      console.log("[v0] Payments data:", paymentsData)
      setPayments(paymentsData)

      const membersRes = await fetch(`/api/groups/${groupId}/members`)
      const membersData = await membersRes.json()
      console.log("[v0] Members data:", membersData)
      setMembers(membersData)
    } catch (error) {
      console.error("[v0] Error fetching group details:", error)
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedStudent || !selectedGroupId) return

    console.log("[v0] Recording payment for:", selectedStudent.student_id)
    console.log("[v0] Payment details:", paymentForm)

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          amount_paid: Number(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          notes: paymentForm.notes,
        }),
      })

      console.log("[v0] Payment response status:", res.status)

      if (res.ok) {
        console.log("[v0] Payment recorded successfully")
        setShowPaymentModal(false)
        setPaymentForm({ amount: "", payment_method: "EVC Plus", notes: "" })
        setSelectedStudent(null)
        toast({
          title: "Success",
          description: "Payment recorded successfully!",
          variant: "default",
        })
        fetchGroupDetails(selectedGroupId)
      } else {
        const errorData = await res.json()
        console.error("[v0] Payment failed:", errorData)
        toast({
          title: "Error",
          description: "Failed to record payment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error recording payment:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsUnpaid = async (studentId: string) => {
    if (!confirm("Are you sure you want to mark this student as unpaid?")) return

    console.log("[v0] Marking student as unpaid:", studentId)

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/payments/${studentId}`, {
        method: "DELETE",
      })

      console.log("[v0] Mark unpaid response status:", res.status)

      if (res.ok) {
        console.log("[v0] Student marked as unpaid successfully")
        toast({
          title: "Success",
          description: "Student marked as unpaid successfully!",
          variant: "default",
        })
        fetchGroupDetails(selectedGroupId)
      } else {
        const errorData = await res.json()
        console.error("[v0] Mark unpaid failed:", errorData)
        toast({
          title: "Error",
          description: "Failed to mark as unpaid. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error marking as unpaid:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection.",
        variant: "destructive",
      })
    }
  }

  const handleQuickPayment = async (member: Member) => {
    if (!selectedGroupId || !selectedGroup) return

    const confirmed = confirm(`Record payment of $${selectedGroup.cost_per_member} for ${member.full_name}?`)
    if (!confirmed) return

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: member.student_id,
          amount_paid: Number(selectedGroup.cost_per_member),
          payment_method: "EVC Plus",
          notes: "Quick payment",
        }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Payment recorded successfully!",
          variant: "default",
        })
        fetchGroupDetails(selectedGroupId)
      } else {
        toast({
          title: "Error",
          description: "Failed to record payment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error.",
        variant: "destructive",
      })
    }
  }

  const handleBatchPayment = async () => {
    if (!selectedGroupId || !selectedGroup || selectedStudents.length === 0) return

    try {
      const promises = selectedStudents.map((studentId) =>
        fetch(`/api/groups/${selectedGroupId}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentId,
            amount_paid: Number(selectedGroup.cost_per_member),
            payment_method: "EVC Plus",
            notes: "Batch payment",
          }),
        }),
      )

      await Promise.all(promises)
      toast({
        title: "Success",
        description: `${selectedStudents.length} payments recorded!`,
        variant: "default",
      })
      setSelectedStudents([])
      setShowBatchModal(false)
      fetchGroupDetails(selectedGroupId)
    } catch (error) {
      toast({
        title: "Error",
        description: "Some payments failed.",
        variant: "destructive",
      })
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const openPaymentModal = (member: Member) => {
    setSelectedStudent(member)
    setPaymentForm({
      amount: selectedGroup?.cost_per_member?.toString() || "",
      payment_method: "EVC Plus",
      notes: "",
    })
    setShowPaymentModal(true)
  }

  const paidCount = members.filter((member) =>
    payments.some((p) => p.student_id === member.student_id && Number(p.amount_paid) > 0),
  ).length
  const unpaidCount = members.length - paidCount
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)

  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (member.full_name?.toLowerCase() || "").includes(searchLower) ||
      (member.student_id?.toString() || "").includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="mt-2 text-gray-600">Select a group to view and manage student payments</p>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <Label htmlFor="group-select" className="text-lg font-semibold">
            Select Group
          </Label>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger id="group-select" className="mt-2">
              <SelectValue placeholder="Choose a group..." />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(groups) && groups.length > 0 ? (
                groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{group.name}</span>
                      <span className="text-sm text-gray-500">
                        {group.class_name} - {group.university_name}
                      </span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-groups" disabled>
                  No groups available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedGroup && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unpaid</p>
                    <p className="text-2xl font-bold text-gray-900">{unpaidCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Collected</p>
                    <p className="text-2xl font-bold text-gray-900">${totalCollected.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Students & Payments</h2>
                  <p className="text-sm text-gray-600">
                    Cost per member: ${Number(selectedGroup.cost_per_member).toFixed(2)}
                  </p>
                </div>

                {selectedStudents.length > 0 && (
                  <Button onClick={handleBatchPayment} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Record Payment for {selectedStudents.length} Students
                  </Button>
                )}
              </div>

              <div className="mb-4 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                        <Checkbox
                          checked={
                            selectedStudents.length ===
                            filteredMembers.filter(
                              (m) => !payments.find((p) => p.student_id === m.student_id && Number(p.amount_paid) > 0),
                            ).length
                          }
                          onCheckedChange={(checked) => handleSelectAll(checked === true)}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Payment Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMembers.map((member, index) => {
                      const payment = payments.find((p) => p.student_id === member.student_id)
                      const isPaid = !!payment && Number(payment.amount_paid) > 0

                      return (
                        <tr key={member.student_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {!isPaid && (
                              <Checkbox
                                checked={selectedStudents.includes(member.student_id)}
                                onCheckedChange={() => toggleStudentSelection(member.student_id)}
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.full_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{member.student_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <Badge variant={member.gender === "Male" ? "default" : "secondary"}>{member.gender}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            {isPaid ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-red-100 text-red-800">
                                <XCircle className="mr-1 h-3 w-3" /> Unpaid
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {isPaid ? `$${Number(payment.amount_paid).toFixed(2)}` : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {isPaid ? new Date(payment.paid_at).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4">
                            {isPaid ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsUnpaid(member.student_id)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                Mark as Unpaid
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleQuickPayment(member)}
                                className="gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <Zap className="h-3 w-3" />
                                Record Payment
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {filteredMembers.length === 0 && (
                  <div className="py-12 text-center text-gray-500">
                    <Users className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                    <p>No students found</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600">Loading group details...</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Payment Confirmation</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Record payment of <span className="font-bold">${selectedGroup?.cost_per_member}</span> for{" "}
            <span className="font-bold">{selectedStudents.length}</span> students?
          </DialogDescription>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBatchModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleBatchPayment}>Confirm All Payments</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Custom Payment</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Student</p>
                <p className="font-medium">{selectedStudent.full_name}</p>
                <p className="text-sm text-gray-500">ID: {selectedStudent.student_id}</p>
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={paymentForm.payment_method}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
                >
                  <SelectTrigger id="method" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EVC Plus">EVC Plus</SelectItem>
                    <SelectItem value="eDahab">eDahab</SelectItem>
                    <SelectItem value="Sahal">Sahal</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="mt-1"
                />
              </div>

              <DialogFooter>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRecordPayment}>Confirm Payment</Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
