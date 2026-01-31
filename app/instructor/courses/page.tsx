"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BookOpen, Loader2, Edit } from "lucide-react"
import { toast } from "sonner"

interface Course {
  id: number
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  instructor_name: string | null
  estimated_duration_minutes: number
  difficulty_level: string
  price: number
  is_active: boolean
  is_featured: boolean
  order_index: number
  created_at: string
  modules_count: number
  lessons_count: number
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/instructor/courses", { credentials: "include" })
      if (res.status === 401) {
        window.location.href = "/instructor/login?redirect=/instructor/courses"
        return
      }
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load courses")
      setCourses([])
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-[#e63946]" />
          Learning Courses
        </h1>
        <p className="text-slate-500 mt-1">Courses assigned to you by admin. You can add modules and lessons.</p>
      </div>

      {courses.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No courses assigned to you yet</p>
            <p className="text-slate-500 text-sm mt-1">Admin creates learning courses and assigns you as instructor. Contact admin to be assigned to a course.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Slug</TableHead>
                  <TableHead className="font-semibold">Modules / Lessons</TableHead>
                  <TableHead className="font-semibold">Difficulty</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{c.slug}</TableCell>
                    <TableCell>
                      <span className="text-slate-600 text-sm">
                        {c.modules_count ?? 0} / {c.lessons_count ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {c.difficulty_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">${Number(c.price || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={c.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}>
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/instructor/courses/${c.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
