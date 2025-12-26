"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import {
  Users,
  Search,
  ArrowLeft,
  Eye,
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Mail,
  Building,
  Download,
} from "lucide-react"
import Link from "next/link"

interface Student {
  id: number
  full_name: string
  email: string
  university: string
  field_of_study: string
  account_status: string
  created_at: string
  enrolled_tracks: number
  last_enrollment: string
}

interface StudentDetail {
  id: number
  full_name: string
  email: string
  university: string
  field_of_study: string
  account_status: string
  enrollments: Array<{
    track_id: number
    track_name: string
    current_level_name: string
    enrollment_status: string
    enrolled_at: string
    completed_lessons: number
    total_lessons: number
  }>
}

interface Track {
  id: number
  name: string
}

export default function GoldStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    fetchStudents()
    fetchTracks()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/gold/students")
      const data = await res.json()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const fetchTracks = async () => {
    try {
      const res = await fetch("/api/gold/tracks")
      const data = await res.json()
      setTracks(data)
    } catch (error) {
      console.error("Error fetching tracks:", error)
    }
  }

  const viewStudentDetail = async (student: Student) => {
    try {
      const enrollmentsRes = await fetch(`/api/gold/enrollments?studentId=${student.id}`)
      const enrollments = await enrollmentsRes.json()

      setSelectedStudent({
        ...student,
        enrollments: enrollments,
      })
      setShowDetailDialog(true)
    } catch (error) {
      console.error("Error fetching student details:", error)
      toast.error("Khalad ayaa dhacay")
    }
  }

  const updateStudentStatus = async (studentId: number, newStatus: string) => {
    try {
      await fetch("/api/gold/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: studentId, account_status: newStatus }),
      })
      toast.success("Status-ka waa la cusboonaysiiyay")
      fetchStudents()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.account_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: students.length,
    active: students.filter((s) => s.account_status === "active").length,
    pending: students.filter((s) => s.account_status === "pending").length,
    suspended: students.filter((s) => s.account_status === "suspended").length,
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("so-SO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Shaqeynaya</Badge>
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400">Sugaya</Badge>
      case "suspended":
        return <Badge className="bg-red-500/20 text-red-400">La joojiyay</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">{status}</Badge>
    }
  }

  const exportToExcel = () => {
    const headers = ["Magaca", "Email", "Jaamacada", "Fanka", "Status", "Tracks", "Taariikhda"]
    const rows = filteredStudents.map((s) => [
      s.full_name,
      s.email,
      s.university || "",
      s.field_of_study || "",
      s.account_status,
      s.enrolled_tracks || 0,
      formatDate(s.created_at),
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `gold_students_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/gold">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Maamulka Ardayda</h1>
              <p className="text-slate-400">La socosho horumarkoodda iyo maamul account-kooda</p>
            </div>
          </div>
          <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm text-slate-400">Wadarta</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-sm text-slate-400">Shaqeynaya</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.pending}</p>
                  <p className="text-sm text-slate-400">Sugaya</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.suspended}</p>
                  <p className="text-sm text-slate-400">La joojiyay</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10 bg-slate-900 border-slate-600 text-white"
                  placeholder="Raadi magaca ama email-ka..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white">
                    Dhammaan
                  </SelectItem>
                  <SelectItem value="active" className="text-white">
                    Shaqeynaya
                  </SelectItem>
                  <SelectItem value="pending" className="text-white">
                    Sugaya
                  </SelectItem>
                  <SelectItem value="suspended" className="text-white">
                    La joojiyay
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Ardayda ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400 text-center py-8">Loading...</p>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Wali ma jiro arday</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Arday</TableHead>
                      <TableHead className="text-slate-400">Jaamacada</TableHead>
                      <TableHead className="text-slate-400">Tracks</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Taariikhda</TableHead>
                      <TableHead className="text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{student.full_name}</p>
                            <p className="text-sm text-slate-400">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">{student.university || "-"}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-400">{student.enrolled_tracks || 0} Track</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(student.account_status)}</TableCell>
                        <TableCell className="text-slate-400">{formatDate(student.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-blue-400"
                              onClick={() => viewStudentDetail(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {student.account_status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                                onClick={() => updateStudentStatus(student.id, "active")}
                              >
                                Oggolaaw
                              </Button>
                            )}
                            {student.account_status === "active" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs"
                                onClick={() => updateStudentStatus(student.id, "suspended")}
                              >
                                Jooji
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-400" />
                </div>
                {selectedStudent?.full_name}
              </DialogTitle>
              <DialogDescription className="text-slate-400">Faahfaahinta ardayga</DialogDescription>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-6 mt-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300 text-sm">{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300 text-sm">{selectedStudent.university || "N/A"}</span>
                  </div>
                </div>

                {/* Enrollments */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-400" />
                    Tracks-ka uu ka qeyb qaatay
                  </h4>
                  {selectedStudent.enrollments?.length === 0 ? (
                    <div className="text-center py-6 bg-slate-900 rounded-lg">
                      <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">Wali ma jiro track uu ka qeyb qaato</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudent.enrollments?.map((enrollment, index) => (
                        <div key={index} className="p-4 bg-slate-900 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-white font-medium">{enrollment.track_name}</h5>
                            <Badge
                              className={
                                enrollment.enrollment_status === "active"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-slate-500/20 text-slate-400"
                              }
                            >
                              {enrollment.enrollment_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">
                            Level-ka hadda: {enrollment.current_level_name || "N/A"}
                          </p>
                          <div className="flex items-center gap-3">
                            <Progress
                              value={
                                enrollment.total_lessons > 0
                                  ? (enrollment.completed_lessons / enrollment.total_lessons) * 100
                                  : 0
                              }
                              className="flex-1 h-2 bg-slate-700"
                            />
                            <span className="text-xs text-slate-400">
                              {enrollment.completed_lessons}/{enrollment.total_lessons} cashar
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
