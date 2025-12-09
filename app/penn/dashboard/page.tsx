"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Award, PlayCircle, LogOut, GraduationCap } from "lucide-react"

interface Enrollment {
  id: number
  course_id: number
  title: string
  description: string
  instructor: string
  thumbnail: string | null
  progress: number
  modules_count: number
  lessons_count: number
  completed_lessons: number
  enrolled_at: string
}

export default function PennDashboard() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pennStudent = localStorage.getItem("pennStudent")
    if (!pennStudent) {
      router.push("/penn/login")
      return
    }

    const studentData = JSON.parse(pennStudent)
    setStudent(studentData)
    fetchEnrollments(studentData.id)
  }, [router])

  const fetchEnrollments = async (studentId: string) => {
    try {
      const response = await fetch(`/api/enrollments?studentId=${studentId}`)
      const data = await response.json()
      setEnrollments(data)
    } catch (error) {
      console.error("[v0] Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("pennStudent")
    router.push("/penn/login")
  }

  if (!student) return null

  const totalLessons = enrollments.reduce((sum, e) => sum + e.lessons_count, 0)
  const completedLessons = enrollments.reduce((sum, e) => sum + e.completed_lessons, 0)
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{student.name}</h2>
              <p className="text-sm text-gray-600">
                ID: {student.id} • Class: {student.class}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {student.name}!</h1>
          <p className="text-gray-600 text-lg">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrollments.length}</div>
              <p className="text-xs opacity-80 mt-1">Active courses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
              <Award className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedLessons}</div>
              <p className="text-xs opacity-80 mt-1">Out of {totalLessons} lessons</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <GraduationCap className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overallProgress}%</div>
              <p className="text-xs opacity-80 mt-1">Keep going!</p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            <Button onClick={() => router.push("/")} variant="outline">
              Browse Courses
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : enrollments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No enrolled courses yet</h3>
                <p className="text-gray-600 mb-4">Start learning by enrolling in a course</p>
                <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-xl transition-all duration-200 overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{enrollment.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{enrollment.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-blue-600">
                          {enrollment.completed_lessons}/{enrollment.lessons_count} lessons
                        </span>
                      </div>
                      <Progress
                        value={
                          enrollment.lessons_count > 0
                            ? (enrollment.completed_lessons / enrollment.lessons_count) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>

                    <Button
                      onClick={() => router.push(`/penn/courses/${enrollment.course_id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
