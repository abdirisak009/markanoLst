"use client"

import { usePathname } from "next/navigation"
import { InstructorNav } from "@/components/instructor-nav"

const publicPaths = ["/instructor/apply", "/instructor/login"]

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPublic = publicPaths.some((p) => pathname === p || pathname?.startsWith(p + "/"))
  return (
    <div className="min-h-screen bg-slate-50">
      {!isPublic && <InstructorNav />}
      {children}
    </div>
  )
}
