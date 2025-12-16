"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Plus, Search, Edit, Trophy, Video, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

interface StudentDetails {
  name: string
  class: string
  group: string
  paymentStatus: "paid" | "unpaid"
  videoStats: { watched: number; total: number }
  studentData: any
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
      let paymentStatus = "unpaid"
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

  const fetchStudentVideos = async () => {
    if (!selectedStudent) return

    try {
      console.log("[v0] Fetching videos for student:", selectedStudent.student_id)
      // Use student_id instead of id for the API call
      const response = await fetch(`/api/videos/analytics?student_id=${selectedStudent.student_id}`)
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
        <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
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
                {loadingDetails && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading student details...</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Or Select from Dropdown</Label>
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
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students
                      .filter((student) => student.student_id && String(student.student_id).trim() !== "")
                      .map((student) => (
                        <SelectItem key={student.student_id} value={String(student.student_id)}>
                          {student.full_name} ({student.student_id})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {studentDetails && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Student Name</p>
                    <p className="text-base font-semibold text-gray-900">{studentDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Class</p>
                    <p className="text-base font-semibold text-gray-900">{studentDetails.class}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Group</p>
                    <p className="text-base font-semibold text-gray-900">{studentDetails.group}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Payment Status</p>
                    <Badge
                      className={
                        studentDetails.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-red-100 text-red-800 border-red-300"
                      }
                    >
                      {studentDetails.paymentStatus === "paid" ? "Lacag Bixiyay" : "Aan Bixin"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-blue-200 pt-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Video Progress</p>
                    <p className="text-base font-semibold text-gray-900">
                      {studentDetails.videoStats.watched} / {studentDetails.videoStats.total} Completed
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchStudentVideos}
                    className="bg-white hover:bg-gray-50"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label>Select Assignment</Label>
              <Select
                value={selectedAssignment?.id ? String(selectedAssignment.id) : undefined}
                onValueChange={handleAssignmentChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignment" />
                </SelectTrigger>
                <SelectContent>
                  {assignments
                    .filter((assignment) => assignment.id && String(assignment.id).trim() !== "")
                    .map((assignment) => (
                      <SelectItem key={assignment.id} value={String(assignment.id)}>
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

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-4xl bg-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#1e3a5f]">Video Progress - {selectedStudent?.full_name}</DialogTitle>
            <p className="text-sm text-gray-600">Track which videos have been watched and completed</p>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {studentVideos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Video className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No video data available</p>
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
                          {Number(video.completion_percentage) >= 80
                            ? "Completed"
                            : Number(video.completion_percentage) > 0
                              ? "In Progress"
                              : "Not Watched"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {Number(video.completion_percentage || 0).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.floor((video.watch_duration || 0) / 60)} min watched
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
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowVideoDialog(false)} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
