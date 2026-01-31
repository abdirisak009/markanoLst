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
      <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row relative overflow-hidden">
        {/* Skeleton sidebar – desktop only */}
        <div className="hidden lg:flex w-64 flex-shrink-0 bg-gradient-to-b from-[#0a3d4d] via-[#156b85] to-[#2596be] border-r border-[#0a3d4d]/50 flex-col relative z-10 shadow-xl animate-pulse">
          <div className="px-3 py-3 border-b border-white/10 flex flex-col items-center gap-2 shrink-0 bg-[#0a3d4d]/80">
            <div className="h-10 w-32 rounded-lg bg-white/20" />
            <div className="h-3 w-20 rounded bg-white/20" />
          </div>
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-white/20" />
              <div className="h-3 w-16 rounded bg-white/15" />
            </div>
          </div>
          <div className="flex-1 p-3 space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-white/10" />
            ))}
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="h-8 w-full rounded-lg bg-white/10" />
          </div>
        </div>
        {/* Skeleton main content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-7xl mx-auto px-8 py-8 animate-pulse">
            <div className="mb-8">
              <div className="h-10 w-64 rounded-lg bg-[#2596be]/10 mb-3" />
              <div className="h-5 w-96 max-w-full rounded bg-[#2596be]/10" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-[#2596be]/12 bg-white p-6 space-y-4">
                <div className="h-6 w-32 rounded-lg bg-[#2596be]/15" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-lg bg-[#2596be]/10" />
                  <div className="h-20 rounded-lg bg-[#2596be]/10" />
                </div>
                <div className="h-24 rounded-lg bg-[#2596be]/10" />
              </div>
              <div className="rounded-xl border border-[#2596be]/12 bg-white p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-6 w-40 rounded-lg bg-[#2596be]/15" />
                  <div className="h-8 w-24 rounded-lg bg-[#2596be]/10" />
                </div>
                <div className="h-28 rounded-lg bg-[#2596be]/10" />
              </div>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <div className="h-6 w-48 rounded-lg bg-[#2596be]/15" />
              <div className="h-4 w-16 rounded bg-[#2596be]/10" />
            </div>
            <div className="rounded-xl border border-[#2596be]/12 bg-white p-12 flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#2596be]/10" />
              <div className="h-5 w-56 rounded-lg bg-[#2596be]/10" />
              <div className="h-4 w-72 max-w-full rounded bg-[#2596be]/10" />
              <div className="h-12 w-40 rounded-lg bg-[#2596be]/15" />
            </div>
          </div>
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

  const dashboardNavItems: { view: View; label: string; Icon: typeof Home }[] = [
    { view: "home", label: "Home", Icon: Home },
    { view: "courses", label: "Courses", Icon: BookOpen },
    { view: "forum", label: "Forum", Icon: MessageCircle },
    { view: "certificates", label: "Certificates", Icon: GraduationCap },
    { view: "settings", label: "Settings", Icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left Sidebar – desktop only (taleefan bottom nav) */}
      <div className="hidden lg:flex w-64 flex-shrink-0 bg-gradient-to-b from-[#0a3d4d] via-[#156b85] to-[#2596be] border-r border-[#0a3d4d]/50 flex-col relative z-10 shadow-xl">
        {/* Sidebar header: logo fit to sidebar width */}
        <div className="px-3 py-3 border-b border-white/10 flex flex-col items-center justify-center gap-1.5 shrink-0 bg-[#0a3d4d]/80">
          <div className="w-full min-w-0 flex items-center justify-center" style={{ maxHeight: 44 }}>
            <img
              src="/footer-logo.png"
              alt="Markano"
              className="max-h-11 max-w-full w-auto object-contain object-center brightness-0 invert"
              style={{ width: "auto", height: "auto", maxWidth: "100%" }}
            />
          </div>
          <span className="text-white text-[10px] font-semibold uppercase tracking-widest opacity-95">Student Portal</span>
        </div>
        {/* User Profile */}
        <div className="p-4 border-b border-white/10 relative overflow-hidden bg-white/5">
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg ring-2 ring-white/30 flex-shrink-0">
              {studentData.full_name
                ? studentData.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm truncate">
                {studentData.full_name || "Student"}
              </h3>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold whitespace-nowrap">
                Level {xpData?.current_level || 1} · Pro
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-3">
          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveView("home")
                window.history.pushState({}, "", "/profile")
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeView === "home"
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              <span>Home</span>
            </button>
            <button
              onClick={() => {
                setActiveView("courses")
                window.history.pushState({}, "", "/learning/my-courses")
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeView === "courses"
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              <span>My Courses</span>
            </button>
            <button
              onClick={() => {
                setActiveView("forum")
                window.history.pushState({}, "", "/forum")
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeView === "forum"
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MessageCircle className="h-4 w-4 flex-shrink-0" />
              <span>Forum</span>
            </button>
            <button
              onClick={() => {
                setActiveView("certificates")
                window.history.pushState({}, "", "/profile?view=certificates")
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeView === "certificates"
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <span>Certificates</span>
            </button>
            <button
              onClick={() => {
                setActiveView("settings")
                window.history.pushState({}, "", "/profile?view=settings")
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeView === "settings"
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-xs py-2 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile: tab bar (sida mobile app) – Home, Courses, Forum, Certificates, Settings */}
      <div className="lg:hidden flex-shrink-0 sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#e5e7eb] px-2 py-2">
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-2 px-2">
          {dashboardNavItems.map(({ view, label, Icon }) => (
            <button
              key={view}
              type="button"
              onClick={() => {
                setActiveView(view)
                const url = view === "home" ? "/profile" : view === "courses" ? "/learning/my-courses" : view === "forum" ? "/forum" : `/profile?view=${view}`
                window.history.pushState({}, "", url)
              }}
              className={`flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeView === view
                  ? "bg-[#2596be] text-white shadow-md"
                  : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#2596be]/10 hover:text-[#2596be]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area – responsive (mobile app style) */}
      <div className="flex-1 overflow-y-auto relative z-10 bg-white min-h-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-24 lg:pb-8">
          {activeView === "home" && (
            <>
              {/* Top Header - Welcome back qurxan (brand colors) */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="relative">
                  <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-[#0f172a] via-[#2596be] to-[#3c62b3] bg-clip-text text-transparent drop-shadow-sm">
                    Welcome back, {studentData.full_name || "Student"}! 👋
                  </h1>
                  <p className="text-gray-600 text-lg">
                    You've completed{" "}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#2596be]/15 to-[#3c62b3]/15 border border-[#2596be]/25 text-[#2596be] font-bold shadow-sm">
                      <Flame className="h-4 w-4 text-[#2596be]" />
                      <span>{weeklyProgress}%</span>
                    </span>{" "}
                    of your weekly goals. Keep it up! 🚀
                  </p>
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
                <Card className="mb-6 bg-emerald-50 border-2 border-emerald-200 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <MessageCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[#0f172a] font-semibold">Fariin streak – WhatsApp</p>
                      <p className="text-gray-600 text-sm">
                        Waxaa laguu diray fariin streak WhatsApp:{" "}
                        <span className="text-emerald-600 font-medium">
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

              {/* Overview cards - compact, professional */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Your Progress - compact */}
                <Card className="bg-white border border-[#2596be]/12 rounded-xl shadow-sm hover:shadow-md hover:border-[#2596be]/25 transition-all overflow-hidden">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-[#0f172a] flex items-center gap-2 text-base font-semibold">
                      <div className="p-1.5 rounded-lg bg-[#2596be]/10">
                        <Flag className="h-4 w-4 text-[#2596be]" />
                      </div>
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-[#2596be]/5 border border-[#2596be]/10 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-0.5">Total XP</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl font-bold text-[#2596be]">{xpData?.total_xp || 0}</span>
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                            <TrendingUp className="h-3 w-3" /> +15%
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#3c62b3]/5 border border-[#3c62b3]/10 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-0.5">Global Rank</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xl font-bold text-[#3c62b3]">Top 5%</span>
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                            <TrendingUp className="h-3 w-3" /> +1%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#2596be]/5 border border-[#2596be]/10 p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1.5 mb-2">
                        <Sparkles className="h-3 w-3 text-[#2596be]" />
                        Recent Badges
                      </p>
                      <div className="flex items-center justify-center gap-2 min-h-[40px]">
                        {badgeData && badgeData.earned && badgeData.earned.length > 0 ? (
                          badgeData.earned.slice(0, 4).map((badge) => (
                            <div key={badge.id} className="relative group/badge">
                              <div className="w-9 h-9 rounded-full bg-[#2596be]/15 border border-[#2596be]/25 flex items-center justify-center hover:scale-110 transition-transform">
                                <Award className="h-4 w-4 text-[#2596be]" />
                              </div>
                              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                <span className="bg-[#0f172a] text-white text-[10px] px-2 py-0.5 rounded shadow-lg">{badge.badge_name}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <Plus className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-medium">Earn your first badge</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Activity - compact */}
                <Card className="bg-white border border-[#2596be]/12 rounded-xl shadow-sm hover:shadow-md hover:border-[#2596be]/25 transition-all overflow-hidden">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-[#0f172a] flex items-center gap-2 text-base font-semibold">
                        <div className="p-1.5 rounded-lg bg-[#2596be]/10">
                          <BarChart3 className="h-4 w-4 text-[#2596be]" />
                        </div>
                        Performance Activity
                      </CardTitle>
                      <div className="flex gap-1 bg-gray-100 rounded-md p-0.5">
                        <button
                          onClick={() => setActiveTab("weekly")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                            activeTab === "weekly"
                              ? "bg-[#2596be] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Weekly
                        </button>
                        <button
                          onClick={() => setActiveTab("monthly")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                            activeTab === "monthly"
                              ? "bg-[#2596be] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-1">
                    <div className="h-28 flex items-end justify-between gap-1.5">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                        const height = activeTab === "weekly" 
                          ? [60, 45, 70, 90, 55, 40, 65][i] 
                          : [50, 60, 45, 70, 80, 55, 65][i]
                        return (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                            <div
                              className="w-full rounded-t transition-all duration-500 bg-gradient-to-t from-[#2596be] to-[#3c62b3] min-h-[4px]"
                              style={{ height: `${Math.max(height * 0.8, 8)}%` }}
                              title={`${height}%`}
                            />
                            <span className="text-[10px] text-gray-500 font-medium">{day}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enrolled courses - compact overview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#2596be]/10 border border-[#2596be]/15">
                      <BookOpen className="h-4 w-4 text-[#2596be]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0f172a]">
                        Koorsoyinka aad iska diiwaangalisay
                      </h2>
                      <p className="text-gray-500 text-xs">Ardayga aad ah – koorsoyinka aad iska diiwaangalisay</p>
                    </div>
                  </div>
                  <Link href="/self-learning">
                    <span className="text-[#2596be] hover:text-[#3c62b3] text-xs font-semibold flex items-center gap-0.5 hover:gap-1 transition-all">
                      View All <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </div>

                {courses.length === 0 ? (
                  <Card className="bg-white border border-[#2596be]/12 rounded-xl shadow-sm overflow-hidden">
                    <CardContent className="py-8 px-6 text-center">
                      <div className="inline-flex p-3 rounded-xl bg-[#2596be]/10 mb-3">
                        <BookOpen className="h-10 w-10 text-[#2596be]" />
                      </div>
                      <h3 className="text-base font-bold text-[#0f172a] mb-1">Start Your Learning Journey</h3>
                      <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">Weli ma diiwaangalisan koorsas. Koorsoyinka aad iska diiwaangalisay waxaa ku jiri doona halkan.</p>
                      <Link href="/self-learning">
                        <Button className="bg-[#2596be] hover:bg-[#1e7a9e] text-white text-sm font-semibold px-5 py-2.5 shadow-md hover:shadow-lg transition-all rounded-lg">
                          <Sparkles className="h-4 w-4 mr-1.5" />
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
                        className="bg-white border-2 border-[#2596be]/15 shadow-[0_8px_24px_rgba(37,150,190,0.06)] hover:shadow-[0_16px_40px_rgba(37,150,190,0.12)] hover:border-[#2596be]/30 transition-all duration-300 cursor-pointer group overflow-hidden hover:-translate-y-1"
                        onClick={() => router.push(`/learning/courses/${course.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-[#2596be]/5 border border-[#2596be]/10 group-hover:border-[#2596be]/25 transition-all">
                            {course.thumbnail_url ? (
                              <>
                                <img
                                  src={getImageSrc(course.thumbnail_url) || course.thumbnail_url}
                                  alt={course.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#2596be]/5">
                                <BookOpen className="h-16 w-16 text-[#2596be]/40 group-hover:text-[#2596be] transition-colors" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-[#2596be] rounded-full p-2 shadow-lg">
                                <Play className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          </div>
                          <h3 className="text-[#0f172a] font-bold text-lg mb-2 group-hover:text-[#2596be] transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-gray-500 text-sm mb-4">
                            Module {Math.ceil((course.progress.lessons_completed / course.progress.total_lessons) * 12) || 1} of 12
                          </p>
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-gray-500">Progress</span>
                              <span className="text-[#2596be] font-bold">{course.progress.progress_percentage}%</span>
                            </div>
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2596be] to-[#3c62b3] rounded-full transition-all duration-500"
                                style={{ width: `${course.progress.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#2596be] font-bold text-sm flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              {course.progress.progress_percentage}% Complete
                            </span>
                            <span className="text-gray-500 text-xs flex items-center gap-1">
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
                  <div className="p-2 rounded-lg bg-[#2596be]/10 border border-[#2596be]/20">
                    <BookOpen className="h-6 w-6 text-[#2596be]" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-bold text-[#0f172a]">
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
                <Card className="bg-white border-2 border-[#2596be]/15 shadow-[0_8px_24px_rgba(37,150,190,0.06)]">
                  <CardContent className="p-16 text-center">
                    <div className="inline-block mb-6 p-4 rounded-2xl bg-[#2596be]/10">
                      <BookOpen className="h-20 w-20 text-[#2596be] mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-2">Start Your Learning Journey</h3>
                    <p className="text-gray-600 mb-6">Weli ma diiwaangalisan koorsas. Koorsoyinka aad iska diiwaangalisay waxaa ku jiri doona halkan.</p>
                    <Link href="/self-learning">
                      <Button className="bg-[#2596be] hover:bg-[#1e7a9e] text-white font-bold px-8 py-6 shadow-lg shadow-[#2596be]/25 transition-all hover:scale-105">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Browse Courses
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card
                      key={course.id}
                      className="bg-white border-2 border-[#2596be]/15 shadow-[0_8px_24px_rgba(37,150,190,0.06)] hover:shadow-[0_16px_40px_rgba(37,150,190,0.12)] hover:border-[#2596be]/30 transition-all duration-300 cursor-pointer group overflow-hidden hover:-translate-y-1"
                      onClick={() => router.push(`/learning/courses/${course.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-[#2596be]/5 border border-[#2596be]/10 group-hover:border-[#2596be]/25 transition-all">
                          {course.thumbnail_url ? (
                            <>
                              <img
                                src={getImageSrc(course.thumbnail_url) || course.thumbnail_url}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#2596be]/5">
                              <BookOpen className="h-16 w-16 text-[#2596be]/40 group-hover:text-[#2596be] transition-colors" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-[#2596be] rounded-full p-2 shadow-lg">
                              <Play className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </div>
                        <h3 className="text-[#0f172a] font-bold text-lg mb-2 group-hover:text-[#2596be] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-[#2596be] font-bold">{course.progress.progress_percentage}%</span>
                          </div>
                          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2596be] to-[#3c62b3] rounded-full transition-all duration-500"
                              style={{ width: `${course.progress.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {course.progress.lessons_completed} / {course.progress.total_lessons} lessons
                          </span>
                        </div>
                        <Button
                          className="w-full bg-[#2596be] hover:bg-[#1e7a9e] text-white font-semibold shadow-lg shadow-[#2596be]/25 hover:shadow-[#2596be]/40 transition-all hover:scale-[1.02] group/btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/learning/courses/${course.id}`)
                          }}
                        >
                          <span className="flex items-center gap-2">
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
            <div className="space-y-4 md:space-y-6">
              {/* Header – mobile app style: compact on mobile, full on desktop */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0f172a] mb-1 bg-gradient-to-r from-[#0f172a] via-[#2596be] to-[#3c62b3] bg-clip-text text-transparent md:bg-none md:text-[#0f172a]">
                    Community
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">Connect with students and get help</p>
                </div>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-semibold shadow-lg shadow-[#2596be]/25 rounded-xl h-11 px-5 touch-target">
                  <Plus className="h-4 w-4 mr-2" />
                  New Topic
                </Button>
              </div>

              {/* Stats – horizontal scroll on mobile (swipeable), grid on desktop */}
              <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-1 snap-x snap-mandatory touch-pan-x">
                <div className="flex-shrink-0 w-[140px] md:w-auto snap-center">
                  <Card className="bg-white border-2 border-[#2596be]/15 shadow-sm rounded-2xl overflow-hidden h-full">
                    <CardContent className="p-4">
                      <p className="text-gray-500 text-xs mb-0.5">Topics</p>
                      <p className="text-xl md:text-2xl font-bold text-[#2596be]">{forumStats.totalTopics}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-shrink-0 w-[140px] md:w-auto snap-center">
                  <Card className="bg-white border-2 border-[#2596be]/15 shadow-sm rounded-2xl overflow-hidden h-full">
                    <CardContent className="p-4">
                      <p className="text-gray-500 text-xs mb-0.5">Replies</p>
                      <p className="text-xl md:text-2xl font-bold text-[#2596be]">{forumStats.totalReplies}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-shrink-0 w-[140px] md:w-auto snap-center">
                  <Card className="bg-white border-2 border-[#2596be]/15 shadow-sm rounded-2xl overflow-hidden h-full">
                    <CardContent className="p-4">
                      <p className="text-gray-500 text-xs mb-0.5">Views</p>
                      <p className="text-xl md:text-2xl font-bold text-[#2596be]">{formatViews(forumStats.totalViews)}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-shrink-0 w-[140px] md:w-auto snap-center">
                  <Card className="bg-white border-2 border-[#3c62b3]/20 shadow-sm rounded-2xl overflow-hidden h-full">
                    <CardContent className="p-4">
                      <p className="text-gray-500 text-xs mb-0.5">Active</p>
                      <p className="text-xl md:text-2xl font-bold text-[#3c62b3]">{forumStats.activeUsers}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Search – prominent on mobile */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-2 border-[#2596be]/20 focus:border-[#2596be] bg-white text-[#0f172a] placeholder:text-gray-400"
                />
              </div>

              {/* Tabs – pill/segmented control on mobile, underline on desktop */}
              <div className="flex rounded-2xl md:rounded-none bg-[#f1f5f9] md:bg-transparent p-1 md:p-0 gap-0 md:gap-2 md:border-b md:border-gray-200">
                <button
                  onClick={() => setForumActiveTab("latest")}
                  className={`flex-1 md:flex-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-none text-sm font-medium transition-all touch-target md:border-b-2 ${
                    forumActiveTab === "latest"
                      ? "bg-white md:bg-transparent text-[#2596be] shadow-sm md:shadow-none md:border-[#2596be]"
                      : "text-gray-600 hover:text-[#0f172a] md:border-transparent"
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setForumActiveTab("hot")}
                  className={`flex-1 md:flex-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-none text-sm font-medium transition-all touch-target md:border-b-2 ${
                    forumActiveTab === "hot"
                      ? "bg-white md:bg-transparent text-[#2596be] shadow-sm md:shadow-none md:border-[#2596be]"
                      : "text-gray-600 hover:text-[#0f172a] md:border-transparent"
                  }`}
                >
                  Hot
                </button>
                <button
                  onClick={() => setForumActiveTab("categories")}
                  className={`flex-1 md:flex-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-none text-sm font-medium transition-all touch-target md:border-b-2 ${
                    forumActiveTab === "categories"
                      ? "bg-white md:bg-transparent text-[#2596be] shadow-sm md:shadow-none md:border-[#2596be]"
                      : "text-gray-600 hover:text-[#0f172a] md:border-transparent"
                  }`}
                >
                  Categories
                </button>
              </div>

              {forumLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[#2596be]/30 border-t-[#2596be] mb-4"></div>
                  <p className="text-gray-500 text-sm">Loading community...</p>
                </div>
              ) : forumActiveTab === "categories" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {forumCategories.map((category) => (
                    <Card
                      key={category.id}
                      className="bg-white border-2 border-[#2596be]/15 hover:border-[#2596be]/40 rounded-2xl shadow-lg shadow-[#2596be]/5 hover:shadow-xl hover:shadow-[#2596be]/10 transition-all cursor-pointer active:scale-[0.98] overflow-hidden"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20 border border-[#2596be]/25 flex items-center justify-center flex-shrink-0">
                            {iconMap[category.icon] || <MessageCircle className="w-6 h-6 text-[#2596be]" />}
                          </div>
                          <h3 className="text-[#0f172a] font-bold text-lg">{category.name}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{category.topics_count} topics</span>
                          <span>{category.posts_count} posts</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {filteredTopics.length === 0 ? (
                    <Card className="bg-white border-2 border-[#2596be]/15 rounded-2xl overflow-hidden">
                      <CardContent className="p-8 md:p-12 text-center">
                        <div className="inline-flex p-4 rounded-2xl bg-[#2596be]/10 mb-4">
                          <MessageCircle className="h-12 w-12 text-[#2596be]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#0f172a] mb-2">No topics yet</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {searchQuery ? "No topics match your search." : "Be the first to start a conversation."}
                        </p>
                        {!searchQuery && (
                          <Button className="bg-[#2596be] hover:bg-[#3c62b3] text-white rounded-xl">
                            <Plus className="h-4 w-4 mr-2" />
                            New Topic
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredTopics.map((topic) => (
                      <Card
                        key={topic.id}
                        className="bg-white border-2 border-[#2596be]/15 hover:border-[#2596be]/40 rounded-2xl shadow-lg shadow-[#2596be]/5 hover:shadow-xl transition-all cursor-pointer active:scale-[0.99] overflow-hidden touch-target"
                        onClick={() => router.push(`/forum/topic/${topic.id}`)}
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20 border-2 border-[#2596be]/30 flex items-center justify-center">
                              <User className="h-5 w-5 text-[#2596be]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                {topic.is_pinned && <Pin className="h-4 w-4 text-[#2596be] flex-shrink-0" />}
                                {topic.is_locked && <Lock className="h-4 w-4 text-gray-500 flex-shrink-0" />}
                                {topic.is_solved && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                                <h3 className="text-[#0f172a] font-bold text-base md:text-lg line-clamp-2">{topic.title}</h3>
                              </div>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{topic.content}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                <span>by {topic.author_name}</span>
                                <span>{formatTimeAgo(topic.created_at)}</span>
                                <span>{formatViews(topic.views)} views</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className="inline-flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-xl bg-[#2596be]/10 border border-[#2596be]/20">
                                <span className="text-[#2596be] font-bold text-lg">{topic.replies_count}</span>
                                <span className="text-gray-500 text-xs">replies</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeView === "certificates" && (
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-2xl bg-[#2596be]/10 mb-4">
                <GraduationCap className="h-16 w-16 text-[#2596be]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Certificates</h2>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          )}

          {activeView === "settings" && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-3">Settings</h1>
                <p className="text-gray-600">Manage your account information and preferences</p>
              </div>

              <Card className="bg-white border-2 border-[#2596be]/15 shadow-[0_8px_24px_rgba(37,150,190,0.06)]">
                <CardHeader>
                  <CardTitle className="text-[#0f172a] flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#2596be]/10 border border-[#2596be]/20">
                      <User className="h-5 w-5 text-[#2596be]" />
                    </div>
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Label className="text-gray-700 font-semibold">Profile Picture</Label>
                    <ImageUpload
                      value={settingsData.profile_image}
                      onChange={(url) => setSettingsData({ ...settingsData, profile_image: url })}
                      onRemove={() => setSettingsData({ ...settingsData, profile_image: "" })}
                      folder="profile-images"
                      size="lg"
                    />
                    <p className="text-xs text-gray-500 text-center">Click or drag to upload. Max 5MB</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={settingsData.full_name}
                      onChange={(e) => setSettingsData({ ...settingsData, full_name: e.target.value })}
                      className="bg-white border-gray-200 text-[#0f172a] focus:border-[#2596be] focus:ring-[#2596be]/20"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={settingsData.email}
                      onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                      className="bg-white border-gray-200 text-[#0f172a] focus:border-[#2596be] focus:ring-[#2596be]/20"
                      placeholder="Enter your email"
                    />
                  </div>

                  <Button
                    onClick={handleUpdateProfile}
                    disabled={settingsLoading}
                    className="w-full bg-[#2596be] hover:bg-[#1e7a9e] text-white font-semibold shadow-lg shadow-[#2596be]/25 transition-all"
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

              <Card className="bg-white border-2 border-[#2596be]/15 shadow-[0_8px_24px_rgba(37,150,190,0.06)]">
                <CardHeader>
                  <CardTitle className="text-[#0f172a] flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#2596be]/10 border border-[#2596be]/20">
                      <Key className="h-5 w-5 text-[#2596be]" />
                    </div>
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old_password" className="text-gray-700 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="old_password"
                        type={showPassword.old ? "text" : "password"}
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        className="bg-white border-gray-200 text-[#0f172a] focus:border-[#2596be] focus:ring-[#2596be]/20 pr-10"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2596be]"
                      >
                        {showPassword.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-gray-700 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="bg-white border-gray-200 text-[#0f172a] focus:border-[#2596be] focus:ring-[#2596be]/20 pr-10"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2596be]"
                      >
                        {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-gray-700 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="bg-white border-gray-200 text-[#0f172a] focus:border-[#2596be] focus:ring-[#2596be]/20 pr-10"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2596be]"
                      >
                        {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleUpdatePassword}
                    disabled={settingsLoading}
                    className="w-full bg-[#2596be] hover:bg-[#1e7a9e] text-white font-semibold shadow-lg shadow-[#2596be]/25 transition-all"
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
