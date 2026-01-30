"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Play,
  Trophy,
  Flame,
  Award,
  ChevronRight,
  Clock,
  CheckCircle2,
  Lock,
  TrendingUp,
} from "lucide-react"

interface Course {
  id: number
  title: string
  slug: string
  description: string
  thumbnail_url: string
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

export default function LearningDashboard() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [xpData, setXpData] = useState<XPData | null>(null)
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    // Get user ID from your auth system (adjust based on your setup)
    const storedUser = localStorage.getItem("gold_student") || localStorage.getItem("verified_student_id")
    if (!storedUser) {
      router.push("/student-login")
      return
    }

    const user = typeof storedUser === "string" ? JSON.parse(storedUser) : { id: storedUser }
    setUserId(user.id || user)
    fetchData(user.id || user)
  }, [router])

  const fetchData = async (userId: number) => {
    try {
      const [coursesRes, xpRes, streakRes] = await Promise.all([
        fetch(`/api/learning/courses?userId=${userId}`),
        fetch(`/api/learning/gamification/xp?userId=${userId}`),
        fetch(`/api/learning/gamification/streak?userId=${userId}`),
      ])

      const coursesData = await coursesRes.json()
      const xpData = await xpRes.json()
      const streakData = await streakRes.json()

      setCourses(coursesData)
      setXpData(xpData)
      setStreakData(streakData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#016b62] mb-4"></div>
          <p className="text-gray-600">Loading your learning path...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#016b62] mb-2">My Learning Path</h1>
          <p className="text-gray-600">Continue your journey and track your progress</p>
        </div>

        {/* Gamification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* XP & Level Card */}
          <Card className="bg-[#016b62] text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">Current Level</p>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold">{xpData?.level_info?.badge_icon || "🌱"}</span>
                    <div>
                      <p className="text-2xl font-bold">{xpData?.level_info?.level_name || "Beginner"}</p>
                      <p className="text-white/80 text-sm">Level {xpData?.current_level || 1}</p>
                    </div>
                  </div>
                </div>
                <Trophy className="h-12 w-12 text-[#fcad21]" />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/80">XP Progress</span>
                  <span className="font-semibold">{xpData?.total_xp || 0} / {((xpData?.total_xp || 0) + (xpData?.xp_to_next_level || 100))} XP</span>
                </div>
                <Progress
                  value={xpData && (xpData.total_xp + xpData.xp_to_next_level) > 0 ? ((xpData.total_xp / (xpData.total_xp + xpData.xp_to_next_level)) * 100) : 0}
                  className="h-2 bg-white/30"
                />
                <p className="text-white/80 text-xs mt-1">
                  {xpData?.xp_to_next_level || 100} XP to next level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-orange-100 text-sm mb-1">Learning Streak</p>
                  <p className="text-4xl font-bold">{streakData?.current_streak || 0}</p>
                  <p className="text-orange-100 text-sm">days in a row</p>
                </div>
                <Flame className="h-12 w-12 text-orange-200" />
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm">
                  {streakData?.today_completed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-orange-100">Today completed!</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      <span className="text-orange-100">Keep your streak alive</span>
                    </>
                  )}
                </div>
                {streakData?.today_data && (
                  <p className="text-orange-100 text-xs mt-1">
                    {streakData.today_data.lessons_completed} lessons today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Badges Earned</p>
                  <p className="text-4xl font-bold">
                    {xpData?.recent_xp?.filter((x: any) => x.source_type === "badge").length || 0}
                  </p>
                </div>
                <Award className="h-12 w-12 text-purple-200" />
              </div>
              <Link href="/learning/badges">
                <Button variant="ghost" className="text-white hover:bg-purple-400/20 mt-4 w-full">
                  View All Badges <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            <Badge variant="outline" className="text-gray-600">
              {courses.length} {courses.length === 1 ? "Course" : "Courses"}
            </Badge>
          </div>

          {courses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href={`/learning/courses/${course.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        </div>
                        {course.progress.progress_percentage === 100 && (
                          <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.lessons_count} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 font-medium">Progress</span>
                          <span className="text-gray-900 font-bold">{course.progress.progress_percentage}%</span>
                        </div>
                        <Progress value={course.progress.progress_percentage} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {course.progress.lessons_completed} of {course.progress.total_lessons} lessons completed
                        </p>
                      </div>

                      {/* Continue Button */}
                      {course.progress.current_lesson_id ? (
                        <Link href={`/learning/lessons/${course.progress.current_lesson_id}`}>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <Play className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                        </Link>
                      ) : course.progress.progress_percentage === 0 ? (
                        <Link href={`/learning/courses/${course.id}`}>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Start Course
                          </Button>
                        </Link>
                      ) : (
                        <Button className="w-full" variant="outline" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Course Completed
                        </Button>
                      )}
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
