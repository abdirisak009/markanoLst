"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function InstructorLoginPage() {
  const router = useRouter()
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
      const data = await res.json()
      if (res.ok) {
        toast.success(`Welcome back, ${data.instructor?.full_name || "Instructor"}!`)
        const redirect = searchParams.get("redirect") || "/instructor/dashboard"
        router.push(redirect)
        router.refresh()
      } else {
        toast.error(data.error || "Login failed")
      }
    } catch {
      toast.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[#e63946]/10">
            <GraduationCap className="h-8 w-8 text-[#e63946]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Instructor Login</h1>
            <p className="text-slate-500 text-sm">Sign in to your instructor account</p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Only approved instructors can log in. Apply first if you have not yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="border-slate-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#e63946] hover:bg-[#d62839]">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
              <Link href="/instructor/apply" className="text-[#e63946] hover:underline">
                Apply to become an instructor
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link href="/" className="text-[#e63946] hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  )
}
