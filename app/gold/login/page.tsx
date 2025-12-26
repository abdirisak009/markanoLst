"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Crown, Mail, Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function GoldLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/gold/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Khalad ayaa dhacay")
        return
      }

      // Save to localStorage
      localStorage.setItem("goldStudent", JSON.stringify(data.student))
      localStorage.setItem("goldEnrollments", JSON.stringify(data.enrollments))

      toast.success(`Soo dhawoow, ${data.student.full_name}!`)
      router.push("/gold/dashboard")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Markano Gold</CardTitle>
            <CardDescription className="text-slate-400">
              Soo gal akoonkaaga si aad u sii waddo waxbarashada
            </CardDescription>
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
                  className="bg-slate-900/50 border-slate-600 text-white pl-10"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  className="bg-slate-900/50 border-slate-600 text-white pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Waa la soo galinayaa...
                </>
              ) : (
                "Soo Gal"
              )}
            </Button>

            <p className="text-center text-slate-400 text-sm">
              Akoon ma lihid?{" "}
              <Link href="/gold/register" className="text-amber-400 hover:text-amber-300">
                Is-diwaangeli
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
