"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Video,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  QrCode,
  ChevronRight,
  UsersRound,
  FileText,
  DollarSign,
  FileBarChart,
  Trophy,
  Shield,
  ShoppingBag,
} from "lucide-react"

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", permission: "dashboard_view" },
  { href: "/admin/all-students", icon: Users, label: "All Students", permission: "students_view" },
  { href: "/admin/penn-students", icon: GraduationCap, label: "Penn Students", permission: "penn_students_view" },
  {
    href: "/admin/university-students",
    icon: Building2,
    label: "University Students",
    permission: "university_students_view",
  },
  { href: "/admin/universities", icon: Building2, label: "Universities", permission: "universities_view" },
  { href: "/admin/classes", icon: BookOpen, label: "Classes", permission: "classes_view" },
  { href: "/admin/courses", icon: BookOpen, label: "Courses", permission: "courses_view" },
  { href: "/admin/videos", icon: Video, label: "Videos", permission: "videos_view" },
  { href: "/admin/video-analytics", icon: TrendingUp, label: "Video Analytics", permission: "video_analytics_view" },
  { href: "/admin/assignments", icon: ClipboardList, label: "Assignments", permission: "assignments_view" },
  { href: "/admin/groups", icon: UsersRound, label: "Groups", permission: "groups_view" },
  { href: "/admin/groups/reports", icon: FileText, label: "Group Reports", permission: "group_reports_view" },
  { href: "/admin/challenges", icon: Trophy, label: "Challenges", permission: "challenges_view" },
  { href: "/admin/ecommerce-submissions", icon: ShoppingBag, label: "E-commerce Wizard", permission: "dashboard_view" },
  { href: "/admin/payments", icon: DollarSign, label: "Payments", permission: "payments_view" },
  { href: "/admin/general-expenses", icon: DollarSign, label: "General Expenses", permission: "expenses_view" },
  {
    href: "/admin/financial-report",
    icon: FileBarChart,
    label: "Financial Report",
    permission: "financial_report_view",
  },
  { href: "/admin/performance", icon: TrendingUp, label: "Performance", permission: "performance_view" },
  { href: "/admin/analytics", icon: TrendingUp, label: "Analytics", permission: "analytics_view" },
  { href: "/admin/approvals", icon: CheckCircle, label: "Approvals", permission: "approvals_view" },
  { href: "/admin/qr-codes", icon: QrCode, label: "QR Codes", permission: "qr_codes_view" },
  { href: "/admin/users", icon: Shield, label: "Users", permission: "users_view" },
]

// Converts "university_students_view" to "view_university_students" and vice versa
function getAlternatePermissionFormat(permission: string): string {
  // If permission ends with _view or _edit, convert to view_X or edit_X format
  if (permission.endsWith("_view")) {
    const base = permission.replace("_view", "")
    return `view_${base}`
  }
  if (permission.endsWith("_edit")) {
    const base = permission.replace("_edit", "")
    return `edit_${base}`
  }
  // If permission starts with view_ or edit_, convert to X_view or X_edit format
  if (permission.startsWith("view_")) {
    const base = permission.replace("view_", "")
    return `${base}_view`
  }
  if (permission.startsWith("edit_")) {
    const base = permission.replace("edit_", "")
    return `${base}_edit`
  }
  return permission
}

interface UserInfo {
  fullName: string
  profileImage: string | null
  role: string
  username: string
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [userRole, setUserRole] = useState<string>("")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("adminUser")

    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserPermissions(user.permissions || [])
        setUserRole(user.role || "")
        setUserInfo({
          fullName: user.fullName || user.full_name || user.username || "User",
          profileImage: user.profileImage || user.profile_image || null,
          role: user.role || "user",
          username: user.username || "",
        })
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }
    setIsLoading(false)
  }, [])

  const hasPermission = (permission: string) => {
    if (userRole === "superadmin" || userRole === "admin") {
      return true
    }
    const alternateFormat = getAlternatePermissionFormat(permission)
    return userPermissions.includes(permission) || userPermissions.includes(alternateFormat)
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "fixed left-0 top-0 h-screen bg-[#013565] text-white transition-all duration-300 z-50 shadow-xl w-64",
        )}
      >
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-white/20 border-t-[#ff1b4a] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.permission))

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#013565] text-white transition-all duration-300 z-50 shadow-xl",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-[#013565] to-[#024a8c]">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/images/ll.png"
                alt="Markano Logo"
                fill
                className="object-contain drop-shadow-[0_0_8px_rgba(255,27,74,0.5)]"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#ff1b4a]">M</span>arkano
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="relative w-8 h-8">
              <Image
                src="/images/ll.png"
                alt="Markano Logo"
                fill
                className="object-contain drop-shadow-[0_0_8px_rgba(255,27,74,0.5)]"
              />
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group",
            collapsed ? "mx-auto" : "ml-auto",
          )}
        >
          <ChevronRight
            className={cn(
              "h-5 w-5 transition-transform duration-200 group-hover:text-[#ff1b4a]",
              collapsed ? "" : "rotate-180",
            )}
          />
        </button>
      </div>

      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-[#ff1b4a] text-white shadow-lg shadow-[#ff1b4a]/20"
                  : "text-gray-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {isActive && !collapsed && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white" />}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#012a52]">
        {!collapsed ? (
          <div className="p-4">
            {userInfo && (
              <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="relative shrink-0">
                  {userInfo.profileImage ? (
                    <img
                      src={userInfo.profileImage || "/placeholder.svg"}
                      alt={userInfo.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ff1b4a]/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff1b4a] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {userInfo.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#012a52]"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{userInfo.fullName}</p>
                  <p className="text-xs text-gray-400 truncate capitalize">
                    @{userInfo.username} • {userInfo.role}
                  </p>
                </div>
              </div>
            )}
            <p className="text-xs text-center text-gray-400">
              Powered by <span className="text-[#ff1b4a] font-semibold">Markano</span>
            </p>
          </div>
        ) : (
          <div className="p-2">
            {userInfo && (
              <div className="flex justify-center mb-2">
                {userInfo.profileImage ? (
                  <img
                    src={userInfo.profileImage || "/placeholder.svg"}
                    alt={userInfo.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#ff1b4a]/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff1b4a] to-[#ff6b35] flex items-center justify-center text-white font-bold text-xs">
                    {userInfo.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
