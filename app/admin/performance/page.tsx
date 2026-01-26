"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Plus,
  Search,
  Edit,
  Trophy,
  Video,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Save,
  Pencil,
  Trash2,
  AlertTriangle,
  FastForward,
  SkipForward,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface StudentMark {
  id: number // Changed from string to number based on delete confirmation id type
  student_id: string
  assignment_id: string
  marks_obtained: number
  percentage: number
  grade: string
  submitted_at: string
  assignment_title?: string
  max_marks?: number
  class_name?: string
  student_name?: string // Added student_name field
}

interface Student {
  id: string
  full_name: string
  class_id: string
  student_id: string // Added for easier access
  class_name?: string // Added for student details
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

interface StudentDetails {
  name: string
  class: string
  group: string
  paymentStatus: "paid" | "unpaid"
  videoStats: { watched: number; total: number }
  studentData: Student | null // Corrected type to Student | null
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
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [studentVideos, setStudentVideos] = useState<any[]>([])
  const [existingMarks, setExistingMarks] = useState<{
    marks_obtained: number
    max_marks: number
    date: string
    percentage: number
  } | null>(null)

  const [editingMark, setEditingMark] = useState<StudentMark | null>(null)
  const [editMarksValue, setEditMarksValue] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

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

      // Map student data to include class name directly
      const processedStudents = (Array.isArray(studentsData) ? studentsData : []).map((student: any) => {
        const studentClass = classesData.find((c: Class) => c.id === student.class_id)
        return {
          ...student,
          class_name: studentClass?.name || "Unknown Class",
        }
      })
      setStudents(processedStudents)

      const processedMarks = (Array.isArray(marksData) ? marksData : []).map((mark: any) => {
        // Find the assignment to get max_marks
        const assignment = assignmentsData.find((a: Assignment) => a.id === mark.assignment_id)
        const cls = classesData.find((c: Class) => c.id === assignment?.class_id)

        // Calculate percentage if not present or ensure it's a number
        const percentage = mark.percentage
          ? Number(mark.percentage)
          : assignment?.max_marks
            ? (Number(mark.marks_obtained) / Number(assignment.max_marks)) * 100
            : 0

        // Find the student to get student_name and class_name
        const student = processedStudents.find((s: Student) => String(s.student_id) === String(mark.student_id))

        return {
          ...mark,
          id: Number(mark.id), // Ensure id is a number
          assignment_title: assignment?.title || "Unknown Assignment",
          max_marks: assignment?.max_marks || 0,
          class_name: cls?.name || student?.class_name || "Unknown Class", // Use class from assignment or student
          percentage: percentage, // Ensure it's a number
          marks_obtained: Number(mark.marks_obtained),
          student_name: student?.full_name, // Get student's full name
        }
      })

      setMarks(processedMarks)
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

  // Renamed to fetchMarks to avoid confusion with fetchData
  const fetchMarks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/student-marks")
      const data = await response.json()

      // Re-process marks to include assignment titles, student names, etc.
      const assignmentsData = assignments // Use fetched assignments
      const studentsData = students // Use fetched students
      const classesData = classes // Use fetched classes

      const processedMarks = (Array.isArray(data) ? data : []).map((mark: any) => {
        const assignment = assignmentsData.find((a: Assignment) => a.id === mark.assignment_id)
        const cls = classesData.find((c: Class) => c.id === assignment?.class_id)
        const student = studentsData.find((s: Student) => String(s.student_id) === String(mark.student_id))

        const percentage = mark.percentage
          ? Number(mark.percentage)
          : assignment?.max_marks
            ? (Number(mark.marks_obtained) / Number(assignment.max_marks)) * 100
            : 0

        return {
          ...mark,
          id: Number(mark.id),
          assignment_title: assignment?.title || "Unknown Assignment",
          max_marks: assignment?.max_marks || 0,
          class_name: cls?.name || student?.class_name || "Unknown Class",
          percentage: percentage,
          marks_obtained: Number(mark.marks_obtained),
          student_name: student?.full_name,
        }
      })

