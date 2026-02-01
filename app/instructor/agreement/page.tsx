"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FileCheck, FileText, Percent, Loader2, ExternalLink, Download } from "lucide-react"
import { toast } from "sonner"
interface AgreementVersion {
  id: number
  version: string
  content_html: string | null
  content_text: string | null
  pdf_url?: string
  pdf_name?: string
  force_reaccept: boolean
}

interface AgreementData {
  revenue_share_percent: number | null
  agreement_accepted_at: string | null
  must_accept: boolean
  accepted: boolean
  use_digital: boolean
  agreement_version: AgreementVersion | null
  agreement_document: {
    id: number
    file_url: string
    file_name: string | null
    created_at: string
  } | null
  accepted_version: { id: number; version: string } | null
}

const DEFAULT_AGREEMENT_HTML = `
<h2>Instructor Agreement</h2>
<p>By accepting this agreement, you agree to the following terms governing your participation as an instructor on this platform.</p>
<h3>1. Revenue Share</h3>
<p>Your revenue share percentage will be set by the platform and communicated to you. Payments are processed according to the payout policy.</p>
<h3>2. Content & Conduct</h3>
<p>You are responsible for the accuracy and quality of your course content. You agree not to publish misleading, infringing, or inappropriate material.</p>
<h3>3. Intellectual Property</h3>
<p>You retain ownership of your original content. You grant the platform a license to host, display, and distribute your content to enrolled students.</p>
<h3>4. Updates</h3>
<p>When the agreement is updated, you may be required to re-accept. You will be notified and must accept before continuing to publish or monetize.</p>
<p><strong>By clicking "Accept & Continue" you confirm that you have read and agree to this Instructor Agreement.</strong></p>
`

export default function InstructorAgreementPage() {
  const [data, setData] = useState<AgreementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAgreement()
  }, [])

  const fetchAgreement = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/instructor/agreement", { credentials: "include" })
      if (res.status === 401) {
        window.location.href = "/instructor/login?redirect=/instructor/agreement"
        return
      }
      if (!res.ok) throw new Error("Failed to load agreement")
      const json = await res.json()
      setData(json)
    } catch {
      toast.error("Failed to load agreement")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const atBottom = scrollHeight - scrollTop - clientHeight < 80
    if (atBottom) setHasScrolledToBottom(true)
  }

  const handleAccept = async () => {
    if (!checkboxChecked) {
      toast.error("Please check the box to confirm you have read and agree.")
      return
    }
    if (!data?.agreement_version && !data?.agreement_document) {
      toast.error("No agreement is available. Contact the administrator.")
      return
    }
    setAccepting(true)
    try {
      const contentSnapshot = data?.agreement_version?.content_text ?? data?.agreement_version?.content_html ?? null
      const res = await fetch("/api/instructor/agreement/accept", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_snapshot: contentSnapshot?.slice(0, 50000) ?? null }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed to accept")
      toast.success("Agreement accepted successfully. Your acceptance has been recorded.")
      fetchAgreement()
      setCheckboxChecked(false)
      setHasScrolledToBottom(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to accept")
    } finally {
      setAccepting(false)
    }
  }

  const showDigital = data?.use_digital && data?.agreement_version
  const contentHtml = data?.agreement_version?.content_html || DEFAULT_AGREEMENT_HTML
  const requireScroll = showDigital && !data?.accepted
  const canAccept = checkboxChecked && (!requireScroll || hasScrolledToBottom)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#2596be]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 rounded-xl bg-[#2596be]/10">
              <FileCheck className="h-5 w-5 text-[#2596be]" />
            </div>
            Instructor Agreement
          </CardTitle>
          <CardDescription>
            Read the agreement below. You must accept to create lessons, publish courses, and receive payouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap gap-4 text-sm">
            {data?.revenue_share_percent != null && (
              <span className="flex items-center gap-1.5 text-slate-700">
                <Percent className="h-4 w-4" />
                Your revenue share: <strong>{data.revenue_share_percent}%</strong>
              </span>
            )}
            {data?.accepted && data?.agreement_accepted_at && (
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <FileCheck className="h-4 w-4" />
                Accepted on {new Date(data.agreement_accepted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                {data?.accepted_version && (
                  <span className="text-slate-500">(Version {data.accepted_version.version})</span>
                )}
              </span>
            )}
            {data?.must_accept && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-medium">
                Acceptance required
              </span>
            )}
          </div>

          {!data?.agreement_version && !data?.agreement_document ? (
            <p className="text-slate-500">
              {data?.revenue_share_percent != null
                ? "No agreement has been set yet. Contact the administrator to upload the agreement; you can accept once it is available."
                : "No agreement has been set for you yet. Please contact the administrator."}
            </p>
          ) : showDigital ? (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Agreement (Version {data.agreement_version.version})</p>
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-700 text-sm leading-relaxed prose prose-slate max-w-none prose-p:my-2 prose-headings:my-3 prose-h2:text-base prose-h3:text-sm"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
                {requireScroll && !hasScrolledToBottom && (
                  <p className="text-xs text-amber-600">Scroll to the bottom of the agreement to continue.</p>
                )}
              </div>

              {(data.agreement_version.pdf_url || data.agreement_document?.file_url) && (
                <div className="flex flex-wrap gap-2">
                  {data.agreement_version.pdf_url && (
                    <a
                      href={data.agreement_version.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#2596be] hover:underline text-sm font-medium"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF (reference copy)
                    </a>
                  )}
                  {data.agreement_document?.file_url && !data.agreement_version.pdf_url && (
                    <a
                      href={data.agreement_document.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#2596be] hover:underline text-sm font-medium"
                    >
                      <FileText className="h-4 w-4" />
                      {data.agreement_document.file_name || "Contract PDF"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {data.must_accept && (
                <>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <Checkbox
                      id="agree"
                      checked={checkboxChecked}
                      onCheckedChange={(v) => setCheckboxChecked(v === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="agree" className="text-sm text-slate-700 cursor-pointer leading-tight">
                      I have read and agree to the Instructor Agreement.
                    </label>
                  </div>
                  <Button
                    onClick={handleAccept}
                    disabled={!canAccept || accepting}
                    className="w-full sm:w-auto bg-[#2596be] hover:bg-[#1e7a9e] font-medium rounded-xl"
                  >
                    {accepting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Accept & Continue
                      </>
                    )}
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Contract document</p>
                <a
                  href={data?.agreement_document?.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#2596be] hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  {data?.agreement_document?.file_name || "Contract PDF"}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {data?.must_accept && (
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Checkbox
                    id="agree-legacy"
                    checked={checkboxChecked}
                    onCheckedChange={(v) => setCheckboxChecked(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="agree-legacy" className="text-sm text-slate-700 cursor-pointer">
                    I have read and agree to the Instructor Agreement (PDF above).
                  </label>
                </div>
              )}
              {data?.must_accept && (
                <Button
                  onClick={handleAccept}
                  disabled={!checkboxChecked || accepting}
                  className="bg-[#2596be] hover:bg-[#1e7a9e] font-medium rounded-xl"
                >
                  {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><FileCheck className="h-4 w-4 mr-2" />Accept & Continue</>}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
