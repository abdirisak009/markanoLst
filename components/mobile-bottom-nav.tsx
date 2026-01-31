"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, MessageCircle, BookOpen, User } from "lucide-react"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/self-learning", icon: BookOpen, label: "Courses" },
  { href: "/forum", icon: MessageCircle, label: "Community" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#e8f4f3] shadow-[0_-4px_20px_rgba(37,150,190,0.08)] safe-area-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-2xl min-w-0 transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-[#2596be] bg-[#2596be]/10"
                  : "text-[#64748b] hover:text-[#2596be] hover:bg-[#2596be]/5"
              }`}
              aria-label={item.label}
            >
              <Icon className="w-6 h-6 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
