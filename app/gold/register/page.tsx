"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Crown, Mail, Lock, User, Building2, BookOpen, CheckCircle, Loader2, X, Check, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

const passwordRules = [
  { id: "length", label: "Ugu yaraan 8 xaraf", test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "Xaraf weyn (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "Xaraf yar (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "Nambar (0-9)", test: (p: string) => /[0-9]/.test(p) },
]

export default function GoldRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [form, setForm] = useState({
    full_name: "",
    email: "",
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
    if (strength <= 25) return { color: "bg-red-600", label: "Daciif", textColor: "text-red-400" }
    if (strength <= 50) return { color: "bg-orange-500", label: "Dhexdhexaad", textColor: "text-orange-400" }
    if (strength <= 75) return { color: "bg-[#e63946]", label: "Wanaagsan", textColor: "text-[#e63946]" }
    return { color: "bg-emerald-500", label: "Aad u Xoog Badan", textColor: "text-emerald-400" }
  }

  const strengthInfo = getStrengthInfo(passwordValidation.strength)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordValidation.isValid) {
      toast.error("Password-ku ma buuxiyo shuruudaha loo baahan yahay", {
        description: "Fadlan eeg shuruudaha password-ka oo buuxi dhammaan.",
      })
      return
    }

    if (!passwordValidation.passwordsMatch) {
      toast.error("Password-yadu ma iswaafaqsanin", {
        description: "Fadlan hubi in labada password ay isku mid yihiin.",
      })
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
        toast.error(data.error || "Khalad ayaa dhacay")
        return
      }

      setSuccess(true)
      toast.success("Is-diiwaangelintu way guulaysatay!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#0f1419]/80 border-[#1a1a2e] text-center backdrop-blur-sm">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Is-diiwaangelintu Way Guulaysatay!</h2>
            <p className="text-slate-400 mb-6">
              Akoonkaagu waa la abuuray. Fadlan sug ansixinta admin-ka si aad u gasho. Waxaan kuu soo diri doonaa email
              marka la ansixiyo.
            </p>
            <Link href="/gold/login">
              <Button className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white">
                Ku Noqo Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#ff6b6b]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md bg-[#0f1419]/80 border-[#1a1a2e] backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#e63946] to-[#ff6b6b] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#e63946]/20">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Markano <span className="text-[#e63946]">Gold</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Samee akoon cusub si aad u bilowdo waxbarashada
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Magaca Oo Dhamaystiran</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  className="bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors"
                  placeholder="Magacaaga oo dhamaystiran"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
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
                  className="bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Jaamacadda</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    className="bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors"
                    placeholder="Jaamacadda"
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Qaybta</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    className="bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 focus:border-[#e63946] transition-colors"
                    placeholder="Qaybta"
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
                  className="bg-[#0a0a0f]/80 border-[#1a1a2e] text-white pl-10 pr-10 focus:border-[#e63946] transition-colors"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

              {form.password.length > 0 && (
                <div className="space-y-3 mt-3 p-3 bg-[#0a0a0f]/60 rounded-lg border border-[#1a1a2e]">
                  {/* Strength bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Xoogga Password-ka</span>
                      <span className={strengthInfo.textColor}>{strengthInfo.label}</span>
                    </div>
                    <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                        style={{ width: `${passwordValidation.strength}%` }}
                      />
                    </div>
                  </div>

                  {/* Rules checklist */}
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
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Xaqiiji Password</Label>
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
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
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
              {/* Match status message */}
              {form.confirm_password.length > 0 && (
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.passwordsMatch ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {passwordValidation.passwordsMatch ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Password-yadu waa iswaafaqsan yihiin</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5" />
                      <span>Password-yadu ma iswaafaqsanin</span>
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
                  Waa la diiwaangelinayaa...
                </>
              ) : (
                "Samee Akoon"
              )}
            </Button>

            <p className="text-center text-slate-400 text-sm">
              Horey akoon u leedahay?{" "}
              <Link href="/gold/login" className="text-[#e63946] hover:text-[#ff6b6b] transition-colors">
                Soo Gal
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
