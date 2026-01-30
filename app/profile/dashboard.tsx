"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Trophy,
  Zap,
  TrendingUp,
  MessageCircle,
  Award,
  Play,
  CheckCircle2,
  Clock,
  BarChart3,
  Flame,
  Home,
  GraduationCap,
  Settings,
  LogOut,
  ArrowRight,
  Flag,
  Eye,
  EyeOff,
  Pin,
  Lock,
  ChevronDown,
  Search,
  Plus,
  Filter,
  Code,
  FileCode,
  Terminal,
  Database,
  Shield,
  Briefcase,
  Folder,
  Component,
  Users,
  Sparkles,
  Save,
  Mail,
  User,
  Key,
  Camera,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { getImageSrc } from "@/lib/utils"
import { ImageUpload } from "@/components/image-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Course {
  id: number
  title: string
  description: string | null
  thumbnail_url: string | null
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
  level_name: string
  xp_to_next_level: number
  xp_in_current_level: number
}

interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
}

interface BadgeData {
  earned: Array<{
    id: number
    badge_key: string
    badge_name: string
    badge_icon: string
    earned_at: string
  }>
  available: Array<{
    id: number
    badge_key: string
    badge_name: string
    badge_icon: string
    xp_reward: number
  }>
}

interface ForumCategory {
  id: number
  name: string
  slug: string
  description: string
  color: string
  icon: string
  topics_count: number
  posts_count: number
}

interface ForumTopic {
  id: number
  category_id: number
  category_name: string
  category_slug: string
  category_color: string
  author_id: string
  author_name: string
  author_type: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  is_solved: boolean
  views: number
  replies_count: number
  last_reply_at: string
  created_at: string
  participants: { id: string; name: string; avatar?: string }[]
}

type View = "home" | "courses" | "forum" | "certificates" | "settings"

