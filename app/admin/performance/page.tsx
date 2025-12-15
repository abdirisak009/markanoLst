"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Plus, Search, Edit, Trophy } from "lucide-react"

interface StudentMark {
  id: string
  student_id: string
  assignment_id: string
  marks_obtained: number
  percentage: number
  grade: string
  submitted_at: string
  assignment_title?: string
  max_marks?: number
  class_name?: string
}

interface Student {
  id: string
  full_name: string
  class: string
}

interface Assignment {
  id: string
  title: string
  class_id: string
  max_marks: number
}

interface Class {
  id: string
  name: string
  university_id: string
}

export default function PerformancePage() {
  const [marks, setMarks] = useState<StudentMark[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [showDialog, setShowDialog] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [marksObtained, setMarksObtained] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState("all")

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [marksRes, studentsRes, assignmentsRes, classesRes] = await Promise.all([
        fetch("/api/student-marks"),
        fetch("/api/university-students?class_id=" + (selectedClass !== "all" ? selectedClass : "")),
        fetch("/api/assignments"),
        fetch("/api/classes"),
      ])

      const marksData = await marksRes.json()
      const studentsData = await studentsRes.json()
      const assignmentsData = await assignmentsRes.json()
      const classesData = await classesRes.json()

      console.log("[v0] Fetched marks:", Array.isArray(marksData) ? marksData.length : 0)
      console.log("[v0] Fetched students:", Array.isArray(studentsData) ? studentsData.length : 0)
      console.log("[v0] Fetched assignments:", Array.isArray(assignmentsData) ? assignmentsData.length : 0)

      const processedMarks = (Array.isArray(marksData) ? marksData : []).map((mark) => {
        // Find the assignment to get max_marks
        const assignment = assignmentsData.find((a: any) => a.id === mark.assignment_id)
        const classData = classesData.find((c: any) => c.id === assignment?.class_id)

        // Calculate percentage if not present or ensure it's a number
        const percentage = mark.percentage
          ? Number(mark.percentage)
          : assignment?.max_marks
            ? (Number(mark.marks_obtained) / Number(assignment.max_marks)) * 100
            : 0

        return {
          ...mark,
          assignment_title: assignment?.title || "Unknown Assignment",
          max_marks: assignment?.max_marks || 0,
          class_name: classData?.name || "Unknown Class",
          percentage: percentage, // Ensure it's a number
          marks_obtained: Number(mark.marks_obtained),
        }
      })

      setMarks(processedMarks)
      setStudents(Array.isArray(studentsData) ? studentsData : [])
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      setClasses(Array.isArray(classesData) ? classesData : [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      setMarks([])
      setStudents([])
      setAssignments([])
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedClass])

  const averagePerformance =
    marks.length > 0 ? (marks.reduce((sum, m) => sum + Number(m.percentage), 0) / marks.length).toFixed(1) : "0.0"

  const topPerformer = marks.length > 0 ? marks.reduce((max, m) => (m.percentage > max.percentage ? m : max)) : null

  const filteredMarks = marks.filter((mark) => {
    const student = students.find((s) => s.id === mark.student_id)
    const studentName = student?.full_name || mark.student_id

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mark.assignment_title || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = classFilter === "all" || mark.class_name === classFilter
    return matchesSearch && matchesClass
  })

  const classPerformance = classes
    .map((cls) => {
      const classMarks = marks.filter((m) => m.class_name === cls.name)
      const avg = classMarks.length > 0 ? classMarks.reduce((sum, m) => sum + m.percentage, 0) / classMarks.length : 0
      return { className: cls.name, average: avg }
    })
    .filter((cp) => cp.average > 0)
    .slice(0, 4)

  const handleStudentSearch = (value: string) => {
    setStudentSearch(value)
    if (value.length > 2) {
      const found = students.find(
        (s) =>
          s.id.toLowerCase().includes(value.toLowerCase()) || s.full_name.toLowerCase().includes(value.toLowerCase()),
      )
      setSelectedStudent(found || null)
    }
  }

  const handleAssignmentChange = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId)
    setSelectedAssignment(assignment || null)
  }

  const handleSaveMarks = async () => {
    if (!selectedStudent || !selectedAssignment || !marksObtained) {
      alert("Please fill all fields")
      return
    }

    const marks = Number.parseFloat(marksObtained)
    if (marks < 0 || marks > selectedAssignment.max_marks) {
      alert(`Marks must be between 0 and ${selectedAssignment.max_marks}`)
      return
    }

    try {
      const response = await fetch("/api/student-marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          assignment_id: selectedAssignment.id,
          marks_obtained: marks,
          max_marks: selectedAssignment.max_marks,
        }),
      })

      if (!response.ok) throw new Error("Failed to save marks")

      await fetchData()

      setShowDialog(false)
      setStudentSearch("")
      setSelectedStudent(null)
      setSelectedAssignment(null)
      setMarksObtained("")
    } catch (error) {
      console.error("[v0] Error saving marks:", error)
      alert("Failed to save marks")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading performance data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Performance Tracking</h1>
            <p className="text-gray-600">Enter marks and track student performance across assignments</p>
          </div>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#1e3a5f] hover:bg-[#152d47] text-white shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Add Marks
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Performance</p>
                <p className="text-3xl font-bold text-[#1e3a5f]">{averagePerformance}%</p>
                <p className="text-xs text-gray-500 mt-1">Across all submissions</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                <p className="text-3xl font-bold text-[#1e3a5f]">{marks.length}</p>
                <p className="text-xs text-gray-500 mt-1">Assignment submissions</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Edit className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Top Performer</p>
                <p className="text-lg font-bold text-[#1e3a5f]">
                  {topPerformer ? topPerformer.student_id : "No data yet"}
                </p>
                <p className="text-sm text-gray-600">{topPerformer && `Highest scoring student`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {classPerformance.length > 0 && (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">Class Performance Analysis</h3>
            <p className="text-sm text-gray-600 mb-6">Visual representation of performance across classes</p>
            <div className="flex items-end justify-around h-64 gap-4">
              {classPerformance.map((cp, index) => {
                const colors = ["#1e3a5f", "#16a34a", "#0891b2", "#ca8a04"]
                return (
                  <div key={index} className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: "200px" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-lg transition-all duration-500 flex items-end justify-center pb-2"
                        style={{
                          height: `${(cp.average / 100) * 200}px`,
                          backgroundColor: colors[index % colors.length],
                        }}
                      >
                        <span className="text-white font-semibold text-sm">{cp.average.toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2 text-center">{cp.className}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1e3a5f]">Student Marks</h3>
              <p className="text-sm text-gray-600">View and manage all student marks and grades</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students or assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredMarks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Assignment</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Class</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Marks</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Percentage</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Grade</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarks.map((mark, index) => {
                    const student = students.find((s) => s.id === mark.student_id)
                    const studentName = student?.full_name || mark.student_id
                    const submissionDate = new Date(mark.submitted_at).toISOString().split("T")[0]

                    return (
                      <tr
                        key={mark.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="p-3 text-sm text-gray-900">{studentName}</td>
                        <td className="p-3 text-sm text-gray-700">{mark.assignment_title || "Unknown"}</td>
                        <td className="p-3 text-sm text-gray-700">{mark.class_name || "N/A"}</td>
                        <td className="p-3 text-sm font-medium text-gray-900">
                          {mark.marks_obtained}/{mark.max_marks || "?"}
                        </td>
                        <td className="p-3 text-sm">
                          <span className="font-semibold text-gray-900">{Number(mark.percentage).toFixed(1)}%</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              mark.grade === "A+" || mark.grade === "A"
                                ? "bg-green-100 text-green-700"
                                : mark.grade === "B" || mark.grade === "B+" || mark.grade === "B-"
                                  ? "bg-blue-100 text-blue-700"
                                  : mark.grade === "C" || mark.grade === "C+" || mark.grade === "C-"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {mark.grade}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{submissionDate}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredMarks.length} of {marks.length} marks
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No marks found. Add marks to start tracking performance.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#1e3a5f]">Enter Student Marks</DialogTitle>
            <p className="text-sm text-gray-600">Add or update marks for a student's assignment submission.</p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Search Student by Name/ID</Label>
                <Input
                  placeholder="Enter student ID or name"
                  value={studentSearch}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  className="mt-1"
                />
                {selectedStudent && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium text-gray-900">{selectedStudent.full_name}</p>
                    <p className="text-gray-600">
                      {selectedStudent.id} • {selectedStudent.class}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Or Select from Dropdown</Label>
                <Select
                  value={selectedStudent?.id || ""}
                  onValueChange={(value) => {
                    const student = students.find((s) => s.id === value)
                    setSelectedStudent(student || null)
                    setStudentSearch(student?.full_name || "")
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedStudent && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                    {selectedStudent.full_name.charAt(0)}
                  </div>
                  <p className="font-semibold text-blue-900">Selected Student</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium">Name</p>
                    <p className="text-blue-900">{selectedStudent.full_name}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Student ID</p>
                    <p className="text-blue-900">{selectedStudent.id}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Class</p>
                    <p className="text-blue-900">{selectedStudent.class}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Select Assignment</Label>
              <Select value={selectedAssignment?.id || ""} onValueChange={handleAssignmentChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignment" />
                </SelectTrigger>
                <SelectContent>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.title} (Max: {assignment.max_marks} marks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAssignment && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Edit className="h-4 w-4 text-white" />
                  </div>
                  <p className="font-semibold text-green-900">Selected Assignment</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-700 font-medium">Assignment Title</p>
                    <p className="text-green-900">{selectedAssignment.title}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">Maximum Marks</p>
                    <p className="text-green-900 flex items-center gap-1">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-semibold">
                        {selectedAssignment.max_marks} marks
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Marks Obtained (out of {selectedAssignment?.max_marks || "0"})
              </Label>
              <Input
                type="number"
                placeholder={`Enter marks (0-${selectedAssignment?.max_marks || "0"})`}
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value)}
                min={0}
                max={selectedAssignment?.max_marks}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveMarks} className="flex-1 bg-[#1e3a5f] hover:bg-[#152d47] text-white">
                Save Marks
              </Button>
              <Button onClick={() => setShowDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
