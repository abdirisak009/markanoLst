"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  Loader2,
  Shield,
  Wifi,
  Code,
  Film,
  Play,
  Users,
  Award,
  Clock,
  ChevronRight,
  Globe,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Phone,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getDeviceId, setDeviceIdFromServer } from "@/lib/utils"

// Particle animation component
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(230, 57, 70, ${p.opacity})`
        ctx.fill()

        particles.forEach((p2, j) => {
          if (i === j) return
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(230, 57, 70, ${0.1 * (1 - dist / 150)})`
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}


// Stats data
const platformStats = [
  { value: "1,200+", label: "Students", icon: Users },
  { value: "200+", label: "Lessons", icon: Play },
  { value: "50+", label: "Instructors", icon: Award },
  { value: "24/7", label: "Support", icon: Clock },
]

// Features list
const features = ["HD Quality Lessons", "Professional Certificate", "24/7 Mentor Support", "Hands-on Projects"]

export default function GoldAuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    whatsapp_number: "",
    password: "",
    confirmPassword: "",
    university: "",
    field_of_study: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      const student = localStorage.getItem("gold_student")
      if (student) {
        router.push("/gold/dashboard")
      }
    } catch (e) {}
  }, [router, mounted])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const device_id = getDeviceId()
      const res = await fetch("/api/gold/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loginForm, device_id }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.code === "DEVICE_LIMIT") {
          toast.error(data.error || "You can only use 2 devices. Contact admin to add this device.")
        } else {
          toast.error(data.error || "Login failed")
        }
        setLoading(false)
        return
      }

      setDeviceIdFromServer(data.device_id)
      localStorage.setItem("gold_student", JSON.stringify(data.student || data))
      localStorage.setItem("goldEnrollments", JSON.stringify(data.enrollments || []))
      toast.success(`Welcome back, ${(data.student || data).full_name}!`)
      router.push("/profile")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (registerForm.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/gold/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: registerForm.full_name,
          email: registerForm.email,
          whatsapp_number: registerForm.whatsapp_number,
          password: registerForm.password,
          university: registerForm.university,
          field_of_study: registerForm.field_of_study,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      localStorage.setItem("gold_student", JSON.stringify(data))
      toast.success("Your account has been created!")
      // Redirect to welcome page for first-time users
      router.push("/gold/welcome")
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#e63946]/20 rounded-full animate-spin border-t-[#e63946]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(230, 57, 70, 0.3); }
          50% { box-shadow: 0 0 40px rgba(230, 57, 70, 0.5); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-gradient-x { 
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite; 
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .animate-slide-right { animation: slide-right 0.5s ease-out forwards; }
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-card {
          background: rgba(20, 20, 20, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gold-input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 12px;
          color: #0a0a0a !important;
          font-size: 15px;
          transition: all 0.3s ease;
        }
        .gold-input:focus {
          border-color: #e63946 !important;
          box-shadow: 0 0 0 4px rgba(230, 57, 70, 0.1) !important;
          outline: none !important;
        }
        .gold-input::placeholder {
          color: #9ca3af !important;
        }
        .track-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .track-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .dark-inputs input {
          background: #111 !important;
          color: #ddd !important;
          border-color: #333 !important;
        }
        .dark-inputs input:focus {
          border-color: #e63946 !important;
          box-shadow: 0 0 0 4px rgba(230, 57, 70, 0.1) !important;
          outline: none !important;
        }
      `}</style>

      {/* Particle Background */}
      <ParticleField />

      {/* Gradient Orb following mouse */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(230,57,70,0.2) 0%, transparent 60%)",
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
          transition: "left 0.2s ease-out, top 0.2s ease-out",
          filter: "blur(40px)",
        }}
      />

      {/* Fixed background orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#e63946]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 py-4 border-b border-white/5">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/images/markano-logo-new.png"
                alt="Markano"
                width={160}
                height={45}
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden md:flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm px-4 py-2 rounded-full hover:bg-white/5"
              >
                <Globe className="w-4 h-4" />
                Home
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <section className="relative py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left Column - Content */}
            <div className="space-y-8 animate-slide-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e63946] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e63946]"></span>
                </span>
                <span className="text-sm text-white/80 font-medium">Premium Learning Platform</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
                  <span className="text-white">Markano</span>{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] to-[#ff6b6b]">
                    Gold
                  </span>
                </h1>
                <p className="text-lg text-white/60 max-w-lg">
                  The most modern Technology education platform.
                  <span className="text-white font-medium"> Learn, Practice, Succeed.</span>
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-white/70"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#e63946] flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {platformStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 mb-2">
                      <stat.icon className="w-5 h-5 text-[#e63946]" />
                    </div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column - Auth Form */}
            <div className="animate-slide-up" id="auth-section">
              <div className="glass-card rounded-3xl p-8 max-w-md mx-auto lg:mx-0 lg:ml-auto shadow-2xl dark-inputs">
                {/* Form Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] mb-4 animate-float">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeTab === "login" ? "Welcome Back" : "Create Account"}
                  </h2>
                  <p className="text-white/50 text-sm mt-1">
                    {activeTab === "login" ? "Sign in to your account" : "Start learning today"}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      activeTab === "login"
                        ? "bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white shadow-lg"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      activeTab === "register"
                        ? "bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white shadow-lg"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Login Form */}
                {activeTab === "login" && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label className="text-white/70 text-sm mb-2 block">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="gold-input"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm mb-2 block">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="gold-input"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d32f3d] hover:to-[#e63946] text-white py-6 text-base rounded-xl shadow-lg shadow-[#e63946]/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {/* Register Form */}
                {activeTab === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label className="text-white/70 text-sm mb-2 block">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <input
                          type="text"
                          placeholder="Your Full Name"
                          value={registerForm.full_name}
                          onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                          className="gold-input"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm mb-2 block">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="gold-input"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm mb-2 block">
                        WhatsApp Number <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <input
                          type="tel"
                          placeholder="+252 61 1234567"
                          value={registerForm.whatsapp_number}
                          onChange={(e) => setRegisterForm({ ...registerForm, whatsapp_number: e.target.value })}
                          className="gold-input"
                          required
                        />
                      </div>
                      <p className="text-xs text-white/50 mt-1">We'll use this to contact you about your account</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white/70 text-sm mb-2 block">University</Label>
                        <div className="relative">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                          <input
                            type="text"
                            placeholder="Your University"
                            value={registerForm.university}
                            onChange={(e) => setRegisterForm({ ...registerForm, university: e.target.value })}
                            className="gold-input"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm mb-2 block">Field of Study</Label>
                        <div className="relative">
                          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                          <input
                            type="text"
                            placeholder="Your Field of Study"
                            value={registerForm.field_of_study}
                            onChange={(e) => setRegisterForm({ ...registerForm, field_of_study: e.target.value })}
                            className="gold-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white/70 text-sm mb-2 block">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            className="gold-input"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm mb-2 block">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                            className="gold-input"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d32f3d] hover:to-[#e63946] text-white py-6 text-base rounded-xl shadow-lg shadow-[#e63946]/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Register
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {/* Terms */}
                <p className="text-center text-white/40 text-xs mt-4">
                  By registering, you agree to our{" "}
                  <Link href="#" className="text-[#e63946] hover:underline">
                    Terms
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative py-8 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/40 text-sm">© 2025 Markano Gold. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
