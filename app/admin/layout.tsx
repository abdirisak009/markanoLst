"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { initializeLocalStorage } from "@/lib/data"
import { initializeAdminData } from "@/lib/admin-data"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    initializeLocalStorage()
    initializeAdminData()

    const adminSession = localStorage.getItem("adminSession")
    if (adminSession === "true") {
      setIsLoggedIn(true)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !isLoginPage) {
      router.push("/admin/login")
    }
  }, [isLoading, isLoggedIn, isLoginPage, router])

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    setIsLoggedIn(false)
    router.push("/admin/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="text-sm text-gray-600">
              <span className="text-[#1e3a5f] font-semibold">/admin</span>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
