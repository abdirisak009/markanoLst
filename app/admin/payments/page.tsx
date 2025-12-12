"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, XCircle, DollarSign, Users } from "lucide-react"

interface Group {
  id: number
  name: string
  class_name: string
  university_name: string
  cost_per_member: number
  capacity: number
  member_count: number
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

export default function PaymentManagementPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Member | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "EVC Plus",
    notes: "",
  })

  // Fetch all groups on mount
  useEffect(() => {
    fetchGroups()
  }, [])

  // Fetch group details when selection changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupDetails(selectedGroupId)
    }
  }, [selectedGroupId])

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups")
      const data = await res.json()
      setGroups(data)
    } catch (error) {
      console.error("Error fetching groups:", error)
    }
  }

  const fetchGroupDetails = async (groupId: string) => {
    setLoading(true)
    try {
      // Fetch group info
      const groupRes = await fetch(`/api/groups/${groupId}`)
      const groupData = await groupRes.json()
      setSelectedGroup(groupData)

      // Fetch payments
      const paymentsRes = await fetch(`/api/groups/${groupId}/payments`)
      const paymentsData = await paymentsRes.json()
      setPayments(paymentsData)

      // Fetch members
      const membersRes = await fetch(`/api/groups/${groupId}/members`)
      const membersData = await membersRes.json()
      setMembers(membersData)
    } catch (error) {
      console.error("Error fetching group details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedStudent || !selectedGroupId) return

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

      if (res.ok) {
        setShowPaymentModal(false)
        setPaymentForm({ amount: "", payment_method: "EVC Plus", notes: "" })
        setSelectedStudent(null)
        fetchGroupDetails(selectedGroupId)
      }
    } catch (error) {
      console.error("Error recording payment:", error)
    }
  }

  const handleMarkAsUnpaid = async (studentId: string) => {
    if (!confirm("Are you sure you want to mark this student as unpaid?")) return

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/payments/${studentId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        fetchGroupDetails(selectedGroupId)
      }
    } catch (error) {
      console.error("Error marking as unpaid:", error)
    }
  }

  const openPaymentModal = (student: Member) => {
    setSelectedStudent(student)
    setPaymentForm({
      amount: selectedGroup?.cost_per_member?.toString() || "",
      payment_method: "EVC Plus",
      notes: "",
    })
    setShowPaymentModal(true)
  }

  // Calculate statistics
  const paidStudents = payments.filter((p) => p.amount_paid > 0)
  const unpaidMembers = members.filter((m) => !payments.find((p) => p.student_id === m.student_id))
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="mt-2 text-gray-600">Select a group to view and manage student payments</p>
        </div>

        {/* Group Selection */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <Label htmlFor="group-select" className="text-lg font-semibold">
            Select Group
          </Label>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger id="group-select" className="mt-2">
              <SelectValue placeholder="Choose a group..." />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{group.name}</span>
                    <span className="text-sm text-gray-500">
                      {group.class_name} - {group.university_name}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Group Details and Payment Tracking */}
        {selectedGroup && !loading && (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold">{paidStudents.length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-100 p-3">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unpaid</p>
                    <p className="text-2xl font-bold">{unpaidMembers.length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-3">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Collected</p>
                    <p className="text-2xl font-bold">${totalCollected.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold">{members.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b p-6">
                <h2 className="text-xl font-semibold">Students & Payments</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Cost per member: ${Number(selectedGroup.cost_per_member || 0).toFixed(2)}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gender</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((member, index) => {
                      const payment = payments.find((p) => p.student_id === member.student_id)
                      const isPaid = !!payment

                      return (
                        <tr key={member.student_id} className="hover:bg-gray-50">
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
                                className="text-red-600 hover:bg-red-50"
                              >
                                Mark as Unpaid
                              </Button>
                            ) : (
                              <Button size="sm" onClick={() => openPaymentModal(member)}>
                                Record Payment
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
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

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRecordPayment}>Confirm Payment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
