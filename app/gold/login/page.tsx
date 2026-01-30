"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Crown, Mail, Lock, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { getDeviceId, setDeviceIdFromServer } from "@/lib/utils"

export default function GoldLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Client-side validation
    if (!form.email.trim()) {
      setError("Please enter your email address")
      setLoading(false)
      return
    }

    if (!form.password) {
      setError("Please enter your password")
      setLoading(false)
      return
    }

    try {
      const device_id = getDeviceId()
      const response = await fetch("/api/gold/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, device_id }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === "INVALID_CREDENTIALS") {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (data.code === "ACCOUNT_PENDING") {
          setError("Your account is pending approval. Please wait for admin confirmation.")
        } else if (data.code === "ACCOUNT_SUSPENDED") {
          setError("Your account has been suspended. Please contact support.")
        } else if (data.code === "ACCOUNT_INACTIVE") {
          setError("Your account is inactive. Please contact support.")
        } else if (data.code === "DEVICE_LIMIT") {
          setError(data.error || "You can only use 2 devices. Contact admin to add this device.")
        } else {
          setError(data.error || "Login failed. Please try again.")
        }
        setLoading(false)
        return
      }

      setDeviceIdFromServer(data.device_id)
      localStorage.setItem("gold_student", JSON.stringify(data.student))
      localStorage.setItem("goldEnrollments", JSON.stringify(data.enrollments || []))
      toast.success(`Welcome back, ${data.student.full_name}!`)
      router.push("/profile")
      router.refresh()
    } catch (err) {
      setError("Connection error. Please check your internet and try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-[#fcf6f0] to-[#e8f4f3] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-[#2596be]/15 shadow-xl shadow-[#2596be]/10">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#2596be] to-[#3c62b3] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#2596be]/25">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#1a1a1a]">Welcome Back</CardTitle>
            <CardDescription className="text-[#3c62b3]/80">Sign in to your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#1a1a1a]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#2596be]/60" />
                <Input
                  type="email"
                  className={`bg-white border-[#e5e7eb] text-[#1a1a1a] pl-10 focus:border-[#2596be] focus:ring-[#2596be]/20 ${error ? "border-red-500" : ""}`}
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value })
                    setError("")
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#1a1a1a]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#2596be]/60" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className={`bg-white border-[#e5e7eb] text-[#1a1a1a] pl-10 pr-10 focus:border-[#2596be] focus:ring-[#2596be]/20 ${error ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                    setError("")
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#374151] hover:text-[#2596be]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#2596be] hover:bg-[#3c62b3] text-white font-semibold shadow-lg shadow-[#2596be]/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-[#374151] text-sm">
              Don't have an account?{" "}
              <Link href="/gold/register" className="text-[#2596be] hover:text-[#3c62b3] font-medium">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
