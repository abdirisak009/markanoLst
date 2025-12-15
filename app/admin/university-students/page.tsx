"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Plus, Edit, Trash2, Upload, Download, Search, Check, ChevronsUpDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface University {
  id: number
  name: string
  abbreviation: string
}

interface Class {
  id: number
  name: string
  type: string
  university_id: number
  university_name: string
}

interface UniversityStudent {
  id: number
  student_id: string
  full_name: string
  phone?: string
  address?: string
  gender?: string
  university_id: number
  class_id: number
  status: string
  registered_at: string
  university_name?: string
  class_name?: string
}

export default function UniversityStudentsPage() {
  const [students, setStudents] = useState<UniversityStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<UniversityStudent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all") // Updated default value
  const [universities, setUniversities] = useState<University[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState<UniversityStudent | null>(null)
  const [loading, setLoading] = useState(false)
  const [classSearchOpen, setClassSearchOpen] = useState(false)
  const [formData, setFormData] = useState({
    student_id: "",
    full_name: "",
    phone: "",
    address: "",
    gender: "",
    university_id: "",
    class_id: "",
    status: "Active",
  })
  const [classSearchQuery, setClassSearchQuery] = useState("")

  const searchFilteredClasses = filteredClasses.filter(
    (cls) =>
      cls.name.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
      cls.university_name?.toLowerCase().includes(classSearchQuery.toLowerCase()),
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [studentsRes, universitiesRes, classesRes] = await Promise.all([
          fetch("/api/university-students"),
          fetch("/api/universities"),
          fetch("/api/classes"),
        ])

        const studentsData = await studentsRes.json()
        const universitiesData = await universitiesRes.json()
        const classesData = await classesRes.json()

        console.log("[v0] Loaded classes:", classesData)
        console.log("[v0] Total classes count:", classesData.length)

        setStudents(studentsData)
        setFilteredStudents(studentsData)
        setUniversities(Array.isArray(universitiesData) ? universitiesData : [])
        setClasses(classesData)
      } catch (error) {
        console.error("[v0] Error loading data:", error)
        setUniversities([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setLoading(true)
        const [studentsRes, universitiesRes, classesRes] = await Promise.all([
          fetch(`/api/university-students?class_id=${selectedClassFilter}`),
          fetch("/api/universities"),
          fetch("/api/classes"),
        ])

        const studentsData = await studentsRes.json()
        const universitiesData = await universitiesRes.json()
        const classesData = await classesRes.json()

        setStudents(studentsData)
        setFilteredStudents(studentsData)
        setUniversities(Array.isArray(universitiesData) ? universitiesData : [])
        setClasses(classesData)
      } catch (error) {
        console.error("[v0] Error loading filtered data:", error)
        setUniversities([])
      } finally {
        setLoading(false)
      }
    }

    if (selectedClassFilter === "all") {
      fetchData()
    } else {
      fetchFilteredData()
    }
  }, [selectedClassFilter])

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.class_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredStudents(filtered)
  }, [searchQuery, students])

  useEffect(() => {
    if (formData.university_id) {
      const filtered = classes.filter(
        (c) => c.university_id === Number.parseInt(formData.university_id) && c.type === "University",
      )
      console.log("[v0] Filtered classes for university:", formData.university_id, filtered)
      setFilteredClasses(filtered)
    } else {
      const universityClasses = classes.filter((c) => c.type === "University")
      console.log("[v0] All university classes:", universityClasses)
      setFilteredClasses(universityClasses)
    }
  }, [formData.university_id, classes])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [studentsRes, universitiesRes, classesRes] = await Promise.all([
        fetch("/api/university-students"),
        fetch("/api/universities"),
        fetch("/api/classes"),
      ])

      const studentsData = await studentsRes.json()
      const universitiesData = await universitiesRes.json()
      const classesData = await classesRes.json()

      console.log("[v0] Loaded classes:", classesData)
      console.log("[v0] Total classes count:", classesData.length)

      setStudents(studentsData)
      setFilteredStudents(studentsData)
      setUniversities(Array.isArray(universitiesData) ? universitiesData : [])
      setClasses(classesData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      setUniversities([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredData = async (classId: string) => {
    try {
      setLoading(true)
      const [studentsRes, universitiesRes, classesRes] = await Promise.all([
        fetch(`/api/university-students?class_id=${classId}`),
        fetch("/api/universities"),
        fetch("/api/classes"),
      ])

      const studentsData = await studentsRes.json()
      const universitiesData = await universitiesRes.json()
      const classesData = await classesRes.json()

      setStudents(studentsData)
      setFilteredStudents(studentsData)
      setUniversities(Array.isArray(universitiesData) ? universitiesData : [])
      setClasses(classesData)
    } catch (error) {
      console.error("[v0] Error loading filtered data:", error)
      setUniversities([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        university_id: Number.parseInt(formData.university_id),
        class_id: Number.parseInt(formData.class_id),
      }

      if (editingStudent) {
        const response = await fetch("/api/university-students", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingStudent.id }),
        })

        if (!response.ok) throw new Error("Failed to update student")
      } else {
        const response = await fetch("/api/university-students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error("Failed to create student")
      }

      setShowDialog(false)
      setEditingStudent(null)
      setFormData({
        student_id: "",
        full_name: "",
        phone: "",
        address: "",
        gender: "",
        university_id: "",
        class_id: "",
        status: "Active",
      })
      await fetchData()
    } catch (error) {
      console.error("[v0] Submit error:", error)
      alert("Failed to save student")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student: UniversityStudent) => {
    setEditingStudent(student)
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      phone: student.phone || "",
      address: student.address || "",
      gender: student.gender || "",
      university_id: student.university_id.toString(),
      class_id: student.class_id.toString(),
      status: student.status,
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return

    try {
      setLoading(true)
      const response = await fetch(`/api/university-students?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete student")

      await fetchData()
    } catch (error) {
      console.error("[v0] Delete error:", error)
      alert("Failed to delete student")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = [
      ["Student ID", "Full Name", "Phone", "Address", "Gender", "University", "Class", "Status"],
      [
        "132244",
        "Ahmed Ali",
        "252617665544",
        "Hodan, Mogadishu",
        "Male",
        "Somali International University",
        "CMS3D",
        "Active",
      ],
      [
        "132245",
        "Fatima Hassan",
        "0612345678",
        "Bakara, Mogadishu",
        "Female",
        "SIMAD University",
        "SIMAD-Semester 1-A",
        "Active",
      ],
      [
        "132246",
        "Mohamed Omar",
        "619876543",
        "Hodan, Mogadishu",
        "Male",
        "Mogadishu University",
        "MU-Year 1-A",
        "Active",
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Students Template")

    const instructions = [
      { Instruction: "Fill in student data following the template format" },
      { Instruction: "Student ID must be unique" },
      { Instruction: "Gender options: Male, Female" },
      { Instruction: "Status options: Active, Disabled" },
      {
        Instruction:
          "University Name: Use EXACT university name (Somali International University, SIMAD University, Mogadishu University, UNISO University)",
      },
      {
        Instruction: "Class Name: Use exact class name from the system (e.g., CMS3D, SIMAD-Semester 1-A, MU-Year 1-A)",
      },
      { Instruction: "Phone: Any format accepted (252XXXXXXXXX, 06XXXXXXXX, or just numbers)" },
    ]
    const wsInstructions = XLSX.utils.json_to_sheet(instructions)
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions")

    // Create blob and download in browser
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "university_students_template.xlsx"
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      console.log("[v0] Starting Excel upload, file:", file.name)

      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      console.log("[v0] Parsed Excel data:", jsonData)

      const studentsData = jsonData.map((row: any) => ({
        student_id: String(row["Student ID"] || ""),
        full_name: String(row["Full Name"] || ""),
        phone: String(row["Phone"] || ""),
        address: String(row["Address"] || ""),
        gender: String(row["Gender"] || ""),
        university_name: String(row["University"] || ""),
        class_name: String(row["Class"] || ""),
        status: String(row["Status"] || "Active"),
      }))

      console.log("[v0] Formatted students data:", studentsData)

      const response = await fetch("/api/university-students/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: studentsData }),
      })

      const result = await response.json()
      console.log("[v0] Upload result:", result)

      if (result.success) {
        toast({
          title: "Success",
          description: `${result.inserted} students uploaded successfully. ${result.errors > 0 ? `${result.errors} errors.` : ""}`,
        })

        if (result.errorDetails && result.errorDetails.length > 0) {
          console.error("[v0] Upload errors:", result.errorDetails)
        }

        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload students",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to process Excel file",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      if (e.target) e.target.value = ""
    }
  }

  const handleUniversityChange = (value: string) => {
    setFormData({ ...formData, university_id: value, class_id: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1e3a5f]">University Students</h1>
              <p className="text-gray-500 mt-1">Manage university students</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2 shadow-sm hover:shadow-md transition-shadow bg-transparent"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <Button
              variant="outline"
              className="gap-2 shadow-sm hover:shadow-md transition-shadow bg-transparent"
              onClick={() => document.getElementById("uni-excel-upload")?.click()}
              disabled={loading}
            >
              <Upload className="h-4 w-4" />
              Upload Excel
            </Button>
            <input
              id="uni-excel-upload"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleExcelUpload}
            />
          </div>
        </div>

        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="manage">Manage Students</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            <div className="flex gap-3">
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-[#ef4444] hover:bg-[#dc2626] gap-2 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => {
                      setEditingStudent(null)
                      setFormData({
                        student_id: "",
                        full_name: "",
                        phone: "",
                        address: "",
                        gender: "",
                        university_id: "",
                        class_id: "",
                        status: "Active",
                      })
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {editingStudent ? "Edit University Student" : "Add University Student"}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-2">
                      Enter the student details to {editingStudent ? "update" : "add"} them to the system
                    </p>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student_id" className="text-sm font-medium">
                        Student ID *
                      </Label>
                      <Input
                        id="student_id"
                        placeholder="e.g., 132244"
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        required
                        disabled={!!editingStudent}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="full_name"
                        placeholder="Enter full name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                        placeholder="252XXXXXXXXX, 06XXXXXXXX, or just numbers"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Address
                      </Label>
                      <Input
                        id="address"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger className="bg-transparent h-11">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key="male" value="Male">
                            Male
                          </SelectItem>
                          <SelectItem key="female" value="Female">
                            Female
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university" className="text-sm font-medium">
                        University *
                      </Label>
                      <Select value={formData.university_id} onValueChange={handleUniversityChange}>
                        <SelectTrigger className="bg-transparent h-11">
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map((uni) => (
                            <SelectItem key={uni.id} value={uni.id.toString()}>
                              {uni.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="class">Class *</Label>
                      {!formData.university_id ? (
                        <div className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                          Please select a university first
                        </div>
                      ) : (
                        <Popover open={classSearchOpen} onOpenChange={setClassSearchOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={classSearchOpen}
                              className="w-full h-11 justify-between bg-transparent"
                            >
                              {formData.class_id
                                ? filteredClasses.find((cls) => cls.id === Number.parseInt(formData.class_id))?.name
                                : `Select class (${filteredClasses.length} available)`}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0">
                            <div className="flex flex-col">
                              <div className="flex items-center border-b px-3">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <input
                                  type="text"
                                  placeholder="Search class..."
                                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500"
                                  value={classSearchQuery}
                                  onChange={(e) => setClassSearchQuery(e.target.value)}
                                />
                              </div>
                              <div className="max-h-[300px] overflow-y-auto">
                                {searchFilteredClasses.length === 0 ? (
                                  <div className="py-6 text-center text-sm text-gray-500">No class found.</div>
                                ) : (
                                  <div className="p-1">
                                    {searchFilteredClasses.map((cls) => (
                                      <button
                                        key={cls.id}
                                        onClick={() => {
                                          setFormData({ ...formData, class_id: cls.id.toString() })
                                          setClassSearchOpen(false)
                                          setClassSearchQuery("")
                                        }}
                                        className="relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            formData.class_id === cls.id.toString() ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        {cls.name} ({cls.university_name})
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Status
                      </Label>
                      <div className="flex items-center gap-2 h-11">
                        <Button
                          type="button"
                          variant={formData.status === "Active" ? "default" : "outline"}
                          className={cn(
                            "flex-1 h-full",
                            formData.status === "Active" ? "bg-green-500 hover:bg-green-600" : "",
                          )}
                          onClick={() => setFormData({ ...formData, status: "Active" })}
                        >
                          Active
                        </Button>
                        <Button
                          type="button"
                          variant={formData.status === "Disabled" ? "default" : "outline"}
                          className={cn(
                            "flex-1 h-full",
                            formData.status === "Disabled" ? "bg-red-500 hover:bg-red-600" : "",
                          )}
                          onClick={() => setFormData({ ...formData, status: "Disabled" })}
                        >
                          Disabled
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDialog(false)}
                        className="h-11 px-6"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-[#ef4444] hover:bg-[#dc2626] h-11 px-6" disabled={loading}>
                        {loading ? "Saving..." : editingStudent ? "Update" : "Add"} Student
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#1e3a5f]">All University Students</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} found
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
                      <SelectTrigger className="w-64 bg-white h-11">
                        <SelectValue placeholder="Filter by Class - All Classes" />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-h-80">
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes
                          .filter((c) => c.type === "University")
                          .map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              {cls.name} ({cls.university_name})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, ID, university, or class..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">Loading...</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-12 text-center">
                    <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      {searchQuery ? "No students found matching your search" : "No university students yet"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Student ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Full Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Address
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            University
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Class
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
                            className={`transition-all hover:bg-blue-50 hover:shadow-sm ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{student.student_id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.full_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{student.phone}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{student.gender || "-"}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{student.address || "-"}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{student.university_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{student.class_name}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1.5 text-xs rounded-full font-semibold shadow-sm ${
                                  student.status === "Active"
                                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                                    : "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(student)}
                                  title="Edit"
                                  className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                  disabled={loading}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(student.id)}
                                  title="Delete"
                                  className="hover:bg-red-100 hover:text-red-600 transition-colors"
                                  disabled={loading}
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
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            {/* Bulk Operations Content */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
