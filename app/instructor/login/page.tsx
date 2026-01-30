"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, BookOpen, Users, Award, ArrowRight, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function InstructorLoginPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) {
      toast.error("Email and password are required")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/instructor/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      })
      let data: { instructor?: { full_name?: string }; error?: string } = {}
      try {
        data = await res.json()
      } catch {
        // non-JSON response
      }
      if (res.ok) {
        const redirect = searchParams.get("redirect") || "/instructor/dashboard"
        window.location.href = redirect
        return
      }
      toast.error(data.error || "Login failed")
    } catch {
      toast.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-[#fcf6f0] to-[#e8f4f3] flex flex-col lg:flex-row">
      {/* Left column: branding / hero — hidden on small, full on lg */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center px-8 xl:px-16 py-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#016b62/5%,transparent_40%),linear-gradient(225deg,#fcad21/8%,transparent_50%)]" />
        <div className="absolute top-1/4 right-0 w-[28rem] h-[28rem] bg-[#016b62]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-[#fcad21]/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" style={{ animationDuration: "5s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#f78c6b]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/90 flex items-center justify-center shadow-xl shadow-[#016b62]/15 ring-2 ring-[#fcad21]/30 p-1">
              <Image src="/1.png" alt="Markano" width={52} height={52} className="object-contain" />
            </div>
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold text-[#016b62] tracking-tight">Markano</h1>
              <p className="text-[#fcad21] font-semibold text-sm flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Instructor Portal
              </p>
            </div>
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold text-[#016b62] leading-tight mb-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
            Welcome to the Instructor Portal
          </h2>
          <p className="text-gray-600 text-lg mb-10 leading-relaxed animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
            Teach courses, connect with students, and benefit from the Markano platform.
          </p>
          <ul className="space-y-5">
            {[
              { icon: BookOpen, text: "Create and manage your courses", color: "bg-[#016b62]", delay: "delay-200" },
              { icon: Users, text: "Connect with students and teach", color: "bg-[#fcad21]", delay: "delay-300" },
              { icon: Award, text: "Earn income from what you teach", color: "bg-[#016b62]", delay: "delay-[400ms]" },
            ].map((item, i) => (
              <li key={i} className={`flex items-center gap-4 p-3 rounded-xl hover:bg-white/60 transition-colors duration-300 animate-in fade-in slide-in-from-left-4 duration-500 ${item.delay}`}>
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center shadow-lg text-white shrink-0`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-gray-700 font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right column: login form — full width on mobile, half on lg */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-12 min-h-[100dvh] lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Mobile-only logo + title */}
          <div className="lg:hidden flex items-center gap-3 mb-8 animate-in fade-in duration-500">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shadow-lg flex items-center justify-center ring-2 ring-[#fcad21]/30 p-1">
              <Image src="/1.png" alt="Markano" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#016b62]">Instructor Login</h1>
              <p className="text-gray-600 text-sm">Sign in to your account</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-[#016b62]/10 border border-[#016b62]/10 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 lg:duration-700">
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-[#016b62]/10 bg-gradient-to-r from-[#fcf6f0] via-white to-[#016b62]/5">
              <h2 className="text-xl font-bold text-[#016b62]">Sign in</h2>
              <p className="text-gray-600 text-sm mt-1">
                Only approved instructors can log in. Apply first if you have not yet.
              </p>
            </div>
            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="border-gray-200 focus:border-[#016b62] focus:ring-2 focus:ring-[#016b62]/20 h-11 rounded-lg transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      className="border-gray-200 focus:border-[#016b62] focus:ring-2 focus:ring-[#016b62]/20 pr-10 h-11 rounded-lg transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#016b62] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#016b62] hover:bg-[#014d44] text-white font-semibold shadow-lg shadow-[#016b62]/25 hover:shadow-[#016b62]/30 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
              <p className="text-center text-sm text-gray-600 mt-5">
                <Link
                  href="/instructor/apply"
                  className="text-[#016b62] hover:text-[#fcad21] font-medium hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  Apply to become an instructor
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            <Link href="/" className="text-[#fcad21] hover:text-[#016b62] font-medium hover:underline transition-colors inline-flex items-center gap-1">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
