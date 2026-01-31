"use client"

import StudentDashboard from "./dashboard"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const [initialView, setInitialView] = useState<"home" | "courses" | "forum" | "certificates" | "settings">("home")

  useEffect(() => {
    const view = searchParams.get("view") as "home" | "courses" | "forum" | "certificates" | "settings" | null
    if (view && ["home", "courses", "forum", "certificates", "settings"].includes(view)) {
      setInitialView(view)
    }
  }, [searchParams])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f8fafc] pb-20 lg:pb-0">
        <StudentDashboard initialView={initialView} />
      </div>
      <MobileBottomNav />
    </>
  )
}
