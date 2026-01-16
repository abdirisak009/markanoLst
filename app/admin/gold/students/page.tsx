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
  User,
  Phone,
  MoreVertical,
  Trash2,
  AlertTriangle,
  Loader2,
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
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!studentToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/gold/students?id=${studentToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete student")
      }

      toast.success(`Ardayga ${studentToDelete.full_name} waa la tirtay`)
      setShowDeleteDialog(false)
      setStudentToDelete(null)
      fetchStudents()
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Khalad ayaa dhacay markii la tirtay ardayga")
    } finally {
      setDeleting(false)
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
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-4 py-1.5 font-bold text-xs shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all whitespace-nowrap">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5 inline" />
            Shaqeynaya
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1.5 font-bold text-xs shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 transition-all whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 mr-1.5 inline" />
            Sugaya
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 px-4 py-1.5 font-bold text-xs shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 transition-all whitespace-nowrap">
            <XCircle className="h-3.5 w-3.5 mr-1.5 inline" />
            La joojiyay
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 px-4 py-1.5 font-bold text-xs shadow-lg whitespace-nowrap">
            {status}
          </Badge>
        )
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/gold">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Maamulka Ardayda</h1>
              <p className="text-gray-600 mt-1">La socosho horumarkoodda iyo maamul account-kooda</p>
            </div>
          </div>
          <Button onClick={exportToExcel} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20">
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600 mt-1">Wadarta</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                  <p className="text-sm text-gray-600 mt-1">Shaqeynaya</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-sm text-gray-600 mt-1">Sugaya</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.suspended}</p>
                  <p className="text-sm text-gray-600 mt-1">La joojiyay</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-r from-white via-blue-50/30 to-white border-2 border-gray-200 shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              {/* Search Input - Enhanced */}
              <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                      <Search className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <Input
                    className="pl-16 pr-5 h-14 bg-white border-2 border-gray-200 text-gray-900 text-base font-medium placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
                    placeholder="Raadi magaca ama email-ka ardayga..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter - Enhanced */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-64 h-14 bg-white border-2 border-gray-200 text-gray-900 font-semibold focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 px-5">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <SelectValue placeholder="Filter by Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-2xl">
                      <SelectItem value="all" className="text-gray-900 font-medium py-3 hover:bg-blue-50 focus:bg-blue-50">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          Dhammaan
                        </div>
                      </SelectItem>
                      <SelectItem value="active" className="text-gray-900 font-medium py-3 hover:bg-emerald-50 focus:bg-emerald-50">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          Shaqeynaya
                        </div>
                      </SelectItem>
                      <SelectItem value="pending" className="text-gray-900 font-medium py-3 hover:bg-amber-50 focus:bg-amber-50">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          Sugaya
                        </div>
                      </SelectItem>
                      <SelectItem value="suspended" className="text-gray-900 font-medium py-3 hover:bg-red-50 focus:bg-red-50">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          La joojiyay
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                  }}
                  className="h-14 px-6 border-2 border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Nadiifi
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {(searchQuery || statusFilter !== "all") && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Filters active:</span>
                {searchQuery && (
                  <Badge className="bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1.5 font-semibold">
                    <Search className="h-3 w-3 mr-1.5" />
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-2 hover:text-blue-900"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge className="bg-purple-100 text-purple-700 border border-purple-300 px-3 py-1.5 font-semibold">
                    {statusFilter === "active" && <CheckCircle className="h-3 w-3 mr-1.5" />}
                    {statusFilter === "pending" && <Clock className="h-3 w-3 mr-1.5" />}
                    {statusFilter === "suspended" && <XCircle className="h-3 w-3 mr-1.5" />}
                    {statusFilter === "active" ? "Shaqeynaya" : statusFilter === "pending" ? "Sugaya" : "La joojiyay"}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="ml-2 hover:text-purple-900"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-white border border-gray-200 shadow-2xl overflow-hidden">
          <CardHeader className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-blue-50/30 to-gray-50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-3xl font-extrabold">Ardayda</CardTitle>
                  <p className="text-base text-gray-600 mt-1.5 font-medium">
                    {filteredStudents.length} arday {filteredStudents.length === 1 ? "ah" : "oo"} waa la helay
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center gap-3 text-gray-600">
                  <div className="h-6 w-6 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold">Loading ardayda...</p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 mb-5">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-900 font-bold text-xl mb-2">Ma jiro arday</p>
                <p className="text-gray-600 text-sm">Wali ma jiro arday la heli karo</p>
              </div>
            ) : (
              <div className="w-full">
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-b-2 border-gray-300 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 hover:from-gray-800 hover:via-slate-700 hover:to-gray-800 transition-all shadow-lg">
                        <TableHead className="text-white font-extrabold py-6 px-6 min-w-[280px] text-xs uppercase tracking-widest">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white font-bold">Arday</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-extrabold py-6 px-6 min-w-[180px] text-xs uppercase tracking-widest">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                              <Building className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white font-bold">Jaamacada</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-extrabold py-6 px-6 text-center min-w-[140px] text-xs uppercase tracking-widest">
                          <div className="flex items-center justify-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md">
                              <Award className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white font-bold">Tracks</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-extrabold py-6 px-6 text-center min-w-[160px] text-xs uppercase tracking-widest">
                          <div className="flex items-center justify-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-md">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white font-bold">Status</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-extrabold py-6 px-6 min-w-[160px] text-xs uppercase tracking-widest">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-md">
                              <Clock className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white font-bold">Taariikhda</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-extrabold py-6 px-6 text-center min-w-[180px] text-xs uppercase tracking-widest">
                          <div className="flex items-center justify-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg shadow-md">
                              <MoreVertical className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white font-bold">Actions</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student, index) => (
                        <TableRow
                          key={student.id}
                          className={`group border-b border-gray-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-indigo-50/50 hover:to-blue-50/80 hover:shadow-lg hover:scale-[1.005] hover:border-blue-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <TableCell className="py-5 px-6">
                            <div className="flex items-center gap-4">
                              <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                  <User className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-extrabold text-gray-900 text-base group-hover:text-blue-700 transition-colors leading-tight">
                                  {student.full_name || "N/A"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Mail className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                  <p className="text-sm text-gray-600 font-medium truncate">{student.email}</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 px-6">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0">
                                <Building className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                              </div>
                              <span className="text-gray-800 font-bold text-sm whitespace-nowrap">{student.university || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 px-6 text-center">
                            <Badge
                              variant="outline"
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-4 py-1.5 font-bold text-xs shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all group-hover:scale-105 whitespace-nowrap"
                            >
                              <Award className="h-3.5 w-3.5 mr-1.5 inline" />
                              {student.enrolled_tracks || 0} Track{student.enrolled_tracks !== 1 ? "s" : ""}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-5 px-6 text-center">{getStatusBadge(student.account_status)}</TableCell>
                          <TableCell className="py-5 px-6">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0">
                                <Clock className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                              </div>
                              <span className="text-gray-800 font-bold text-sm whitespace-nowrap">{formatDate(student.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 px-6">
                            <div className="flex items-center justify-center gap-2.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 rounded-xl transition-all border-2 border-gray-200 hover:border-blue-500 shadow-md hover:shadow-xl hover:scale-110 group"
                                onClick={() => viewStudentDetail(student)}
                                title="Eeg faahfaahinta"
                              >
                                <Eye className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                              </Button>
                              {student.account_status === "pending" && (
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 h-9 px-4 text-xs font-bold text-white shadow-xl shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all rounded-xl hover:scale-105 whitespace-nowrap"
                                  onClick={() => updateStudentStatus(student.id, "active")}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Oggolaaw
                                </Button>
                              )}
                              {student.account_status === "active" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-9 px-4 text-xs font-bold bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:via-rose-600 hover:to-red-700 text-white shadow-xl shadow-red-500/40 hover:shadow-2xl hover:shadow-red-500/50 transition-all rounded-xl hover:scale-105 whitespace-nowrap"
                                  onClick={() => updateStudentStatus(student.id, "suspended")}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Jooji
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-600 rounded-xl transition-all border-2 border-gray-200 hover:border-red-500 shadow-md hover:shadow-xl hover:scale-110 group"
                                onClick={() => handleDeleteClick(student)}
                                title="Tirtir ardayga"
                              >
                                <Trash2 className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-white border-gray-200 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-gray-900">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <span>Tirtir Ardayga</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Ma hubtaa inaad tirtid ardaygan? Tani waa hawl aan dib loo celin karin.
              </DialogDescription>
            </DialogHeader>
            {studentToDelete && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{studentToDelete.full_name}</p>
                    <p className="text-sm text-gray-600">{studentToDelete.email}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setStudentToDelete(null)
                }}
                disabled={deleting}
                className="border-gray-300"
              >
                Jooji
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Tirtira...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Haa, Tirtir
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
