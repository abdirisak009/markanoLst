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
        "fixed left-0 top-0 h-screen bg-[#2c3e50] text-white transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && <img src="/images/white-logo.png" alt="Markano" className="h-8" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto"
        >
          <ChevronRight className={cn("h-5 w-5 transition-transform", collapsed ? "" : "rotate-180")} />
        </button>
      </div>

      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-73px)]">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive ? "bg-[#e74c3c] text-white" : "text-gray-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
