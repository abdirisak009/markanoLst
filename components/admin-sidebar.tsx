"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
} from "lucide-react"

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/all-students", icon: Users, label: "All Students" },
  { href: "/admin/penn-students", icon: GraduationCap, label: "Penn Students" },
  { href: "/admin/university-students", icon: Building2, label: "University Students" },
  { href: "/admin/universities", icon: Building2, label: "Universities" },
  { href: "/admin/classes", icon: BookOpen, label: "Classes" },
  { href: "/admin/courses", icon: BookOpen, label: "Courses" },
  { href: "/admin/videos", icon: Video, label: "Videos" },
  { href: "/admin/video-analytics", icon: TrendingUp, label: "Video Analytics" },
  { href: "/admin/assignments", icon: ClipboardList, label: "Assignments" },
  { href: "/admin/groups", icon: UsersRound, label: "Groups" },
  { href: "/admin/groups/reports", icon: FileText, label: "Group Reports" },
  { href: "/admin/challenges", icon: Trophy, label: "Challenges" },
  { href: "/admin/payments", icon: DollarSign, label: "Payments" },
  { href: "/admin/general-expenses", icon: DollarSign, label: "General Expenses" },
  { href: "/admin/financial-report", icon: FileBarChart, label: "Financial Report" },
  { href: "/admin/performance", icon: TrendingUp, label: "Performance" },
  { href: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
  { href: "/admin/approvals", icon: CheckCircle, label: "Approvals" },
  { href: "/admin/qr-codes", icon: QrCode, label: "QR Codes" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

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
            <img src="/images/white-logo.png" alt="Markano" className="h-10 w-auto object-contain" />
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <img src="/images/white-logo.png" alt="Markano" className="h-8 w-auto object-contain" />
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
      {/* End logo section change */}

      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-73px)] custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-[#ff1b4a] to-[#ff4d6d] text-white shadow-lg shadow-[#ff1b4a]/25"
                  : "text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                  !isActive && "group-hover:scale-110",
                )}
              />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {/* Active indicator */}
              {isActive && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </Link>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#012447]">
          <p className="text-xs text-gray-400 text-center">
            Powered by <span className="text-[#ff1b4a] font-semibold">Markano</span>
          </p>
        </div>
      )}
    </div>
  )
}
