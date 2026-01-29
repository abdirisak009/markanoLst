"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  GraduationCap,
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
  AlertTriangle,
  XCircle,
  Phone,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { getDeviceId, setDeviceIdFromServer } from "@/lib/utils"

const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "Uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "Lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "Number (0-9)", test: (p: string) => /[0-9]/.test(p) },
]

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "login" | "register"
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState<{
    title: string
    description: string
    icon: React.ReactNode
  } | null>(null)

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
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
      passed: rule.test(registerForm.password),
    }))
    const passedCount = results.filter((r) => r.passed).length
    const strength =
      passedCount === 0 ? 0 : passedCount === 1 ? 25 : passedCount === 2 ? 50 : passedCount === 3 ? 75 : 100
    const isValid = passedCount === passwordRules.length
    const passwordsMatch = registerForm.password === registerForm.confirm_password && registerForm.confirm_password.length > 0

    return { results, strength, isValid, passwordsMatch }
  }, [registerForm.password, registerForm.confirm_password])

  const getStrengthInfo = (strength: number) => {
    if (strength === 0) return { color: "bg-slate-600", label: "", textColor: "text-slate-400" }
    if (strength <= 25) return { color: "bg-red-600", label: "Weak", textColor: "text-red-400" }
    if (strength <= 50) return { color: "bg-orange-500", label: "Fair", textColor: "text-orange-400" }
    if (strength <= 75) return { color: "bg-[#e63946]", label: "Good", textColor: "text-[#e63946]" }
    return { color: "bg-emerald-500", label: "Very Strong", textColor: "text-emerald-400" }
  }

  const strengthInfo = getStrengthInfo(passwordValidation.strength)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError("")

    if (!loginForm.email.trim()) {
      setLoginError("Please enter your email address")
      setLoginLoading(false)
      return
    }

    if (!loginForm.password) {
      setLoginError("Please enter your password")
      setLoginLoading(false)
      return
    }

    try {
      const device_id = getDeviceId()
      const response = await fetch("/api/gold/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email.trim().toLowerCase(),
          password: loginForm.password,
          device_id,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError)
        setLoginError("Server error. Please try again later.")
        setLoginLoading(false)
        return
      }

      if (!response.ok) {
        if (data.code === "INVALID_CREDENTIALS") {
          setLoginError("Invalid email or password. Please check your credentials and try again.")
        } else if (data.code === "ACCOUNT_PENDING") {
          setLoginError("Your account is pending approval. Please wait for admin confirmation.")
        } else if (data.code === "ACCOUNT_SUSPENDED") {
          setLoginError("Your account has been suspended. Please contact support.")
        } else if (data.code === "ACCOUNT_INACTIVE") {
          setLoginError("Your account is inactive. Please contact support.")
        } else if (data.code === "DEVICE_LIMIT") {
          setLoginError(data.error || "You can only use 2 devices. Contact admin to add this device.")
        } else if (data.code === "SERVER_ERROR") {
          setLoginError(data.error || "Server error. Please try again in a few minutes.")
        } else {
          setLoginError(data.error || "Login failed. Please try again.")
        }
        setLoginLoading(false)
        return
      }

      if (!data.student) {
        setLoginError("Invalid response from server. Please try again.")
        setLoginLoading(false)
        return
      }

      setDeviceIdFromServer(data.device_id)
      localStorage.setItem("gold_student", JSON.stringify(data.student))
      localStorage.setItem("goldEnrollments", JSON.stringify(data.enrollments || []))
      toast.success(`Welcome back, ${data.student.full_name}!`)
      onOpenChange(false)
      router.push("/profile")
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)
      setLoginError(err instanceof Error ? err.message : "Connection error. Please check your internet and try again.")
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError(null)

    if (registerForm.full_name.trim().length < 2) {
      setRegisterError({
        title: "Invalid Name",
        description: "Please enter your full name (at least 2 characters).",
        icon: <User className="h-6 w-6" />,
      })
      toast.error("Invalid name", {
        description: "Please enter your full name (at least 2 characters).",
      })
      setRegisterLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerForm.email)) {
      setRegisterError({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., name@example.com).",
        icon: <Mail className="h-6 w-6" />,
      })
      toast.error("Invalid email format", {
        description: "Please enter a valid email address.",
      })
      setRegisterLoading(false)
      return
    }

    const phoneRegex = /^[\d\s+\-$$$$]{7,20}$/
    if (!registerForm.whatsapp_number.trim()) {
      setRegisterError({
        title: "WhatsApp Number Required",
        description: "Please enter your WhatsApp number so we can contact you.",
        icon: <Phone className="h-6 w-6" />,
      })
      toast.error("WhatsApp number required", {
        description: "Please enter your WhatsApp number.",
      })
      setRegisterLoading(false)
      return
    }
    if (!phoneRegex.test(registerForm.whatsapp_number)) {
      setRegisterError({
        title: "Invalid WhatsApp Number",
        description: "Please enter a valid phone number (e.g., +252 61 1234567).",
        icon: <Phone className="h-6 w-6" />,
      })
      toast.error("Invalid phone number", {
        description: "Please enter a valid WhatsApp number.",
      })
      setRegisterLoading(false)
      return
    }

    if (!passwordValidation.isValid) {
      const weakReasons = passwordValidation.results
        .filter((r) => !r.passed)
        .map((r) => r.label)
        .join(", ")
      
      setRegisterError({
        title: "Weak Password",
        description: `Your password is too weak. Please make sure it meets all requirements: ${weakReasons}.`,
        icon: <Lock className="h-6 w-6" />,
      })
      toast.error("Password is too weak", {
        description: "Please make sure your password meets all security requirements.",
      })
      setRegisterLoading(false)
      return
    }

    if (!passwordValidation.passwordsMatch) {
      setRegisterError({
        title: "Passwords Don't Match",
        description: "The passwords you entered do not match. Please make sure both passwords are the same.",
        icon: <XCircle className="h-6 w-6" />,
      })
      toast.error("Passwords don't match", {
        description: "Please make sure both password fields match.",
      })
      setRegisterLoading(false)
      return
    }

    setRegisterLoading(true)
    try {
      const response = await fetch("/api/gold/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorText = data.error?.toLowerCase() || ""
        
        // Handle IP blocked or rate limited errors
        if (response.status === 403 || response.status === 429) {
          const retryAfter = data.retryAfterMinutes || data.retryAfterSeconds
          const retryMessage = retryAfter 
            ? `Please try again in ${retryAfter} ${retryAfter > 60 ? 'minutes' : 'seconds'}.`
            : "Please try again in a few minutes."
          
          setRegisterError({
            title: response.status === 403 ? "Access Temporarily Blocked" : "Too Many Attempts",
            description: data.error || (response.status === 403 
              ? "Your IP has been temporarily blocked. " + retryMessage
              : "Too many registration attempts. " + retryMessage),
            icon: <AlertCircle className="h-6 w-6" />,
          })
          toast.error(response.status === 403 ? "Access blocked" : "Too many attempts", {
            description: retryMessage,
          })
          setRegisterLoading(false)
          return
        }
        
        if (response.status === 400) {
          if (errorText.includes("email") && (errorText.includes("registered") || errorText.includes("already") || errorText.includes("exists"))) {
            setRegisterError({
              title: "Email Already Registered",
              description: "This email address is already in use. Please use a different email or try logging in.",
              icon: <Mail className="h-6 w-6" />,
            })
            toast.error("Email already registered", {
              description: "This email is already in use. Please use a different email or try logging in.",
            })
          } else if (errorText.includes("password") && (errorText.includes("weak") || errorText.includes("invalid") || errorText.includes("short"))) {
            setRegisterError({
              title: "Weak Password",
              description: "Your password is too weak. Please make sure it has at least 8 characters, including uppercase, lowercase, and a number.",
              icon: <Lock className="h-6 w-6" />,
            })
          } else if (errorText.includes("required") || errorText.includes("missing") || errorText.includes("fill")) {
            setRegisterError({
              title: "Missing Information",
              description: data.error || "Please fill in all required fields.",
              icon: <AlertCircle className="h-6 w-6" />,
            })
            toast.error("Missing information", {
              description: data.error || "Please fill in all required fields.",
            })
          } else {
            setRegisterError({
              title: "Invalid Information",
              description: data.error || "Please check your information and try again.",
              icon: <AlertCircle className="h-6 w-6" />,
            })
            toast.error("Registration failed", {
              description: data.error || "Please check your information and try again.",
            })
          }
        } else if (response.status === 500) {
          setRegisterError({
            title: "Server Error",
            description: "Something went wrong on our end. Please try again in a few minutes.",
            icon: <AlertCircle className="h-6 w-6" />,
          })
          toast.error("Server error", {
            description: "Something went wrong. Please try again later.",
          })
        } else {
          setRegisterError({
            title: "Registration Failed",
            description: data.error || "An unexpected error occurred. Please try again.",
            icon: <AlertCircle className="h-6 w-6" />,
          })
          toast.error("Registration failed", {
            description: data.error || "An unexpected error occurred. Please try again.",
          })
        }
        setRegisterLoading(false)
        return
      }

      // Automatically log in the user after successful registration
      localStorage.setItem("gold_student", JSON.stringify(data.student))
      localStorage.setItem("goldEnrollments", JSON.stringify("[]"))
      
      toast.success(`Welcome, ${data.student.full_name}!`, {
        description: "Your account has been created successfully.",
      })
      
      // Close modal and redirect to profile
      onOpenChange(false)
      router.push("/profile")
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      setRegisterError({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        icon: <AlertCircle className="h-6 w-6" />,
      })
      toast.error("Connection error", {
        description: "Unable to connect to the server. Please check your internet connection.",
      })
      setRegisterLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-[#0a0a0f] to-[#0f1419] border-[#1a1a2e] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#e63946] to-[#ff6b6b] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#e63946]/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Welcome Back</span>
            <p className="text-sm text-gray-400 mt-2">Sign in to access your profile</p>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#0a0a0f]/60 border border-[#1a1a2e] mb-6">
            <TabsTrigger value="login" className="data-[state=active]:bg-[#e63946] data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-[#e63946] data-[state=active]:text-white">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] ${loginError ? "border-red-500" : ""}`}
                    placeholder="email@example.com"
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, email: e.target.value })
                      setLoginError("")
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
                    className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 pr-10 focus:border-[#e63946] ${loginError ? "border-red-500" : ""}`}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, password: e.target.value })
                      setLoginError("")
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

              {loginError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{loginError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white font-semibold"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-0">
            {registerError && (
              <div className="mb-4 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <div className="text-red-400">{registerError.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-red-400 font-bold text-sm">{registerError.title}</h4>
                    <p className="text-red-300/90 text-xs mt-1">{registerError.description}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors ${registerError ? "border-red-500/50" : ""}`}
                    placeholder="Your full name"
                    value={registerForm.full_name}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, full_name: e.target.value })
                      setRegisterError(null)
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
                    className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors ${registerError ? "border-red-500/50" : ""}`}
                    placeholder="email@example.com"
                    value={registerForm.email}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, email: e.target.value })
                      setRegisterError(null)
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
                    className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors ${registerError ? "border-red-500/50" : ""}`}
                    placeholder="+252 61 1234567"
                    value={registerForm.whatsapp_number}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, whatsapp_number: e.target.value })
                      setRegisterError(null)
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
                      value={registerForm.university}
                      onChange={(e) => setRegisterForm({ ...registerForm, university: e.target.value })}
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
                      value={registerForm.field_of_study}
                      onChange={(e) => setRegisterForm({ ...registerForm, field_of_study: e.target.value })}
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
                    className={`bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 pr-10 focus:border-[#e63946] transition-colors ${registerError ? "border-red-500/50" : ""}`}
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, password: e.target.value })
                      setRegisterError(null)
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

                {registerForm.password.length > 0 && (
                  <div className="space-y-2 p-3 bg-[#0a0a0f]/60 rounded-lg border border-[#1a1a2e]">
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
                    <div className="grid grid-cols-2 gap-2 mt-2">
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
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`bg-[#0a0a0f]/80 text-white pl-10 pr-10 transition-colors ${
                      registerForm.confirm_password.length > 0
                        ? passwordValidation.passwordsMatch
                          ? "border-emerald-500 focus:border-emerald-500"
                          : "border-red-500 focus:border-red-500"
                        : "border-[#1a1a2e] focus:border-[#e63946]"
                    }`}
                    placeholder="••••••••"
                    value={registerForm.confirm_password}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, confirm_password: e.target.value })
                      setRegisterError(null)
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
                {registerForm.confirm_password.length > 0 && (
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
                disabled={registerLoading || !passwordValidation.isValid || !passwordValidation.passwordsMatch}
              >
                {registerLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
