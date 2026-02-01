"use client"

import StudentDashboard from "./dashboard"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const [initialView, setInitialView] = useState<"home" | "courses" | "schedule" | "forum" | "certificates" | "payments" | "settings">("home")

  useEffect(() => {
    const view = searchParams.get("view") as string | null
    if (view && ["home", "courses", "schedule", "forum", "certificates", "payments", "settings"].includes(view)) {
      setInitialView(view as typeof initialView)
    }
  }, [searchParams])

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] pb-20 lg:pb-0">
        <StudentDashboard initialView={initialView} />
      </div>
      <MobileBottomNav />
    </>
  )
}
