"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Video, CheckCircle2, TrendingUp, Link2 } from "lucide-react"
import { getStudents, getCourses } from "@/lib/data"
import { getUniversityStudents, getVideos } from "@/lib/admin-data"
import Link from "next/link"

export default function AdminOverviewPage() {
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalVideos, setTotalVideos] = useState(0)
  const [completions, setCompletions] = useState(0)
  const [avgProgress, setAvgProgress] = useState(0)

  useEffect(() => {
    const students = getStudents()
    const uniStudents = getUniversityStudents()
    const courses = getCourses()
    const videos = getVideos()

    setTotalStudents(students.length + uniStudents.length)
    setTotalVideos(courses.reduce((acc, c) => acc + c.lessonsCount, 0))

    const allStudents = [...students, ...uniStudents]
    const completed = allStudents.filter(
      (s) => s.avgProgress >= 100 || (s.completedLessons === s.totalLessons && s.totalLessons > 0),
    ).length
    setCompletions(completed)

    const avgProg =
      allStudents.length > 0
        ? allStudents.reduce((acc, s) => acc + (s.avgProgress || s.progress || 0), 0) / allStudents.length
        : 0
    setAvgProgress(Math.round(avgProg * 10) / 10)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back to Markano Admin Panel</p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1e3a5f] mb-1">Student Group View</h3>
              <p className="text-sm text-gray-600">Share this link with students to check their group information</p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const link = `${window.location.origin}/student/group`
                navigator.clipboard.writeText(link)
                alert("Student Group View link copied to clipboard!")
              }}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Videos</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Video className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{totalVideos}</div>
            <p className="text-xs text-gray-500 mt-1">Course materials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completions</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{completions}</div>
            <p className="text-xs text-gray-500 mt-1">Videos completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Progress</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{avgProgress}%</div>
            <p className="text-xs text-gray-500 mt-1">Overall completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/all-students">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle className="text-lg">Manage Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">View all students, track progress, and identify performance</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/courses">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">Manage Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Add, edit courses and organize learning content</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">View Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Detailed charts and reports on student performance</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
