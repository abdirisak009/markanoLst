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
      const response = await fetch("/api/gold/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        } else {
          setError(data.error || "Login failed. Please try again.")
        }
        setLoading(false)
        return
      }

      localStorage.setItem("goldStudent", JSON.stringify(data.student))
      localStorage.setItem("goldEnrollments", JSON.stringify(data.enrollments))
      toast.success(`Welcome back, ${data.student.full_name}!`)
      router.push("/gold/dashboard")
    } catch (err) {
      setError("Connection error. Please check your internet and try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0f1419]/80 border-[#1a1a2e] backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#e63946] to-[#ff6b6b] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#e63946]/20">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">Sign in to your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] ${error ? "border-red-500" : ""}`}
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
              <Label className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 pr-10 focus:border-[#e63946] ${error ? "border-red-500" : ""}`}
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
                  className="absolute right-3 top-3 text-slate-500 hover:text-[#e63946]"
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
              className="w-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white font-semibold"
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

            <p className="text-center text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link href="/gold/register" className="text-[#e63946] hover:text-[#ff6b6b]">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
