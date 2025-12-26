"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Crown, Mail, Lock, User, Building2, BookOpen, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function GoldRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    university: "",
    field_of_study: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirm_password) {
      toast.error("Password-yadu ma iswaafaqsanin")
      return
    }

    if (form.password.length < 6) {
      toast.error("Password-ku waa inuu ahaadaa ugu yaraan 6 xaraf")
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Is-diiwaangelintu Way Guulaysatay!</h2>
            <p className="text-slate-400 mb-6">
              Akoonkaagu waa la abuuray. Fadlan sug ansixinta admin-ka si aad u gasho. Waxaan kuu soo diri doonaa email
              marka la ansixiyo.
            </p>
            <Link href="/gold/login">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">Ku Noqo Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
                  className="bg-slate-900/50 border-slate-600 text-white pl-10"
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
                  className="bg-slate-900/50 border-slate-600 text-white pl-10"
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
                    className="bg-slate-900/50 border-slate-600 text-white pl-10"
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
                    className="bg-slate-900/50 border-slate-600 text-white pl-10"
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
                  type="password"
                  className="bg-slate-900/50 border-slate-600 text-white pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Xaqiiji Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  className="bg-slate-900/50 border-slate-600 text-white pl-10"
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
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
                  Waa la diiwaangelinayaa...
                </>
              ) : (
                "Samee Akoon"
              )}
            </Button>

            <p className="text-center text-slate-400 text-sm">
              Horey akoon u leedahay?{" "}
              <Link href="/gold/login" className="text-amber-400 hover:text-amber-300">
                Soo Gal
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
