"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Crown,
  LogOut,
  Play,
  BookOpen,
  Trophy,
  Flame,
  Award,
  ChevronRight,
  Clock,
  CheckCircle2,
  Lock,
  TrendingUp,
  Target,
  Zap,
  Users,
  Folder,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface Student {
  id: number
  full_name: string
  email: string
}

interface Course {
  id: number
  title: string
  description: string
  thumbnail_url: string | null
  instructor_name: string
  estimated_duration_minutes: number
  difficulty_level: string
  modules_count: number
  lessons_count: number
  progress: {
    progress_percentage: number
    lessons_completed: number
    total_lessons: number
    current_lesson_id: number | null
    last_accessed_at: string | null
  }
}

interface XPData {
  total_xp: number
  current_level: number
  xp_to_next_level: number
  level_info: {
    level_name: string
    badge_icon: string
  }
  recent_xp: Array<{
    xp_amount: number
    description: string
    earned_at: string
  }>
}

interface StreakData {
  today_completed: boolean
  current_streak: number
  today_data: {
    lessons_completed: number
    xp_earned: number
  } | null
}

interface BadgeData {
  earned: Array<{
    id: number
    badge_key: string
    badge_name: string
    badge_icon: string
    earned_at: string
  }>
  all: Array<{
    id: number
    badge_key: string
    badge_name: string
    badge_icon: string
    description: string
    earned: boolean
  }>
}

