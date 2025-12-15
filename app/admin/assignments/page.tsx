"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardList, Plus, TrendingUp } from "lucide-react"
import type { Assignment } from "@/lib/admin-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Class {
  id: number
  name: string
  type: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    maxMarks: "",
    dueDate: "",
    period: "Regular",
  })

  useEffect(() => {
    loadAssignments()
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      setClasses(data)
    } catch (error) {
      console.error("Failed to load classes:", error)
    }
  }

  const loadAssignments = async () => {
    try {
      const response = await fetch("/api/assignments")
      const data = await response.json()

      const assignmentsWithSubmissions = await Promise.all(
        data.map(async (assignment: any) => {
          const marksResponse = await fetch(`/api/student-marks?assignment_id=${assignment.id}`)
          const marks = await marksResponse.json()

          const submissions = marks.length
          const avgScore =
            submissions > 0
              ? (
                  (marks.reduce((acc: number, mark: any) => acc + mark.marks_obtained, 0) /
                    submissions /
                    assignment.max_marks) *
                  100
                ).toFixed(0)
              : 0

          return {
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            classId: assignment.class_id,
            className: assignment.class_name,
            maxMarks: assignment.max_marks,
            dueDate: assignment.due_date,
            period: assignment.period,
            submissions,
            avgScore: Number(avgScore),
            status: "active",
          }
        }),
      )

      setAssignments(assignmentsWithSubmissions)
    } catch (error) {
      console.error("[v0] Failed to load assignments:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          class_id: Number(formData.classId),
          max_marks: Number(formData.maxMarks),
          due_date: formData.dueDate,
          period: formData.period,
        }),
      })

      if (response.ok) {
        setShowDialog(false)
        setFormData({ title: "", description: "", classId: "", maxMarks: "", dueDate: "", period: "Regular" })
        loadAssignments()
      }
    } catch (error) {
      console.error("[v0] Failed to create assignment:", error)
    }
  }

  const totalAssignments = assignments.length
  const avgCompletion =
    assignments.length > 0
      ? (assignments.reduce((acc, a) => acc + (a.submissions / 100) * 100, 0) / assignments.length).toFixed(1)
      : "0.0"
  const avgScore =
    assignments.length > 0
      ? (assignments.reduce((acc, a) => acc + a.avgScore, 0) / assignments.length).toFixed(1)
      : "0.0"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Assignments Management</h1>
            <p className="text-gray-600">Create and manage assignments for different classes</p>
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#ef4444] hover:bg-[#dc2626] gap-2">
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <p className="text-sm text-gray-600">Add a new assignment for students to complete.</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="Enter assignment title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter assignment description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Class</Label>
                  <select
                    id="class"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="period">Period</Label>
                  <select
                    id="period"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  >
                    <option value="Regular">Regular</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxMarks">Maximum Marks</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    placeholder="Enter maximum marks"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#ef4444] hover:bg-[#dc2626]">
                  Create Assignment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{totalAssignments}</div>
            <p className="text-xs text-gray-500 mt-1">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{avgCompletion}%</div>
            <p className="text-xs text-gray-500 mt-1">Student submission rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{avgScore}%</div>
            <p className="text-xs text-gray-500 mt-1">Across all assignments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-base font-semibold">Assignment List</CardTitle>
          <p className="text-sm text-gray-600 mt-1">View and manage all assignments</p>
        </CardHeader>
        <CardContent className="p-0">
          {assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No assignments created yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{assignment.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{assignment.className || assignment.classId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{assignment.maxMarks}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{assignment.dueDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{assignment.period}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{assignment.submissions}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{assignment.avgScore}%</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assignment.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
