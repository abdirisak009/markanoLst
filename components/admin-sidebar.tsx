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
  ChevronDown,
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
  MessageCircle,
} from "lucide-react"

type MenuItem = { href: string; icon: typeof Users; label: string; permission: string }
type MenuGroup = { label: string; icon: typeof Users; permission?: string; items: MenuItem[] }

const menuStructure: (MenuItem | MenuGroup)[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", permission: "dashboard_view" },
  {
    label: "Free Features",
    icon: Users,
    permission: "students_view",
    items: [
      { href: "/admin/all-students", icon: Users, label: "All Students", permission: "students_view" },
      { href: "/admin/universities", icon: Building2, label: "Universities", permission: "universities_view" },
      { href: "/admin/penn-students", icon: GraduationCap, label: "Penn Students", permission: "penn_students_view" },
      { href: "/admin/university-students", icon: Building2, label: "University Students", permission: "university_students_view" },
      { href: "/admin/classes", icon: BookOpen, label: "Classes", permission: "classes_view" },
      { href: "/admin/payments", icon: DollarSign, label: "Payments", permission: "payments_view" },
      { href: "/admin/general-expenses", icon: DollarSign, label: "General Expenses", permission: "expenses_view" },
      { href: "/admin/financial-report", icon: FileBarChart, label: "Financial Report", permission: "financial_report_view" },
      { href: "/admin/ecommerce-submissions", icon: ShoppingBag, label: "E-commerce Wizard", permission: "dashboard_view" },
    ],
  },
  {
    label: "Elearning",
    icon: Layers,
    permission: "courses_view",
    items: [
      { href: "/admin/learning-courses", icon: Layers, label: "Learning Courses", permission: "courses_view" },
      { href: "/admin/learning-revenue", icon: DollarSign, label: "Learning Revenue", permission: "financial_report_view" },
      { href: "/admin/instructor-applications", icon: GraduationCap, label: "Instructor Applications", permission: "dashboard_view" },
      { href: "/admin/instructors", icon: UserCheck, label: "Instructors", permission: "dashboard_view" },
      { href: "/admin/agreement", icon: FileText, label: "Agreement Management", permission: "dashboard_view" },
      { href: "/admin/gold/students", icon: Crown, label: "Gold Students (Devices)", permission: "students_view" },
      { href: "/admin/system-students", icon: Database, label: "System Students", permission: "students_view" },
      { href: "/admin/reviews", icon: MessageCircle, label: "Reviews", permission: "dashboard_view" },
    ],
  },
  {
    label: "Video Posts",
    icon: Video,
    permission: "videos_view",
    items: [
      { href: "/admin/videos", icon: Video, label: "Videos", permission: "videos_view" },
      { href: "/admin/video-analytics", icon: TrendingUp, label: "Video Analytics", permission: "video_analytics_view" },
      { href: "/admin/video-behavior", icon: SkipForward, label: "Video Behavior", permission: "video_analytics_view" },
    ],
  },
  {
    label: "Content & Activities",
    icon: ClipboardList,
    permission: "assignments_view",
    items: [
      { href: "/admin/assignments", icon: ClipboardList, label: "Assignments", permission: "assignments_view" },
      { href: "/admin/quizzes", icon: HelpCircle, label: "Quizzes", permission: "quizzes_view" },
      { href: "/admin/challenges", icon: Trophy, label: "Challenges", permission: "challenges_view" },
      { href: "/admin/live-coding", icon: Code, label: "Live Coding", permission: "dashboard_view" },
      { href: "/admin/temporary-activities", icon: FileSpreadsheet, label: "Temporary Activities", permission: "dashboard_view" },
      { href: "/admin/star-ratings", icon: Star, label: "Star Ratings", permission: "dashboard_view" },
    ],
  },
  {
    label: "Groups",
    icon: UsersRound,
    permission: "groups_view",
    items: [
      { href: "/admin/groups", icon: UsersRound, label: "Groups", permission: "groups_view" },
      { href: "/admin/groups/reports", icon: FileText, label: "Group Reports", permission: "group_reports_view" },
    ],
  },
  {
    label: "Payments & Finance",
    icon: DollarSign,
    permission: "payments_view",
    items: [
      { href: "/admin/learning-revenue", icon: DollarSign, label: "Learning Revenue", permission: "financial_report_view" },
      { href: "/admin/instructor-payouts", icon: Banknote, label: "Instructor Payouts", permission: "payments_view" },
      { href: "/admin/offline-payments", icon: Banknote, label: "Offline Payments", permission: "payments_view" },
      { href: "/admin/enrollments", icon: GraduationCap, label: "Enrollments", permission: "payments_view" },
    ],
  },
  {
    label: "Analytics & Reports",
    icon: TrendingUp,
    permission: "analytics_view",
    items: [
      { href: "/admin/performance", icon: TrendingUp, label: "Performance", permission: "performance_view" },
      { href: "/admin/analytics", icon: TrendingUp, label: "Analytics", permission: "analytics_view" },
    ],
  },
  { href: "/admin/approvals", icon: CheckCircle, label: "Approvals", permission: "approvals_view" },
  { href: "/admin/qr-codes", icon: QrCode, label: "QR Codes", permission: "qr_codes_view" },
  { href: "/admin/users", icon: Shield, label: "Users", permission: "users_view" },
]