const iconMap: { [key: string]: React.ReactNode } = {
  "message-circle": <MessageCircle className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  "file-code": <FileCode className="w-5 h-5" />,
  component: <Component className="w-5 h-5" />,
  terminal: <Terminal className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
  folder: <Folder className="w-5 h-5" />,
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`
  return views.toString()
}

interface StudentDashboardProps {
  initialView?: View
}

export default function StudentDashboard({ initialView = "home" }: StudentDashboardProps) {
  const router = useRouter()
  const [activeView, setActiveView] = useState<View>(initialView)
  
  // Update view when initialView changes (for route changes)
  useEffect(() => {
    setActiveView(initialView)
  }, [initialView])
  const [studentData, setStudentData] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [xpData, setXpData] = useState<XPData | null>(null)
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null)
  const [streakMessageLastSent, setStreakMessageLastSent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly")
  
  // Forum state
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([])
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([])
  const [forumLoading, setForumLoading] = useState(false)
  const [forumActiveTab, setForumActiveTab] = useState<"latest" | "hot" | "categories">("latest")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Settings state
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsData, setSettingsData] = useState({
    full_name: "",
    email: "",
    profile_image: "",
  })
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    const storedStudent = localStorage.getItem("gold_student")
    if (!storedStudent) {
      router.push("/student-login")
      return
    }

    try {
      const parsed = JSON.parse(storedStudent)
      setStudentData(parsed)
      fetchDashboardData(parsed.id)
    } catch (error) {
      router.push("/student-login")
    }
  }, [router])

  // Load forum data when forum view is active
  useEffect(() => {
    if (activeView === "forum") {
      fetchForumData()
    }
  }, [activeView, forumActiveTab, selectedCategory])

  // Load settings data when settings view is active
  useEffect(() => {
    if (activeView === "settings" && studentData) {
      fetchSettingsData()
    }
  }, [activeView, studentData])

  const fetchSettingsData = async () => {
    if (!studentData?.id) return

    try {
      const response = await fetch("/api/gold/students/profile", {
        headers: {
          "x-user-id": studentData.id.toString(),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSettingsData({
          full_name: data.full_name || "",
          email: data.email || "",
          profile_image: data.profile_image || "",
        })
      }
    } catch (error) {
      console.error("Error fetching settings data:", error)
    }
  }

  const handleUpdateProfile = async () => {
    if (!studentData?.id) return

    setSettingsLoading(true)
    try {
      const response = await fetch("/api/gold/students/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": studentData.id.toString(),
        },
        body: JSON.stringify({
          full_name: settingsData.full_name,
          email: settingsData.email,
          profile_image: settingsData.profile_image,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Profile updated successfully!")
        // Update localStorage
        const updatedStudent = { ...studentData, ...data.student }
        localStorage.setItem("gold_student", JSON.stringify(updatedStudent))
        setStudentData(updatedStudent)
      } else {
        toast.error(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!studentData?.id) return

    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error("Please fill in all password fields")
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setSettingsLoading(true)
    try {
      const response = await fetch("/api/gold/students/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": studentData.id.toString(),
        },
        body: JSON.stringify({
          password: passwordData.new_password,
          old_password: passwordData.old_password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Password updated successfully!")
        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_password: "",
        })
      } else {
        toast.error(data.error || "Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("Failed to update password")
    } finally {
      setSettingsLoading(false)
    }
  }

  // Handle browser back/forward buttons for SPA navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === "/profile" || path === "/profile/") {
        setActiveView("home")
      } else if (path === "/learning/my-courses") {
        setActiveView("courses")
      } else if (path === "/forum") {
        setActiveView("forum")
      } else if (path.startsWith("/profile")) {
        const params = new URLSearchParams(window.location.search)
        const view = params.get("view")
        if (view && ["home", "courses", "forum", "certificates", "settings"].includes(view)) {
          setActiveView(view as View)
        }
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const fetchDashboardData = async (userId: number) => {
    try {
      const [coursesRes, xpRes, streakRes, badgesRes, streakMessagesRes] = await Promise.all([
        fetch(`/api/learning/courses?userId=${userId}`),
        fetch(`/api/learning/gamification/xp?userId=${userId}`),
        fetch(`/api/learning/gamification/streak?userId=${userId}`),
        fetch(`/api/learning/gamification/badges?userId=${userId}`),
        fetch(`/api/learning/streak-messages?userId=${userId}`),
      ])

      const coursesData = await coursesRes.json()
      const xpData = await xpRes.json()
      const streakData = await streakRes.json()
      const badgesData = await badgesRes.json()
      const streakMessagesData = streakMessagesRes.ok ? await streakMessagesRes.json() : {}

      setCourses(Array.isArray(coursesData) ? coursesData : [])
      setXpData(xpData)
      setStreakData(streakData)
      setBadgeData(badgesData)
      setStreakMessageLastSent(streakMessagesData.last_sent_at ?? null)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const fetchForumData = async () => {
    try {
      setForumLoading(true)
      const [categoriesRes, topicsRes] = await Promise.all([
        fetch("/api/forum/categories"),
        fetch(`/api/forum/topics?tab=${forumActiveTab}&category=${selectedCategory}`),
      ])

      if (categoriesRes.ok) {
        const catData = await categoriesRes.json()
        setForumCategories(catData)
      }

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json()
        setForumTopics(topicsData)
      }
    } catch (error) {
      console.error("Error fetching forum data:", error)
      toast.error("Failed to load forum data")
    } finally {
      setForumLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("gold_student")
    router.push("/student-login")
    router.refresh()
  }

  if (loading || !studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[#2596be]/30 border-t-[#3c62b3] mb-4"></div>
          <p className="text-gray-400 font-medium">Loading your dashboard...</p>
          <p className="text-[#2596be]/80 text-sm mt-1">Markano Student Portal</p>
        </div>
      </div>
    )
  }

  const levelProgress = xpData
    ? ((xpData.xp_in_current_level / xpData.xp_to_next_level) * 100).toFixed(0)
    : 0

  const weeklyProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.progress.progress_percentage, 0) / courses.length)
    : 0

  const currentCourse = courses.length > 0 ? courses[0] : null
  const getTimeLeft = (course: Course) => {
    const remaining = 100 - course.progress.progress_percentage
    return Math.round(remaining * 0.5)
  }

  const filteredTopics = forumTopics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const forumStats = {
    totalTopics: forumTopics.length,
    totalReplies: forumTopics.reduce((acc, t) => acc + t.replies_count, 0),
    totalViews: forumTopics.reduce((acc, t) => acc + t.views, 0),
    activeUsers: new Set(forumTopics.map((t) => t.author_id)).size,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/5 via-transparent to-[#3c62b3]/5 animate-pulse pointer-events-none" />
      
      {/* Left Sidebar - Always visible */}
      <div className="w-64 bg-gradient-to-b from-[#0a0a0f] to-[#0f1419] border-r border-white/10 flex flex-col relative z-10 backdrop-blur-sm shadow-2xl">
        {/* Markano Brand */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
          <div className="flex-shrink-0 h-10 w-auto max-w-[140px]">
            <img src="/footer-logo.png" alt="Markano" className="h-full w-auto object-contain object-left" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm tracking-tight">Markano</p>
            <p className="text-[#3c62b3]/90 text-xs font-medium">Student Portal</p>
          </div>
        </div>
        {/* User Profile - Side by Side Layout */}
        <div className="p-6 border-b border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/10 to-[#3c62b3]/5 opacity-50" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2596be] to-[#3c62b3] rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#2596be] via-[#3c62b3] to-[#3c62b3]/80 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-[#2596be]/40 ring-4 ring-[#2596be]/30">
                {studentData.full_name
                  ? studentData.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </div>
            </div>
            {/* Name and Level - Side by Side */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-base bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent truncate">
                {studentData.full_name || "Student"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#2596be]/20 to-[#3c62b3]/20 border border-[#2596be]/30">
                  <p className="text-xs font-semibold text-transparent bg-gradient-to-r from-[#2596be] to-[#3c62b3] bg-clip-text whitespace-nowrap">
                    Level {xpData?.current_level || 1} · Pro Learner
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => {
                setActiveView("home")
                window.history.pushState({}, "", "/profile")
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                activeView === "home"
                  ? "bg-gradient-to-r from-[#2596be] to-[#3c62b3] text-white shadow-lg shadow-[#2596be]/30"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {activeView === "home" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#3c62b3]/10 to-transparent" />
              )}
              <Home className={`h-5 w-5 relative z-10 ${activeView === "home" ? "text-[#3c62b3]" : "text-gray-400 group-hover:text-white transition-colors"}`} />
              <span className="relative z-10">Home</span>
            </button>
            <button
              onClick={() => {
                setActiveView("courses")
                window.history.pushState({}, "", "/learning/my-courses")
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                activeView === "courses"
                  ? "bg-gradient-to-r from-[#2596be] to-[#3c62b3] text-white shadow-lg shadow-[#2596be]/30"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {activeView === "courses" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#3c62b3]/10 to-transparent" />
              )}
              <BookOpen className={`h-5 w-5 relative z-10 ${activeView === "courses" ? "text-[#3c62b3]" : "text-gray-400 group-hover:text-white transition-colors"}`} />
              <span className="relative z-10">My Courses</span>
            </button>
            <button
              onClick={() => {
                setActiveView("forum")
                window.history.pushState({}, "", "/forum")
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                activeView === "forum"
                  ? "bg-gradient-to-r from-[#2596be] to-[#3c62b3] text-white shadow-lg shadow-[#2596be]/30"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {activeView === "forum" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#3c62b3]/10 to-transparent" />
              )}
              <MessageCircle className={`h-5 w-5 relative z-10 ${activeView === "forum" ? "text-[#3c62b3]" : "text-gray-400 group-hover:text-white transition-colors"}`} />
              <span className="relative z-10">Forum</span>
            </button>
            <button
              onClick={() => {
                setActiveView("certificates")
                window.history.pushState({}, "", "/profile?view=certificates")
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                activeView === "certificates"
                  ? "bg-gradient-to-r from-[#2596be] to-[#3c62b3] text-white shadow-lg shadow-[#2596be]/30"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {activeView === "certificates" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#3c62b3]/10 to-transparent" />
              )}
              <GraduationCap className={`h-5 w-5 relative z-10 ${activeView === "certificates" ? "text-[#3c62b3]" : "text-gray-400 group-hover:text-white transition-colors"}`} />
              <span className="relative z-10">Certificates</span>
            </button>
            <button
              onClick={() => {
                setActiveView("settings")
                window.history.pushState({}, "", "/profile?view=settings")
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                activeView === "settings"
                  ? "bg-gradient-to-r from-[#2596be] to-[#3c62b3] text-white shadow-lg shadow-[#2596be]/30"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {activeView === "settings" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#3c62b3]/10 to-transparent" />
              )}
              <Settings className={`h-5 w-5 relative z-10 ${activeView === "settings" ? "text-[#3c62b3]" : "text-gray-400 group-hover:text-white transition-colors"}`} />
              <span className="relative z-10">Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Changes based on activeView */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {activeView === "home" && (
            <>
              {/* Top Header */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#2596be]/20 to-[#3c62b3]/20 blur-3xl opacity-50 rounded-full animate-pulse" />
                  <div className="relative">
                    <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                      Welcome back, {studentData.full_name || "Student"}! 👋
                    </h1>
                    <p className="text-gray-300 text-lg">
                      You've completed{" "}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#2596be]/20 to-[#3c62b3]/20 border border-[#2596be]/30">
                        <Flame className="h-4 w-4 text-[#2596be] animate-pulse" />
                        <span className="text-[#2596be] font-bold">{weeklyProgress}%</span>
                      </span>{" "}
                      of your weekly goals. Keep it up! 🚀
                    </p>
                  </div>
                </div>
                {currentCourse && (
                  <Button
                    className="relative bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-bold px-8 py-6 text-lg shadow-2xl shadow-[#2596be]/40 hover:shadow-[#2596be]/60 transition-all duration-300 hover:scale-105 group overflow-hidden"
                    onClick={() => router.push(`/learning/courses/${currentCourse.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Resume Learning
                    </span>
                  </Button>
                )}
              </div>

              {/* Fariin streak: Waxaa laguu diray WhatsApp */}
              {streakMessageLastSent && (
                <Card className="mb-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <MessageCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Fariin streak – WhatsApp</p>
                      <p className="text-gray-400 text-sm">
                        Waxaa laguu diray fariin streak WhatsApp:{" "}
                        <span className="text-emerald-400">
                          {new Date(streakMessageLastSent).toLocaleDateString("so-SO", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress and Activity Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Your Progress Card */}
                <Card className="bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] border border-white/10 hover:border-[#2596be]/40 transition-all duration-300 relative overflow-hidden group shadow-xl hover:shadow-2xl hover:shadow-[#2596be]/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/10 via-[#3c62b3]/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2596be]/10 to-transparent rounded-full blur-3xl opacity-50" />
                  <CardHeader className="relative z-10 pb-4">
                    <CardTitle className="text-white flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#2596be]/30 via-[#3c62b3]/20 to-[#3c62b3]/20 border border-[#2596be]/30 shadow-lg">
                        <Flag className="h-6 w-6 text-[#2596be] drop-shadow-lg" />
                      </div>
                      <span className="text-xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Your Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-7 relative z-10 pt-2">
                    <div className="relative">
                      <p className="text-gray-400 text-sm mb-2">Total XP</p>
                      <div className="flex items-center justify-between">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-[#2596be]/20 to-[#3c62b3]/20 blur-xl opacity-50 rounded-lg" />
                          <p className="relative text-5xl font-black bg-gradient-to-r from-[#2596be] via-[#2596be] to-[#3c62b3] bg-clip-text text-transparent">
                            {xpData?.total_xp || 0}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                          <TrendingUp className="h-4 w-4 text-green-400 animate-bounce" />
                          <span className="text-sm font-semibold text-green-400">+15%</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <p className="text-gray-400 text-sm mb-2">Global Rank</p>
                      <div className="flex items-center justify-between">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-[#2596be]/20 to-[#3c62b3]/20 blur-xl opacity-50 rounded-lg" />
                          <p className="relative text-5xl font-black bg-gradient-to-r from-[#2596be] via-[#3c62b3] to-amber-400 bg-clip-text text-transparent">
                            Top 5%
                          </p>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-semibold text-green-400">+1%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#2596be]/5 to-[#3c62b3]/5 rounded-xl p-4 border border-[#2596be]/20">
                      <p className="text-gray-300 text-xs uppercase mb-4 tracking-wider font-semibold flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-[#3c62b3]" />
                        Recent Badges
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        {badgeData && badgeData.earned && badgeData.earned.length > 0 ? (
                          <>
                            {badgeData.earned.slice(0, 4).map((badge, idx) => (
                              <div
                                key={badge.id}
                                className="relative group/badge"
                                style={{ animationDelay: `${idx * 100}ms` }}
                              >
                                <div className="absolute -inset-2 bg-gradient-to-br from-[#2596be]/40 to-[#3c62b3]/40 rounded-full blur-xl opacity-0 group-hover/badge:opacity-100 transition-opacity animate-pulse" />
                                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#2596be]/40 via-[#3c62b3]/30 to-amber-500/30 border-2 border-[#2596be]/50 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-xl shadow-[#2596be]/30 hover:shadow-[#2596be]/50">
                                  <Award className="h-8 w-8 text-[#3c62b3]/90 group-hover/badge:text-yellow-300 transition-colors drop-shadow-lg" />
                                </div>
                                <div className="absolute -top-1 -right-1 z-10">
                                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse drop-shadow-lg" />
                                </div>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap">
                                  <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg border border-[#2596be]/30">
                                    {badge.badge_name}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="relative group w-full">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 hover:border-[#2596be]/50 hover:text-[#2596be] transition-all mx-auto hover:scale-110">
                              <Plus className="h-7 w-7" />
                            </div>
                            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap font-medium">
                              Earn your first badge! 🏆
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Activity Card */}
                <Card className="bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] border border-white/10 hover:border-[#3c62b3]/40 transition-all duration-300 relative overflow-hidden group shadow-xl hover:shadow-2xl hover:shadow-[#3c62b3]/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/10 via-[#3c62b3]/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#2596be]/10 to-transparent rounded-full blur-3xl opacity-50" />
                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#2596be]/30 via-[#3c62b3]/20 to-amber-500/20 border border-[#2596be]/30 shadow-lg">
                          <BarChart3 className="h-6 w-6 text-[#3c62b3] drop-shadow-lg" />
                        </div>
                        <span className="text-xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Performance Activity</span>
                      </CardTitle>
                      <div className="flex gap-2 bg-[#0a0a0f]/50 rounded-lg p-1">
                        <button
                          onClick={() => setActiveTab("weekly")}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            activeTab === "weekly"
                              ? "bg-gradient-to-r from-[#2596be] to-[#3c62b3] text-white shadow-lg shadow-[#2596be]/30"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          Weekly
                        </button>
                        <button
                          onClick={() => setActiveTab("monthly")}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            activeTab === "monthly"
                              ? "bg-gradient-to-r from-[#2596be] to-[#3c62b3] text-white shadow-lg shadow-[#2596be]/30"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-2">
                    <div className="h-44 flex items-end justify-between gap-2.5">
                      {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => {
                        const height = activeTab === "weekly" 
                          ? [60, 45, 70, 90, 55, 40, 65][i] 
                          : [50, 60, 45, 70, 80, 55, 65][i]
                        return (
                          <div key={day} className="flex-1 flex flex-col items-center gap-3 group/bar">
                            <div className="relative w-full flex flex-col items-center">
                              <div
                                className="w-full rounded-t-lg transition-all duration-500 ease-out relative overflow-hidden group-hover/bar:scale-105"
                                style={{
                                  height: `${height}%`,
                                  background: `linear-gradient(to top, #2596be, #ff6b6b, #ff8e8e, #ffb3b3)`,
                                  boxShadow: `0 4px 20px rgba(230, 57, 70, ${height / 100})`,
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 animate-pulse" />
                              </div>
                              <div className="absolute -top-6 opacity-0 group-hover/bar:opacity-100 transition-opacity text-xs font-semibold text-[#2596be] bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                                {height}%
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{day}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Koorsoyinka aad iska diiwaangalisay – ardayga iska diiwaangaliyay */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20">
                      <BookOpen className="h-6 w-6 text-[#2596be]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Koorsoyinka aad iska diiwaangalisay
                      </h2>
                      <p className="text-gray-500 text-sm mt-0.5">Ardayga aad ah – koorsoyinka aad iska diiwaangalisay</p>
                    </div>
                  </div>
                  <Link href="/self-learning">
                    <span className="text-[#2596be] hover:text-[#3c62b3] cursor-pointer text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      View All <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>

                {courses.length === 0 ? (
                  <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/5 to-[#3c62b3]/5" />
                    <CardContent className="p-16 text-center relative z-10">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20 blur-2xl rounded-full" />
                        <BookOpen className="relative h-20 w-20 text-gray-600 mx-auto" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Start Your Learning Journey</h3>
                      <p className="text-gray-400 mb-6">Weli ma diiwaangalisan koorsas. Koorsoyinka aad iska diiwaangalisay waxaa ku jiri doona halkan.</p>
                      <Link href="/self-learning">
                        <Button className="bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-bold px-8 py-6 shadow-lg shadow-[#2596be]/30 hover:shadow-[#2596be]/50 transition-all hover:scale-105">
                          <Sparkles className="h-5 w-5 mr-2" />
                          Browse Courses
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.slice(0, 3).map((course, idx) => (
                      <Card
                        key={course.id}
                        className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border border-white/10 hover:border-[#2596be]/50 transition-all duration-300 cursor-pointer group relative overflow-hidden hover:shadow-2xl hover:shadow-[#2596be]/20 hover:-translate-y-1"
                        style={{ animationDelay: `${idx * 100}ms` }}
                        onClick={() => router.push(`/learning/courses/${course.id}`)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/5 to-[#3c62b3]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 relative z-10">
                          <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/10 border border-white/10 group-hover:border-[#2596be]/50 transition-all">
                            {course.thumbnail_url ? (
                              <>
                                <img
                                  src={getImageSrc(course.thumbnail_url) || course.thumbnail_url}
                                  alt={course.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2596be]/10 to-[#3c62b3]/10">
                                <BookOpen className="h-16 w-16 text-gray-500 group-hover:text-[#2596be] transition-colors" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                                <Play className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          </div>
                          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#2596be] group-hover:to-[#3c62b3] group-hover:bg-clip-text transition-all">
                            {course.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Module {Math.ceil((course.progress.lessons_completed / course.progress.total_lessons) * 12) || 1} of 12
                          </p>
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-[#2596be] font-bold">{course.progress.progress_percentage}%</span>
                            </div>
                            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2596be] via-[#3c62b3] to-amber-500 rounded-full transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[#2596be]/50"
                                style={{ width: `${course.progress.progress_percentage}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#2596be] font-bold text-sm flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              {course.progress.progress_percentage}% Complete
                            </span>
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeLeft(course)}h left
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeView === "courses" && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20">
                    <BookOpen className="h-6 w-6 text-[#2596be]" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                      Koorsoyinka aad iska diiwaangalisay
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">Koorsoyinka aad iska diiwaangalisay (your enrolled courses)</p>
                  </div>
                </div>
                <Link href="/self-learning">
                  <span className="text-[#2596be] hover:text-[#3c62b3] cursor-pointer text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    Browse More <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>

              {courses.length === 0 ? (
                <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/5 to-[#3c62b3]/5" />
                  <CardContent className="p-16 text-center relative z-10">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20 blur-2xl rounded-full" />
                      <BookOpen className="relative h-20 w-20 text-gray-600 mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Start Your Learning Journey</h3>
                    <p className="text-gray-400 mb-6">Weli ma diiwaangalisan koorsas. Koorsoyinka aad iska diiwaangalisay waxaa ku jiri doona halkan.</p>
                    <Link href="/self-learning">
                      <Button className="bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-bold px-8 py-6 shadow-lg shadow-[#2596be]/30 hover:shadow-[#2596be]/50 transition-all hover:scale-105">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Browse Courses
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course, idx) => (
                    <Card
                      key={course.id}
                      className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border border-white/10 hover:border-[#2596be]/50 transition-all duration-300 cursor-pointer group relative overflow-hidden hover:shadow-2xl hover:shadow-[#2596be]/20 hover:-translate-y-1"
                      style={{ animationDelay: `${idx * 100}ms` }}
                      onClick={() => router.push(`/learning/courses/${course.id}`)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2596be]/5 to-[#3c62b3]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-6 relative z-10">
                        <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/10 border border-white/10 group-hover:border-[#2596be]/50 transition-all">
                          {course.thumbnail_url ? (
                            <>
                              <img
                                src={getImageSrc(course.thumbnail_url) || course.thumbnail_url}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2596be]/10 to-[#3c62b3]/10">
                              <BookOpen className="h-16 w-16 text-gray-500 group-hover:text-[#2596be] transition-colors" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                              <Play className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#2596be] group-hover:to-[#3c62b3] group-hover:bg-clip-text transition-all">
                          {course.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-[#2596be] font-bold">{course.progress.progress_percentage}%</span>
                          </div>
                          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2596be] via-[#3c62b3] to-amber-500 rounded-full transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[#2596be]/50"
                              style={{ width: `${course.progress.progress_percentage}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                            {course.progress.lessons_completed} / {course.progress.total_lessons} lessons
                          </span>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-semibold shadow-lg shadow-[#2596be]/30 hover:shadow-[#2596be]/50 transition-all hover:scale-105 group/btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/learning/courses/${course.id}`)
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-md" />
                          <span className="relative z-10 flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Continue
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {activeView === "forum" && (
            <div className="space-y-6">
              {/* Forum Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black text-white mb-2">Forum</h1>
                  <p className="text-gray-400">Connect with other students and get help</p>
                </div>
                <Button className="bg-[#2596be] hover:bg-[#3c62b3] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Topic
                </Button>
              </div>

              {/* Forum Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0f] border border-white/10">
                  <CardContent className="p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Topics</p>
                    <p className="text-2xl font-bold text-white">{forumStats.totalTopics}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border border-white/10">
                  <CardContent className="p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Replies</p>
                    <p className="text-2xl font-bold text-white">{forumStats.totalReplies}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border border-white/10">
                  <CardContent className="p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Views</p>
                    <p className="text-2xl font-bold text-white">{formatViews(forumStats.totalViews)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border border-white/10">
                  <CardContent className="p-4">
                    <p className="text-gray-400 text-sm mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-white">{forumStats.activeUsers}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Forum Tabs */}
              <div className="flex gap-2 border-b border-white/10">
                <button
                  onClick={() => setForumActiveTab("latest")}
                  className={`px-6 py-3 font-medium transition-all border-b-2 ${
                    forumActiveTab === "latest"
                      ? "border-[#2596be] text-[#2596be]"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setForumActiveTab("hot")}
                  className={`px-6 py-3 font-medium transition-all border-b-2 ${
                    forumActiveTab === "hot"
                      ? "border-[#2596be] text-[#2596be]"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  Hot
                </button>
                <button
                  onClick={() => setForumActiveTab("categories")}
                  className={`px-6 py-3 font-medium transition-all border-b-2 ${
                    forumActiveTab === "categories"
                      ? "border-[#2596be] text-[#2596be]"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  Categories
                </button>
              </div>

              {/* Forum Content */}
              {forumLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be]"></div>
                </div>
              ) : forumActiveTab === "categories" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {forumCategories.map((category) => (
                    <Card
                      key={category.id}
                      className="bg-[#0a0a0f] border border-white/10 hover:border-[#2596be]/40 transition-all cursor-pointer"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/10 flex items-center justify-center">
                            {iconMap[category.icon] || <MessageCircle className="w-5 h-5 text-[#2596be]" />}
                          </div>
                          <h3 className="text-white font-bold">{category.name}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{category.topics_count} topics</span>
                          <span>{category.posts_count} posts</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTopics.map((topic) => (
                    <Card
                      key={topic.id}
                      className="bg-[#0a0a0f] border border-white/10 hover:border-[#2596be]/40 transition-all cursor-pointer"
                      onClick={() => router.push(`/forum/topic/${topic.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {topic.is_pinned && <Pin className="h-4 w-4 text-[#2596be]" />}
                              {topic.is_locked && <Lock className="h-4 w-4 text-gray-500" />}
                              {topic.is_solved && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              <h3 className="text-white font-bold text-lg">{topic.title}</h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{topic.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>by {topic.author_name}</span>
                              <span>{formatTimeAgo(topic.created_at)}</span>
                              <span>{formatViews(topic.views)} views</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold text-lg">{topic.replies_count}</div>
                            <div className="text-gray-400 text-xs">replies</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === "certificates" && (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Certificates</h2>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          )}

          {activeView === "settings" && (
            <div className="space-y-8 max-w-4xl">
              {/* Header */}
              <div>
                <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-gray-400">Manage your account information and preferences</p>
              </div>

              {/* Profile Information Card */}
              <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20">
                      <User className="h-5 w-5 text-[#2596be]" />
                    </div>
                    <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-4">
                    <Label className="text-gray-300 font-semibold">Profile Picture</Label>
                    <ImageUpload
                      value={settingsData.profile_image}
                      onChange={(url) => setSettingsData({ ...settingsData, profile_image: url })}
                      onRemove={() => setSettingsData({ ...settingsData, profile_image: "" })}
                      folder="profile-images"
                      size="lg"
                    />
                    <p className="text-xs text-gray-500 text-center">Click or drag to upload. Max 5MB</p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-gray-300 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={settingsData.full_name}
                      onChange={(e) => setSettingsData({ ...settingsData, full_name: e.target.value })}
                      className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#2596be]"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={settingsData.email}
                      onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                      className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#2596be]"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={settingsLoading}
                    className="w-full bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-semibold shadow-lg shadow-[#2596be]/30 hover:shadow-[#2596be]/50 transition-all"
                  >
                    {settingsLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Change Password Card */}
              <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20">
                      <Key className="h-5 w-5 text-[#3c62b3]" />
                    </div>
                    <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Change Password</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Old Password */}
                  <div className="space-y-2">
                    <Label htmlFor="old_password" className="text-gray-300 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="old_password"
                        type={showPassword.old ? "text" : "password"}
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#2596be] pr-10"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-gray-300 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#2596be] pr-10"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-gray-300 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#2596be] pr-10"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Update Password Button */}
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={settingsLoading}
                    className="w-full bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-semibold shadow-lg shadow-[#2596be]/30 hover:shadow-[#2596be]/50 transition-all"
                  >
                    {settingsLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
