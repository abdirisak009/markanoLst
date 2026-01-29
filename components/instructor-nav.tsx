"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  BookOpen,
  Users,
  Video,
  ClipboardList,
  BarChart3,
  LogOut,
  LayoutDashboard,
} from "lucide-react"

const navItems = [
  { href: "/instructor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/instructor/courses", icon: BookOpen, label: "Courses" },
  { href: "/instructor/students", icon: Users, label: "Students" },
  { href: "/instructor/videos", icon: Video, label: "Videos" },
  { href: "/instructor/assignments", icon: ClipboardList, label: "Assignments" },
  { href: "/instructor/analytics", icon: BarChart3, label: "Analytics" },
]

export function InstructorNav() {
  const pathname = usePathname()

  const handleLogout = () => {
    document.cookie = "instructor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/instructor/login"
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/instructor/dashboard" className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#e63946]/10">
              <GraduationCap className="h-6 w-6 text-[#e63946]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Instructor</h1>
              <p className="text-slate-500 text-xs">Markano Teacher Portal</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/instructor/dashboard" && pathname?.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      isActive && "bg-[#e63946] hover:bg-[#d62839] text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-1.5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </div>
    </header>
  )
}
