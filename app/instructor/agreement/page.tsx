"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FileCheck, FileText, Percent, Loader2, ExternalLink, Download, Globe } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Lang = "en" | "so" | "ar"

interface AgreementVersion {
  id: number
  version: string
  content_html: string | null
  content_text: string | null
  content_html_so?: string | null
  content_html_ar?: string | null
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

const LANG_OPTIONS: { id: Lang; label: string; dir?: "ltr" | "rtl" }[] = [
  { id: "en", label: "English" },
  { id: "so", label: "Somali" },
  { id: "ar", label: "العربية", dir: "rtl" },
]

const DEFAULT_EN = `
<h2 class="text-xl font-semibold text-slate-900 mt-4 first:mt-0">Instructor Agreement</h2>
<p class="text-slate-600 mt-2">By accepting this agreement, you agree to the following terms governing your participation as an instructor on this platform.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">1. Revenue Share</h3>
<p class="text-slate-600 mt-1">Your revenue share percentage will be set by the platform and communicated to you. Payments are processed according to the payout policy.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">2. Content & Conduct</h3>
<p class="text-slate-600 mt-1">You are responsible for the accuracy and quality of your course content. You agree not to publish misleading, infringing, or inappropriate material.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">3. Intellectual Property</h3>
<p class="text-slate-600 mt-1">You retain ownership of your original content. You grant the platform a non-exclusive, worldwide license to host, display, and distribute your content to enrolled students.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">4. Updates</h3>
<p class="text-slate-600 mt-1">When the agreement is updated, you may be required to re-accept. You will be notified and must accept before continuing to publish or monetize.</p>
<p class="text-slate-700 font-medium mt-4"><strong>By clicking "Accept & Continue" you confirm that you have read and agree to this Instructor Agreement.</strong></p>
`

const DEFAULT_SO = `
<h2 class="text-xl font-semibold text-slate-900 mt-4 first:mt-0">Heerka Macalinka (Instructor Agreement)</h2>
<p class="text-slate-600 mt-2">Markaad ansixiso heerkan, waxaad ogolaatay shuruudaha soo socda ee ku aadan ka-qaybgalkaaga macalinka platform-kan.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">1. Qaybta Dakhliga (Revenue Share)</h3>
<p class="text-slate-600 mt-1">Boqolkiiba dakhligaaga platform-ku wuu gooni uga dhigi doonaa wuxuuna kugu soo gudbin doonaa. Lacag bixinta waxaa loo fulinayaa sida siyaabadda bixinta.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">2. Nuxurka & Dabeecada</h3>
<p class="text-slate-600 mt-1">Waad mas'uul ka tahay saxnaanta iyo tayada nuxurka koorsaskaaga. Waxaad ogolaatay inaadan daabicin wax been ah, xad gudub ah, ama aan habboonayn.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">3. Hantida Maskaxda</h3>
<p class="text-slate-600 mt-1">Waxaad hayso milkiyadda nuxurkaaga asaliga ah. Waxaad platform-ka siisaa ogolaansho adag oo caalami ah inuu kuu hoydiyo, tusiyo oo ardayda diiwaangeliyay u qaybiyo nuxurkaaga.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">4. Cusboonaysiinta</h3>
<p class="text-slate-600 mt-1">Marka heerka la cusboonaysiiyo, waxaa laga yaabaa in laguu qasdo inaad mar kale ansixiso. Waxaa laguu ogeysiin doonaa, waxaana laguu qasdii doonaa inaad ansixiso ka hor intaadan sii daabicin ama lacag ku sameyn.</p>
<p class="text-slate-700 font-medium mt-4"><strong>Markaad taabato "Ansixi & Sii wad" waxaad xaqiijinaysaa inaad akhriyay oo aad ogolaatay Heerka Macalinka.</strong></p>
`

const DEFAULT_AR = `
<h2 class="text-xl font-semibold text-slate-900 mt-4 first:mt-0">اتفاقية المدرب</h2>
<p class="text-slate-600 mt-2">بقبولك لهذه الاتفاقية، فإنك توافق على الشروط التالية التي تحكم مشاركتك كمدرب على هذه المنصة.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">١. حصة الإيرادات</h3>
<p class="text-slate-600 mt-1">سيتم تحديد نسبة حصتك من الإيرادات من قبل المنصة وإبلاغك بها. تتم معالجة المدفوعات وفقاً لسياسة الدفع.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">٢. المحتوى والسلوك</h3>
<p class="text-slate-600 mt-1">أنت مسؤول عن دقة وجودة محتوى دورتك. توافق على عدم نشر مواد مضللة أو منتهكة أو غير مناسبة.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">٣. الملكية الفكرية</h3>
<p class="text-slate-600 mt-1">تحتفظ بملكية محتواك الأصلي. تمنح المنصة ترخيصاً غير حصري عالمياً لاستضافة وعرض وتوزيع محتواك على الطلاب المسجلين.</p>
<h3 class="text-base font-semibold text-slate-800 mt-4">٤. التحديثات</h3>
<p class="text-slate-600 mt-1">عند تحديث الاتفاقية، قد يُطلب منك إعادة القبول. سيتم إخطارك ويجب عليك القبول قبل المتابعة في النشر أو تحقيق الدخل.</p>
<p class="text-slate-700 font-medium mt-4"><strong>بالنقر على "قبول ومتابعة" فإنك تؤكد أنك قرأت ووافقت على اتفاقية المدرب هذه.</strong></p>
`

const COPY: Record<Lang, { title: string; readBelow: string; version: string; scrollHint: string; checkbox: string; acceptBtn: string }> = {
  en: {
    title: "Instructor Agreement",
    readBelow: "Read the agreement below. You must accept to create lessons, publish courses, and receive payouts.",
    version: "Version",
    scrollHint: "Scroll to the bottom of the agreement to continue.",
    checkbox: "I have read and agree to the Instructor Agreement.",
    acceptBtn: "Accept & Continue",
  },
  so: {
    title: "Heerka Macalinka",
    readBelow: "Akhri heerka hoose. Waa inaad ansixiso si aad u abuurto casharrada, daabacdo koorsaska, oo aad hesho lacag bixinta.",
    version: "Nooca",
    scrollHint: "Daaqac ilaa hoose heerka si aad u sii wadato.",
    checkbox: "Waan akhriyay oo waxaan ogolaaday Heerka Macalinka.",
    acceptBtn: "Ansixi & Sii wad",
  },
  ar: {
    title: "اتفاقية المدرب",
    readBelow: "اقرأ الاتفاقية أدناه. يجب عليك القبول لإنشاء الدروس ونشر الدورات واستلام المدفوعات.",
    version: "الإصدار",
    scrollHint: "مرر إلى أسفل الاتفاقية للمتابعة.",
    checkbox: "لقد قرأت ووافقت على اتفاقية المدرب.",
    acceptBtn: "قبول ومتابعة",
  },
}

export default function InstructorAgreementPage() {
  const [data, setData] = useState<AgreementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [lang, setLang] = useState<Lang>("en")
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
  const contentEn = data?.agreement_version?.content_html || DEFAULT_EN
  const contentSo = data?.agreement_version?.content_html_so || DEFAULT_SO
  const contentAr = data?.agreement_version?.content_html_ar || DEFAULT_AR
  const contentByLang = lang === "en" ? contentEn : lang === "so" ? contentSo : contentAr
  const requireScroll = showDigital && !data?.accepted
  const canAccept = checkboxChecked && (!requireScroll || hasScrolledToBottom)
  const t = COPY[lang]
  const isRtl = LANG_OPTIONS.find((l) => l.id === lang)?.dir === "rtl"
  const versionLabel = data?.agreement_version?.version ? `-v${data.agreement_version.version}` : ""

  const downloadAgreement = (language: Lang) => {
    const content = language === "en" ? contentEn : language === "so" ? contentSo : contentAr
    const fullHtml = `<!DOCTYPE html><html lang="${language}"><head><meta charset="utf-8"/><title>Instructor Agreement - ${language === "en" ? "English" : language === "so" ? "Somali" : "Arabic"}</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;color:#334155;line-height:1.6}h2{font-size:1.25rem;margin-top:1.5rem}h3{font-size:1rem;margin-top:1rem}p{margin:0.5rem 0}</style></head><body>${content}</body></html>`
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Instructor-Agreement${versionLabel}-${language === "en" ? "EN" : language === "so" ? "SO" : "AR"}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(language === "en" ? "Downloaded (English)." : language === "so" ? "La soo dejiyay (Somali)." : "تم التحميل (العربية).")
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#2596be]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-br from-[#2596be]/10 via-white to-[#3c62b3]/5 border-b border-slate-100 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-slate-900 text-2xl">
                <div className="p-3 rounded-2xl bg-[#2596be]/15 border border-[#2596be]/25 shadow-sm">
                  <FileCheck className="h-7 w-7 text-[#2596be]" />
                </div>
                {t.title}
              </CardTitle>
              <CardDescription className="mt-2 text-slate-600 max-w-xl">
                {t.readBelow}
              </CardDescription>
            </div>
            {data?.revenue_share_percent != null && (
              <div className="shrink-0 rounded-2xl bg-[#2596be]/10 border border-[#2596be]/20 px-4 py-2.5 flex items-center gap-2">
                <Percent className="h-5 w-5 text-[#2596be]" />
                <span className="font-bold text-[#2596be]">{data.revenue_share_percent}%</span>
                <span className="text-slate-600 text-sm">revenue share</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {data?.accepted && data?.agreement_accepted_at && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1.5 text-sm font-medium">
                <FileCheck className="h-4 w-4" />
                Accepted {new Date(data.agreement_accepted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                {data?.accepted_version && (
                  <span className="text-emerald-600">({t.version} {data.accepted_version.version})</span>
                )}
              </span>
            )}
            {data?.must_accept && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-3 py-1.5 text-sm font-medium">
                Acceptance required
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {!data?.agreement_version && !data?.agreement_document ? (
            <p className="text-slate-500">
              {data?.revenue_share_percent != null
                ? "No agreement has been set yet. Contact the administrator to upload the agreement; you can accept once it is available."
                : "No agreement has been set for you yet. Please contact the administrator."}
            </p>
          ) : showDigital ? (
            <>
              {/* Language switcher */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#2596be]" />
                  Language / Luqad / اللغة
                </p>
                <div className="flex flex-wrap gap-2">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLang(opt.id)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl font-medium text-sm transition-all border",
                        lang === opt.id
                          ? "bg-[#2596be] text-white border-[#2596be] shadow-md shadow-[#2596be]/25"
                          : "bg-white text-slate-600 border-slate-200 hover:border-[#2596be]/40 hover:bg-[#2596be]/5"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agreement content */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">
                  {t.title} ({t.version} {data.agreement_version.version})
                </p>
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  dir={isRtl ? "rtl" : "ltr"}
                  className={cn(
                    "max-h-[380px] overflow-y-auto rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-6 text-slate-700 leading-relaxed",
                    isRtl && "text-right"
                  )}
                >
                  <div
                    className={cn(
                      "prose prose-slate max-w-none",
                      "prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-lg prose-h2:font-semibold prose-h2:text-slate-900",
                      "prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-base prose-h3:font-semibold prose-h3:text-slate-800",
                      "prose-p:my-3 prose-p:leading-relaxed prose-p:text-slate-600",
                      "prose-strong:font-semibold prose-strong:text-slate-700",
                      isRtl && "prose-body:text-right"
                    )}
                    dangerouslySetInnerHTML={{ __html: contentByLang }}
                  />
                </div>
                {requireScroll && !hasScrolledToBottom && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">{t.scrollHint}</p>
                )}
              </div>

              {/* Download agreement by language (English, Somali, Arabic) */}
              <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Download className="h-4 w-4 text-[#2596be]" />
                  Download agreement / Soo deji heerka / تحميل الاتفاقية
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#2596be]/40 text-[#2596be] hover:bg-[#2596be]/10"
                    onClick={() => downloadAgreement("en")}
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    By English
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#2596be]/40 text-[#2596be] hover:bg-[#2596be]/10"
                    onClick={() => downloadAgreement("so")}
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    By Somali
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#2596be]/40 text-[#2596be] hover:bg-[#2596be]/10"
                    onClick={() => downloadAgreement("ar")}
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    By Arabic / العربية
                  </Button>
                </div>
              </div>

              {/* Download PDF (reference) */}
              {(data.agreement_version.pdf_url || data.agreement_document?.file_url) && (
                <div className="flex flex-wrap gap-3">
                  {data.agreement_version.pdf_url && (
                    <a
                      href={data.agreement_version.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#2596be] hover:underline font-medium text-sm"
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
                      className="inline-flex items-center gap-2 text-[#2596be] hover:underline font-medium text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      {data.agreement_document.file_name || "Contract PDF"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {data.must_accept && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
                    <Checkbox
                      id="agree"
                      checked={checkboxChecked}
                      onCheckedChange={(v) => setCheckboxChecked(v === true)}
                      className="mt-0.5 rounded border-2 border-slate-300 data-[state=checked]:bg-[#2596be] data-[state=checked]:border-[#2596be]"
                    />
                    <label htmlFor="agree" className={cn("text-sm text-slate-700 cursor-pointer leading-tight flex-1", isRtl && "text-right")}>
                      {t.checkbox}
                    </label>
                  </div>
                  <Button
                    onClick={handleAccept}
                    disabled={!canAccept || accepting}
                    className="w-full sm:w-auto min-w-[200px] bg-[#2596be] hover:bg-[#1e7a9e] font-semibold rounded-xl py-6 text-base shadow-lg shadow-[#2596be]/25"
                  >
                    {accepting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <FileCheck className="h-5 w-5 mr-2" />
                        {t.acceptBtn}
                      </>
                    )}
                  </Button>
                </div>
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
                <>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                  <Button
                    onClick={handleAccept}
                    disabled={!checkboxChecked || accepting}
                    className="bg-[#2596be] hover:bg-[#1e7a9e] font-medium rounded-xl"
                  >
                    {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><FileCheck className="h-4 w-4 mr-2" />Accept & Continue</>}
                  </Button>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
