"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Award, BookOpen, GraduationCap, Mail, Lock, User, Building, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const darkInputStyle: React.CSSProperties = {
  backgroundColor: "#0f172a",
  borderColor: "#475569",
  color: "white",
}

export default function GoldAuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    field_of_study: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      const student = localStorage.getItem("gold_student")
      if (student) {
        router.push("/gold/dashboard")
      }
    } catch (e) {
      // localStorage not available
    }
  }, [router, mounted])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/gold/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      localStorage.setItem("gold_student", JSON.stringify(data))
      toast.success("Ku soo dhawoow Markano Gold!")
      router.push("/gold/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Register form submitted:", registerForm)

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Password-yadu ma isku mid aha")
      return
    }

    if (registerForm.password.length < 6) {
      toast.error("Password-ku waa inuu ahaadaa ugu yaraan 6 xaraf")
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Sending registration request...")
      const res = await fetch("/api/gold/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: registerForm.full_name,
          email: registerForm.email,
          password: registerForm.password,
          university: registerForm.university,
          field_of_study: registerForm.field_of_study,
        }),
      })

      console.log("[v0] Response status:", res.status)
      const data = await res.json()
      console.log("[v0] Response data:", data)

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      localStorage.setItem("gold_student", JSON.stringify(data))
      toast.success("Account-kaaga waa la abuurtay!")
      router.push("/gold/dashboard")
    } catch (error: any) {
      console.log("[v0] Registration error:", error)
      toast.error(error.message || "Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <style jsx global>{`
        .gold-input {
          background-color: white !important;
          border-color: #e2e8f0 !important;
          color: black !important;
        }
        .gold-input::placeholder {
          color: #94a3b8 !important;
        }
        .gold-input:focus {
          border-color: #f59e0b !important;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2) !important;
        }
      `}</style>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl">
                <Award className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Markano Gold</h1>
                <p className="text-amber-400">Premium Learning Experience</p>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Ku biir barnaamijka waxbarashada casriga ah ee Markano Gold. Baro xirfado cusub, raac waddooyinka aqoonta,
              oo dhamaystir casharro muhiim ah.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BookOpen, title: "Casharro Dheeraad ah", desc: "Ku baro qaabab kala duwan - video iyo qoraal" },
              { icon: GraduationCap, title: "Track-yo Kala Duwan", desc: "Dooro wadada ku haboon xirfadaada" },
              { icon: Sparkles, title: "Horumar La Socod", desc: "La socosho horumarka casharro walba" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
              >
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <feature.icon className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Markano Gold</span>
            </div>
            <CardTitle className="text-white text-xl">Ku soo dhawoow</CardTitle>
            <CardDescription className="text-slate-400">Bilow waxbarashadaada maanta</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid grid-cols-2 bg-slate-900">
                <TabsTrigger value="login" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                  Soo Gal
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                >
                  Is Diiwaan Geli
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                      <input
                        type="email"
                        className="gold-input w-full h-10 pl-10 pr-3 rounded-md border text-sm"
                        placeholder="email@tusaale.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                      <input
                        type="password"
                        className="gold-input w-full h-10 pl-10 pr-3 rounded-md border text-sm"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sugaya...
                      </>
                    ) : (
                      <>
                        Soo Gal
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Magacaaga Oo Buuxa</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                      <input
                        type="text"
                        className="gold-input w-full h-10 pl-10 pr-3 rounded-md border text-sm"
                        placeholder="Maxamed Cali"
                        value={registerForm.full_name}
                        onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                      <input
                        type="email"
                        className="gold-input w-full h-10 pl-10 pr-3 rounded-md border text-sm"
                        placeholder="email@tusaale.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300">Jaamacada</Label>
                      <div className="relative mt-1">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                        <input
                          type="text"
                          className="gold-input w-full h-10 pl-10 pr-3 rounded-md border text-sm"
                          placeholder="SIU"
                          value={registerForm.university}
                          onChange={(e) => setRegisterForm({ ...registerForm, university: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">Fanka</Label>
                      <input
                        type="text"
                        className="gold-input w-full h-10 px-3 rounded-md border text-sm mt-1"
                        placeholder="IT"
                        value={registerForm.field_of_study}
                        onChange={(e) => setRegisterForm({ ...registerForm, field_of_study: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                      <input
                        type="password"
                        className="gold-input w-full h-10 pl-10 pr-3 rounded-md border text-sm"
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Xaqiiji Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                      <input
                        type="password"
                        className="gold-input w-full h-10 pl-10 pr-3 rounded-md border text-sm"
                        placeholder="••••••••"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sugaya...
                      </>
                    ) : (
                      <>
                        Is Diiwaan Geli
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
