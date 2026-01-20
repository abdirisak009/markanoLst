"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Award,
  User,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Menu,
  X,
} from "lucide-react"

interface Student {
  id: number
  full_name: string
  email: string
}

export default function GoldLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [student, setStudent] = useState<Student | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStudent = () => {
      try {
        const storedStudent = localStorage.getItem("gold_student")
        if (!storedStudent) {
          setLoading(false)
          router.push("/gold")
          return
        }
        const studentData = JSON.parse(storedStudent)
        setStudent(studentData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading student data:", error)
        setLoading(false)
        router.push("/gold")
      }
    }

    // Load immediately
    loadStudent()

    // Also reload on focus (when user comes back to tab)
    const handleFocus = () => {
      if (!loading) {
        loadStudent()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem("gold_student")
    document.cookie = "goldStudentId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/gold")
  }

  const navigation = [
    { name: "Dashboard", href: "/gold/dashboard", icon: LayoutDashboard },
    { name: "Forum", href: "/gold/forum", icon: MessageSquare },
    { name: "Settings", href: "/gold/settings", icon: Settings },
  ]

  // Don't show sidebar on login/register pages or dashboard
  if (pathname === "/gold" || pathname === "/gold/login" || pathname === "/gold/register" || pathname === "/gold/dashboard") {
    return <>{children}</>
  }

  // No track pages anymore
  const isTrackPage = false

  // Show loading state only if we don't have student data yet
  // This prevents blocking when student data is already available
  if (loading && !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#013565] mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Hidden on track learning pages */}
      {!isTrackPage && (
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#013565] border-r border-white/10 transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo & Toggle */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#013565] to-[#024a8c]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#ff1b4a] rounded-xl shadow-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">Markano</span>
                  <span className="text-lg font-bold text-[#ff1b4a]"> Gold</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Student Profile */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ff1b4a] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{student?.full_name}</p>
                  <p className="text-xs text-white/60 truncate">{student?.email}</p>
                  <Badge className="mt-1 bg-[#ff1b4a]/20 text-white border border-[#ff1b4a]/30 text-xs">Gold Member</Badge>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#ff1b4a] text-white shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
              <Button
                variant="ghost"
                className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* Overlay for mobile - Only show if sidebar is visible */}
      {!isTrackPage && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${isTrackPage ? "bg-transparent" : "bg-gray-50"}`}>
        {/* Top Bar - Hidden on track learning pages */}
        {!isTrackPage && (
          <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-6 h-16">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-600 hover:text-gray-900"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1" />
              {student && (
                <div className="flex items-center gap-4">
                  <Badge className="bg-[#013565] text-white border-0">
                    {pathname === "/gold/dashboard" ? "Dashboard" : pathname === "/gold/forum" ? "Forum" : "Settings"}
                  </Badge>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${isTrackPage ? "p-0" : "p-6"}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
