"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Plus, Search, Edit, Trophy, Trash2 } from "lucide-react"

interface StudentMark {
  id: number
  student_id: string
  assignment_id: number
  marks_obtained: number
  percentage: number
  grade: string
  submitted_at: string
  assignment_title?: string
  max_marks?: number
  class_name?: string
}

interface Student {
  id: number
  student_id: string
  full_name: string
  class_id: number
  class_name?: string
}

interface Assignment {
  id: number
  title: string
  description: string
  class_id: number
  max_marks: number
  class_name?: string
}

interface Class {
  id: number
  name: string
}

export default function Performance() {
  const [marks, setMarks] = useState<StudentMark[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [marksObtained, setMarksObtained] = useState("")
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [hasDuplicateMarks, setHasDuplicateMarks] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [filterStudent, setFilterStudent] = useState("all")
  const [filterAssignment, setFilterAssignment] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isVideoDetailsOpen, setIsVideoDetailsOpen] = useState(false)
  const [videoDetails, setVideoDetails] = useState<any[]>([])

  const [videoAwards, setVideoAwards] = useState<{
    videosCompleted: number
    eligibleBonusMarks: number
    totalAwarded: number
    newBonusMarks: number
  } | null>(null)

  const [videoStats, setVideoStats] = useState<{
    totalVideosWatched: number
    averageCompletion: number
    totalWatchTime: number
    coursesInProgress: number
    groupName: string | null
    groupId: number | null
    costPerMember: number | null
    hasPaid: boolean
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      await loadMarks()
      await loadStudents()
      await loadAssignments()
      await loadClasses()
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    console.log("[v0] Selected student changed:", selectedStudent)
  }, [selectedStudent])

  const loadMarks = async (classId?: number) => {
    try {
      const url = classId ? `/api/student-marks?classId=${classId}` : "/api/student-marks"
      const response = await fetch(url)
      const data = await response.json()
      console.log("[v0] Loaded marks from database:", data)

      // Convert percentage and marks_obtained from strings to numbers
      const normalizedMarks = data.map((mark: any) => ({
        ...mark,
        percentage: Number.parseFloat(mark.percentage),
        marks_obtained: Number.parseFloat(mark.marks_obtained),
      }))

      setMarks(normalizedMarks)
    } catch (error) {
      console.error("Error loading marks:", error)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await fetch("/api/university-students")
      const data = await response.json()
      console.log("[v0] Loaded students from database:", data)
      setStudents(data)
    } catch (error) {
      console.error("[v0] Error loading students:", error)
    }
  }

  const loadAssignments = async () => {
    try {
      const response = await fetch("/api/assignments")
      const data = await response.json()
      console.log("[v0] Loaded assignments from database:", data)
      setAssignments(data)
    } catch (error) {
      console.error("[v0] Error loading assignments:", error)
    }
  }

  const loadClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      console.log("[v0] Loaded classes from database:", data)
      setClasses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[v0] Error loading classes:", error)
    }
  }

  const fetchVideoStats = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/video-stats?studentId=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setVideoStats(data)
      }
    } catch (error) {
      console.error("Error fetching video stats:", error)
    }
  }

  const fetchVideoDetails = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/video-details?studentId=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setVideoDetails(data)
        setIsVideoDetailsOpen(true)
      }
    } catch (error) {
      console.error("Error fetching video details:", error)
    }
  }

  const fetchVideoAwards = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/video-awards?studentId=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setVideoAwards(data)
      }
    } catch (error) {
      console.error("Error fetching video awards:", error)
    }
  }

  useEffect(() => {
    if (selectedStudent) {
      fetchVideoStats(selectedStudent.student_id)
      fetchVideoAwards(selectedStudent.student_id)
    } else {
      setVideoStats(null)
      setVideoAwards(null)
    }
  }, [selectedStudent])

  // Calculate statistics
  const averagePerformance =
    marks.length > 0 ? (marks.reduce((sum, m) => sum + Number(m.percentage), 0) / marks.length).toFixed(1) : "0.0"

  const topPerformer =
    marks.length > 0 ? marks.reduce((max, m) => (Number(m.percentage) > Number(max.percentage) ? m : max)) : null

  const filteredMarks = marks.filter((mark) => {
    const studentName = students.find((s) => s.student_id === mark.student_id)?.full_name || ""
    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mark.assignment_title || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = filterClass === "all" || mark.class_name === filterClass
    const matchesStudent = filterStudent === "all" || mark.student_id === filterStudent
    const matchesAssignment = filterAssignment === "all" || mark.assignment_id.toString() === filterAssignment
    return matchesSearch && matchesClass && matchesStudent && matchesAssignment
  })

  // Calculate class performance for charts
  const classPerformance = classes
    .map((cls) => {
      const classMarks = marks.filter((m) => m.class_name === cls.name)
      const avg = classMarks.length > 0 ? classMarks.reduce((sum, m) => sum + m.percentage, 0) / classMarks.length : 0
      return { className: cls.name, average: avg }
    })
    .filter((cp) => cp.average > 0)
    .slice(0, 4)

  const handleStudentSearch = (value: string) => {
    setStudentSearchTerm(value)
    console.log("[v0] Searching for student:", value)

    if (value.length > 2) {
      const found = students.find(
        (s) =>
          s.student_id.toLowerCase().includes(value.toLowerCase()) ||
          s.full_name.toLowerCase().includes(value.toLowerCase()),
      )
      console.log("[v0] Found student:", found)
      setSelectedStudent(found || null)
      if (selectedAssignment) {
        const existingMark = marks.find(
          (mark) => mark.student_id === found?.student_id && mark.assignment_id === selectedAssignment.id,
        )
        setHasDuplicateMarks(!!existingMark)
      }
    } else if (value.length === 0) {
      setSelectedStudent(null)
      setHasDuplicateMarks(false)
    }
  }

  const handleAssignmentChange = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === Number(assignmentId))
    setSelectedAssignment(assignment || null)
    if (selectedStudent && assignment) {
      const existingMark = marks.find(
        (mark) => mark.student_id === selectedStudent.student_id && mark.assignment_id === assignment.id,
      )
      setHasDuplicateMarks(!!existingMark)
    }
  }

  const handleSaveMarks = async () => {
    if (!selectedStudent || !selectedAssignment || !marksObtained) {
      alert("Please fill all fields")
      return
    }

    const marksValue = Number.parseFloat(marksObtained)
    if (marksValue < 0 || marksValue > selectedAssignment.max_marks) {
      alert(`Marks must be between 0 and ${selectedAssignment.max_marks}`)
      return
    }

    const existingMark = marks.find(
      (mark) => mark.student_id === selectedStudent.student_id && mark.assignment_id === selectedAssignment.id,
    )

    if (existingMark) {
      alert(
        `Marks already exist for ${selectedStudent.full_name} in ${selectedAssignment.title}. Please edit the existing marks instead of creating a duplicate.`,
      )
      return
    }

    try {
      const response = await fetch("/api/student-marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          assignment_id: selectedAssignment.id,
          marks_obtained: marksValue,
          max_marks: selectedAssignment.max_marks,
        }),
      })

      if (response.ok) {
        console.log("[v0] Marks saved successfully")
        await loadMarks()
        setIsDialogOpen(false)
        setStudentSearchTerm("")
        setSelectedStudent(null)
        setSelectedAssignment(null)
        setMarksObtained("")
        setHasDuplicateMarks(false)
      } else {
        alert("Failed to save marks")
      }
    } catch (error) {
      console.error("[v0] Error saving marks:", error)
      alert("Error saving marks")
    }
  }

  const handleDeleteMarks = async (markId: number) => {
    if (!confirm("Are you sure you want to delete this mark?")) return

    try {
      const response = await fetch(`/api/student-marks?id=${markId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log("[v0] Marks deleted successfully")
        await loadMarks()
      } else {
        alert("Failed to delete marks")
      }
    } catch (error) {
      console.error("[v0] Error deleting marks:", error)
      alert("Error deleting marks")
    }
  }

  const handleStudentDropdownChange = (value: string) => {
    const student = students.find((s) => s.student_id === value)
    console.log("[v0] Student selected from dropdown:", student)
    setSelectedStudent(student || null)
    setStudentSearchTerm("")
    if (selectedAssignment) {
      const existingMark = marks.find(
        (mark) => mark.student_id === student?.student_id && mark.assignment_id === selectedAssignment.id,
      )
      setHasDuplicateMarks(!!existingMark)
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(studentSearchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
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
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#1e3a5f] hover:bg-[#152d47] text-white shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Add Marks
        </Button>
      </div>

      {/* Statistics Cards */}
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
                  {topPerformer
                    ? students.find((s) => s.student_id === topPerformer.student_id)?.full_name || "Unknown"
                    : "No data yet"}
                </p>
                <p className="text-sm text-gray-600">
                  {topPerformer && `${Number(topPerformer.percentage).toFixed(1)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Chart */}
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

      {/* Student Marks Table */}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterClass} onValueChange={setFilterClass}>
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
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarks.map((mark, index) => {
                    const student = students.find((s) => s.student_id === mark.student_id)
                    return (
                      <tr
                        key={mark.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="p-3 text-sm text-gray-900">{student?.full_name || mark.student_id}</td>
                        <td className="p-3 text-sm text-gray-700">{mark.assignment_title}</td>
                        <td className="p-3 text-sm text-gray-700">{mark.class_name}</td>
                        <td className="p-3 text-sm font-medium text-gray-900">
                          {mark.marks_obtained}/{mark.max_marks}
                        </td>
                        <td className="p-3 text-sm">
                          <span className="font-semibold text-gray-900">{mark.percentage.toFixed(1)}%</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              mark.grade === "A+" || mark.grade === "A"
                                ? "bg-green-100 text-green-700"
                                : mark.grade === "B" || mark.grade === "B+"
                                  ? "bg-blue-100 text-blue-700"
                                  : mark.grade === "C" || mark.grade === "C+"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {mark.grade}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(mark.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Button
                            onClick={() => handleDeleteMarks(mark.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
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

      {/* Add Marks Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold text-gray-900">Enter Student Marks</DialogTitle>
            <p className="text-sm text-gray-600">Add or update marks for a student's assignment submission.</p>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Student Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Search Student by Name/ID</Label>
                <Input
                  placeholder="Enter student ID or name"
                  value={studentSearchTerm}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  className="bg-gray-50 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Or Select from Dropdown</Label>
                <Select value={selectedStudent?.student_id || undefined} onValueChange={handleStudentDropdownChange}>
                  <SelectTrigger className="w-full bg-gray-50 border border-gray-300">
                    <SelectValue placeholder="Dooro Ardayga">
                      {selectedStudent && (
                        <span className="block truncate">
                          {selectedStudent.full_name} ({selectedStudent.student_id})
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents
                      .filter((s) => s.student_id && s.student_id.trim() !== "")
                      .map((student) => (
                        <SelectItem key={student.student_id} value={student.student_id}>
                          <span className="block max-w-md truncate">
                            {student.full_name} ({student.student_id})
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedStudent && (
              <div className="space-y-3">
                {/* Basic Student Information - Compact Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Student Information</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="bg-white px-2 py-1 rounded border border-gray-200">
                        {selectedStudent.class_name}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-xs">
                        {selectedStudent.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-900">{selectedStudent.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs">
                        ID
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Student ID</p>
                        <p className="font-medium text-gray-900">{selectedStudent.student_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid - Compact Cards */}
                {videoStats && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Group & Payment Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-purple-100 rounded flex items-center justify-center text-purple-700 text-xs font-bold">
                          K
                        </div>
                        <h4 className="text-xs font-semibold text-gray-900">Koox & Lacag</h4>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Kooxda:</span>
                          <span className="font-medium text-gray-900 truncate ml-2">
                            {videoStats.groupName || "Ma jiro"}
                          </span>
                        </div>
                        {videoStats.costPerMember && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Qiimaha:</span>
                            <span className="font-medium text-gray-900">${videoStats.costPerMember}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-gray-600">Bixinta:</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              videoStats.hasPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {videoStats.hasPaid ? "✓ Paid" : "✗ Unpaid"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Video Stats Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded flex items-center justify-center text-indigo-700 text-xs font-bold">
                          ▶
                        </div>
                        <h4 className="text-xs font-semibold text-gray-900">Video Daawashada</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Muqaalo</p>
                          <p className="font-bold text-gray-900 text-base">{videoStats.totalVideosWatched}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Dhamaystir</p>
                          <p className="font-bold text-gray-900 text-base">
                            {videoStats.averageCompletion.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Waqti</p>
                          <p className="font-medium text-gray-900">
                            {Math.floor(videoStats.totalWatchTime / 60)}h {videoStats.totalWatchTime % 60}m
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Koorso</p>
                          <p className="font-medium text-gray-900">{videoStats.coursesInProgress}</p>
                        </div>
                      </div>
                      {videoAwards && videoAwards.eligibleBonusMarks > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 flex items-center gap-1">
                              <span className="text-yellow-500">🏆</span> Abaal-marinta:
                            </span>
                            <span className="font-bold text-green-600">{videoAwards.totalAwarded} dhibcood</span>
                          </div>
                          {videoAwards.newBonusMarks > 0 && (
                            <div className="mt-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                              ✨ {videoAwards.newBonusMarks} dhibco cusub! (2 video = 1 dhibco)
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => selectedStudent && fetchVideoDetails(selectedStudent.student_id)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium underline mt-2"
                      >
                        Faahfaahin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Assignment Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Select Assignment</Label>

              {/* Assignment Selection Dropdown */}
              <Select value={selectedAssignment?.id.toString() || undefined} onValueChange={handleAssignmentChange}>
                <SelectTrigger className="w-full !bg-gray-100 border border-gray-300 hover:!bg-gray-200">
                  <SelectValue placeholder="Dooro Assignment-ka">
                    {selectedAssignment ? (
                      <span className="truncate">
                        {selectedAssignment.title} - {selectedAssignment.class_name} ({selectedAssignment.max_marks}{" "}
                        marks)
                      </span>
                    ) : (
                      "Dooro Assignment-ka"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {assignments
                    .filter((assignment) => assignment.id)
                    .map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id.toString()} className="cursor-pointer">
                        <span className="truncate">
                          {assignment.title} - {assignment.class_name} ({assignment.max_marks} marks)
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAssignment && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Assignment</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{selectedAssignment.title}</p>
                    <p className="text-sm text-gray-600 truncate">{selectedAssignment.class_name}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-xs text-gray-600">Maximum Marks</p>
                    <p className="text-2xl font-bold text-green-600">{selectedAssignment.max_marks}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Marks Input */}
            <div className="space-y-2 mt-6">
              <Label className="text-sm font-medium text-gray-700">
                Marks Obtained (out of {selectedAssignment?.max_marks || "0"})
              </Label>
              <Input
                type="number"
                placeholder={`Enter marks (0-${selectedAssignment?.max_marks || "0"})`}
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value)}
                min={0}
                max={selectedAssignment?.max_marks}
                className="bg-white text-lg"
                disabled={hasDuplicateMarks}
              />
              {hasDuplicateMarks && (
                <p className="text-red-600 text-sm font-medium mt-2">
                  Marks-ka ardaygan assignment-kan horay loo qoray. Duplicate ma qori kartid.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveMarks}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                disabled={hasDuplicateMarks}
              >
                Save Marks
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Details Dialog */}
      <Dialog open={isVideoDetailsOpen} onOpenChange={setIsVideoDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Muqaalada uu daawanayay {selectedStudent?.full_name}
            </DialogTitle>
            <DialogDescription>
              Liiska dhameystiran ee muqaalada uu ardaygu daawanayay iyo inta uu dhammeeyay
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {videoDetails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Wax muqaalo ah ma daawanin ardaygan</p>
              </div>
            ) : (
              videoDetails.map((video, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{video.video_title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {video.video_category} • Muddada: {video.video_duration}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          ⏱️ Waqti daawashada: {Math.floor(video.watch_duration / 60)}:
                          {(video.watch_duration % 60).toString().padStart(2, "0")}
                        </span>
                        <span>🎬 Xawliga: {video.speed_attempts || 0}x</span>
                        <span>⏭️ Boobay: {video.skipped_count || 0}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            Number(video.completion_percentage) >= 80
                              ? "bg-green-100 text-green-700"
                              : Number(video.completion_percentage) >= 50
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {Number(video.completion_percentage).toFixed(1)}%
                        </span>
                        {Number(video.completion_percentage) >= 80 ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">
                            ✓ Dhameystiran
                          </span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-medium">
                            ⏳ Socdaa
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            Number(video.completion_percentage) >= 80
                              ? "bg-green-500"
                              : Number(video.completion_percentage) >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${video.completion_percentage}%` }}
                        />
                      </div>

                      <span className="text-xs text-gray-400">
                        {new Date(video.last_watched_at).toLocaleDateString("so-SO")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
