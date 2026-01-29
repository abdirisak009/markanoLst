"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileCheck, FileText, Percent, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface AgreementData {
  revenue_share_percent: number | null
  agreement_accepted_at: string | null
  agreement_document: {
    id: number
    file_url: string
    file_name: string | null
    created_at: string
  } | null
}

export default function InstructorAgreementPage() {
  const [data, setData] = useState<AgreementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

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

  const handleAccept = async () => {
    if (!confirm("Do you accept the contract terms? This will be recorded.")) return
    setAccepting(true)
    try {
      const res = await fetch("/api/instructor/agreement/accept", {
        method: "POST",
        credentials: "include",
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed to accept")
      toast.success("Contract accepted successfully.")
      fetchAgreement()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to accept")
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#e63946]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-[#e63946]" />
            Contract / Agreement
          </CardTitle>
          <CardDescription>
            View your contract document and revenue share. You must accept the agreement to confirm terms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!data?.agreement_document ? (
            <p className="text-gray-500">
              No contract has been set for you yet. Please contact the administrator to upload your agreement.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 text-sm">
                {data.revenue_share_percent != null && (
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <Percent className="h-4 w-4" />
                    Your revenue share: <strong>{data.revenue_share_percent}%</strong>
                  </span>
                )}
                {data.agreement_accepted_at ? (
                  <span className="flex items-center gap-1.5 text-green-700">
                    <FileCheck className="h-4 w-4" />
                    Accepted on {new Date(data.agreement_accepted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </span>
                ) : (
                  <span className="text-amber-600">Not yet accepted</span>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Contract document</p>
                <a
                  href={data.agreement_document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#e63946] hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  {data.agreement_document.file_name || "Contract PDF"}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {!data.agreement_accepted_at && (
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="bg-[#e63946] hover:bg-[#d62839]"
                >
                  {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4 mr-2" />}
                  I accept the contract
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
