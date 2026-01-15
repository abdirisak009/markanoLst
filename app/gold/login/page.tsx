"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Crown, Mail, Lock, Loader2, AlertCircle, Clock, ShieldOff, Eye, EyeOff, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function GoldLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)
  const [errorMessage, setErrorMessage] = useState<{
    title: string
    description: string
    icon: React.ReactNode
  } | null>(null)
  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    // Client-side validation
    if (!form.email.trim()) {
      setErrorMessage({
        title: "Email Required",
        description: "Please enter your email address to sign in.",
        icon: <Mail className="h-5 w-5" />,
      })
      triggerShake()
      setLoading(false)
      return
    }

    if (!form.password) {
      setErrorMessage({
        title: "Password Required",
        description: "Please enter your password to sign in.",
        icon: <Lock className="h-5 w-5" />,
      })
      triggerShake()
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
        triggerShake()

        // Handle different error codes with specific messages
        switch (data.code) {
          case "INVALID_CREDENTIALS":
            setErrorMessage({
              title: "Invalid Email or Password",
              description:
                "The email or password you entered is incorrect. Please double-check your credentials and try again.",
              icon: <XCircle className="h-6 w-6" />,
            })
            break
          case "ACCOUNT_PENDING":
            setErrorMessage({
              title: "Account Pending Approval",
              description: "Your account is awaiting admin approval. You'll receive an email once approved.",
              icon: <Clock className="h-6 w-6" />,
            })
            break
          case "ACCOUNT_SUSPENDED":
            setErrorMessage({
              title: "Account Suspended",
              description: "Your account has been suspended. Please contact support for assistance.",
              icon: <ShieldOff className="h-6 w-6" />,
            })
            break
          case "ACCOUNT_INACTIVE":
            setErrorMessage({
              title: "Account Inactive",
              description: "Your account is not active. Please contact support for help.",
              icon: <AlertCircle className="h-6 w-6" />,
            })
            break
          case "SERVER_ERROR":
            setErrorMessage({
              title: "Server Error",
              description: "Something went wrong on our end. Please try again in a few minutes.",
              icon: <AlertCircle className="h-6 w-6" />,
            })
            break
          default:
            setErrorMessage({
              title: "Sign In Failed",
              description: data.error || "An unexpected error occurred. Please try again.",
              icon: <AlertCircle className="h-6 w-6" />,
            })
        }
        return
      }

      // Save to localStorage
      localStorage.setItem("goldStudent", JSON.stringify(data.student))
      localStorage.setItem("goldEnrollments", JSON.stringify(data.enrollments))

      toast.success(`Welcome back, ${data.student.full_name}!`, {
        description: "You have successfully signed in.",
      })
      router.push("/gold/dashboard")
    } catch (error) {
      console.error("Error:", error)
      triggerShake()
      setErrorMessage({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        icon: <AlertCircle className="h-6 w-6" />,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center p-4">
      <Card
        className={`w-full max-w-md bg-[#0f1419]/80 border-[#1a1a2e] backdrop-blur-sm transition-transform ${shake ? "animate-shake" : ""}`}
      >
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#e63946] to-[#ff6b6b] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#e63946]/20">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Markano <span className="text-[#e63946]">Gold</span>
            </CardTitle>
            <CardDescription className="text-slate-400">Sign in to your account to continue learning</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-6 p-5 bg-red-500/20 border-2 border-red-500/50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <div className="text-red-400">{errorMessage.icon}</div>
                </div>
                <div className="flex-1">
                  <h4 className="text-red-400 font-bold text-lg">{errorMessage.title}</h4>
                  <p className="text-red-300/90 text-sm mt-1 leading-relaxed">{errorMessage.description}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors ${errorMessage ? "border-red-500/50" : ""}`}
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value })
                    setErrorMessage(null)
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 pr-10 focus:border-[#e63946] transition-colors ${errorMessage ? "border-red-500/50" : ""}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                    setErrorMessage(null)
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-[#e63946] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white font-semibold shadow-lg shadow-[#e63946]/20 transition-all hover:shadow-[#e63946]/30"
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
              <Link href="/gold/register" className="text-[#e63946] hover:text-[#ff6b6b] transition-colors">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
