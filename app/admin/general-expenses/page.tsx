"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Plus, Trash2, Loader2, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GeneralExpense {
  id: number
  description: string
  amount: number
  category: string | null
  expense_date: string
  recorded_by: string | null
  notes: string | null
}

export default function GeneralExpensesPage() {
  const [expenses, setExpenses] = useState<GeneralExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<GeneralExpense | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/general-expenses")
      const data = await res.json()
      setExpenses(data.expenses || [])
    } catch (error) {
      console.error("[v0] Error fetching expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = "/api/general-expenses"
      const method = editingExpense ? "PUT" : "POST"
      const body = editingExpense
        ? {
            id: editingExpense.id,
            description: formData.description,
            amount: Number.parseFloat(formData.amount),
            category: formData.category,
            notes: formData.notes,
          }
        : {
            description: formData.description,
            amount: Number.parseFloat(formData.amount),
            category: formData.category,
            recorded_by: "Admin",
            notes: formData.notes,
          }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingExpense(null)
        setFormData({ description: "", amount: "", category: "", notes: "" })
        fetchExpenses()
      }
    } catch (error) {
      console.error("[v0] Error saving expense:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (expense: GeneralExpense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category || "",
      notes: expense.notes || "",
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingExpense(null)
    setFormData({ description: "", amount: "", category: "", notes: "" })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      await fetch(`/api/general-expenses?id=${id}`, { method: "DELETE" })
      fetchExpenses()
    } catch (error) {
      console.error("[v0] Error deleting expense:", error)
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number.parseFloat(e.amount.toString()), 0)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">General Expenses</h1>
            <p className="mt-1 text-gray-600">Track overall expenses like defense ceremony, hall rental, etc.</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Summary */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total General Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">${totalExpenses.toFixed(2)}</div>
            <p className="text-sm text-red-600">{expenses.length} expense(s) recorded</p>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Expense List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="p-3 font-medium">Description</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No expenses recorded yet
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="text-sm hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{expense.description}</div>
                          {expense.notes && <div className="text-xs text-gray-500">{expense.notes}</div>}
                        </td>
                        <td className="p-3">{expense.category || "-"}</td>
                        <td className="p-3 font-medium text-red-600">
                          ${Number.parseFloat(expense.amount.toString()).toFixed(2)}
                        </td>
                        <td className="p-3 text-gray-600">{new Date(expense.expense_date).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(expense)}
                              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Expense Modal */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit General Expense" : "Add General Expense"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Defense Ceremony Hall Rental"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Event, Equipment, Transportation"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleCloseForm} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingExpense ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{editingExpense ? "Update Expense" : "Add Expense"}</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
