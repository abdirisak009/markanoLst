"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

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
        // Store session with user data and permissions
        localStorage.setItem("adminSession", "true")
        localStorage.setItem("adminUser", JSON.stringify(data))

        // Redirect to dashboard
        window.location.href = "/admin"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#013565] to-[#0a1628] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff1b4a]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#013565]/50 rounded-full blur-3xl" />
      </div>

      <Card className="max-w-md w-full bg-[#0a1628]/90 backdrop-blur-xl border-white/10 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <Image
                src="/images/markanologo.png"
                alt="Markano"
                fill
                className="object-contain drop-shadow-[0_0_20px_rgba(255,27,74,0.4)]"
              />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">
            <span className="text-[#ff1b4a]">M</span>arkano Admin
          </CardTitle>
          <p className="text-gray-400 text-sm mt-1">Geli si aad u maamusho nidaamka</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 bg-[#111d32] border-white/10 text-white placeholder:text-gray-500 focus:border-[#ff1b4a] focus:ring-[#ff1b4a]/20"
                placeholder="Geli username-kaaga"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 bg-[#111d32] border-white/10 text-white placeholder:text-gray-500 pr-10 focus:border-[#ff1b4a] focus:ring-[#ff1b4a]/20"
                  placeholder="Geli password-kaaga"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white mt-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-[#ff1b4a] hover:bg-[#e0173f] text-white font-semibold py-5 transition-all duration-200 shadow-lg shadow-[#ff1b4a]/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Galitaanka...
                </>
              ) : (
                "Gal"
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center pt-2">
              Powered by <span className="text-[#ff1b4a]">Markano</span> Learning Management System
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
