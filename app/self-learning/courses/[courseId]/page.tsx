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
import { getDeviceId, setDeviceIdFromServer, getImageSrc } from "@/lib/utils"

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
      const device_id = getDeviceId()
      const res = await fetch("/api/gold/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          device_id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === "DEVICE_LIMIT") {
          toast.error(data.error || "You can only use 2 devices. Contact admin to add this device.")
        } else {
          toast.error(data.error || "Login failed")
        }
        return
      }

      setDeviceIdFromServer(data.device_id)
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
        return "bg-[#2596be]/20 text-[#2596be] border-[#2596be]/30"
      case "intermediate":
        return "bg-[#3c62b3]/20 text-[#2596be] border-[#3c62b3]/30"
      case "advanced":
        return "bg-[#2596be]/25 text-[#3c62b3] border-[#2596be]/40"
      default:
        return "bg-[#2596be]/10 text-[#2596be] border-[#2596be]/20"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-[#fcf6f0] to-[#e8f4f3] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mb-4"></div>
          <p className="text-[#333333]/70">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-[#fcf6f0] to-[#e8f4f3] flex items-center justify-center">
        <Card className="max-w-md bg-white border-[#2596be]/20 shadow-xl shadow-[#2596be]/10 rounded-2xl">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-16 w-16 text-[#2596be]/40 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#2596be] mb-2">Course Not Found</h2>
            <Button onClick={() => router.push("/self-learning")} className="bg-[#2596be] hover:bg-[#3c62b3] text-white">
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
    <div className="min-h-screen bg-gradient-to-b from-[#e0f2f4] via-[#f0f9f8] to-[#e8f4f8] relative overflow-hidden">
      {/* Visible background – teal tint */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#2596be]/12 to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-[#3c62b3]/10 to-transparent" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Visible banner – New Course */}
        <div className="bg-gradient-to-r from-[#2596be] to-[#2a8bb5] text-white py-2.5 px-4 text-center shadow-lg border-b border-[#2596be]/30">
          <p className="text-sm font-bold tracking-wide">
            ✦ New course launch — Enroll today and start learning
          </p>
        </div>

        {/* Hero – bigger, bolder */}
        <div className="relative">
          {course.thumbnail_url ? (
            <div className="relative h-[68vh] min-h-[560px] overflow-hidden group">
              <img
                src={getImageSrc(course.thumbnail_url) || course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-[18s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2596be]/25 via-transparent to-[#3c62b3]/15" />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
                <div className="max-w-7xl mx-auto animate-fade-in delay-200">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/self-learning")}
                    className="mb-6 text-white/90 hover:bg-white/15 hover:text-white transition-all duration-300 hover:scale-105 hover:translate-x-[-4px] group/back rounded-full px-4 border border-white/20"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover/back:-translate-x-1 transition-transform" />
                    Back to Courses
                  </Button>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-[0.2em] mb-4 border border-white/30 shadow-xl animate-fade-in delay-300">
                    ✦ New course launch
                  </span>
                  <div className="flex items-center gap-3 mb-4 flex-wrap animate-fade-in delay-300">
                    <Badge className={`${getDifficultyColor(course.difficulty_level)} border-0 font-semibold capitalize transition-all duration-300 hover:scale-105 px-3 py-1`}>
                      {course.difficulty_level}
                    </Badge>
                    {course.is_featured && (
                      <Badge className="bg-white/20 text-white border border-white/40 font-semibold transition-all duration-300 hover:scale-105 px-3 py-1 backdrop-blur-sm">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-3 animate-fade-in delay-400 drop-shadow-2xl tracking-tight leading-[1.1]">
                    {course.title}
                  </h1>
                  <div className="w-24 h-1.5 bg-[#2596be] rounded-full mb-4 shadow-lg" />
                  <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl animate-fade-in delay-500">
                    {course.instructor_name && <span>By {course.instructor_name}</span>}
                    {course.estimated_duration_minutes > 0 && (
                      <span className="mx-2"> · </span>
                    )}
                    {course.estimated_duration_minutes > 0 && (
                      <span>{Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-[40vh] min-h-[400px] bg-gradient-to-br from-[#2596be]/20 via-[#e8f4f3] to-[#fcf6f0] flex items-center justify-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in delay-200">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/self-learning")}
                  className="mb-6 text-[#2596be] hover:bg-[#2596be]/10 transition-all duration-300 hover:scale-105 hover:translate-x-[-4px] group/back rounded-full px-4 border border-[#2596be]/30"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover/back:-translate-x-1 transition-transform" />
                  Back to Courses
                </Button>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7dd3fc] text-[#0c4a6e] text-xs font-bold uppercase tracking-widest mb-4 shadow-md animate-fade-in delay-300">
                  New course launch
                </span>
                <div className="flex items-center gap-3 mb-4 flex-wrap animate-fade-in delay-300">
                  <Badge className={`${getDifficultyColor(course.difficulty_level)} border-0 font-semibold capitalize transition-all duration-300 hover:scale-105 px-3 py-1`}>
                    {course.difficulty_level}
                  </Badge>
                  {course.is_featured && (
                    <Badge className="bg-[#2596be]/20 text-[#2596be] border-[#2596be]/30 font-semibold transition-all duration-300 hover:scale-105 px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 animate-fade-in delay-400 bg-gradient-to-r from-[#2596be] via-[#1e3a5f] to-[#2596be] bg-clip-text text-transparent tracking-tight leading-[1.1]">
                  {course.title}
                </h1>
                <p className="text-[#1e3a5f]/80 text-lg font-medium animate-fade-in delay-500">
                  {course.instructor_name && <span>By {course.instructor_name}</span>}
                  {course.estimated_duration_minutes > 0 && <span className="mx-2"> · </span>}
                  {course.estimated_duration_minutes > 0 && (
                    <span>{Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content – overlaps hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 md:pb-20 -mt-20 md:-mt-24 lg:-mt-28 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Main – visible left accent on large screens */}
            <div className="lg:col-span-2 space-y-8 lg:pl-6 lg:border-l-4 lg:border-[#2596be]/40">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-white border-2 border-[#2596be]/25 shadow-[0_8px_32px_rgba(37,150,190,0.12)] rounded-2xl p-1.5 gap-1">
                  <TabsTrigger 
                    value="overview" 
                    className="py-3 text-[#1e3a5f] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2596be] data-[state=active]:to-[#2a7a9e] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:hover:bg-[#2596be]/10 data-[state=inactive]:hover:text-[#2596be] rounded-xl font-semibold transition-all duration-300"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="curriculum" 
                    className="py-3 text-[#1e3a5f] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2596be] data-[state=active]:to-[#2a7a9e] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:hover:bg-[#2596be]/10 data-[state=inactive]:hover:text-[#2596be] rounded-xl font-semibold transition-all duration-300"
                  >
                    Curriculum
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instructor" 
                    className="py-3 text-[#1e3a5f] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2596be] data-[state=active]:to-[#2a7a9e] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:hover:bg-[#2596be]/10 data-[state=inactive]:hover:text-[#2596be] rounded-xl font-semibold transition-all duration-300"
                  >
                    Instructor
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 mt-6">
                  {/* About This Course – visible accent */}
                  <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-[#2596be]/20 shadow-[0_16px_48px_rgba(37,150,190,0.15)] hover:shadow-[0_24px_56px_rgba(37,150,190,0.22)] hover:border-[#2596be]/35 transition-all duration-500 group">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#2596be] via-[#3c62b3] to-[#2596be]" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#3c62b3]/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-1/4 w-44 h-44 bg-[#2596be]/[0.05] rounded-full blur-3xl translate-y-1/2" />
                    <div className="relative z-10 p-8 md:p-10">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2596be]/10 text-[#0c4a6e] text-[11px] font-bold uppercase tracking-[0.15em] mb-5 text-[#2596be]">
                        What you’ll learn
                      </span>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] flex items-center gap-3 mb-6 group-hover:text-[#2596be] transition-colors duration-300">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2596be]/15 to-[#3c62b3]/15 text-[#2596be] border border-[#2596be]/20 shadow-sm">
                          <BookOpen className="h-6 w-6" />
                        </span>
                        About This Course
                      </h3>
                      <p className="text-[#334155] leading-[1.8] text-base md:text-lg font-normal max-w-3xl">
                        {(course.description || "No description available.").trim()}
                      </p>
                    </div>
                  </div>

                  {/* Course stats – bold cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Folder, label: "Modules", value: course.modules.length, color: "teal" },
                      { icon: Play, label: "Lessons", value: totalLessons, color: "gold" },
                      { icon: Clock, label: "Duration", value: `${Math.floor(course.estimated_duration_minutes / 60)}h ${course.estimated_duration_minutes % 60}m`, color: "teal" },
                      { icon: Zap, label: "Total XP", value: totalXP, color: "gold" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-5 rounded-2xl bg-white border-2 border-[#2596be]/20 shadow-[0_8px_24px_rgba(37,150,190,0.12)] hover:shadow-[0_16px_40px_rgba(37,150,190,0.2)] hover:border-[#2596be]/40 hover:-translate-y-1 transition-all duration-300 group/card"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2.5 rounded-xl ${stat.color === "gold" ? "bg-[#3c62b3]/15 text-[#3c62b3]" : "bg-[#2596be]/15 text-[#2596be]"} group-hover/card:scale-105 transition-transform`}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                          <p className="text-[11px] text-[#64748b] uppercase font-semibold tracking-wider">{stat.label}</p>
                        </div>
                        <p className={`text-2xl font-extrabold ${stat.color === "gold" ? "text-[#3c62b3]" : "text-[#2596be]"}`}>
                          {stat.value}
                        </p>
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
                          className="bg-white border-2 border-[#2596be]/20 hover:border-[#3c62b3]/40 hover:shadow-xl hover:shadow-[#2596be]/10 transition-all duration-500 hover:scale-[1.01] group animate-fade-in rounded-2xl"
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#2596be]/15 flex items-center justify-center text-[#2596be] font-bold group-hover:bg-[#3c62b3]/20 group-hover:scale-110 transition-all duration-300">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-[#2596be] group-hover:text-[#3c62b3] transition-colors duration-300">
                                  {module.title}
                                </CardTitle>
                                {module.description && (
                                  <CardDescription className="text-gray-600 mt-1">
                                    {module.description}
                                  </CardDescription>
                                )}
                              </div>
                              <Badge className="bg-[#3c62b3]/20 text-[#3c62b3] border-[#3c62b3]/30 font-semibold">
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
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-[#2596be]/10 hover:border-[#2596be]/30 hover:bg-[#2596be]/5 transition-all duration-300 hover:scale-[1.01] hover:translate-x-1 group/lesson animate-fade-in"
                                    style={{ animationDelay: `${(index * 150) + (lessonIdx * 50)}ms` }}
                                  >
                                    <Play className="h-4 w-4 text-[#2596be] flex-shrink-0 group-hover/lesson:text-[#3c62b3] transition-colors duration-300" />
                                    <div className="flex-1">
                                      <p className="text-gray-800 font-medium text-sm group-hover/lesson:text-[#2596be] transition-colors duration-300">
                                        {lesson.title}
                                      </p>
                                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
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
                                    <Lock className="h-4 w-4 text-gray-400 flex-shrink-0 group-hover/lesson:text-[#2596be] transition-colors duration-300" />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 animate-fade-in bg-white rounded-2xl border border-[#2596be]/20">
                      <Folder className="h-12 w-12 text-[#2596be]/40 mx-auto mb-4" />
                      <p className="text-gray-600">No curriculum available yet</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="instructor" className="space-y-4 mt-6 animate-fade-in delay-200">
                  <Card className="bg-white border-2 border-[#2596be]/20 hover:border-[#3c62b3]/40 hover:shadow-xl hover:shadow-[#2596be]/10 transition-all duration-500 hover:scale-[1.01] group rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2596be] to-[#3c62b3] flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#2596be]/20">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#2596be] mb-1 group-hover:text-[#3c62b3] transition-colors duration-300">
                            {course.instructor_name || "Expert Instructor"}
                          </h3>
                          <p className="text-gray-600">Course Instructor</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar – Price card: very visible */}
            <div className="lg:col-span-1 order-first lg:order-none">
              <Card className="bg-white border-[3px] border-[#2596be] shadow-[0_20px_60px_rgba(37,150,190,0.3)] hover:shadow-[0_28px_72px_rgba(37,150,190,0.4)] sticky top-6 transition-all duration-300 overflow-hidden relative group rounded-3xl">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2596be] via-[#3c62b3] to-[#2596be] z-20" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#3c62b3]/[0.08] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#2596be]/[0.08] rounded-full blur-3xl" />
                {/* Course thumbnail at top */}
                {course.thumbnail_url && (
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#e8f4f3]">
                    <img
                      src={getImageSrc(course.thumbnail_url) || course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  </div>
                )}
                <CardContent className="p-6 space-y-5 relative z-10">
                  {/* Price block */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2596be] via-[#2a7a9e] to-[#3c62b3] border-0 shadow-lg shadow-[#2596be]/25 hover:shadow-xl hover:shadow-[#2596be]/30 transition-all duration-300 group/price relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/price:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <p className="text-[10px] text-white/90 uppercase mb-2 tracking-[0.2em] font-bold flex items-center gap-2">
                        <Award className="h-3.5 w-3.5 text-white/90" />
                        Course Price
                      </p>
                      {isFree ? (
                        <div className="text-center">
                          <p className="text-4xl md:text-5xl font-black text-white mb-1 drop-shadow-md">FREE</p>
                          <p className="text-sm text-white/85 font-medium">Start learning today</p>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-4xl md:text-5xl font-black text-white drop-shadow-md group-hover/price:scale-105 transition-transform duration-300">
                            ${coursePrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-white/80 font-semibold">USD</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course includes */}
                  <div>
                    <p className="text-[10px] text-[#64748b] uppercase tracking-[0.2em] font-bold mb-3">Course includes</p>
                    <div className="space-y-2.5">
                      {[
                        { icon: Folder, label: "Modules", value: course.modules.length, accent: "teal" },
                        { icon: Play, label: "Lessons", value: totalLessons, accent: "gold" },
                        { icon: Clock, label: "Duration", value: `${Math.floor(course.estimated_duration_minutes / 60)}h ${course.estimated_duration_minutes % 60}m`, accent: "teal" },
                        { icon: Zap, label: "Total XP", value: totalXP, accent: "gold" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fafc] border border-[#2596be]/08 hover:border-[#2596be]/20 hover:bg-[#2596be]/[0.04] transition-all duration-200 group/stat"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.accent === "gold" ? "bg-[#3c62b3]/15 text-[#3c62b3]" : "bg-[#2596be]/15 text-[#2596be]"}`}>
                              <stat.icon className="h-4 w-4" />
                            </div>
                            <span className="text-[#475569] text-sm font-semibold">{stat.label}</span>
                          </div>
                          <span className={`font-bold text-base ${stat.accent === "gold" ? "text-[#3c62b3]" : "text-[#2596be]"}`}>
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#2596be]/15 to-transparent" />

                  {/* Enroll CTA – very visible */}
                  <Button
                    onClick={handleEnrollClick}
                    className="w-full bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#1e7a9e] hover:to-[#2d5a9e] text-white font-bold h-14 text-lg shadow-[0_8px_24px_rgba(37,150,190,0.4)] hover:shadow-[0_12px_32px_rgba(37,150,190,0.5)] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 group/btn rounded-xl relative overflow-hidden border-2 border-[#2596be]/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-600" />
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <Award className="h-5 w-5" />
                      {isFree ? "Enroll for Free" : "Enroll Now"}
                      <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>

                  {isLoggedIn && (
                    <div className="p-3 rounded-xl bg-[#2596be]/10 border border-[#2596be]/20 animate-fade-in delay-1000">
                      <p className="text-xs text-center text-[#2596be] font-medium flex items-center justify-center gap-2">
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
        <DialogContent className="sm:max-w-[550px] md:max-w-[600px] !bg-gradient-to-br !from-[#0a0a0f] !via-[#0f1419] !to-[#0a0a0f] border-2 border-[#2596be]/40 shadow-2xl shadow-[#2596be]/20 overflow-hidden !fixed !top-[50%] !left-[50%] !-translate-x-[50%] !-translate-y-[50%] !transform">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2596be]/5 via-transparent to-[#3c62b3]/5 opacity-50" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2596be]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3c62b3]/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <DialogHeader className="space-y-3 mb-6">
              <DialogTitle className="text-white text-3xl font-black bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/10">
                  <Award className="h-6 w-6 text-[#2596be]" />
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
              <TabsList className="grid w-full grid-cols-2 bg-[#0a0a0f]/80 backdrop-blur-sm border-2 border-[#2596be]/20 rounded-xl p-1 h-14">
                <TabsTrigger 
                  value="login" 
                  className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2596be] data-[state=active]:to-[#3c62b3] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#2596be]/30 rounded-lg font-semibold transition-all duration-300 data-[state=active]:scale-105"
                >
                  <Mail className="h-4 w-4 mr-2 inline" />
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2596be] data-[state=active]:to-[#3c62b3] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#2596be]/30 rounded-lg font-semibold transition-all duration-300 data-[state=active]:scale-105"
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
                      <Mail className="h-4 w-4 text-[#2596be]" />
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
                        className="bg-[#0a0a0f]/80 backdrop-blur-sm border-2 border-[#2596be]/30 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300 hover:border-[#2596be]/50 pl-11"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#2596be] transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="loginPassword" className="text-white font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#2596be]" />
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
                        className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#2596be]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300 hover:border-[#2596be]/50 pl-11 pr-11"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#2596be] transition-colors duration-300" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2596be] transition-colors duration-300 p-1 rounded-lg hover:bg-[#2596be]/10"
                      >
                        {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#2596be] via-[#3c62b3] to-[#2596be] hover:from-[#3c62b3] hover:via-[#2d4d8a] hover:to-[#3c62b3] text-white font-bold h-14 text-lg rounded-xl shadow-xl shadow-[#2596be]/30 hover:shadow-2xl hover:shadow-[#2596be]/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group/btn"
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
                      <User className="h-4 w-4 text-[#2596be]" />
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
                        className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#2596be]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300 hover:border-[#2596be]/50 pl-11"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#2596be] transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="registerEmail" className="text-white font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#2596be]" />
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
                        className="bg-[#0a0a0f]/80 backdrop-blur-sm border-2 border-[#2596be]/30 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300 hover:border-[#2596be]/50 pl-11"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#2596be] transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="registerPhone" className="text-white font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#2596be]" />
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
                        className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#2596be]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300 hover:border-[#2596be]/50 pl-11"
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#2596be] transition-colors duration-300" />
                    </div>
                  </div>

                  {/* University & Field of Study - Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                      <Label htmlFor="registerUniversity" className="text-white font-semibold flex items-center gap-2">
                        <Star className="h-4 w-4 text-[#2596be]" />
                        University
                      </Label>
                      <div className="relative">
                        <Input
                          id="registerUniversity"
                          type="text"
                          value={registerUniversity}
                          onChange={(e) => setRegisterUniversity(e.target.value)}
                          placeholder="University"
                          className="bg-[#0a0a0f]/80 backdrop-blur-sm border-2 border-[#2596be]/30 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300 hover:border-[#2596be]/50 pl-11"
                        />
                        <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#2596be] transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="space-y-2 group">
                      <Label htmlFor="registerField" className="text-white font-semibold flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#2596be]" />
                        Field of Study
                      </Label>
                      <div className="relative">
                        <Input
                          id="registerField"
                          type="text"
                          value={registerField}
                          onChange={(e) => setRegisterField(e.target.value)}
                          placeholder="Field"
                          className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#2596be]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300 hover:border-[#2596be]/50 pl-11"
                        />
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#2596be] transition-colors duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="registerPassword" className="text-white font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#2596be]" />
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
                        className="!bg-[#0a0a0f] backdrop-blur-sm border-2 border-[#2596be]/30 !text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300 hover:border-[#2596be]/50 pl-11 pr-11"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#2596be] transition-colors duration-300" />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2596be] transition-colors duration-300 p-1 rounded-lg hover:bg-[#2596be]/10"
                      >
                        {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#2596be] via-[#3c62b3] to-[#2596be] hover:from-[#3c62b3] hover:via-[#2d4d8a] hover:to-[#3c62b3] text-white font-bold h-14 text-lg rounded-xl shadow-xl shadow-[#2596be]/30 hover:shadow-2xl hover:shadow-[#2596be]/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group/btn"
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
