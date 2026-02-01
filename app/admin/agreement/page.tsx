"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminSidebar } from "@/components/admin-sidebar"
import { FileText, Loader2, CheckCircle, Download, Save, Plus } from "lucide-react"
import { toast } from "sonner"

interface Version {
  id: number
  version: string
  content_html: string | null
  content_text: string | null
  content_html_so?: string | null
  content_html_ar?: string | null
  pdf_url: string | null
  pdf_name: string | null
  is_active: boolean
  force_reaccept: boolean
  created_at: string
  updated_at: string
}

interface Acceptance {
  id: number
  instructor_id: number
  instructor_name: string
  instructor_email: string
  agreement_version_id: number
  version_string: string
  source: string
  accepted_at_utc: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export default function AdminAgreementPage() {
  const [versions, setVersions] = useState<Version[]>([])
  const [acceptances, setAcceptances] = useState<Acceptance[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"versions" | "acceptances">("versions")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLang, setEditLang] = useState<"en" | "so" | "ar">("en")
  const [editHtml, setEditHtml] = useState("")
  const [editHtmlSo, setEditHtmlSo] = useState("")
  const [editHtmlAr, setEditHtmlAr] = useState("")
  const [editForceReaccept, setEditForceReaccept] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchVersions()
  }, [])

  useEffect(() => {
    if (activeTab === "acceptances") fetchAcceptances()
  }, [activeTab])

  const fetchVersions = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/agreement-versions", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setVersions(json)
    } catch {
      toast.error("Failed to load versions")
      setVersions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAcceptances = async () => {
    try {
      const res = await fetch("/api/admin/agreement-acceptances?limit=200", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setAcceptances(json)
    } catch {
      toast.error("Failed to load acceptances")
      setAcceptances([])
    }
  }

  const startEdit = (v: Version) => {
    setEditingId(v.id)
    setEditHtml(v.content_html || "")
    setEditHtmlSo(v.content_html_so ?? "")
    setEditHtmlAr(v.content_html_ar ?? "")
    setEditForceReaccept(v.force_reaccept)
    setEditLang("en")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditHtml("")
    setEditHtmlSo("")
    setEditHtmlAr("")
  }

  const saveVersion = async () => {
    if (editingId == null) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/agreement-versions/${editingId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_html: editHtml,
          content_html_so: editHtmlSo || null,
          content_html_ar: editHtmlAr || null,
          force_reaccept: editForceReaccept,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed to save")
      toast.success("Version updated.")
      setEditingId(null)
      fetchVersions()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const setActive = async (id: number) => {
    try {
      await Promise.all(
        versions.map((v) =>
          fetch(`/api/admin/agreement-versions/${v.id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: v.id === id }),
          })
        )
      )
      toast.success("Active version updated.")
      fetchVersions()
    } catch {
      toast.error("Failed to set active version")
    }
  }

  const exportCsv = () => {
    window.open("/api/admin/agreement-acceptances?export=csv", "_blank")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#2596be]" />
              Agreement Management
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Digital agreement versions and acceptance logs. Edit content, set active version, force re-acceptance.
            </p>

            <div className="flex gap-2 mt-4">
              <Button
                variant={activeTab === "versions" ? "default" : "outline"}
                size="sm"
                className={activeTab === "versions" ? "bg-[#2596be] hover:bg-[#1e7a9e]" : ""}
                onClick={() => setActiveTab("versions")}
              >
                Versions
              </Button>
              <Button
                variant={activeTab === "acceptances" ? "default" : "outline"}
                size="sm"
                className={activeTab === "acceptances" ? "bg-[#2596be] hover:bg-[#1e7a9e]" : ""}
                onClick={() => setActiveTab("acceptances")}
              >
                Acceptance logs
              </Button>
            </div>

            {activeTab === "versions" && (
              <Card className="mt-6 border border-slate-200 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Agreement versions</CardTitle>
                  <CardDescription>One version is active. Instructors must accept the active version. Edit the agreement content by English, by Arabic, and by Somali using the language tabs below. Use &quot;Force re-accept&quot; to require all instructors to re-accept.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[#2596be]" />
                    </div>
                  ) : versions.length === 0 ? (
                    <p className="text-slate-500 py-6">No versions yet. Run migration script 068-instructor-agreement-digital.sql to seed v1.0.</p>
                  ) : (
                    <div className="space-y-4">
                      {versions.map((v) => (
                        <div
                          key={v.id}
                          className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900">Version {v.version}</span>
                            {v.is_active && (
                              <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5">Active</span>
                            )}
                            {v.force_reaccept && (
                              <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5">Force re-accept</span>
                            )}
                            <span className="text-slate-500 text-sm">{new Date(v.updated_at).toLocaleDateString()}</span>
                            <div className="ml-auto flex gap-2">
                              {!v.is_active && (
                                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setActive(v.id)}>
                                  Set active
                                </Button>
                              )}
                              {editingId === v.id ? (
                                <>
                                  <Button size="sm" className="bg-[#2596be] rounded-lg" disabled={saving} onClick={saveVersion}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" className="rounded-lg" onClick={cancelEdit}>
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => startEdit(v)}>
                                  Edit
                                </Button>
                              )}
                            </div>
                          </div>
                          {editingId === v.id && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                              <div className="flex gap-2 border-b border-slate-100 pb-2">
                                {(["en", "so", "ar"] as const).map((l) => (
                                  <button
                                    key={l}
                                    type="button"
                                    onClick={() => setEditLang(l)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                      editLang === l ? "bg-[#2596be] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                  >
                                    {l === "en" ? "By English" : l === "so" ? "By Somali" : "By Arabic / بالعربية"}
                                  </button>
                                ))}
                              </div>
                              <div>
                                <Label>{editLang === "en" ? "Agreement content — By English (HTML)" : editLang === "so" ? "Agreement content — By Somali (HTML)" : "Agreement content — By Arabic (HTML)"}</Label>
                                <Textarea
                                  value={editLang === "en" ? editHtml : editLang === "so" ? editHtmlSo : editHtmlAr}
                                  onChange={(e) => (editLang === "en" ? setEditHtml(e.target.value) : editLang === "so" ? setEditHtmlSo(e.target.value) : setEditHtmlAr(e.target.value))}
                                  className="min-h-[200px] font-mono text-sm rounded-xl border-slate-200 mt-1"
                                  placeholder={editLang === "en" ? "<h2>Instructor Agreement</h2>..." : editLang === "so" ? "<h2>Heerka Macalinka</h2>..." : "<h2>اتفاقية المدرب</h2>..."}
                                />
                              </div>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editForceReaccept}
                                  onChange={(e) => setEditForceReaccept(e.target.checked)}
                                />
                                <span className="text-sm text-slate-700">Force all instructors to re-accept this version</span>
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "acceptances" && (
              <Card className="mt-6 border border-slate-200 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Acceptance logs</CardTitle>
                    <CardDescription>Audit trail of instructor agreement acceptances (digital only).</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={exportCsv}>
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {acceptances.length === 0 ? (
                    <p className="text-slate-500 py-6">No acceptance records yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-left text-slate-600">
                            <th className="py-2 pr-4">Instructor</th>
                            <th className="py-2 pr-4">Version</th>
                            <th className="py-2 pr-4">Accepted (UTC)</th>
                            <th className="py-2">IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {acceptances.map((a) => (
                            <tr key={a.id} className="border-b border-slate-100">
                              <td className="py-3 pr-4">
                                <p className="font-medium text-slate-900">{a.instructor_name}</p>
                                <p className="text-xs text-slate-500">{a.instructor_email}</p>
                              </td>
                              <td className="py-3 pr-4">{a.version_string}</td>
                              <td className="py-3 pr-4">{new Date(a.accepted_at_utc).toLocaleString("en-US", { timeZone: "UTC" })}</td>
                              <td className="py-3 text-slate-500">{a.ip_address || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
