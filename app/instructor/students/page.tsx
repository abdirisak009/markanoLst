"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Loader2, Building2, GraduationCap, Upload } from "lucide-react"
import { toast } from "sonner"

interface StudentEnrollment {
  id: number
  user_id: number
  course_title?: string
  progress_percentage: number
  lessons_completed: number
  total_lessons: number
  last_accessed_at: string | null
  courses: Array<{ course_id: number; course_title: string; progress_percentage: number }>
}

interface StudentUniversity {
  id: number
  university_id: number
  full_name: string
  email: string
  phone: string | null
  student_number: string | null
  created_at: string
}

export default function InstructorStudentsPage() {
  const [source, setSource] = useState<"enrollments" | "university">("enrollments")
  const [students, setStudents] = useState<StudentEnrollment[] | StudentUniversity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/instructor/students", { credentials: "include" })
      if (res.status === 401) {
        window.location.href = "/instructor/login?redirect=/instructor/students"
        return
      }
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setSource(data.source || "enrollments")
      setStudents(data.students || [])
    } catch {
      toast.error("Failed to load students")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#e63946]" />
      </div>
    )
  }

  const isUniversity = source === "university"
  const list = students as (StudentEnrollment | StudentUniversity)[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-7 w-7 text-[#e63946]" />
            Students
          </h1>
          <p className="text-slate-500 mt-1">
            {isUniversity
              ? "University students linked to your account (bulk upload available)"
              : "Students enrolled in your courses"}
          </p>
        </div>
        {isUniversity && (
          <Button variant="outline" className="gap-2" disabled title="Bulk upload: use API POST /api/instructor/students/bulk-upload with CSV/Excel data">
            <Upload className="h-4 w-4" />
            Bulk Upload (API)
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center">
            {isUniversity ? (
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            ) : (
              <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            )}
            <p className="text-slate-600 font-medium">
              {isUniversity ? "No university students" : "No enrollments yet"}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {isUniversity
                ? "Link your account to a university in admin, or bulk upload students via API."
                : "Students will appear here when they enroll in your courses."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  {isUniversity ? (
                    <>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Student ID</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="font-semibold">User ID</TableHead>
                      <TableHead className="font-semibold">Course(s)</TableHead>
                      <TableHead className="font-semibold">Progress</TableHead>
                      <TableHead className="font-semibold">Last accessed</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((s, i) =>
                  isUniversity ? (
                    <TableRow key={(s as StudentUniversity).id ?? i} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">{(s as StudentUniversity).full_name}</TableCell>
                      <TableCell>{(s as StudentUniversity).email}</TableCell>
                      <TableCell>{(s as StudentUniversity).phone || "—"}</TableCell>
                      <TableCell>{(s as StudentUniversity).student_number || "—"}</TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={(s as StudentEnrollment).user_id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">#{(s as StudentEnrollment).user_id}</TableCell>
                      <TableCell>
                        {(s as StudentEnrollment).courses?.map((c) => c.course_title).filter(Boolean).join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{(s as StudentEnrollment).progress_percentage ?? 0}%</span>
                        {(s as StudentEnrollment).total_lessons != null && (
                          <span className="text-slate-500 text-sm ml-1">
                            ({(s as StudentEnrollment).lessons_completed}/{(s as StudentEnrollment).total_lessons})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {(s as StudentEnrollment).last_accessed_at
                          ? new Date((s as StudentEnrollment).last_accessed_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
