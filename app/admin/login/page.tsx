"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Hardcoded admin credentials
      const ADMIN_USERNAME = "admin"
      const ADMIN_PASSWORD = "admin123"

      console.log("[v0] Attempting login:", { username })

      // Simple credential check
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        console.log("[v0] Login successful!")

        // Store session
        localStorage.setItem("adminSession", "true")
        localStorage.setItem("adminUser", JSON.stringify({ username, role: "admin" }))

        // Use window.location for a hard redirect
        console.log("[v0] Redirecting to dashboard...")
        window.location.href = "/admin"
      } else {
        console.log("[v0] Login failed: Invalid credentials")
        setError("Invalid username or password")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white to-[#2d5a8c] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <img src="/images/logo.png" alt="Markano" className="h-12 mx-auto mb-4" />
          <CardTitle className="text-2xl text-[#1e3a5f]">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2"
                placeholder="Enter User"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
                placeholder="Enter Password"
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-[#ef4444] hover:bg-[#dc2626]" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-gray-500 text-center">Markano</p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
