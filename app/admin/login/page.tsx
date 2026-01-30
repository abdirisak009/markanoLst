"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Eye,
  EyeOff,
  User,
  Lock,
  GraduationCap,
  Users,
  BookOpen,
  Trophy,
  ChevronRight,
  AlertTriangle,
  Clock,
} from "lucide-react"
import Image from "next/image"

// Session timeout in milliseconds (10 minutes)
const SESSION_TIMEOUT = 10 * 60 * 1000

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const isTimeout = searchParams.get("timeout") === "true"
  const isExpired = searchParams.get("expired") === "true"

  useEffect(() => {
    setMounted(true)

    localStorage.removeItem("adminSession")
    localStorage.removeItem("adminUser")
    localStorage.removeItem("lastActivity")
    document.cookie = "adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "sessionExpiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "adminUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("adminSession", "true")
        localStorage.setItem("adminUser", JSON.stringify(data))
        localStorage.setItem("lastActivity", Date.now().toString())

        const expiryTime = Date.now() + SESSION_TIMEOUT
        document.cookie = `adminSession=true; path=/; max-age=${SESSION_TIMEOUT / 1000}`
        document.cookie = `sessionExpiry=${expiryTime}; path=/; max-age=${SESSION_TIMEOUT / 1000}`
        document.cookie = `adminUser=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${SESSION_TIMEOUT / 1000}`

        const redirectUrl = searchParams.get("redirect") || "/admin"
        window.location.href = redirectUrl
      } else {
        setError(data.error || "Invalid username or password")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const features = [
    { icon: GraduationCap, title: "Students", desc: "Manage students easily" },
    { icon: BookOpen, title: "Courses", desc: "Create and plan courses" },
    { icon: Users, title: "Classes", desc: "Organize educational classes" },
    { icon: Trophy, title: "Results", desc: "Track student success" },
  ]

  return (
    <div className="min-h-screen flex">
      <div className="fixed inset-0 bg-gradient-to-br from-[#2596be] via-[#3c62b3] to-[#013d36]">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(60,98,179,0.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(60,98,179,0.12) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="absolute top-10 left-10 w-80 h-80 bg-[#3c62b3]/25 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-[#3c62b3]/20 rounded-full blur-[140px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#2596be]/50 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-[#3c62b3]/15 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Animated Diagonal Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3c62b3" stopOpacity="0" />
              <stop offset="50%" stopColor="#3c62b3" stopOpacity="1" />
              <stop offset="100%" stopColor="#3c62b3" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[...Array(6)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={`${15 + i * 15}%`}
              x2="100%"
              y2={`${15 + i * 15}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </svg>

        {/* Circuit Pattern Dots */}
        <div className="absolute inset-0">
          {mounted &&
            [...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-[#3c62b3]/40 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
        </div>

        {/* Hexagon Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23ff1b4a' strokeWidth='1'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Left Side - Branding Card */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12 transition-all duration-1000 ${
          mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"
        }`}
      >
        <div className="max-w-lg">
          {/* Logo and Branding */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-24 h-24 group">
              <div className="absolute inset-0 bg-[#3c62b3]/30 rounded-2xl blur-xl group-hover:bg-[#3c62b3]/50 transition-all duration-500" />
              <Image
                src="/images/markanologo.png"
                alt="Markano"
                fill
                className="object-contain drop-shadow-2xl relative z-10"
              />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white">
                <span className="text-[#3c62b3]">M</span>arkano
              </h1>
              <p className="text-white/70 text-sm tracking-wider">Learning Management System</p>
            </div>
          </div>

          {/* Welcome Text - Translated to English */}
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Welcome to
              <span className="block text-[#3c62b3] mt-1">Learning Management System</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Manage your students, track their learning progress, and create modern educational experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-[#3c62b3]/40 hover:shadow-lg hover:shadow-[#3c62b3]/10 transition-all duration-500 cursor-default ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150 + 500}ms` }}
              >
                <div className="w-14 h-14 bg-[#3c62b3] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#3c62b3]/30 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-[#1a1a1a]" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats - Translated to English */}
          <div className="flex gap-10 mt-10 pt-8 border-t border-white/10">
            <div
              className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              style={{ transitionDelay: "1000ms" }}
            >
              <p className="text-4xl font-bold text-[#3c62b3]">700+</p>
              <p className="text-white/50 text-sm">Students</p>
            </div>
            <div
              className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              style={{ transitionDelay: "1200ms" }}
            >
              <p className="text-4xl font-bold text-white">50+</p>
              <p className="text-white/50 text-sm">Courses</p>
            </div>
            <div
              className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              style={{ transitionDelay: "1400ms" }}
            >
              <p className="text-4xl font-bold text-white">98%</p>
              <p className="text-white/50 text-sm">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        className={`w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 lg:p-12 transition-all duration-1000 ${
          mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
        }`}
      >
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-8 lg:p-10">
            {(isTimeout || isExpired) && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {isTimeout ? (
                    <Clock className="w-5 h-5 text-amber-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 text-sm">
                    {isTimeout ? "Session Timed Out" : "Session Expired"}
                  </h4>
                  <p className="text-amber-600 text-xs mt-1">
                    {isTimeout
                      ? "You were inactive for 10 minutes. Please log in again."
                      : "Your session has expired. Please log in again to continue."}
                  </p>
                </div>
              </div>
            )}

            {/* Form Header - Translated to English */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <Image src="/images/ll.png" alt="Markano Logo" fill className="object-contain" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#2596be]">Sign In</h2>
              <p className="text-gray-500 mt-2">Enter your account credentials</p>
            </div>

            {/* Login Form - Translated placeholders to English */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2596be] flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username or Email
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full h-12 pl-4 pr-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-[#2596be] focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2596be] flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 pl-4 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-[#2596be] focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2596be] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              {/* Submit Button - Translated to English */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-[#2596be] hover:bg-[#3c62b3] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#2596be]/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Login Now
                    <ChevronRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Powered by <span className="text-[#2596be] font-semibold">Markano</span>
              </p>
            </div>
          </div>

          {/* Help Link - Translated to English */}
          <p className="text-center mt-6 text-blue-200/60 text-sm">
            Don't have an account?{" "}
            <span className="text-[#2596be] hover:underline cursor-pointer font-medium">Contact Admin</span>
          </p>
        </div>
      </div>
    </div>
  )
}
