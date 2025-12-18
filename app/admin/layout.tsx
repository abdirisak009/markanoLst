"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { LogOut, Clock, Shield, User } from "lucide-react"
import { initializeLocalStorage } from "@/lib/data"
import { initializeAdminData } from "@/lib/admin-data"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Session timeout in milliseconds (10 minutes)
const SESSION_TIMEOUT = 10 * 60 * 1000
// Warning before timeout (1 minute before)
const WARNING_BEFORE_TIMEOUT = 1 * 60 * 1000

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [userName, setUserName] = useState<string>("")
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const isLoginPage = pathname === "/admin/login"

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  const handleLogout = useCallback(() => {
    clearAllTimers()
    localStorage.removeItem("adminSession")
    localStorage.removeItem("adminUser")
    localStorage.removeItem("lastActivity")
    document.cookie = "adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "sessionExpiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setIsLoggedIn(false)
    setShowTimeoutWarning(false)
    router.push("/admin/login")
  }, [clearAllTimers, router])

  const handleAutoLogout = useCallback(() => {
    clearAllTimers()
    localStorage.removeItem("adminSession")
    localStorage.removeItem("adminUser")
    localStorage.removeItem("lastActivity")
    document.cookie = "adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "sessionExpiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setIsLoggedIn(false)
    setShowTimeoutWarning(false)
    router.push("/admin/login?timeout=true")
  }, [clearAllTimers, router])

  const resetActivityTimer = useCallback(() => {
    if (!isLoggedIn || isLoginPage) return

    clearAllTimers()
    setShowTimeoutWarning(false)

    const now = Date.now()
    localStorage.setItem("lastActivity", now.toString())

    const expiryTime = now + SESSION_TIMEOUT
    document.cookie = `sessionExpiry=${expiryTime}; path=/; max-age=${SESSION_TIMEOUT / 1000}`

    warningRef.current = setTimeout(() => {
      setShowTimeoutWarning(true)
      setRemainingTime(WARNING_BEFORE_TIMEOUT / 1000)

      countdownRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT)

    timeoutRef.current = setTimeout(() => {
      handleAutoLogout()
    }, SESSION_TIMEOUT)
  }, [isLoggedIn, isLoginPage, clearAllTimers, handleAutoLogout])

  const extendSession = useCallback(() => {
    resetActivityTimer()
  }, [resetActivityTimer])

  useEffect(() => {
    initializeLocalStorage()
    initializeAdminData()

    const adminSession = localStorage.getItem("adminSession")
    const lastActivity = localStorage.getItem("lastActivity")
    const adminUserData = localStorage.getItem("adminUser")

    if (adminSession === "true") {
      if (lastActivity) {
        const lastActivityTime = Number.parseInt(lastActivity, 10)
        const timeSinceActivity = Date.now() - lastActivityTime

        if (timeSinceActivity > SESSION_TIMEOUT) {
          handleAutoLogout()
          return
        }
      }
      setIsLoggedIn(true)

      if (adminUserData) {
        try {
          const userData = JSON.parse(adminUserData)
          setUserName(userData.fullName || userData.full_name || userData.username || "")
          setUserProfileImage(userData.profileImage || userData.profile_image || null)
        } catch (e) {
          console.error("Error parsing admin user data:", e)
        }
      }
    }
    setIsLoading(false)
  }, [handleAutoLogout])

  useEffect(() => {
    if (!isLoggedIn || isLoginPage) return

    const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"]

    const handleActivity = () => {
      if (!showTimeoutWarning) {
        resetActivityTimer()
      }
    }

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    resetActivityTimer()

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      clearAllTimers()
    }
  }, [isLoggedIn, isLoginPage, resetActivityTimer, showTimeoutWarning, clearAllTimers])

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !isLoginPage) {
      router.push("/admin/login")
    }
  }, [isLoading, isLoggedIn, isLoginPage, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#013565] to-[#012040]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-[#ff1b4a] rounded-full animate-spin" />
          <p className="text-white/80 text-lg">Loading...</p>
        </div>
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
            <div className="flex items-center gap-4">
              <span className="text-[#1e3a5f] font-semibold">/admin</span>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                <Shield className="h-3 w-3 text-green-500" />
                <span>Session Secured</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8 border-2 border-[#e63946]/20">
                {userProfileImage ? (
                  <AvatarImage src={userProfileImage || "/placeholder.svg"} alt={userName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-[#e63946] to-[#ff6b6b] text-white text-xs font-semibold">
                  {userName ? (
                    userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{userName || "Admin"}</span>
                <span className="text-xs text-gray-500">Administrator</span>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>

      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Clock className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Session-kaaga wuu dhacayaa!</h2>

              <p className="text-gray-600 mb-6">
                Waxaad maqnayd muddo dheer. Session-kaagu wuu dhici doonaa haddii aadan wax qaban.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 mb-6 w-full">
                <p className="text-red-600 text-sm mb-1">Waqtiga haray</p>
                <p className="text-4xl font-bold text-red-600 font-mono">{formatTime(remainingTime)}</p>
              </div>

              <div className="flex gap-4 w-full">
                <Button onClick={handleLogout} variant="outline" className="flex-1 h-12 bg-transparent">
                  Ka Bax
                </Button>
                <Button
                  onClick={extendSession}
                  className="flex-1 h-12 bg-gradient-to-r from-[#ff1b4a] to-[#ff4d6d] hover:from-[#e01640] hover:to-[#ff1b4a] text-white"
                >
                  Sii Wad Session-ka
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
