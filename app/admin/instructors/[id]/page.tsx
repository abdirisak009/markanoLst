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
  GraduationCap,
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
  Upload,
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
  const [agreementFile, setAgreementFile] = useState<File | null>(null)
  const [revenueSharePercent, setRevenueSharePercent] = useState<string>("")
  const [uploadingAgreement, setUploadingAgreement] = useState(false)

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

  const agreementDoc = instructor?.documents?.find((d) => d.document_type === "agreement")

  const handleUploadAgreement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreementFile) {
      toast.error("Select a contract PDF")
      return
    }
    if (agreementFile.type !== "application/pdf") {
      toast.error("Only PDF files are allowed")
      return
    }
    const percent = revenueSharePercent.trim() ? parseFloat(revenueSharePercent) : null
    if (percent != null && (Number.isNaN(percent) || percent < 0 || percent > 100)) {
      toast.error("Revenue share must be between 0 and 100")
      return
    }
    setUploadingAgreement(true)
    try {
      const form = new FormData()
      form.append("file", agreementFile)
      if (percent != null) form.append("revenue_share_percent", String(percent))
      const res = await fetch(`/api/admin/instructors/${id}/agreement`, {
        method: "POST",
        credentials: "include",
        body: form,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to upload")
      toast.success("Contract uploaded and revenue share updated.")
      setAgreementFile(null)
      setRevenueSharePercent("")
      fetchInstructor()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to upload agreement")
    } finally {
      setUploadingAgreement(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#e63946]" />
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Instructor not found</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/admin/instructors">Back to Instructors</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6 gap-2 text-gray-600" asChild>
              <Link href="/admin/instructors">
                <ArrowLeft className="h-4 w-4" />
                Back to Instructors
              </Link>
            </Button>

            <Card className="border border-gray-200 shadow-sm mb-6">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[#e63946]/10">
                      <UserCheck className="h-8 w-8 text-[#e63946]" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{instructor.full_name}</CardTitle>
                      <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                        <Mail className="h-4 w-4" />
                        {instructor.email}
                      </p>
                      {instructor.phone && (
                        <p className="text-gray-500 flex items-center gap-1.5 mt-0.5">
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
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }
                    >
                      {instructor.status}
                    </Badge>
                    {instructor.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={() => handleSuspend(false)}
                        disabled={processing}
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suspend"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleSuspend(true)}
                        disabled={processing}
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unsuspend"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {instructor.university_name && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    {instructor.university_name}
                  </p>
                )}
                {instructor.bio && (
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Bio</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{instructor.bio}</p>
                  </div>
                )}
                <p className="text-gray-400 text-sm">
                  Joined {new Date(instructor.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#e63946]" />
                  Courses ({instructor.courses?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instructor.courses?.length ? (
                  <ul className="space-y-2">
                    {instructor.courses.map((c) => (
                      <li key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <Link
                            href={`/admin/learning-courses/${c.id}`}
                            className="font-medium text-[#e63946] hover:underline"
                          >
                            {c.title}
                          </Link>
                          <span className="text-gray-500 text-sm ml-2">/{c.slug}</span>
                        </div>
                        <Badge variant={c.is_active ? "default" : "secondary"} className={c.is_active ? "bg-green-50 text-green-700" : ""}>
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No courses yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-[#e63946]" />
                  Contract / Agreement
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Upload contract PDF and set revenue share %. Instructor must accept the agreement in their portal.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  {instructor.revenue_share_percent != null && (
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <Percent className="h-4 w-4" />
                      Revenue share: <strong>{instructor.revenue_share_percent}%</strong>
                    </span>
                  )}
                  {instructor.agreement_accepted_at ? (
                    <span className="flex items-center gap-1.5 text-green-700">
                      <FileCheck className="h-4 w-4" />
                      Accepted {new Date(instructor.agreement_accepted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </span>
                  ) : (
                    <span className="text-amber-600">Not yet accepted by instructor</span>
                  )}
                </div>
                {agreementDoc && (
                  <p>
                    <a
                      href={agreementDoc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e63946] hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {agreementDoc.file_name || "Contract PDF"}
                    </a>
                  </p>
                )}
                <form onSubmit={handleUploadAgreement} className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">Contract PDF</Label>
                      <Input
                        type="file"
                        accept="application/pdf"
                        className="mt-1"
                        onChange={(e) => setAgreementFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Revenue share % (0–100)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        placeholder="e.g. 40"
                        value={revenueSharePercent}
                        onChange={(e) => setRevenueSharePercent(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={!agreementFile || uploadingAgreement}
                    className="bg-[#e63946] hover:bg-[#d62839]"
                  >
                    {uploadingAgreement ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                    Upload contract
                  </Button>
                </form>
              </CardContent>
            </Card>

            {instructor.documents?.length ? (
              <Card className="border border-gray-200 shadow-sm mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#e63946]" />
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
                          className="text-[#e63946] hover:underline flex items-center gap-2"
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
