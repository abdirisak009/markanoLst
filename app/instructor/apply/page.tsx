"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  GraduationCap,
  Loader2,
  ChevronRight,
  ChevronLeft,
  User,
  Briefcase,
  BookOpen,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

const STEPS = [
  { id: 1, title: "Personal", icon: User },
  { id: 2, title: "Professional", icon: Briefcase },
  { id: 3, title: "Teaching", icon: BookOpen },
  { id: 4, title: "Review", icon: CheckCircle2 },
]

export default function InstructorApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
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

  const canProceedStep1 = form.full_name.trim() && form.email.trim() && form.password.length >= 6
  const canSubmit =
    form.full_name.trim() && form.email.trim() && form.password.length >= 6

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-[#e63946]/10">
            <GraduationCap className="h-8 w-8 text-[#e63946]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Become an Instructor</h1>
            <p className="text-slate-500 text-sm">Apply to teach on Markano</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                  step === s.id
                    ? "bg-[#e63946] text-white"
                    : step > s.id
                      ? "bg-[#e63946]/20 text-[#e63946]"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                <s.icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{s.title}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-0.5 rounded ${step > s.id ? "bg-[#e63946]/40" : "bg-slate-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>{STEPS[step - 1].title}</CardTitle>
            <CardDescription>
              {step === 1 && "Your contact and account details."}
              {step === 2 && "Professional experience and CV-related information."}
              {step === 3 && "Teaching interests and background."}
              {step === 4 && "Review your application before submitting."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }} className="space-y-4">
              {/* Step 1: Personal */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        placeholder="Your full name"
                        required
                        className="border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                        className="border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+252..."
                        className="border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                        className="border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional / CV */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_experience_years">Job Experience (years) *</Label>
                    <Input
                      id="job_experience_years"
                      type="number"
                      min={0}
                      value={form.job_experience_years}
                      onChange={(e) => setForm({ ...form, job_experience_years: e.target.value })}
                      placeholder="e.g. 5"
                      className="border-slate-200"
                    />
                    <p className="text-xs text-slate-500">Total years of professional/work experience</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={form.education}
                      onChange={(e) => setForm({ ...form, education: e.target.value })}
                      placeholder="e.g. BSc Computer Science, University of..."
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previous_roles">Previous Roles / Companies</Label>
                    <Textarea
                      id="previous_roles"
                      value={form.previous_roles}
                      onChange={(e) => setForm({ ...form, previous_roles: e.target.value })}
                      placeholder="e.g. Senior Developer at Company X (2020-2023), Lead at Company Y..."
                      rows={3}
                      className="border-slate-200 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills_certifications">Skills & Certifications</Label>
                    <Textarea
                      id="skills_certifications"
                      value={form.skills_certifications}
                      onChange={(e) => setForm({ ...form, skills_certifications: e.target.value })}
                      placeholder="e.g. React, Python, AWS, Teaching Certificate..."
                      rows={2}
                      className="border-slate-200 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      value={form.linkedin_url}
                      onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cv_url">CV / Resume URL (optional)</Label>
                    <Input
                      id="cv_url"
                      value={form.cv_url}
                      onChange={(e) => setForm({ ...form, cv_url: e.target.value })}
                      placeholder="https://... or Google Drive link"
                      className="border-slate-200"
                    />
                    <p className="text-xs text-slate-500">Upload your CV elsewhere and paste the link, or leave blank.</p>
                  </div>
                </div>
              )}

              {/* Step 3: Teaching */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposed_courses">Proposed Courses</Label>
                    <Textarea
                      id="proposed_courses"
                      value={form.proposed_courses}
                      onChange={(e) => setForm({ ...form, proposed_courses: e.target.value })}
                      placeholder="List courses you want to teach (e.g. Web Development, Python, React)"
                      rows={3}
                      className="border-slate-200 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Short Bio</Label>
                    <Textarea
                      id="bio"
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Your teaching experience and background"
                      rows={2}
                      className="border-slate-200 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Teaching Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min={0}
                      value={form.experience_years}
                      onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                      placeholder="e.g. 3"
                      className="border-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-medium">{form.full_name || "—"}</span>
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium">{form.email || "—"}</span>
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium">{form.phone || "—"}</span>
                    <span className="text-slate-500">Job experience (years)</span>
                    <span className="font-medium">{form.job_experience_years || "—"}</span>
                    <span className="text-slate-500">Teaching experience (years)</span>
                    <span className="font-medium">{form.experience_years || "—"}</span>
                  </div>
                  {form.education && (
                    <div>
                      <p className="text-slate-500 font-medium mb-1">Education</p>
                      <p className="text-slate-800">{form.education}</p>
                    </div>
                  )}
                  {form.previous_roles && (
                    <div>
                      <p className="text-slate-500 font-medium mb-1">Previous roles</p>
                      <p className="text-slate-800 whitespace-pre-wrap">{form.previous_roles}</p>
                    </div>
                  )}
                  {form.skills_certifications && (
                    <div>
                      <p className="text-slate-500 font-medium mb-1">Skills & certifications</p>
                      <p className="text-slate-800">{form.skills_certifications}</p>
                    </div>
                  )}
                  {form.proposed_courses && (
                    <div>
                      <p className="text-slate-500 font-medium mb-1">Proposed courses</p>
                      <p className="text-slate-800 whitespace-pre-wrap">{form.proposed_courses}</p>
                    </div>
                  )}
                  {form.bio && (
                    <div>
                      <p className="text-slate-500 font-medium mb-1">Short bio</p>
                      <p className="text-slate-800">{form.bio}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handleBack} className="gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex-1" />
                {step < 4 ? (
                  <Button
                    type="submit"
                    disabled={step === 1 && !canProceedStep1}
                    className="bg-[#e63946] hover:bg-[#d62839] gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading || !canSubmit} className="bg-[#e63946] hover:bg-[#d62839]">
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

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link href="/instructor/login" className="text-[#e63946] hover:underline">
            Already applied? Log in
          </Link>
          {" · "}
          <Link href="/" className="text-[#e63946] hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
