"use client"

import { usePathname } from "next/navigation"
import { InstructorSidebar } from "@/components/instructor-sidebar"

const publicPaths = ["/instructor/apply", "/instructor/login"]

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPublic = publicPaths.some((p) => pathname === p || pathname?.startsWith(p + "/"))
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {!isPublic && (
        <>
          <InstructorSidebar />
          <div className="pl-64 min-h-screen">
            {children}
          </div>
        </>
      )}
      {isPublic && children}
    </div>
  )
}