      setMarks(processedMarks)
    } catch (error) {
      console.error("Error fetching marks:", error)
      setMarks([])
    } finally {
      setLoading(false)
    }
  }

  const averagePerformance =
    marks.length > 0 ? (marks.reduce((sum, m) => sum + Number(m.percentage), 0) / marks.length).toFixed(1) : "0.0"

  const topPerformer = marks.length > 0 ? marks.reduce((max, m) => (m.percentage > max.percentage ? m : max)) : null

  const filteredMarks = marks.filter((mark) => {
    const student = students.find((s) => String(s.student_id) === String(mark.student_id)) // Use student_id for filtering
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

  const fetchStudentDetails = async (studentId: string) => {
    if (!studentId) {
      setStudentDetails(null)
      return
    }

    console.log("[v0] Fetching details for student:", studentId)
    setLoadingDetails(true)
    try {
      // Fetch all students data to find the specific student
      const studentRes = await fetch(`/api/university-students`)
      const studentsData = await studentRes.json()
      console.log("[v0] Students data:", studentsData)

      const student = Array.isArray(studentsData)
        ? studentsData.find((s: any) => String(s.student_id) === String(studentId))
        : null

      console.log("[v0] Found student:", student)

      if (!student) {
        setStudentDetails(null)
        setLoadingDetails(false)
        return
      }

      // Get group info using POST request (correct API method)
      let groupInfo = null
      let paymentStatus: "paid" | "unpaid" = "unpaid"
      try {
        const groupRes = await fetch(`/api/students/group-info`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: studentId }),
        })

        if (groupRes.ok) {
          const groupData = await groupRes.json()
          console.log("[v0] Group data:", groupData)

          if (!groupData.error && groupData.group) {
            groupInfo = groupData.group
            // Check payment status from group data
            paymentStatus = groupData.hasPaid ? "paid" : "unpaid"
          }
        } else {
          console.log("[v0] Student not in any group (404 expected)")
        }
      } catch (err) {
        console.log("[v0] Group info not available:", err)
      }

      // Get video stats - fetch all analytics and filter for this student
      const videoStats = { watched: 0, total: 0 }
      try {
        const videosRes = await fetch(`/api/videos/analytics`)
        if (videosRes.ok) {
          const videosData = await videosRes.json()
          console.log("[v0] All video data fetched")

          if (Array.isArray(videosData)) {
            // Filter for this specific student
            const studentVideos = videosData.filter((v: any) => String(v.student_id) === String(studentId))
            console.log("[v0] Student videos:", studentVideos.length)

            videoStats.total = studentVideos.length
            videoStats.watched = studentVideos.filter((v: any) => Number(v.completion_percentage) >= 80).length
          }
        }
      } catch (err) {
        console.log("[v0] Video stats not available:", err)
      }

      setStudentDetails({
        name: student.full_name,
        class: student.class_name || "Unknown",
        group: groupInfo?.name || "No Group",
        paymentStatus,
        videoStats,
        studentData: student,
      })
    } catch (error) {
      console.error("[v0] Error fetching student details:", error)
      setStudentDetails(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleStudentSearch = async (value: string) => {
    setStudentSearch(value)
    if (value.length > 2) {
      const found = students.find(
        (s) =>
          String(s.student_id).toLowerCase().includes(value.toLowerCase()) ||
          s.full_name.toLowerCase().includes(value.toLowerCase()),
      )
      setSelectedStudent(found || null)

      if (found) {
        await fetchStudentDetails(String(found.student_id))
      } else {
        setStudentDetails(null)
      }
    } else {
      setStudentDetails(null)
    }
  }

  const fetchStudentVideos = async (studentId: string) => {
    if (!studentId) return

    try {
      console.log("[v0] Fetching videos for student:", studentId)
      // Use student_id instead of id for the API call
      const response = await fetch(`/api/videos/analytics?student_id=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Videos fetched:", data)
        setStudentVideos(Array.isArray(data) ? data : [])
        setShowVideoDialog(true)
      } else {
        console.error("[v0] Failed to fetch videos:", response.status)
        setStudentVideos([])
        setShowVideoDialog(true)
      }
    } catch (error) {
      console.error("[v0] Error fetching videos:", error)
      setStudentVideos([])
      setShowVideoDialog(true)
    }
  }

  const handleAssignmentChange = async (assignmentId: string) => {
    const assignment = assignments.find((a) => String(a.id) === assignmentId)
    setSelectedAssignment(assignment || null)

    if (selectedStudent && assignmentId) {
      console.log("[v0] Checking for existing marks:", {
        student_id: selectedStudent.student_id,
        assignment_id: assignmentId,
      })

      try {
        const existingMark = marks.find(
          (mark) =>
            String(mark.student_id) === String(selectedStudent.student_id) &&
            String(mark.assignment_id) === assignmentId,
        )

        if (existingMark) {
          console.log("[v0] Found existing marks:", existingMark)
          setExistingMarks({
            marks_obtained: existingMark.marks_obtained,
            max_marks: existingMark.max_marks ?? 0,
            date: existingMark.submitted_at,
            percentage: existingMark.percentage,
          })
          setMarksObtained(String(existingMark.marks_obtained))
        } else {
          console.log("[v0] No existing marks found")
          setExistingMarks(null)
          setMarksObtained("")
        }
      } catch (error) {
        console.error("[v0] Error checking existing marks:", error)
        setExistingMarks(null)
      }
    }
  }

  const handleSaveMarks = async () => {
    if (!selectedStudent || !selectedAssignment || !marksObtained) {
      alert("Please fill all fields")
      return
    }

    const marks = Number.parseFloat(marksObtained)
    if (marks < 0 || marks > (selectedAssignment?.max_marks ?? 0)) {
      // Added nullish coalescing for safety
      alert(`Marks must be between 0 and ${selectedAssignment?.max_marks ?? "?"}`) // Added nullish coalescing for safety
      return
    }

    try {
      const response = await fetch("/api/student-marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          assignment_id: selectedAssignment.id,
          marks_obtained: marks,
          max_marks: selectedAssignment.max_marks,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          alert(
            `${data.error}\n\nMarks-kii hore: ${data.existing.marks_obtained} (${data.existing.percentage.toFixed(1)}%)`,
          )
          return
        }
        throw new Error(data.error || "Failed to save marks")
      }

      await fetchData()

      setShowDialog(false)
      setStudentSearch("")
      setSelectedStudent(null)
      setSelectedAssignment(null)
      setMarksObtained("")
      setExistingMarks(null)
    } catch (error) {
      console.error("[v0] Error saving marks:", error)
      alert("Failed to save marks. Please try again.")
    }
  }

  const handleEditMark = async () => {
    if (!editingMark || !editMarksValue) return

    const maxMarks = editingMark.max_marks ?? 0
    const marksNum = Number(editMarksValue)
    if (isNaN(marksNum) || marksNum < 0 || marksNum > maxMarks) {
      toast({
        title: "Khalad",
        description: `Marks waa inay u dhexeeyaan 0 iyo ${maxMarks}`,
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/student-marks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMark.id,
          marks_obtained: marksNum,
          max_marks: editingMark.max_marks ?? 0,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update marks")
      }

      toast({
        title: "Guul",
        description: "Marks-ka si guul ah ayaa loo update-garay",
      })

      setIsEditDialogOpen(false)
      setEditingMark(null)
      setEditMarksValue("")
      fetchMarks() // Use the renamed fetchMarks function
    } catch (error) {
      toast({
        title: "Khalad",
        description: "Marks-ka lama update-garayn karin",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMark = async (id: number) => {
    try {
      const res = await fetch(`/api/student-marks?id=${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete marks")
      }

      toast({
        title: "Guul",
        description: "Marks-ka si guul ah ayaa loo tirtiray",
      })

      setDeleteConfirmId(null)
      fetchMarks() // Use the renamed fetchMarks function
    } catch (error) {
      toast({
        title: "Khalad",
        description: "Marks-ka lama tirtiri karin",
        variant: "destructive",
      })
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Student ID</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Student Name</th>
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
                    const studentName = mark.student_name || mark.student_id
                    const submissionDate = new Date(mark.submitted_at).toISOString().split("T")[0]

                    return (
                      <tr
                        key={mark.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="p-3 text-sm font-medium text-gray-900">{mark.student_id}</td>
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
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingMark(mark)
                                setEditMarksValue(mark.marks_obtained.toString())
                                setIsEditDialogOpen(true)
                              }}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit marks"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(mark.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete marks"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto border-0 shadow-2xl rounded-2xl p-0">
          <div className="px-8 pt-8 pb-4">
            <DialogHeader className="p-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#013565] to-[#024a8c] flex items-center justify-center shadow-lg shadow-[#013565]/20">
                  <Edit className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-[#013565]">Enter Student Marks</DialogTitle>
                  <p className="text-gray-500 text-sm mt-1">
                    Add or update marks for a student's assignment submission
                  </p>
                </div>
              </div>
            </DialogHeader>
            <div className="mt-6 h-px bg-gradient-to-r from-[#013565]/20 via-[#013565]/10 to-transparent" />
          </div>

          <div className="px-8 pb-8 pt-4 space-y-8">
            {/* Step 1: Select Student */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#013565] text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  1
                </span>
                <h3 className="text-lg font-semibold text-[#013565]">Select Student</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Search by Name/ID</label>
                  <Input
                    placeholder="Type student name or ID..."
                    value={studentSearch}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    className="h-12 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Or Select from List</label>
                  <Select
                    value={selectedStudent?.student_id || ""}
                    onValueChange={async (value) => {
                      const student = students.find((s) => String(s.student_id) === value)
                      setSelectedStudent(student || null)
                      setStudentSearch(student?.full_name || "")
                      if (student) {
                        await fetchStudentDetails(value)
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 w-full border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20 text-gray-900 bg-white">
                      <SelectValue placeholder="Choose a student..." className="text-gray-900" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] bg-white">
                      {students
                        .filter((student) => student.student_id && String(student.student_id).trim() !== "")
                        .map((student) => (
                          <SelectItem
                            key={student.student_id}
                            value={String(student.student_id)}
                            className="text-gray-900"
                          >
                            {student.full_name} ({student.student_id})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {loadingDetails && (
                <div className="flex items-center gap-2 text-sm text-[#013565] pl-11">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading student details...</span>
                </div>
              )}
            </div>

            {/* Student Details Card */}
            {studentDetails && (
              <div className="ml-11 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student Name</p>
                    <p className="font-bold text-[#013565] text-lg">{studentDetails.studentData?.full_name}</p>
                    <p className="text-sm text-gray-500">ID: {selectedStudent?.student_id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Class</p>
                    <p className="font-bold text-[#013565] text-lg">{studentDetails.studentData?.class_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Group</p>
                    <p className="font-bold text-[#013565] text-lg">{studentDetails.group || "No Group"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <Badge
                      className={
                        studentDetails.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700 border-green-200 px-3 py-1"
                          : "bg-red-100 text-red-700 border-red-200 px-3 py-1"
                      }
                    >
                      {studentDetails.paymentStatus === "paid" ? "Lacag Bixiyay" : "Aan Bixin"}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Video className="h-4 w-4 text-[#013565]" />
                      <span>
                        Videos:{" "}
                        <span className="font-bold text-[#013565]">
                          {studentDetails.videoStats.watched}/{studentDetails.videoStats.total}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await fetchStudentVideos(selectedStudent?.student_id || "")
                      setShowVideoDialog(true)
                    }}
                    className="text-[#013565] border-[#013565] hover:bg-[#013565] hover:text-white transition-colors"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Select Assignment */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#013565] text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  2
                </span>
                <h3 className="text-lg font-semibold text-[#013a5f]">Select Assignment</h3>
              </div>
              <div className="pl-11">
                <label className="block text-sm font-medium text-gray-600 mb-2">Choose Assignment</label>
                <Select
                  value={selectedAssignment?.id || ""} // Ensure value is string or undefined
                  onValueChange={handleAssignmentChange}
                  disabled={!selectedStudent}
                >
                  <SelectTrigger className="h-12 w-full border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20 text-gray-900 bg-white">
                    <SelectValue
                      placeholder={selectedStudent ? "Select an assignment..." : "Please select a student first"}
                      className="text-gray-900"
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-white">
                    {assignments
                      .filter((assignment) => {
                        if (!selectedStudent) return false
                        return String(assignment.class_id) === String(selectedStudent.class_id)
                      })
                      .map((assignment) => (
                        <SelectItem key={assignment.id} value={String(assignment.id)} className="text-gray-900">
                          {assignment.title} (Max: {assignment.max_marks} marks)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Existing Marks Warning */}
            {existingMarks && (
              <div className="ml-11 flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">Marks Already Entered</p>
                  <p className="text-sm text-amber-700">
                    Previous:{" "}
                    <span className="font-bold">
                      {existingMarks.marks_obtained}/{existingMarks.max_marks}
                    </span>{" "}
                    ({existingMarks.percentage.toFixed(1)}%) - Entered on{" "}
                    {new Date(existingMarks.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Enter Marks */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#ff1b4a] text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  3
                </span>
                <h3 className="text-lg font-semibold text-[#013a5f]">Enter Marks</h3>
                {selectedAssignment && (
                  <span className="ml-auto text-sm bg-gradient-to-r from-[#013565] to-[#024a8c] text-white px-4 py-1.5 rounded-full font-medium shadow-md">
                    Maximum: {selectedAssignment.max_marks} marks
                  </span>
                )}
              </div>
              <div className="pl-11">
                <Input
                  type="number"
                  placeholder={
                    selectedAssignment
                      ? `Enter marks (0-${selectedAssignment.max_marks})`
                      : "Select an assignment first"
                  }
                  value={marksObtained}
                  onChange={(e) => setMarksObtained(e.target.value)}
                  min={0}
                  max={selectedAssignment?.max_marks}
                  disabled={!selectedAssignment}
                  className="h-16 text-3xl font-bold text-center border-2 border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20 rounded-xl"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 ml-11">
              <Button
                onClick={handleSaveMarks}
                disabled={!selectedStudent || !selectedAssignment || !marksObtained}
                className="flex-1 bg-gradient-to-r from-[#013565] to-[#024a8c] hover:from-[#012855] hover:to-[#013d7a] text-white shadow-lg shadow-[#013565]/30 h-14 text-lg font-semibold disabled:opacity-50 rounded-xl"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Marks
              </Button>
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:bg-gray-100 h-14 text-lg font-medium rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-4xl bg-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            {/* Update Dialog Title and Description */}
            <DialogTitle className="text-xl text-[#1e3a5f]">
              Horumar Video-ga - {selectedStudent?.full_name}
            </DialogTitle>
            <p className="text-sm text-gray-600">Raadi videos-ka la daawday iyo la dhammeeyay</p>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {studentVideos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Video className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Xog video ma jirto</p>
              </div>
            ) : (
              studentVideos.map((video) => (
                <div
                  key={video.video_id}
                  className={`p-4 rounded-lg border-2 ${
                    Number(video.completion_percentage) >= 80
                      ? "bg-green-50 border-green-200"
                      : Number(video.completion_percentage) > 0
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {Number(video.completion_percentage) >= 80 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : Number(video.completion_percentage) > 0 ? (
                        <Video className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{video.video_title || `Video #${video.video_id}`}</p>
                        <p className="text-sm text-gray-600">
                          {/* Update Somali translations */}
                          {Number(video.completion_percentage) >= 80
                            ? "La Dhammeeyay"
                            : Number(video.completion_percentage) > 0
                              ? "Socda"
                              : "Lama Daawin"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {Number(video.completion_percentage || 0).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {/* Update Somali translations */}
                        {Math.floor((video.watch_duration || 0) / 60)} daqiiqo la daawday
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        Number(video.completion_percentage) >= 80
                          ? "bg-green-500"
                          : Number(video.completion_percentage) > 0
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                      }`}
                      style={{ width: `${Number(video.completion_percentage || 0)}%` }}
                    />
                  </div>

                  {(video.total_skips > 0 || video.skip_events?.length > 0) && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-700">Booditaanada La Ogaaday</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-red-100">
                          <SkipForward className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-xs text-gray-500">Tirada Booditaanada</p>
                            <p className="font-semibold text-red-600">
                              {video.total_skips || video.skip_events?.length || 0} jeer
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-red-100">
                          <FastForward className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-xs text-gray-500">Wadarta La Booday</p>
                            <p className="font-semibold text-red-600">
                              {Math.round((video.total_skipped_seconds || 0) / 60)} daqiiqo
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Skip Events List */}
                      {video.skip_events && video.skip_events.length > 0 && (
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          <p className="text-xs font-medium text-gray-600 mb-1">Faahfaahinta Booditaanada:</p>
                          {video.skip_events.slice(0, 5).map((skip: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs bg-white p-2 rounded border border-red-100"
                            >
                              <span className="text-gray-600">
                                {Math.floor(skip.skip_from / 60)}:{String(skip.skip_from % 60).padStart(2, "0")}
                                {" → "}
                                {Math.floor(skip.skip_to / 60)}:{String(skip.skip_to % 60).padStart(2, "0")}
                              </span>
                              <span className="text-red-600 font-medium">+{skip.skip_amount}s la booday</span>
                            </div>
                          ))}
                          {video.skip_events.length > 5 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{video.skip_events.length - 5} booditaan kale...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {(!video.total_skips || video.total_skips === 0) && Number(video.completion_percentage) >= 80 && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-700">
                        Si fiican ayuu u daawday - wax booditaan ah lama ogaan
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowVideoDialog(false)} variant="outline">
              Xir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0f172a]">
              <Pencil className="h-5 w-5 text-blue-600" />
              Edit Marks
            </DialogTitle>
          </DialogHeader>
          {editingMark && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Student:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {editingMark.student_name || editingMark.student_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Assignment:</span>
                  <span className="text-sm font-medium text-gray-900">{editingMark.assignment_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Max Marks:</span>
                  <span className="text-sm font-medium text-gray-900">{editingMark.max_marks}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Marks</label>
                <Input
                  type="number"
                  min={0}
                  max={editingMark.max_marks}
                  value={editMarksValue}
                  onChange={(e) => setEditMarksValue(e.target.value)}
                  className="text-gray-900"
                  placeholder={`Enter marks (0-${editingMark.max_marks})`}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditMark} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Tirtir Marks
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Ma hubtaa inaad rabto inaad tirtirto marks-kan? Ficilkan dib looma celin karo.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Maya, Ka noqo
            </Button>
            <Button
              onClick={() => deleteConfirmId && handleDeleteMark(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Haa, Tirtir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
