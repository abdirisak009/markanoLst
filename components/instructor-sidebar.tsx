"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  { href: "/instructor/profile", icon: User, label: "Profile" },
  { href: "/instructor/agreement", icon: FileCheck, label: "Agreement" },
  { href: "/instructor/revenue", icon: DollarSign, label: "Revenue" },
  { href: "/instructor/courses", icon: BookOpen, label: "Courses" },
  { href: "/instructor/students", icon: Users, label: "Students" },
  { href: "/instructor/videos", icon: Video, label: "Videos" },
  { href: "/instructor/assignments", icon: ClipboardList, label: "Assignments" },
  { href: "/instructor/analytics", icon: BarChart3, label: "Analytics" },
]

interface ProfileInfo {
  full_name: string
  email: string
  profile_image_url: string | null
}

export function InstructorSidebar() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<ProfileInfo | null>(null)
  const [imageKey, setImageKey] = useState(0)

  useEffect(() => {
    fetch("/api/instructor/profile", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setProfile({ full_name: data.full_name, email: data.email, profile_image_url: data.profile_image_url })
          setImageKey((k) => k + 1)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    document.cookie = "instructor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/instructor/login"
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col bg-[#1e3d6e] border-r border-white/10 shadow-2xl">
      {/* Logo / brand */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="flex-shrink-0 h-10 w-auto max-w-[140px]">
          <img src="/footer-logo.png" alt="Markano" className="h-full w-auto object-contain object-left" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate">Markano</p>
          <p className="text-white/60 text-xs truncate">Teacher Portal</p>
        </div>
      </div>

      {/* Profile block */}
      <div className="p-4 border-b border-white/10">
        <Link href="/instructor/profile" className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-[#1e3d6e] overflow-hidden bg-white/10 shadow-lg">
              {profile?.profile_image_url ? (
                <img
                  key={imageKey}
                  src={`/api/instructor/profile/image?v=${imageKey}-${(profile.profile_image_url || "").slice(-20)}`}
                  alt={profile.full_name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white/70" />
                </div>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#3c62b3] border-2 border-[#1e3d6e]" title="Active" />
          </div>
          {profile && (
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white text-sm truncate">{profile.full_name}</p>
              <p className="text-white/50 text-xs truncate">{profile.email}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/instructor/dashboard" && pathname?.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#3c62b3] text-white shadow-lg shadow-[#3c62b3]/30"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 pt-4 border-t border-white/10">
          <Link
            href="/instructor/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              pathname === "/instructor/profile"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Footer: Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
