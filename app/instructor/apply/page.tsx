"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  User,
  Briefcase,
  BookOpen,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Award,
  Heart,
  Upload,
  FileText,
  X,
} from "lucide-react"
import { toast } from "sonner"

const STEPS = [
  { id: 1, title: "Personal", icon: User, desc: "Contact & account" },
  { id: 2, title: "Professional", icon: Briefcase, desc: "Experience & CV" },
  { id: 3, title: "Teaching", icon: BookOpen, desc: "Courses & bio" },
  { id: 4, title: "Review", icon: CheckCircle2, desc: "Confirm & submit" },
]

export default function InstructorApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [cvUploading, setCvUploading] = useState(false)
  const [cvOption, setCvOption] = useState<"" | "upload" | "github" | "other">("")
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    cv_url: "",
    cv_file_name: "",
    job_experience_years: "",
    education: "",
    previous_roles: "",
    skills_certifications: "",
    linkedin_url: "",
    proposed_courses: "",
    bio: "",
    experience_years: "",
  })

  const cvInputRef = useRef<HTMLInputElement>(null)
  const canProceedStep1 = form.full_name.trim() && form.email.trim() && form.password.length >= 6
  const canSubmit =
    form.full_name.trim() && form.email.trim() && form.password.length >= 6

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a PDF or Word document (.pdf, .doc, .docx)")
      e.target.value = ""
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.")
      e.target.value = ""
      return
    }
    setCvUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/instructor/apply/cv-upload", {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to upload CV")
        e.target.value = ""
        return
      }
      setForm((f) => ({
        ...f,
        cv_url: data.url || "",
        cv_file_name: data.fileName || file.name,
      }))
      toast.success("CV uploaded")
    } catch {
      toast.error("Failed to upload CV")
      e.target.value = ""
    } finally {
      setCvUploading(false)
      e.target.value = ""
    }
  }

  const handleRemoveCv = () => {
    setForm((f) => ({ ...f, cv_url: "", cv_file_name: "" }))
    if (cvInputRef.current) cvInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      toast.error("Please fill in required fields: Full name, Email, Password (min 6 characters)")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/instructor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          experience_years: form.experience_years ? parseInt(form.experience_years, 10) : null,
          job_experience_years: form.job_experience_years ? parseInt(form.job_experience_years, 10) : null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Application submitted. We will review and notify you.")
        router.push("/instructor/login")
      } else {
        toast.error(data.error || "Failed to submit application")
      }
    } catch {
      toast.error("Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-[#fcf6f0] to-[#e8f4f3] flex flex-col lg:flex-row pb-safe">
      {/* Mobile: sticky app-style header */}
      <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-xl border-b border-[#2596be]/10 shadow-sm safe-area-top">
        <div className="w-10 h-10 rounded-xl bg-[#2596be]/10 flex items-center justify-center flex-shrink-0">
          <Image src="/1.png" alt="Markano" width={28} height={28} className="object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-[#2596be] truncate">Instructor Registration</h1>
          <p className="text-xs text-gray-500 truncate">Apply to teach on Markano</p>
        </div>
      </header>

      {/* Left column: hero / benefits — hidden on small, visible on lg */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] flex-col justify-center px-8 xl:px-14 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#2596be/6%,transparent_45%),linear-gradient(225deg,#3c62b3/10%,transparent_55%)]" />
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-[#2596be]/12 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-[#3c62b3]/12 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/90 flex items-center justify-center shadow-xl shadow-[#2596be]/15 ring-2 ring-[#3c62b3]/30 p-1">
              <Image src="/1.png" alt="Markano" width={52} height={52} className="object-contain" />
            </div>
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold text-[#2596be] tracking-tight">Markano</h1>
              <p className="text-[#3c62b3] font-semibold text-sm flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Instructor Program
              </p>
            </div>
          </div>
          <h2 className="text-2xl xl:text-3xl font-bold text-[#2596be] leading-tight mb-3 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
            Become an Instructor
          </h2>
          <p className="text-gray-600 text-base mb-8 leading-relaxed animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
            Share your expertise, reach students worldwide, and earn from what you teach on Markano.
          </p>
          <ul className="space-y-4">
            {[
              { icon: GraduationCap, text: "Create and manage your own courses", color: "bg-[#2596be]" },
              { icon: Award, text: "Build your reputation and grow your audience", color: "bg-[#3c62b3]" },
              { icon: Heart, text: "Make an impact while earning income", color: "bg-[#2596be]" },
            ].map((item, i) => (
              <li key={i} className={`flex items-center gap-4 p-3 rounded-xl hover:bg-white/70 transition-colors duration-300 animate-in fade-in slide-in-from-left-4 duration-500 ${i === 0 ? "delay-200" : i === 1 ? "delay-300" : "delay-[400ms]"}`}>
                <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shadow-lg text-white shrink-0`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-gray-700 font-medium text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right column: form — full width on mobile, app-style padding; pb for sticky CTA on mobile */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-10 xl:px-14 min-h-0 lg:min-h-0 pb-28 lg:pb-0">
        <div className="w-full max-w-xl mx-auto">
          {/* Mobile: compact title under sticky header (no duplicate logo) */}
          <div className="lg:hidden mb-3">
            <h2 className="text-lg font-bold text-[#2596be]">Become an Instructor</h2>
            <p className="text-gray-600 text-sm mt-0.5">Complete the steps below to apply</p>
          </div>

          {/* Progress bar — mobile: visible thin bar; desktop: subtle */}
          <div className="mb-3 h-1.5 w-full rounded-full bg-gray-200/80 overflow-hidden" aria-hidden>
            <div
              className="h-full rounded-full bg-[#2596be] transition-all duration-400 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* Step indicator — mobile: horizontal scroll pills with short labels; desktop: full */}
          <div className="flex items-center justify-between gap-1 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 touch-pan-x">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-1 items-center min-w-0 snap-center">
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 min-h-[52px] sm:min-h-0 w-full min-w-[72px] sm:min-w-0 px-3 py-2.5 sm:px-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 touch-target ${
                    step === s.id
                      ? "bg-[#2596be] text-white shadow-lg shadow-[#2596be]/30 ring-2 ring-[#3c62b3]/40"
                      : step > s.id
                        ? "bg-[#3c62b3]/25 text-[#2596be] border border-[#3c62b3]/40"
                        : "bg-white/80 text-gray-500 border border-gray-200/80"
                  }`}
                >
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${step === s.id ? "bg-white/20" : step > s.id ? "bg-[#2596be] text-white" : "bg-gray-200"}`}>
                    {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                  </span>
                  <span className="sm:inline">{s.id === 2 ? "Pro" : s.id === 3 ? "Teach" : s.title}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block flex-1 min-w-[6px] h-1 mx-0.5 rounded-full transition-colors duration-300 ${step > s.id ? "bg-[#3c62b3]" : "bg-gray-200"}`}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>

        <Card className="border-[#2596be]/15 shadow-xl sm:shadow-2xl shadow-[#2596be]/10 sm:shadow-[#2596be]/15 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="border-b border-[#2596be]/10 bg-gradient-to-r from-[#fcf6f0] via-white to-[#2596be]/5 px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2596be] flex items-center justify-center text-white shadow-lg">
                {(() => {
                  const Icon = STEPS[step - 1].icon
                  return <Icon className="h-5 w-5" />
                })()}
              </div>
              <div>
                <CardTitle className="text-[#2596be] text-lg sm:text-xl font-bold">{STEPS[step - 1].title}</CardTitle>
                <CardDescription className="text-gray-600 text-sm mt-0.5">
                  {STEPS[step - 1].desc}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 py-4 sm:px-6 sm:py-5 pb-6 sm:pb-5">
            <form id="instructor-apply-form" onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }} className="space-y-4 sm:space-y-5">
              {/* Step 1: Personal */}
              {step === 1 && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-gray-700">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        placeholder="Your full name"
                        required
                        className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 transition-colors touch-target"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                        className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 transition-colors touch-target"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">Phone</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+252..."
                        className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 transition-colors touch-target"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                        className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 transition-colors touch-target"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional / CV — short fields side by side, text areas full width below */}
              {step === 2 && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_experience_years" className="text-gray-700">Job Experience (years) *</Label>
                      <Input
                        id="job_experience_years"
                        type="number"
                        min={0}
                        value={form.job_experience_years}
                        onChange={(e) => setForm({ ...form, job_experience_years: e.target.value })}
                        placeholder="e.g. 5"
                        className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 transition-colors touch-target"
                      />
                      <p className="text-xs text-gray-500">Total years of professional/work experience</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="education" className="text-gray-700">Education</Label>
                      <Input
                        id="education"
                        value={form.education}
                        onChange={(e) => setForm({ ...form, education: e.target.value })}
                        placeholder="e.g. BSc Computer Science, University of..."
                        className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 touch-target"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previous_roles" className="text-gray-700">Previous Roles / Companies</Label>
                    <Textarea
                      id="previous_roles"
                      value={form.previous_roles}
                      onChange={(e) => setForm({ ...form, previous_roles: e.target.value })}
                      placeholder="e.g. Senior Developer at Company X (2020-2023), Lead at Company Y..."
                      rows={4}
                      className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl resize-none w-full min-h-[100px] touch-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills_certifications" className="text-gray-700">Skills & Certifications</Label>
                    <Textarea
                      id="skills_certifications"
                      value={form.skills_certifications}
                      onChange={(e) => setForm({ ...form, skills_certifications: e.target.value })}
                      placeholder="e.g. React, Python, AWS, Teaching Certificate..."
                      rows={3}
                      className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl resize-none w-full min-h-[88px] touch-target"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url" className="text-gray-700">LinkedIn URL (optional)</Label>
                      <Input
                        id="linkedin_url"
                        type="url"
                        value={form.linkedin_url}
                        onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 touch-target"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-gray-700">CV / Resume or profile link (optional)</Label>
                      <Select
                        value={cvOption}
                        onValueChange={(v) => setCvOption((v || "") as "" | "upload" | "github" | "other")}
                      >
                        <SelectTrigger className="w-full sm:max-w-[280px] rounded-xl border-gray-200 focus:ring-2 focus:ring-[#2596be]/20 h-11 sm:h-10 min-h-[44px] touch-target">
                          <SelectValue placeholder="Choose: Upload CV, GitHub, or Other link" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upload">Upload CV (PDF/Word)</SelectItem>
                          <SelectItem value="github">GitHub profile link</SelectItem>
                          <SelectItem value="other">Other link (portfolio, Google Drive, etc.)</SelectItem>
                        </SelectContent>
                      </Select>

                      {cvOption === "upload" && (
                        <>
                          <input
                            ref={cvInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleCvUpload}
                            className="hidden"
                            aria-label="Upload CV"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={cvUploading}
                              onClick={() => cvInputRef.current?.click()}
                              className="rounded-lg border-2 border-[#2596be]/40 text-[#2596be] hover:bg-[#2596be]/15 hover:border-[#2596be] gap-2 font-medium"
                            >
                              {cvUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                              {cvUploading ? "Uploading..." : "Upload CV"}
                            </Button>
                            {form.cv_file_name && !["GitHub", "Link"].includes(form.cv_file_name) && (
                              <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-[#f8faf9] border border-[#2596be]/20 rounded-lg px-2.5 py-1.5">
                                <FileText className="h-4 w-4 text-[#2596be]" />
                                {form.cv_file_name}
                                <button
                                  type="button"
                                  onClick={handleRemoveCv}
                                  className="text-gray-500 hover:text-red-600 p-0.5 rounded"
                                  aria-label="Remove CV"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">PDF or Word, max 10MB. Optional.</p>
                        </>
                      )}

                      {cvOption === "github" && (
                        <>
                          <Label htmlFor="cv_github" className="text-gray-600 text-sm">GitHub profile URL</Label>
                          <Input
                            id="cv_github"
                            type="url"
                            value={form.cv_url && form.cv_file_name === "GitHub" ? form.cv_url : ""}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                cv_url: e.target.value.trim(),
                                cv_file_name: e.target.value.trim() ? "GitHub" : "",
                              })
                            }
                            placeholder="https://github.com/username"
                            className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 touch-target"
                          />
                        </>
                      )}

                      {cvOption === "other" && (
                        <>
                          <Select
                            value={form.cv_file_name === "Portfolio" ? "portfolio" : form.cv_file_name === "GoogleDrive" ? "gdrive" : form.cv_file_name === "Link" || form.cv_url ? "other" : ""}
                            onValueChange={(v) =>
                              setForm({
                                ...form,
                                cv_file_name: v === "portfolio" ? "Portfolio" : v === "gdrive" ? "GoogleDrive" : v === "other" ? "Link" : "",
                              })
                            }
                          >
                            <SelectTrigger className="w-full sm:max-w-[200px] rounded-xl border-gray-200 h-11 sm:h-9 text-sm min-h-[44px] touch-target">
                              <SelectValue placeholder="Link type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portfolio">Portfolio</SelectItem>
                              <SelectItem value="gdrive">Google Drive</SelectItem>
                              <SelectItem value="other">Other link</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            id="cv_other"
                            type="url"
                            value={form.cv_url && ["Portfolio", "GoogleDrive", "Link"].includes(form.cv_file_name) ? form.cv_url : ""}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                cv_url: e.target.value.trim(),
                                cv_file_name: form.cv_file_name || (e.target.value.trim() ? "Link" : ""),
                              })
                            }
                            placeholder="https://... or Google Drive link"
                            className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 touch-target"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Teaching */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposed_courses" className="text-gray-700">Proposed Courses</Label>
                    <Textarea
                      id="proposed_courses"
                      value={form.proposed_courses}
                      onChange={(e) => setForm({ ...form, proposed_courses: e.target.value })}
                      placeholder="List courses you want to teach (e.g. Web Development, Python, React)"
                      rows={3}
                      className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl resize-none min-h-[88px] touch-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-700">Short Bio</Label>
                    <Textarea
                      id="bio"
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Your teaching experience and background"
                      rows={2}
                      className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl resize-none min-h-[80px] touch-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years" className="text-gray-700">Years of Teaching Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min={0}
                      value={form.experience_years}
                      onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                      placeholder="e.g. 3"
                      className="border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 rounded-xl h-11 sm:h-10 transition-colors touch-target"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-5 text-sm animate-in fade-in duration-300">
                  <div className="p-5 bg-gradient-to-br from-[#f8faf9] to-[#fcf6f0] rounded-xl border border-[#2596be]/10 shadow-sm">
                    <h4 className="text-[#2596be] font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <span className="text-gray-600">Full Name</span>
                      <span className="font-medium text-[#2596be]">{form.full_name || "—"}</span>
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium text-[#2596be]">{form.email || "—"}</span>
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium text-gray-900">{form.phone || "—"}</span>
                    </div>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-[#fcf6f0] to-[#f8faf9] rounded-xl border border-[#3c62b3]/20 shadow-sm">
                    <h4 className="text-[#2596be] font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Professional
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <span className="text-gray-600">Job experience (years)</span>
                      <span className="font-medium text-gray-900">{form.job_experience_years || "—"}</span>
                      <span className="text-gray-600">Teaching experience (years)</span>
                      <span className="font-medium text-gray-900">{form.experience_years || "—"}</span>
                    </div>
                    {form.education && (
                      <div className="mt-2">
                        <p className="text-gray-600 font-medium mb-0.5">Education</p>
                        <p className="text-gray-900">{form.education}</p>
                      </div>
                    )}
                    {form.previous_roles && (
                      <div className="mt-2">
                        <p className="text-gray-600 font-medium mb-0.5">Previous roles</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{form.previous_roles}</p>
                      </div>
                    )}
                    {form.skills_certifications && (
                      <div className="mt-2">
                        <p className="text-gray-600 font-medium mb-0.5">Skills & certifications</p>
                        <p className="text-gray-900">{form.skills_certifications}</p>
                      </div>
                    )}
                  </div>
                  {(form.proposed_courses || form.bio) && (
                    <div className="p-5 bg-gradient-to-br from-[#f8faf9] to-[#2596be]/5 rounded-xl border border-[#2596be]/10 shadow-sm">
                      <h4 className="text-[#2596be] font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Teaching
                      </h4>
                      {form.proposed_courses && (
                        <div className="mb-3">
                          <p className="text-gray-600 font-medium mb-0.5">Proposed courses</p>
                          <p className="text-gray-900 whitespace-pre-wrap">{form.proposed_courses}</p>
                        </div>
                      )}
                      {form.bio && (
                        <div>
                          <p className="text-gray-600 font-medium mb-0.5">Short bio</p>
                          <p className="text-gray-900">{form.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Desktop: inline buttons; mobile: use sticky CTA bar below */}
              <div className="hidden lg:flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:pt-5">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="w-full sm:w-auto gap-1 h-12 sm:h-10 rounded-xl border-2 border-[#3c62b3]/50 text-[#2596be] hover:bg-[#3c62b3]/15 hover:border-[#3c62b3] transition-all duration-200 touch-target"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div className="hidden sm:block" />
                )}
                <div className="flex-1 hidden sm:block" />
                {step < 4 ? (
                  <Button
                    type="submit"
                    disabled={step === 1 && !canProceedStep1}
                    className="w-full sm:w-auto h-12 sm:h-10 rounded-xl bg-[#2596be] hover:bg-[#014d44] text-white gap-1 shadow-lg shadow-[#2596be]/25 hover:shadow-[#2596be]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 touch-target font-semibold"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="w-full sm:w-auto h-12 sm:h-10 rounded-xl bg-[#2596be] hover:bg-[#014d44] text-white shadow-lg shadow-[#2596be]/25 hover:shadow-[#2596be]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 touch-target font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <nav className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-1 text-center text-sm mt-6 sm:mt-6 px-2 pb-4 lg:pb-0" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <Link href="/instructor/login" className="py-3 px-4 rounded-xl text-[#2596be] hover:bg-[#2596be]/10 font-medium transition-colors touch-target min-h-[44px] flex items-center justify-center">
            Already applied? Log in
          </Link>
          <span className="hidden sm:inline text-gray-400"> · </span>
          <Link href="/" className="py-3 px-4 rounded-xl text-[#3c62b3] hover:bg-[#3c62b3]/10 font-medium transition-colors touch-target min-h-[44px] flex items-center justify-center">
            Back to home
          </Link>
        </nav>
        </div>
      </div>

      {/* Mobile: sticky bottom CTA bar — Back + Next / Submit */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-xl border-t border-[#2596be]/10 shadow-[0_-4px_20px_rgba(37,150,190,0.08)]" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="gap-1.5 h-12 min-h-[48px] flex-1 rounded-xl border-2 border-[#3c62b3]/50 text-[#2596be] hover:bg-[#3c62b3]/15 hover:border-[#3c62b3] transition-all duration-200 touch-target font-semibold"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </Button>
        ) : (
          <div className="flex-1" />
        )}
        {step < 4 ? (
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              if (step === 1 && !canProceedStep1) return
              handleNext()
            }}
            disabled={step === 1 && !canProceedStep1}
            className="flex-[2] h-12 min-h-[48px] rounded-xl bg-[#2596be] hover:bg-[#014d44] text-white gap-1.5 shadow-lg shadow-[#2596be]/25 font-semibold touch-target"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="submit"
            form="instructor-apply-form"
            disabled={loading || !canSubmit}
            className="flex-[2] h-12 min-h-[48px] rounded-xl bg-[#2596be] hover:bg-[#014d44] text-white shadow-lg shadow-[#2596be]/25 font-semibold touch-target"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
