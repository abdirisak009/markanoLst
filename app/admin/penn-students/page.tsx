"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GraduationCap, Plus, Edit, Trash2, Upload, CheckCircle, Search } from "lucide-react"
import {
  getPennStudents,
  savePennStudents,
  approvePennStudent,
  deletePennStudent,
  type PennStudent,
} from "@/lib/admin-data"

export default function PennStudentsPage() {
  const [students, setStudents] = useState<PennStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<PennStudent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState<PennStudent | null>(null)
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    username: "",
    phone: "",
    selectedCourse: "",
    status: "pending" as "pending" | "approved" | "rejected",
  })

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.selectedCourse.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredStudents(filtered)
  }, [searchQuery, students])

  const loadStudents = () => {
    setStudents(getPennStudents())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const students = getPennStudents()

    if (editingStudent) {
      const updated = students.map((s) => (s.id === editingStudent.id ? { ...s, ...formData } : s))
      savePennStudents(updated)
    } else {
      const newStudent: PennStudent = {
        ...formData,
        id: formData.studentId || `PENN${Date.now().toString().slice(-6)}`,
        registrationDate: new Date().toISOString().split("T")[0],
      }
      students.push(newStudent)
      savePennStudents(students)
    }

    setShowDialog(false)
    setEditingStudent(null)
    setFormData({ studentId: "", name: "", email: "", username: "", phone: "", selectedCourse: "", status: "pending" })
    loadStudents()
  }

  const handleEdit = (student: PennStudent) => {
    setEditingStudent(student)
    setFormData({
      studentId: student.id,
      name: student.name,
      email: student.email,
      username: student.username,
      phone: student.phone,
      selectedCourse: student.selectedCourse,
      status: student.status,
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deletePennStudent(id)
      loadStudents()
    }
  }

  const handleApprove = (id: string) => {
    approvePennStudent(id)
    loadStudents()
  }

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      alert("Excel upload functionality: Please use format with columns: Name, Email, Username, Phone, Course")
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">Penn Creative Lab Students</h1>
            <p className="text-gray-500 mt-1">Manage Penn Creative Lab student registrations and approvals</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 shadow-sm hover:shadow-md transition-shadow bg-transparent"
            onClick={() => document.getElementById("excel-upload")?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload Excel
          </Button>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleExcelUpload}
          />
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#ef4444] hover:bg-[#dc2626] gap-2 shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  setEditingStudent(null)
                  setFormData({
                    studentId: "",
                    name: "",
                    email: "",
                    username: "",
                    phone: "",
                    selectedCourse: "",
                    status: "pending",
                  })
                }}
              >
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingStudent ? "Edit Penn Student" : "Add Penn Student"}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-2">
                  Enter the student details to {editingStudent ? "update" : "add"} them to the system
                </p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-sm font-medium">
                    Student ID *
                  </Label>
                  <Input
                    id="studentId"
                    placeholder="Enter student ID (e.g., PENN001)"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required={!editingStudent}
                    disabled={!!editingStudent}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-sm font-medium">
                    Selected Course *
                  </Label>
                  <Input
                    id="course"
                    placeholder="Enter course name"
                    value={formData.selectedCourse}
                    onChange={(e) => setFormData({ ...formData, selectedCourse: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <select
                    id="status"
                    className="w-full h-11 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:ring-offset-2"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="h-11 px-6">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#ef4444] hover:bg-[#dc2626] h-11 px-6">
                    {editingStudent ? "Update" : "Add"} Student
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-[#1e3a5f]">Student Registrations</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} found
              </p>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, email, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {searchQuery ? "No students found matching your search" : "No Penn students registered yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`transition-all hover:bg-yellow-50 hover:shadow-sm ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{student.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.selectedCourse}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                            student.status === "approved"
                              ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                              : student.status === "rejected"
                                ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                                : "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700"
                          }`}
                        >
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {student.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(student.id)}
                              title="Approve"
                              className="hover:bg-green-100 hover:text-green-600 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(student)}
                            title="Edit"
                            className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(student.id)}
                            title="Delete"
                            className="hover:bg-red-100 hover:text-red-600 transition-colors"
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
