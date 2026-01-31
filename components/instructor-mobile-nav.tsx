"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Users,
  Video,
  ClipboardList,
  BarChart3,
  LogOut,
  LayoutDashboard,
  User,
  FileCheck,
  DollarSign,
  Settings,
} from "lucide-react"

const navItems = [
  { href: "/instructor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/instructor/courses", icon: BookOpen, label: "Learning Courses" },
  { href: "/instructor/students", icon: Users, label: "Students" },
  { href: "/instructor/revenue", icon: DollarSign, label: "Revenue" },
  { href: "/instructor/videos", icon: Video, label: "Videos" },
  { href: "/instructor/assignments", icon: ClipboardList, label: "Assignments" },
  { href: "/instructor/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/instructor/profile", icon: User, label: "Profile" },
  { href: "/instructor/agreement", icon: FileCheck, label: "Agreement" },
  { href: "/instructor/profile", icon: Settings, label: "Settings" },
]

function handleLogout() {
  document.cookie = "instructor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  window.location.href = "/instructor/login"
}

export function InstructorMobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#2596be]/15 shadow-[0_-4px_20px_rgba(37,150,190,0.1)] safe-area-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="flex gap-1 overflow-x-auto scrollbar-hide px-2 py-2 min-h-[4rem] items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== "/instructor/dashboard" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-1.5 shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium transition-all touch-target ${
                isActive
                  ? "bg-[#2596be] text-white shadow-md"
                  : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#2596be]/10 hover:text-[#2596be]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium bg-[#f1f5f9] text-[#64748b] hover:bg-red-50 hover:text-red-600 transition-all touch-target"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Logout</span>
        </button>
      </div>
    </nav>
  )
}
