"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Crown,
  Mail,
  Lock,
  User,
  Building2,
  BookOpen,
  CheckCircle,
  Loader2,
  X,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  XCircle,
  Phone,
} from "lucide-react"
import { toast } from "sonner"

const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "Uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "Lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "Number (0-9)", test: (p: string) => /[0-9]/.test(p) },
]

export default function GoldRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [shake, setShake] = useState(false)
  const [errorMessage, setErrorMessage] = useState<{
    title: string
    description: string
    icon: React.ReactNode
  } | null>(null)
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    whatsapp_number: "",
    password: "",
    confirm_password: "",
    university: "",
    field_of_study: "",
  })

  const passwordValidation = useMemo(() => {
    const results = passwordRules.map((rule) => ({
      ...rule,
      passed: rule.test(form.password),
    }))
    const passedCount = results.filter((r) => r.passed).length
    const strength =
      passedCount === 0 ? 0 : passedCount === 1 ? 25 : passedCount === 2 ? 50 : passedCount === 3 ? 75 : 100
    const isValid = passedCount === passwordRules.length
    const passwordsMatch = form.password === form.confirm_password && form.confirm_password.length > 0

    return { results, strength, isValid, passwordsMatch }
  }, [form.password, form.confirm_password])

  const getStrengthInfo = (strength: number) => {
    if (strength === 0) return { color: "bg-slate-600", label: "", textColor: "text-slate-400" }
    if (strength <= 25) return { color: "bg-red-600", label: "Weak", textColor: "text-red-400" }
    if (strength <= 50) return { color: "bg-orange-500", label: "Fair", textColor: "text-orange-400" }
    if (strength <= 75) return { color: "bg-[#e63946]", label: "Good", textColor: "text-[#e63946]" }
    return { color: "bg-emerald-500", label: "Very Strong", textColor: "text-emerald-400" }
  }

  const strengthInfo = getStrengthInfo(passwordValidation.strength)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validate full name
    if (form.full_name.trim().length < 2) {
      setErrorMessage({
        title: "Invalid Name",
        description: "Please enter your full name (at least 2 characters).",
        icon: <User className="h-6 w-6" />,
      })
      toast.error("Invalid name", {
        description: "Please enter your full name (at least 2 characters).",
      })
      triggerShake()
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setErrorMessage({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., name@example.com).",
        icon: <Mail className="h-6 w-6" />,
      })
      toast.error("Invalid email format", {
        description: "Please enter a valid email address.",
      })
      triggerShake()
      setLoading(false)
      return
    }

    const phoneRegex = /^[\d\s+\-$$$$]{7,20}$/
    if (!form.whatsapp_number.trim()) {
      setErrorMessage({
        title: "WhatsApp Number Required",
        description: "Please enter your WhatsApp number so we can contact you.",
        icon: <Phone className="h-6 w-6" />,
      })
      toast.error("WhatsApp number required", {
        description: "Please enter your WhatsApp number.",
      })
      triggerShake()
      setLoading(false)
      return
    }
    if (!phoneRegex.test(form.whatsapp_number)) {
      setErrorMessage({
        title: "Invalid WhatsApp Number",
        description: "Please enter a valid phone number (e.g., +252 61 1234567).",
        icon: <Phone className="h-6 w-6" />,
      })
      toast.error("Invalid phone number", {
        description: "Please enter a valid WhatsApp number.",
      })
      triggerShake()
      setLoading(false)
      return
    }

    if (!passwordValidation.isValid) {
      const weakReasons = passwordValidation.results
        .filter((r) => !r.passed)
        .map((r) => r.label)
        .join(", ")
      
      setErrorMessage({
        title: "Weak Password",
        description: `Your password is too weak. Please make sure it meets all requirements: ${weakReasons}.`,
        icon: <Lock className="h-6 w-6" />,
      })
      toast.error("Password is too weak", {
        description: "Please make sure your password meets all security requirements.",
      })
      triggerShake()
      setLoading(false)
      return
    }

    if (!passwordValidation.passwordsMatch) {
      setErrorMessage({
        title: "Passwords Don't Match",
        description: "The passwords you entered do not match. Please make sure both passwords are the same.",
        icon: <XCircle className="h-6 w-6" />,
      })
      toast.error("Passwords don't match", {
        description: "Please make sure both password fields match.",
      })
      triggerShake()
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/gold/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        triggerShake()
        const errorText = data.error?.toLowerCase() || ""
        
        if (response.status === 400) {
          // Check for email already registered
          if (errorText.includes("email") && (errorText.includes("registered") || errorText.includes("already") || errorText.includes("exists"))) {
            setErrorMessage({
              title: "Email Already Registered",
              description: "This email address is already in use. Please use a different email or try logging in.",
              icon: <Mail className="h-6 w-6" />,
            })
            toast.error("Email already registered", {
              description: "This email is already in use. Please use a different email or try logging in.",
            })
          } 
          // Check for weak password
          else if (errorText.includes("password") && (errorText.includes("weak") || errorText.includes("invalid") || errorText.includes("short"))) {
            setErrorMessage({
              title: "Weak Password",
              description: "Your password is too weak. Please make sure it has at least 8 characters, including uppercase, lowercase, and a number.",
              icon: <Lock className="h-6 w-6" />,
            })
          }
          // Check for missing fields
          else if (errorText.includes("required") || errorText.includes("missing") || errorText.includes("fill")) {
            setErrorMessage({
              title: "Missing Information",
              description: data.error || "Please fill in all required fields.",
              icon: <AlertCircle className="h-6 w-6" />,
            })
            toast.error("Missing information", {
              description: data.error || "Please fill in all required fields.",
            })
          } 
          // Generic 400 error
          else {
            setErrorMessage({
              title: "Invalid Information",
              description: data.error || "Please check your information and try again.",
              icon: <AlertCircle className="h-6 w-6" />,
            })
            toast.error("Registration failed", {
              description: data.error || "Please check your information and try again.",
            })
          }
        } else if (response.status === 500) {
          setErrorMessage({
            title: "Server Error",
            description: "Something went wrong on our end. Please try again in a few minutes.",
            icon: <AlertCircle className="h-6 w-6" />,
          })
          toast.error("Server error", {
            description: "Something went wrong. Please try again later.",
          })
        } else {
          setErrorMessage({
            title: "Registration Failed",
            description: data.error || "An unexpected error occurred. Please try again.",
            icon: <AlertCircle className="h-6 w-6" />,
          })
          toast.error("Registration failed", {
            description: data.error || "An unexpected error occurred. Please try again.",
          })
        }
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success("Registration Successful!", {
        description: "Your account has been created. Please wait for admin approval.",
      })
    } catch (error) {
      console.error("Error:", error)
      triggerShake()
      setErrorMessage({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        icon: <AlertCircle className="h-6 w-6" />,
      })
      toast.error("Connection error", {
        description: "Unable to connect to the server. Please check your internet connection.",
      })
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#0a0a0f]/80 border-[#1a1a2e] text-center backdrop-blur-sm">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Registration Successful!</h2>
            <p className="text-slate-400 mb-6">
              Your account has been created. Please wait for admin approval to access your account. We will send you an
              email once approved.
            </p>
            <Link href="/gold/login">
              <Button className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center p-4">
      <Card
        className={`w-full max-w-md bg-[#0a0a0f]/80 border-[#1a1a2e] backdrop-blur-sm relative z-10 transition-transform ${shake ? "animate-shake" : ""}`}
      >
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#e63946] to-[#ff6b6b] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#e63946]/20">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Markano <span className="text-[#e63946]">Gold</span>
            </CardTitle>
            <CardDescription className="text-slate-400">Create a new account to start learning</CardDescription>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors ${errorMessage ? "border-red-500/50" : ""}`}
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={(e) => {
                    setForm({ ...form, full_name: e.target.value })
                    setErrorMessage(null)
                  }}
                  required
                />
              </div>
            </div>

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
              <Label className="text-slate-300">
                WhatsApp Number <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="tel"
                  className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors ${errorMessage ? "border-red-500/50" : ""}`}
                  placeholder="+252 61 1234567"
                  value={form.whatsapp_number}
                  onChange={(e) => {
                    setForm({ ...form, whatsapp_number: e.target.value })
                    setErrorMessage(null)
                  }}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">We'll use this to contact you about your account</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">
                  University <span className="text-slate-500 text-xs">(Optional)</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    className="bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors"
                    placeholder="Your University"
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">
                  Field of Study <span className="text-slate-500 text-xs">(Optional)</span>
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    className="bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors"
                    placeholder="Your Field of Study"
                    value={form.field_of_study}
                    onChange={(e) => setForm({ ...form, field_of_study: e.target.value })}
                  />
                </div>
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

              <div className="space-y-3 mt-3 p-3 bg-[#0a0a0f]/60 rounded-lg border border-[#1a1a2e]">
                {form.password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Password Strength</span>
                      <span className={strengthInfo.textColor}>{strengthInfo.label}</span>
                    </div>
                    <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                        style={{ width: `${passwordValidation.strength}%` }}
                      />
                    </div>
                  </div>
                )}

                {form.password.length === 0 && (
                  <div className="flex items-start gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-md">
                    <Lock className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-400">Your password must meet the following requirements:</p>
                  </div>
                )}

                {form.password.length > 0 && !passwordValidation.isValid && (
                  <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
                    <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">
                      Your password is too weak. Please make sure it meets all the requirements below.
                    </p>
                  </div>
                )}

                {form.password.length > 0 && passwordValidation.isValid && (
                  <div className="flex items-start gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-400">Great! Your password meets all security requirements.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {passwordValidation.results.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        rule.passed ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {rule.passed ? (
                        <Check className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`bg-[#0a0a0f]/80 text-white pl-10 pr-10 transition-colors ${
                    form.confirm_password.length > 0
                      ? passwordValidation.passwordsMatch
                        ? "border-emerald-500 focus:border-emerald-500"
                        : "border-red-500 focus:border-red-500"
                      : "border-[#1a1a2e] focus:border-[#e63946]"
                  }`}
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={(e) => {
                    setForm({ ...form, confirm_password: e.target.value })
                    setErrorMessage(null)
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-[#e63946] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.confirm_password.length > 0 && (
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.passwordsMatch ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {passwordValidation.passwordsMatch ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5" />
                      <span>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white font-semibold disabled:opacity-50 shadow-lg shadow-[#e63946]/20 transition-all hover:shadow-[#e63946]/30"
              disabled={loading || !passwordValidation.isValid || !passwordValidation.passwordsMatch}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-slate-400 text-sm">
              Already have an account?{" "}
              <Link href="/gold/login" className="text-[#e63946] hover:text-[#ff6b6b] transition-colors">
                Sign In
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
