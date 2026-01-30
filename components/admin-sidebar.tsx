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
  HelpCircle,
  SkipForward,
  Crown,
  Layers,
  UserCheck,
  Code,
  Banknote,
  Database,
  FileSpreadsheet,
  Star,
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
  { href: "/admin/learning-courses", icon: Layers, label: "Learning Courses", permission: "courses_view" },
  { href: "/admin/learning-revenue", icon: DollarSign, label: "Learning Revenue", permission: "financial_report_view" },
  { href: "/admin/instructor-payouts", icon: Banknote, label: "Instructor Payouts", permission: "payments_view" },
  { href: "/admin/videos", icon: Video, label: "Videos", permission: "videos_view" },
  { href: "/admin/video-analytics", icon: TrendingUp, label: "Video Analytics", permission: "video_analytics_view" },
  { href: "/admin/video-behavior", icon: SkipForward, label: "Video Behavior", permission: "video_analytics_view" },
  { href: "/admin/assignments", icon: ClipboardList, label: "Assignments", permission: "assignments_view" },
  { href: "/admin/quizzes", icon: HelpCircle, label: "Quizzes", permission: "quizzes_view" },
  { href: "/admin/groups", icon: UsersRound, label: "Groups", permission: "groups_view" },
  { href: "/admin/groups/reports", icon: FileText, label: "Group Reports", permission: "group_reports_view" },
  { href: "/admin/challenges", icon: Trophy, label: "Challenges", permission: "challenges_view" },
  { href: "/admin/live-coding", icon: Code, label: "Live Coding", permission: "dashboard_view" },
  { href: "/admin/ecommerce-submissions", icon: ShoppingBag, label: "E-commerce Wizard", permission: "dashboard_view" },
  { href: "/admin/payments", icon: DollarSign, label: "Payments", permission: "payments_view" },
  { href: "/admin/offline-payments", icon: Banknote, label: "Offline Payments", permission: "payments_view" },
  { href: "/admin/enrollments", icon: GraduationCap, label: "Enrollments", permission: "payments_view" },
  { href: "/admin/system-students", icon: Database, label: "System Students", permission: "students_view" },
  { href: "/admin/gold/students", icon: Crown, label: "Gold Students (Devices)", permission: "students_view" },
  { href: "/admin/temporary-activities", icon: FileSpreadsheet, label: "Temporary Activities", permission: "dashboard_view" },
  { href: "/admin/star-ratings", icon: Star, label: "Star Ratings", permission: "dashboard_view" },
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
  { href: "/admin/instructor-applications", icon: GraduationCap, label: "Instructor Applications", permission: "dashboard_view" },
  { href: "/admin/instructors", icon: UserCheck, label: "Instructors", permission: "dashboard_view" },
  { href: "/admin/qr-codes", icon: QrCode, label: "QR Codes", permission: "qr_codes_view" },
  { href: "/admin/users", icon: Shield, label: "Users", permission: "users_view" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const userData = localStorage.getItem("adminUser")
    console.log("[v0] AdminSidebar - Raw userData from localStorage:", userData)

    if (userData) {
      try {
        const user = JSON.parse(userData)
        console.log("[v0] AdminSidebar - Parsed user:", user)
        console.log("[v0] AdminSidebar - User permissions:", user.permissions)
        console.log("[v0] AdminSidebar - User role:", user.role)

        setUserPermissions(user.permissions || [])
        setUserRole(user.role || "")
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }
  }, [])

  const hasPermission = (permission: string) => {
    if (userRole === "superadmin" || userRole === "admin") {
      console.log("[v0] hasPermission - Full access for role:", userRole)
      return true
    }
    // Check both the original permission and alternate format
    const alternateFormat = permission.endsWith("_view")
      ? `view_${permission.replace("_view", "")}`
      : permission.startsWith("view_")
        ? `${permission.replace("view_", "")}_view`
        : permission
    const hasPerm = userPermissions.includes(permission) || userPermissions.includes(alternateFormat)
    console.log("[v0] hasPermission - Checking", permission, ":", hasPerm, "in", userPermissions)
    return hasPerm
  }

  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.permission))
  console.log("[v0] AdminSidebar - Visible menu items:", visibleMenuItems.length)

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#016b62] text-white transition-all duration-300 z-50 shadow-xl",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#016b62]">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/1.png"
                alt="Markano Logo"
                fill
                className="object-contain drop-shadow-[0_0_8px_rgba(252,173,33,0.4)]"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#fcad21]">M</span>arkano
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="relative w-8 h-8">
              <Image
                src="/1.png"
                alt="Markano Logo"
                fill
                className="object-contain drop-shadow-[0_0_8px_rgba(252,173,33,0.4)]"
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
              "h-5 w-5 transition-transform duration-200 group-hover:text-[#fcad21]",
              collapsed ? "" : "rotate-180",
            )}
          />
        </button>
      </div>

      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-[#fcad21] text-[#1a1a1a] shadow-lg shadow-black/10"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-[#1a1a1a]")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {isActive && !collapsed && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#016b62]">
        {!collapsed && (
          <p className="text-xs text-center text-white/60">
            Powered by <span className="text-[#fcad21] font-semibold">Markano</span>
          </p>
        )}
      </div>
    </div>
  )
}