function isMenuGroup(item: MenuItem | MenuGroup): item is MenuGroup {
  return "items" in item && Array.isArray((item as MenuGroup).items)
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [userRole, setUserRole] = useState<string>("")
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    const userData = localStorage.getItem("adminUser")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserPermissions(user.permissions || [])
        setUserRole(user.role || "")
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }
  }, [])

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      menuStructure.forEach((entry) => {
        if (isMenuGroup(entry) && entry.items.some((it) => pathname === it.href || pathname.startsWith(it.href + "/"))) {
          next.add(entry.label)
        }
      })
      return next
    })
  }, [pathname])

  const hasPermission = (permission: string) => {
    if (userRole === "superadmin" || userRole === "admin") return true
    const alternateFormat = permission.endsWith("_view")
      ? `view_${permission.replace("_view", "")}`
      : permission.startsWith("view_")
        ? `${permission.replace("view_", "")}_view`
        : permission
    return userPermissions.includes(permission) || userPermissions.includes(alternateFormat)
  }

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      if (prev.has(label)) {
        const next = new Set(prev)
        next.delete(label)
        return next
      }
      return new Set([label])
    })
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#1e3d6e] text-white transition-all duration-300 z-50 shadow-xl border-r border-white/10",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1e3d6e]">
        <div className={cn("flex items-center justify-center", collapsed ? "w-full" : "flex-1 min-w-0")}>
          <Image
            src="/footer-logo.png"
            alt="Markano"
            width={collapsed ? 64 : 200}
            height={collapsed ? 64 : 200}
            className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] flex-shrink-0 w-full h-auto max-w-[200px] max-h-[200px]"
          />
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group",
            collapsed ? "mx-auto" : "ml-auto",
          )}
        >
          <ChevronRight
            className={cn(
              "h-5 w-5 transition-transform duration-200 group-hover:text-white",
              collapsed ? "" : "rotate-180",
            )}
          />
        </button>
      </div>

      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
        {menuStructure.map((entry, idx) => {
          if (isMenuGroup(entry)) {
            const visibleItems = entry.items.filter((item) => hasPermission(item.permission))
            if (visibleItems.length === 0 && !hasPermission(entry.permission ?? "dashboard_view")) return null
            if (visibleItems.length === 0) return null
            const isExpanded = openGroups.has(entry.label)
            const Icon = entry.icon
            if (collapsed) {
              return (
                <div key={entry.label + idx}>
                  {visibleItems.slice(0, 1).map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative justify-center",
                          isActive ? "bg-[#3c62b3] text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              )
            }
            return (
              <div key={entry.label + idx} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.label)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left",
                    "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1">{entry.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="pl-4 space-y-0.5 border-l border-white/20 ml-3">
                    {visibleItems.map((item) => {
                      const isActive = pathname === item.href
                      const ItemIcon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-2 py-2 rounded-md transition-all duration-200 text-sm relative",
                            isActive
                              ? "bg-[#3c62b3] text-white shadow-lg shadow-[#3c62b3]/30"
                              : "text-white/70 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          <ItemIcon className="h-4 w-4 flex-shrink-0" />
                          <span>{item.label}</span>
                          {isActive && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white" />}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }
          const item = entry as MenuItem
          if (!hasPermission(item.permission)) return null
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-[#3c62b3] text-white shadow-lg shadow-[#3c62b3]/30"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {isActive && !collapsed && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white" />}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#1e3d6e]">
        {!collapsed && (
          <p className="text-xs text-center text-white/60">
            Powered by <span className="text-white font-semibold">Markano</span>
          </p>
        )}
      </div>
    </div>
  )
}
