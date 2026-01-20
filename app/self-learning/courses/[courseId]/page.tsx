"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Play,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  ChevronRight,
  Award,
  Users,
  Folder,
  Zap,
  Star,
  ArrowLeft,
  Mail,
  Phone,
  User,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Module {
  id: number
  title: string
  description: string | null
  order_index: number
  lessons_count: number
  lessons: Array<{
    id: number
    title: string
    description: string | null
    video_duration_seconds: number
    xp_reward: number
    order_index: number
  }>
}

interface Course {
  id: number
  title: string
  description: string
  thumbnail_url: string | null
  instructor_name: string
  estimated_duration_minutes: number
  difficulty_level: string
  price: number
  is_featured: boolean
  modules: Module[]
}

export default function PublicCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  // Auth form states
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [registerUniversity, setRegisterUniversity] = useState("")
  const [registerField, setRegisterField] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("gold_student") || localStorage.getItem("verified_student_id")
    if (storedUser) {
      const user = typeof storedUser === "string" ? JSON.parse(storedUser) : { id: storedUser }
      setUserId(user.id || user)
      setIsLoggedIn(true)
    }
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/learning/courses/${courseId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch course")
      }

      // Fetch modules and lessons
      const modulesRes = await fetch(`/api/learning/modules?courseId=${courseId}`)
      if (modulesRes.ok) {
        const modules = await modulesRes.json()
        const modulesWithLessons = await Promise.all(
          modules.map(async (module: any) => {
            const lessonsRes = await fetch(`/api/learning/lessons?moduleId=${module.id}`)
            const lessons = lessonsRes.ok ? await lessonsRes.json() : []
            return { ...module, lessons }
          })
        )
        setCourse({ ...data, modules: modulesWithLessons })
      } else {
        setCourse({ ...data, modules: [] })
      }
    } catch (error) {
      console.error("Error fetching course:", error)
      toast.error("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollClick = async () => {
    if (!isLoggedIn) {
      setShowAuthDialog(true)
      return
    }
    // User is logged in, proceed with enrollment
    try {
      await handleEnrollment()
      // After enrollment, redirect to profile
      router.push("/profile")
    } catch (error: any) {
      // If enrollment fails or is paid course, handleEnrollment will handle redirect
      if (error.message && !error.message.includes("Paid course")) {
        toast.error(error.message || "Failed to enroll in course")
      }
    }
  }

  const handleEnrollment = async () => {
    if (!userId || !course) return

    // Check if course is free
    const coursePrice = typeof course.price === "number" ? course.price : parseFloat(String(course.price || 0))
    const isFree = coursePrice === 0

    if (isFree) {
      // Free course - enroll directly
      const res = await fetch("/api/learning/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          course_id: course.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to enroll")
      }

      toast.success("Successfully enrolled in course!")
      setShowEnrollDialog(false)
      // Don't redirect here - let the caller handle redirect
    } else {
      // Paid course - redirect to payment page
      setShowEnrollDialog(false)
      router.push(`/learning/payment/${course.id}`)
      throw new Error("Paid course - redirecting to payment")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/gold/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      // API returns { student: {...}, enrollments: [...] }
      const studentData = data.student || data
      
      // Store student data in localStorage
      localStorage.setItem("gold_student", JSON.stringify(studentData))
      setUserId(studentData.id)
      setIsLoggedIn(true)
      setShowAuthDialog(false)
      toast.success("Login successful!")
      
      // Students with existing accounts go directly to their profile
      router.push("/profile")
    } catch (error: any) {
      toast.error(error.message || "Login failed")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate required fields
      if (!registerPhone || !registerPhone.trim()) {
        toast.error("Phone number is required")
        return
      }

      const res = await fetch("/api/gold/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: registerName,
          email: registerEmail,
          whatsapp_number: registerPhone.trim(), // API expects whatsapp_number, not phone
          password: registerPassword,
          university: registerUniversity || null,
          field_of_study: registerField || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // API returns { success: true, student: {...} }
      const studentData = data.student || data
      
      // Store student data in localStorage
      localStorage.setItem("gold_student", JSON.stringify(studentData))
      setUserId(studentData.id)
      setIsLoggedIn(true)
      setShowAuthDialog(false)
      toast.success(`Welcome, ${studentData.full_name}!`, {
        description: "Your account has been created successfully.",
      })
      
      // Enroll first, then redirect to profile
      try {
        await handleEnrollment()
        // After enrollment, redirect to profile
        router.push("/profile")
      } catch (error) {
        // If enrollment fails, still redirect to profile
        router.push("/profile")
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed")
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "intermediate":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mb-4"></div>
          <p className="text-gray-300">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <Card className="max-w-md bg-[#0a0a0f] border-[#e63946]/20">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Course Not Found</h2>
            <Button onClick={() => router.push("/self-learning")} className="bg-[#e63946] hover:bg-[#d62839]">
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
  const totalXP = totalLessons * 10
  const coursePrice = typeof course.price === "number" ? course.price : parseFloat(String(course.price || 0)) || 0
  const isFree = coursePrice === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d62839]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <Navbar />

        {/* Hero Section with Amazing Effects */}
        <div className="relative">
          {course.thumbnail_url ? (
            <div className="relative h-[60vh] min-h-[500px] overflow-hidden group">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-[20s] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0f1419]/80 to-[#0a0a0f]/40" />
              {/* Animated overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/0 via-[#e63946]/5 to-[#e63946]/0 animate-pulse" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
                <div className="max-w-7xl mx-auto animate-fade-in delay-200">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/self-learning")}
                    className="mb-6 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:translate-x-[-4px] group/back"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover/back:-translate-x-1 transition-transform" />
                    Back to Courses
                  </Button>
                  <div className="flex items-center gap-3 mb-4 flex-wrap animate-fade-in delay-300">
                    <Badge className={`${getDifficultyColor(course.difficulty_level)} border-0 font-semibold capitalize transition-all duration-300 hover:scale-110`}>
                      {course.difficulty_level}
                    </Badge>
                    {course.is_featured && (
                      <Badge className="bg-[#e63946]/20 text-[#e63946] border-[#e63946]/30 animate-pulse transition-all duration-300 hover:scale-110">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 animate-fade-in delay-400 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                    {course.title}
                  </h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-[40vh] min-h-[400px] bg-gradient-to-br from-[#e63946]/20 via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in delay-200">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/self-learning")}
                  className="mb-6 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:translate-x-[-4px] group/back"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover/back:-translate-x-1 transition-transform" />
                  Back to Courses
                </Button>
                <div className="flex items-center gap-3 mb-4 flex-wrap animate-fade-in delay-300">
                  <Badge className={`${getDifficultyColor(course.difficulty_level)} border-0 font-semibold capitalize transition-all duration-300 hover:scale-110`}>
                    {course.difficulty_level}
                  </Badge>
                  {course.is_featured && (
                    <Badge className="bg-[#e63946]/20 text-[#e63946] border-[#e63946]/30 animate-pulse transition-all duration-300 hover:scale-110">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 animate-fade-in delay-400 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  {course.title}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Content Section with Amazing Animations */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#0a0a0f] border border-[#e63946]/20 backdrop-blur-sm">
                  <TabsTrigger 
                    value="overview" 
                    className="text-gray-300 data-[state=active]:bg-[#e63946] data-[state=active]:text-white data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-[#e63946]/20 transition-all duration-300 font-semibold hover:scale-105"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="curriculum" 
                    className="text-gray-300 data-[state=active]:bg-[#e63946] data-[state=active]:text-white data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-[#e63946]/20 transition-all duration-300 font-semibold hover:scale-105"
                  >
                    Curriculum
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instructor" 
                    className="text-gray-300 data-[state=active]:bg-[#e63946] data-[state=active]:text-white data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-[#e63946]/20 transition-all duration-300 font-semibold hover:scale-105"
                  >
                    Instructor
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6 animate-fade-in delay-200">
                  {/* About This Course - Amazing Design */}
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-[#e63946]/10 via-[#d62839]/5 to-[#e63946]/10 border-2 border-[#e63946]/30 hover:border-[#e63946]/50 hover:shadow-2xl hover:shadow-[#e63946]/30 transition-all duration-500 hover:scale-[1.01] group relative overflow-hidden">
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/0 via-[#e63946]/5 to-[#e63946]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#e63946]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-5 group-hover:text-[#e63946] transition-colors duration-300">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <BookOpen className="h-6 w-6 text-[#e63946]" />
                        </div>
                        About This Course
                      </h3>
                      <p className="text-gray-200 leading-relaxed text-lg">
                        {course.description || "No description available."}
                      </p>
                    </div>
                  </div>

                  {/* Course Stats - Amazing Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Folder, label: "Modules", value: course.modules.length, gradient: "from-blue-500/20 to-indigo-500/10" },
                      { icon: Play, label: "Lessons", value: totalLessons, gradient: "from-purple-500/20 to-pink-500/10" },
                      { icon: Clock, label: "Duration", value: `${Math.floor(course.estimated_duration_minutes / 60)}h ${course.estimated_duration_minutes % 60}m`, gradient: "from-amber-500/20 to-orange-500/10" },
                      { icon: Zap, label: "Total XP", value: totalXP, gradient: "from-[#e63946]/20 to-[#d62839]/10", isXP: true },
                    ].map((stat, idx) => (
                      <div
                        key={stat.label}
                        className="p-5 rounded-xl bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-2 border-[#e63946]/20 hover:border-[#e63946]/50 hover:bg-gradient-to-br hover:from-[#e63946]/15 hover:to-[#d62839]/10 hover:shadow-2xl hover:shadow-[#e63946]/30 transition-all duration-500 hover:scale-110 hover:-translate-y-2 group relative overflow-hidden animate-fade-in"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        {/* Animated background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-[#e63946]/20">
                              <stat.icon className="h-5 w-5 text-[#e63946]" />
                            </div>
                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">{stat.label}</p>
                          </div>
                          <p className={`text-3xl font-black ${stat.isXP ? "text-[#e63946]" : "text-white"} group-hover:scale-110 transition-transform duration-300`}>
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="curriculum" className="space-y-4 mt-6 animate-fade-in delay-200">
                  {course.modules.length > 0 ? (
                    <div className="space-y-4">
                      {course.modules.map((module, index) => (
                        <Card 
                          key={module.id} 
                          className="bg-[#0a0a0f] border-[#e63946]/20 hover:border-[#e63946]/40 hover:shadow-xl hover:shadow-[#e63946]/10 transition-all duration-500 hover:scale-[1.02] group animate-fade-in"
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#e63946]/20 flex items-center justify-center text-[#e63946] font-bold group-hover:bg-[#e63946]/30 group-hover:scale-110 transition-all duration-300">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-white group-hover:text-[#e63946] transition-colors duration-300">
                                  {module.title}
                                </CardTitle>
                                {module.description && (
                                  <CardDescription className="text-gray-400 mt-1">
                                    {module.description}
                                  </CardDescription>
                                )}
                              </div>
                              <Badge className="bg-[#e63946]/20 text-[#e63946] border-[#e63946]/30 group-hover:bg-[#e63946]/30 transition-all duration-300">
                                {module.lessons?.length || 0} Lessons
                              </Badge>
                            </div>
                          </CardHeader>
                          {module.lessons && module.lessons.length > 0 && (
                            <CardContent>
                              <div className="space-y-2">
                                {module.lessons.map((lesson, lessonIdx) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f] border border-[#e63946]/10 hover:border-[#e63946]/40 hover:bg-[#e63946]/5 hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:translate-x-2 group/lesson animate-fade-in"
                                    style={{ animationDelay: `${(index * 150) + (lessonIdx * 50)}ms` }}
                                  >
                                    <Play className="h-4 w-4 text-[#e63946] flex-shrink-0 group-hover/lesson:scale-125 group-hover/lesson:rotate-12 transition-transform duration-300" />
                                    <div className="flex-1">
                                      <p className="text-white font-medium text-sm group-hover/lesson:text-[#e63946] transition-colors duration-300">
                                        {lesson.title}
                                      </p>
                                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {Math.floor((lesson.video_duration_seconds || 0) / 60)}m
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Award className="h-3 w-3" />
                                          {lesson.xp_reward || 10} XP
                                        </span>
                                      </div>
                                    </div>
                                    <Lock className="h-4 w-4 text-gray-600 flex-shrink-0 group-hover/lesson:text-[#e63946] transition-colors duration-300" />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 animate-fade-in">
                      <Folder className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No curriculum available yet</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="instructor" className="space-y-4 mt-6 animate-fade-in delay-200">
                  <Card className="bg-[#0a0a0f] border-[#e63946]/20 hover:border-[#e63946]/40 hover:shadow-xl hover:shadow-[#e63946]/10 transition-all duration-500 hover:scale-[1.02] group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e63946] to-[#d62839] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-[#e63946]/30">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#e63946] transition-colors duration-300">
                            {course.instructor_name || "Expert Instructor"}
                          </h3>
                          <p className="text-gray-400">Course Instructor</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Beautiful Enrollment Card */}
            <div className="lg:col-span-1 animate-fade-in delay-500">
              <Card className="bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border-2 border-[#e63946]/40 sticky top-8 hover:border-[#e63946]/60 hover:shadow-2xl hover:shadow-[#e63946]/30 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm overflow-hidden relative group">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/0 via-[#e63946]/5 to-[#e63946]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-6 space-y-6 relative z-10">
                  {/* Price Section - Amazing Design */}
                  <div className="animate-fade-in delay-600">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#e63946]/25 via-[#d62839]/20 to-[#e63946]/25 border-2 border-[#e63946]/40 mb-4 relative overflow-hidden group/price shadow-xl shadow-[#e63946]/20 hover:shadow-2xl hover:shadow-[#e63946]/30 transition-all duration-500">
                      {/* Animated background effects */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/10 via-[#d62839]/10 to-[#e63946]/10 animate-pulse" />
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#e63946]/20 rounded-full blur-2xl opacity-50 group-hover/price:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#d62839]/20 rounded-full blur-2xl opacity-50 group-hover/price:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        <p className="text-xs text-gray-200 uppercase mb-4 tracking-widest font-bold flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                            <Award className="h-3.5 w-3.5 text-[#e63946]" />
                          </div>
                          Course Price
                        </p>
                        {isFree ? (
                          <div className="text-center">
                            <p className="text-5xl font-black text-green-400 animate-pulse mb-2 drop-shadow-lg">FREE</p>
                            <p className="text-sm text-green-300 font-medium">Start learning today!</p>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-white transition-all duration-300 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-lg group-hover/price:scale-105">
                              ${coursePrice.toFixed(2)}
                            </span>
                            <span className="text-base text-gray-300 font-semibold">USD</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Stats - Beautiful Cards */}
                  <div className="space-y-3">
                    {[
                      { icon: Folder, label: "Modules", value: course.modules.length, gradient: "from-blue-500/20 to-indigo-500/10" },
                      { icon: Play, label: "Lessons", value: totalLessons, gradient: "from-purple-500/20 to-pink-500/10" },
                      { icon: Clock, label: "Duration", value: `${Math.floor(course.estimated_duration_minutes / 60)}h ${course.estimated_duration_minutes % 60}m`, gradient: "from-amber-500/20 to-orange-500/10" },
                      { icon: Zap, label: "Total XP", value: totalXP, isXP: true, gradient: "from-[#e63946]/20 to-[#d62839]/10" },
                    ].map((stat, idx) => (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#0f1419] to-[#0a0a0f] border-2 border-[#e63946]/15 hover:border-[#e63946]/40 hover:bg-gradient-to-r hover:from-[#e63946]/10 hover:to-[#d62839]/5 transition-all duration-300 hover:scale-[1.05] hover:shadow-lg hover:shadow-[#e63946]/20 group/stat animate-fade-in relative overflow-hidden"
                        style={{ animationDelay: `${700 + (idx * 50)}ms` }}
                      >
                        {/* Animated background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300`} />
                        
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#e63946]/25 to-[#d62839]/15 group-hover/stat:scale-125 group-hover/stat:rotate-12 transition-all duration-300 shadow-md shadow-[#e63946]/20">
                            <stat.icon className="h-5 w-5 text-[#e63946]" />
                          </div>
                          <span className="text-gray-300 text-sm font-semibold">{stat.label}</span>
                        </div>
                        <span className={`font-black text-lg ${stat.isXP ? "text-[#e63946]" : "text-white"} group-hover/stat:scale-110 transition-transform duration-300 relative z-10`}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-[#e63946]/30 to-transparent" />

                  {/* Enrollment Button - Amazing Design */}
                  <Button
                    onClick={handleEnrollClick}
                    className="w-full bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] hover:from-[#d62839] hover:via-[#c1121f] hover:to-[#d62839] text-white font-bold h-14 text-lg shadow-2xl shadow-[#e63946]/40 hover:shadow-[#e63946]/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group/btn animate-fade-in delay-900 relative overflow-hidden"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <Award className="h-5 w-5 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform duration-300" />
                      {isFree ? "Enroll for Free" : "Enroll Now"}
                      <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>

                  {isLoggedIn && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 animate-fade-in delay-1000">
                      <p className="text-xs text-center text-green-400 font-medium flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        You are logged in as a student
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Login/Register Dialog - Professional & Amazing */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[550px] md:max-w-[600px] !bg-gradient-to-br !from-[#0a0a0f] !via-[#0f1419] !to-[#0a0a0f] border-2 border-[#e63946]/40 shadow-2xl shadow-[#e63946]/20 overflow-hidden !fixed !top-[50%] !left-[50%] !-translate-x-[50%] !-translate-y-[50%] !transform">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/5 via-transparent to-[#d62839]/5 opacity-50" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e63946]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#d62839]/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <DialogHeader className="space-y-3 mb-6">
              <DialogTitle className="text-white text-3xl font-black bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/10">
                  <Award className="h-6 w-6 text-[#e63946]" />
                </div>
                {authMode === "login" ? "Login to Enroll" : "Create Account to Enroll"}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-base">
                {authMode === "login"
                  ? "Login to your account to enroll in this course"
                  : "Create a free account to start learning"}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "register")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#0a0a0f]/80 backdrop-blur-sm border-2 border-[#e63946]/20 rounded-xl p-1 h-14">
                <TabsTrigger 
                  value="login" 
                  className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#e63946] data-[state=active]:to-[#d62839] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#e63946]/30 rounded-lg font-semibold transition-all duration-300 data-[state=active]:scale-105"
                >
                  <Mail className="h-4 w-4 mr-2 inline" />
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#e63946] data-[state=active]:to-[#d62839] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#e63946]/30 rounded-lg font-semibold transition-all duration-300 data-[state=active]:scale-105"
                >
                  <User className="h-4 w-4 mr-2 inline" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-5 mt-6 animate-fade-in">
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="loginEmail" className="text-white font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#e63946]" />
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="loginEmail"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="bg-[#0a0a0f]/80 backdrop-blur-sm border-2 border-[#e63946]/30 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 hover:border-[#e63946]/50 pl-11"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#e63946] transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="loginPassword" className="text-white font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#e63946]" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="loginPassword"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#e63946]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 hover:border-[#e63946]/50 pl-11 pr-11"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#e63946] transition-colors duration-300" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e63946] transition-colors duration-300 p-1 rounded-lg hover:bg-[#e63946]/10"
                      >
                        {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] hover:from-[#d62839] hover:via-[#c1121f] hover:to-[#d62839] text-white font-bold h-14 text-lg rounded-xl shadow-xl shadow-[#e63946]/30 hover:shadow-2xl hover:shadow-[#e63946]/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <Award className="h-5 w-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                      Login & Enroll
                      <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-5 mt-6 animate-fade-in">
                <form onSubmit={handleRegister} className="space-y-5">
                  {/* Full Name Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="registerName" className="text-white font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-[#e63946]" />
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="registerName"
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#e63946]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 hover:border-[#e63946]/50 pl-11"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#e63946] transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="registerEmail" className="text-white font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#e63946]" />
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="registerEmail"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="bg-[#0a0a0f]/80 backdrop-blur-sm border-2 border-[#e63946]/30 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 hover:border-[#e63946]/50 pl-11"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#e63946] transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="registerPhone" className="text-white font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#e63946]" />
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Input
                        id="registerPhone"
                        type="tel"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        placeholder="+252..."
                        required
                        className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#e63946]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 hover:border-[#e63946]/50 pl-11"
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#e63946] transition-colors duration-300" />
                    </div>
                  </div>

                  {/* University & Field of Study - Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <Label htmlFor="registerUniversity" className="text-white font-semibold flex items-center gap-2">
                        <Star className="h-4 w-4 text-[#e63946]" />
                        University
                      </Label>
                      <div className="relative">
                        <Input
                          id="registerUniversity"
                          type="text"
                          value={registerUniversity}
                          onChange={(e) => setRegisterUniversity(e.target.value)}
                          placeholder="University"
                          className="bg-[#0a0a0f]/80 backdrop-blur-sm border-2 border-[#e63946]/30 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 hover:border-[#e63946]/50 pl-11"
                        />
                        <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#e63946] transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="registerField" className="text-white font-semibold flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#e63946]" />
                        Field of Study
                      </Label>
                      <div className="relative">
                        <Input
                          id="registerField"
                          type="text"
                          value={registerField}
                          onChange={(e) => setRegisterField(e.target.value)}
                          placeholder="Field"
                          className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#e63946]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 hover:border-[#e63946]/50 pl-11"
                        />
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#e63946] transition-colors duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="registerPassword" className="text-white font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#e63946]" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Create a password"
                        required
                        className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#e63946]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 hover:border-[#e63946]/50 pl-11 pr-11"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#e63946] transition-colors duration-300" />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e63946] transition-colors duration-300 p-1 rounded-lg hover:bg-[#e63946]/10"
                      >
                        {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] hover:from-[#d62839] hover:via-[#c1121f] hover:to-[#d62839] text-white font-bold h-14 text-lg rounded-xl shadow-xl shadow-[#e63946]/30 hover:shadow-2xl hover:shadow-[#e63946]/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <Award className="h-5 w-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                      Register & Enroll
                      <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
