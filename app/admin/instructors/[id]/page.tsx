"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  BookOpen,
  FileText,
  Loader2,
  UserCheck,
  AlertTriangle,
  FileCheck,
  Percent,
  Save,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

interface InstructorDetail {
  id: number
  application_id: number | null
  full_name: string
  email: string
  phone: string | null
  profile_image_url: string | null
  bio: string | null
  status: string
  created_at: string
  updated_at: string
  revenue_share_percent: number | null
  agreement_accepted_at: string | null
  minimum_payout_amount: number | null
  university_name: string | null
  university_id: number | null
  courses: Array<{ id: number; title: string; slug: string; is_active: boolean; created_at: string }>
  documents: Array<{ id: number; document_type: string; file_url: string; file_name: string | null; created_at: string }>
  application: { id: number; status: string; created_at: string } | null
}

export default function AdminInstructorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [revenueSharePercent, setRevenueSharePercent] = useState<string>("")
  const [minimumPayoutAmount, setMinimumPayoutAmount] = useState<string>("")
  const [savingRevenueShare, setSavingRevenueShare] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchInstructor()
  }, [id])

  const fetchInstructor = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/instructors/${id}`, { credentials: "include" })
      if (res.status === 404) {
        setInstructor(null)
        return
      }
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setInstructor(data)
    } catch {
      toast.error("Failed to load instructor")
      setInstructor(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (unsuspend: boolean) => {
    if (!confirm(unsuspend ? "Unsuspend this instructor?" : "Suspend this instructor? They will not be able to log in."))
      return
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/instructors/${id}/suspend`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unsuspend }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to update")
      toast.success(unsuspend ? "Instructor unsuspended." : "Instructor suspended.")
      fetchInstructor()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update")
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    if (instructor?.revenue_share_percent != null) {
      setRevenueSharePercent(String(instructor.revenue_share_percent))
    } else {
      setRevenueSharePercent("")
    }
  }, [instructor?.revenue_share_percent])

  useEffect(() => {
    if (instructor?.minimum_payout_amount != null) {
      setMinimumPayoutAmount(String(instructor.minimum_payout_amount))
    } else {
      setMinimumPayoutAmount("")
    }
  }, [instructor?.minimum_payout_amount])

  const handleSaveRevenueShare = async (e: React.FormEvent) => {
    e.preventDefault()
    const percent = revenueSharePercent.trim() ? parseFloat(revenueSharePercent) : null
    if (percent != null && (Number.isNaN(percent) || percent < 0 || percent > 100)) {
      toast.error("Revenue share must be between 0 and 100")
      return
    }
    const minPayout = minimumPayoutAmount.trim() ? parseFloat(minimumPayoutAmount) : null
    if (minPayout != null && (Number.isNaN(minPayout) || minPayout < 0)) {
      toast.error("Minimum payout amount must be 0 or greater")
      return
    }
    setSavingRevenueShare(true)
    try {
      const res = await fetch(`/api/admin/instructors/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revenue_share_percent: percent, minimum_payout_amount: minPayout }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to save")
      toast.success("Revenue share and minimum payout updated.")
      fetchInstructor()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSavingRevenueShare(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#2596be]" />
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Instructor not found</p>
          <Button variant="outline" className="mt-4 rounded-xl" asChild>
            <Link href="/admin/instructors">Back to Instructors</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6 gap-2 text-slate-600 hover:text-[#2596be]" asChild>
              <Link href="/admin/instructors">
                <ArrowLeft className="h-4 w-4" />
                Back to Instructors
              </Link>
            </Button>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden mb-6 bg-white">
              <CardHeader className="pb-4 bg-gradient-to-br from-white to-slate-50/50 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-[#2596be]/10 border border-[#2596be]/20">
                      <UserCheck className="h-8 w-8 text-[#2596be]" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-slate-900">{instructor.full_name}</CardTitle>
                      <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                        <Mail className="h-4 w-4" />
                        {instructor.email}
                      </p>
                      {instructor.phone && (
                        <p className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-4 w-4" />
                          {instructor.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        instructor.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full"
                          : "bg-amber-50 text-amber-700 border-amber-200 rounded-full"
                      }
                    >
                      {instructor.status}
                    </Badge>
                    {instructor.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl"
                        onClick={() => handleSuspend(false)}
                        disabled={processing}
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suspend"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                        onClick={() => handleSuspend(true)}
                        disabled={processing}
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unsuspend"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                {instructor.university_name && (
                  <p className="text-slate-600 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#2596be]" />
                    {instructor.university_name}
                  </p>
                )}
                {instructor.bio && (
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Bio</p>
                    <p className="text-slate-700 whitespace-pre-wrap">{instructor.bio}</p>
                  </div>
                )}
                <p className="text-slate-400 text-sm">
                  Joined {new Date(instructor.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden mb-6 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <div className="p-2 rounded-xl bg-[#2596be]/10">
                    <BookOpen className="h-5 w-5 text-[#2596be]" />
                  </div>
                  Courses ({instructor.courses?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instructor.courses?.length ? (
                  <ul className="space-y-2">
                    {instructor.courses.map((c) => (
                      <li key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div>
                          <Link
                            href={`/admin/learning-courses/${c.id}`}
                            className="font-medium text-[#2596be] hover:underline"
                          >
                            {c.title}
                          </Link>
                          <span className="text-slate-500 text-sm ml-2">/{c.slug}</span>
                        </div>
                        <Badge variant={c.is_active ? "default" : "secondary"} className={c.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full" : "rounded-full"}>
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No courses yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden mb-6 bg-white border-l-4 border-l-[#2596be]">
              <CardHeader className="bg-gradient-to-br from-[#2596be]/5 to-white border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <div className="p-2 rounded-xl bg-[#2596be]/10 border border-[#2596be]/20">
                    <Percent className="h-5 w-5 text-[#2596be]" />
                  </div>
                  Revenue share & agreement
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Set the percentage you agreed with this instructor. The platform uses a digital agreement; instructors accept it in their portal.
                </p>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {instructor.revenue_share_percent != null && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#2596be]/10 text-[#2596be] font-semibold px-3 py-1.5">
                      <Percent className="h-4 w-4" />
                      Current: {instructor.revenue_share_percent}%
                    </span>
                  )}
                  {instructor.agreement_accepted_at ? (
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <FileCheck className="h-4 w-4" />
                      Agreement accepted {new Date(instructor.agreement_accepted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-medium">
                      Not yet accepted by instructor
                    </span>
                  )}
                </div>
                <form onSubmit={handleSaveRevenueShare} className="flex flex-col gap-5">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[140px] max-w-xs">
                      <Label className="text-slate-700 font-medium">Revenue share % (0–100)</Label>
                      <p className="text-xs text-slate-500 mt-0.5 mb-1">Percentage you agreed with this instructor</p>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        placeholder="e.g. 40"
                        value={revenueSharePercent}
                        onChange={(e) => setRevenueSharePercent(e.target.value)}
                        className="mt-0 rounded-xl border-slate-200 focus:border-[#2596be] focus:ring-[#2596be]/20"
                      />
                    </div>
                    <div className="flex-1 min-w-[140px] max-w-xs">
                      <Label className="text-slate-700 font-medium">Minimum payout amount ($)</Label>
                      <p className="text-xs text-slate-500 mt-0.5 mb-1">Instructor cannot request a payout less than this amount. Leave empty for no minimum.</p>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="e.g. 50"
                        value={minimumPayoutAmount}
                        onChange={(e) => setMinimumPayoutAmount(e.target.value)}
                        className="mt-0 rounded-xl border-slate-200 focus:border-[#2596be] focus:ring-[#2596be]/20"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={savingRevenueShare}
                      className="rounded-xl bg-[#2596be] hover:bg-[#1e7a9e] font-medium"
                    >
                      {savingRevenueShare ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" />Save</>}
                    </Button>
                  </div>
                </form>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  To edit the digital agreement text or manage versions, go to{" "}
                  <Link href="/admin/agreement" className="text-[#2596be] hover:underline font-medium inline-flex items-center gap-1">
                    Agreement Management <ExternalLink className="h-3 w-3" />
                  </Link>
                </p>
              </CardContent>
            </Card>

            {instructor.documents?.length ? (
              <Card className="border-0 shadow-sm rounded-2xl overflow-hidden mb-6 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <FileText className="h-5 w-5 text-[#2596be]" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {instructor.documents.map((d) => (
                      <li key={d.id}>
                        <a
                          href={d.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2596be] hover:underline flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          {d.file_name || d.document_type}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
