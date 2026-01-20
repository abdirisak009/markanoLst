"use client"

import StudentDashboard from "./dashboard"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const [initialView, setInitialView] = useState<"home" | "courses" | "forum" | "certificates" | "settings">("home")

  useEffect(() => {
    const view = searchParams.get("view") as "home" | "courses" | "forum" | "certificates" | "settings" | null
    if (view && ["home", "courses", "forum", "certificates", "settings"].includes(view)) {
      setInitialView(view)
    }
  }, [searchParams])

  return <StudentDashboard initialView={initialView} />
}
