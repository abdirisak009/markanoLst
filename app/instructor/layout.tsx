"use client"

import { usePathname } from "next/navigation"
import { InstructorSidebar } from "@/components/instructor-sidebar"
import { InstructorMobileNav } from "@/components/instructor-mobile-nav"

const publicPaths = ["/instructor/apply", "/instructor/login"]

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPublic = publicPaths.some((p) => pathname === p || pathname?.startsWith(p + "/"))
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      {!isPublic && (
        <>
          <InstructorSidebar />
          {/* Mobile: top bar (sidebar hidden on mobile) */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-[#1e3d6e] border-b border-white/10 flex items-center px-4 shadow-md safe-area-top">
            <img src="/footer-logo.png" alt="Markano" className="h-8 w-auto object-contain" />
            <span className="ml-2 font-bold text-white text-sm">Markano</span>
            <span className="ml-1.5 text-white/70 text-xs">Teacher</span>
          </div>
          <div className="pl-0 lg:pl-64 min-h-screen pt-14 lg:pt-0 pb-24 lg:pb-0">
            {children}
          </div>
          <InstructorMobileNav />
        </>
      )}
      {isPublic && children}
    </div>
  )
}