export default function MarkaanoGoldDashboard() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [xpData, setXpData] = useState<XPData | null>(null)
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)

  useEffect(() => {
    const storedStudent = localStorage.getItem("gold_student")
    if (!storedStudent) {
      router.push("/gold")
      return
    }

    const studentData = JSON.parse(storedStudent)
    setStudent(studentData)
    fetchDashboardData(studentData.id)
  }, [router])

  const fetchDashboardData = async (userId: number) => {
    try {
      const [coursesRes, xpRes, streakRes, badgesRes] = await Promise.all([
        fetch(`/api/learning/courses?userId=${userId}`),
        fetch(`/api/learning/gamification/xp?userId=${userId}`),
        fetch(`/api/learning/gamification/streak?userId=${userId}`),
        fetch(`/api/learning/gamification/badges?userId=${userId}`),
      ])

      const coursesData = await coursesRes.json()
      const xpData = await xpRes.json()
      const streakData = await streakRes.json()
      const badgesData = await badgesRes.json()

      setCourses(Array.isArray(coursesData) ? coursesData : [])
      setXpData(xpData)
      setStreakData(streakData)
      setBadgeData(badgesData)

      // Find current course (most recently accessed or first in progress)
      if (Array.isArray(coursesData) && coursesData.length > 0) {
        const inProgress = coursesData.filter(
          (c: Course) => c.progress.progress_percentage > 0 && c.progress.progress_percentage < 100
        )
        if (inProgress.length > 0) {
          // Sort by last accessed
          inProgress.sort((a: Course, b: Course) => {
            const aTime = a.progress.last_accessed_at ? new Date(a.progress.last_accessed_at).getTime() : 0
            const bTime = b.progress.last_accessed_at ? new Date(b.progress.last_accessed_at).getTime() : 0
            return bTime - aTime
          })
          setCurrentCourse(inProgress[0])
        } else if (coursesData[0].progress.progress_percentage === 0) {
          // First course not started
          setCurrentCourse(coursesData[0])
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("gold_student")
    document.cookie = "goldStudentId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/gold")
  }

  const handleEnrollCourse = async (courseId: number) => {
    try {
      const storedStudent = localStorage.getItem("gold_student")
      if (!storedStudent) return

      const studentData = JSON.parse(storedStudent)
      const response = await fetch("/api/learning/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: studentData.id,
          course_id: courseId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to enroll")
      }

      toast.success("Successfully enrolled in course!")
      fetchDashboardData(studentData.id)
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll in course")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#016b62] mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] relative overflow-hidden">
      <div className="relative z-10">
        {/* Header Section */}
        <header className="border-b border-[#016b62]/10 bg-[#016b62]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-[#fcad21]" />
                  <span className="text-xl font-bold text-white">
                    <span className="text-[#fcad21]">MARKAANO</span> GOLD
                  </span>
                </div>
                <Badge className="bg-[#fcad21] text-[#1a1a1a] border-0">
                  {xpData?.level_info?.badge_icon || "🌱"} {xpData?.level_info?.level_name || "Beginner"}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white/80">Welcome back,</p>
                  <p className="text-white font-semibold">{student?.full_name || "Student"}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
                  <Zap className="h-4 w-4 text-[#fcad21]" />
                  <span className="text-white font-bold">{xpData?.total_xp || 0} XP</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Focus Area - Continue Learning Card */}
          {currentCourse ? (
            <Card className="mb-8 bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border border-[#e63946]/30 shadow-xl shadow-[#e63946]/10">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Play className="h-5 w-5 text-[#e63946]" />
                  <CardTitle className="text-2xl font-bold text-white">Continue Learning</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Pick up where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{currentCourse.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{currentCourse.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Folder className="h-4 w-4 text-[#e63946]" />
                      {currentCourse.modules_count} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-[#e63946]" />
                      {currentCourse.lessons_count} Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-[#e63946]" />
                      {Math.floor(currentCourse.estimated_duration_minutes / 60)}h {currentCourse.estimated_duration_minutes % 60}m
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-bold">{currentCourse.progress.progress_percentage}%</span>
                    </div>
                    <Progress 
                      value={currentCourse.progress.progress_percentage} 
                      className="h-3 bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {currentCourse.progress.lessons_completed} of {currentCourse.progress.total_lessons} lessons completed
                    </p>
                  </div>
                  {currentCourse.progress.current_lesson_id ? (
                    <Link href={`/learning/lessons/${currentCourse.progress.current_lesson_id}`}>
                      <Button className="w-full bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white">
                        <Play className="h-4 w-4 mr-2" />
                        Continue Lesson
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/learning/courses/${currentCourse.id}`}>
                      <Button className="w-full bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white">
                        <Target className="h-4 w-4 mr-2" />
                        Start Course
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : courses.length === 0 ? (
            <Card className="mb-8 bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border border-white/10">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
                <p className="text-gray-400 mb-4">Start your learning journey by enrolling in a course</p>
                <Link href="/learning/courses">
                  <Button className="bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Progress & Motivation Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Learning Path Section */}
              {courses.length > 0 && (
                <Card className="bg-white border border-[#016b62]/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-[#016b62] flex items-center gap-2">
                      <Target className="h-5 w-5 text-[#016b62]" />
                      Your Learning Path
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Track your progress across all courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courses.map((course) => (
                        <Link key={course.id} href={`/learning/courses/${course.id}`}>
                          <div className="p-4 rounded-lg border border-[#016b62]/10 hover:border-[#016b62]/30 bg-[#f8faf9] hover:bg-[#fcf6f0] transition-all cursor-pointer group">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold mb-1 group-hover:text-[#016b62] transition-colors">
                                  {course.title}
                                </h4>
                                <p className="text-gray-600 text-sm line-clamp-1">{course.description}</p>
                              </div>
                              {course.progress.progress_percentage === 100 && (
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span>{course.lessons_count} Lessons</span>
                              <span>{Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m</span>
                            </div>
                            <Progress 
                              value={course.progress.progress_percentage} 
                              className="h-2 bg-[#f8faf9]"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {course.progress.lessons_completed} / {course.progress.total_lessons} completed
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress & Motivation Stats */}
              <Card className="bg-white border border-[#016b62]/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#016b62] flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#016b62]" />
                    Progress & Motivation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#f8faf9] border border-[#016b62]/10">
                      <p className="text-xs text-gray-600 mb-1">Course Completion</p>
                      <p className="text-2xl font-bold text-[#016b62]">
                        {courses.length > 0
                          ? Math.round(
                              courses.reduce((acc, c) => acc + c.progress.progress_percentage, 0) / courses.length
                            )
                          : 0}%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">Daily Streak</p>
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <p className="text-2xl font-bold text-white">{streakData?.current_streak || 0}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">days in a row</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">XP Gained Today</p>
                      <p className="text-2xl font-bold text-white">
                        {streakData?.today_data?.xp_earned || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">Lessons Today</p>
                      <p className="text-2xl font-bold text-white">
                        {streakData?.today_data?.lessons_completed || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements Section */}
            <div className="space-y-6">
              <Card className="bg-white border border-[#016b62]/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#016b62] flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#016b62]" />
                    Achievements
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {badgeData?.earned.length || 0} badges earned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {badgeData?.earned.slice(0, 5).map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[#f8faf9] border border-[#016b62]/10"
                      >
                        <span className="text-2xl">{badge.badge_icon}</span>
                        <div className="flex-1">
                          <p className="text-gray-900 text-sm font-medium">{badge.badge_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(badge.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!badgeData?.earned || badgeData.earned.length === 0) && (
                      <p className="text-gray-600 text-sm text-center py-4">
                        No badges earned yet. Complete lessons to earn your first badge!
                      </p>
                    )}
                    {badgeData && badgeData.earned.length > 5 && (
                      <Link href="/learning/badges">
                        <Button variant="ghost" className="w-full text-[#016b62] hover:bg-[#016b62]/10">
                          View All Badges <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Level & XP Card */}
              <Card className="bg-[#016b62] text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <span className="text-5xl">{xpData?.level_info?.badge_icon || "🌱"}</span>
                    <h3 className="text-xl font-bold text-white mt-2">
                      {xpData?.level_info?.level_name || "Beginner"}
                    </h3>
                    <p className="text-white/80 text-sm">Level {xpData?.current_level || 1}</p>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/80">XP Progress</span>
                      <span className="text-white font-bold">
                        {xpData?.total_xp || 0} / {(xpData?.total_xp || 0) + (xpData?.xp_to_next_level || 100)}
                      </span>
                    </div>
                    <Progress
                      value={
                        xpData
                          ? ((xpData.total_xp / ((xpData.total_xp || 0) + (xpData.xp_to_next_level || 100))) *
                              100) || 0
                          : 0
                      }
                      className="h-2 bg-white/30"
                    />
                    <p className="text-xs text-white/80 mt-1 text-center">
                      {xpData?.xp_to_next_level || 100} XP to next level
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
