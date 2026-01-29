"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  RefreshCw,
  FileText,
  Mail,
  Phone,
  Calendar,
  Loader2,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"

interface Application {
  id: number
  full_name: string
  email: string
  phone: string | null
  cv_url: string | null
  cv_file_name: string | null
  proposed_courses: string | null
  bio: string | null
  experience_years: number | null
  status: string
  rejection_reason: string | null
  changes_requested_message: string | null
  reviewed_at: string | null
  created_at: string
  documents?: Array<{ id: number; document_type: string; file_url: string; file_name: string | null }>
}

export default function InstructorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filtered, setFiltered] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "changes_requested">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selected, setSelected] = useState<Application | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [requestChangesMessage, setRequestChangesMessage] = useState("")
  const [requestChangesOpen, setRequestChangesOpen] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [filter])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(applications)
      return
    }
    const q = searchQuery.toLowerCase()
    setFiltered(
      applications.filter(
        (a) =>
          a.full_name?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.phone?.toLowerCase().includes(q) ||
          a.proposed_courses?.toLowerCase().includes(q)
      )
    )
  }, [searchQuery, applications])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const url =
        filter === "all"
          ? "/api/admin/instructor-applications"
          : `/api/admin/instructor-applications?status=${filter}`
      const res = await fetch(url, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setApplications(Array.isArray(data) ? data : [])
      setFiltered(Array.isArray(data) ? data : [])
    } catch (e) {
      toast.error("Failed to load applications")
      setApplications([])
      setFiltered([])
    } finally {
      setLoading(false)
    }
  }

  const openDetail = async (app: Application) => {
    setSelected(app)
    setDetailOpen(true)
    setRejectReason(app.rejection_reason || "")
    setRequestChangesMessage(app.changes_requested_message || "")
    try {
      const res = await fetch(`/api/admin/instructor-applications/${app.id}`, { credentials: "include" })
      if (res.ok) {
        const full = await res.json()
        setSelected({ ...app, ...full })
      }
    } catch {
      // keep selected as list item
    }
  }

  const handleApprove = async (applicationId: number) => {
    setProcessing(applicationId)
    try {
      const res = await fetch(`/api/admin/instructors/${applicationId}/approve`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to approve")
      toast.success("Application approved. Instructor can now log in.")
      fetchApplications()
      setDetailOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to approve")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (applicationId: number) => {
    const reason = rejectReason.trim() || "No reason provided."
    setProcessing(applicationId)
    try {
      const res = await fetch(`/api/admin/instructors/${applicationId}/reject`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejection_reason: reason }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to reject")
      toast.success("Application rejected.")
      fetchApplications()
      setDetailOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to reject")
    } finally {
      setProcessing(null)
    }
  }

  const handleRequestChanges = async (applicationId: number) => {
    const message = requestChangesMessage.trim() || "Please update your application."
    setProcessing(applicationId)
    try {
      const res = await fetch(`/api/admin/instructor-applications/${applicationId}/request-changes`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to request changes")
      toast.success("Changes requested.")
      fetchApplications()
      setRequestChangesOpen(false)
      setDetailOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to request changes")
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case "changes_requested":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            <MessageSquare className="h-3 w-3 mr-1" />
            Changes Requested
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const pending = applications.filter((a) => a.status === "pending")
  const approved = applications.filter((a) => a.status === "approved")
  const rejected = applications.filter((a) => a.status === "rejected")
  const changesRequested = applications.filter((a) => a.status === "changes_requested")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e63946] mx-auto mb-4" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-[#e63946] to-[#d62839] rounded-lg shadow-md">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  Instructor Applications
                </h1>
                <p className="text-gray-600 mt-1">Review and approve teacher applications</p>
              </div>
              <Button variant="outline" onClick={fetchApplications} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-gray-500 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-amber-600 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-green-600 text-sm font-medium">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approved.length}</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-red-600 text-sm font-medium">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{rejected.length}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-200 shadow-sm mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(
                      [
                        ["all", "All", applications.length],
                        ["pending", "Pending", pending.length],
                        ["approved", "Approved", approved.length],
                        ["rejected", "Rejected", rejected.length],
                        ["changes_requested", "Changes requested", changesRequested.length],
                      ] as const
                    ).map(([value, label, count]) => (
                      <Button
                        key={value}
                        variant={filter === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(value)}
                        className={filter === value ? "bg-[#e63946] hover:bg-[#d62839]" : ""}
                      >
                        {label} ({count})
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {filtered.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No applications found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchQuery ? "Try a different search" : "No instructor applications match the filter"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-[#013565] to-[#024a8c] hover:bg-none">
                        <TableHead className="text-white font-medium">ID</TableHead>
                        <TableHead className="text-white font-medium">Name</TableHead>
                        <TableHead className="text-white font-medium">Email</TableHead>
                        <TableHead className="text-white font-medium">Status</TableHead>
                        <TableHead className="text-white font-medium">Date</TableHead>
                        <TableHead className="text-white font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((app) => (
                        <TableRow key={app.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">#{app.id}</TableCell>
                          <TableCell>{app.full_name}</TableCell>
                          <TableCell className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {app.email}
                          </TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>
                            <span className="text-gray-600 text-sm">
                              {new Date(app.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetail(app)}
                              className="text-[#e63946] hover:bg-red-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-[#e63946]" />
                  Application #{selected.id}
                </DialogTitle>
                <DialogDescription>Instructor application details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 font-medium">Full name</p>
                    <p className="text-gray-900">{selected.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Email</p>
                    <p className="text-gray-900">{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Phone</p>
                    <p className="text-gray-900">{selected.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Experience (years)</p>
                    <p className="text-gray-900">{selected.experience_years ?? "—"}</p>
                  </div>
                </div>
                {selected.bio && (
                  <div>
                    <p className="text-gray-500 font-medium">Bio</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{selected.bio}</p>
                  </div>
                )}
                {selected.proposed_courses && (
                  <div>
                    <p className="text-gray-500 font-medium">Proposed courses</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{selected.proposed_courses}</p>
                  </div>
                )}
                {(selected.cv_url || (selected.documents && selected.documents.length > 0)) && (
                  <div>
                    <p className="text-gray-500 font-medium mb-2">CV / Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.cv_url && (
                        <a
                          href={selected.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#e63946] hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {selected.cv_file_name || "CV"}
                        </a>
                      )}
                      {selected.documents?.map((d) => (
                        <a
                          key={d.id}
                          href={d.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#e63946] hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {d.file_name || d.document_type}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {selected.rejection_reason && (
                  <div>
                    <p className="text-gray-500 font-medium">Rejection reason</p>
                    <p className="text-red-700">{selected.rejection_reason}</p>
                  </div>
                )}
                {selected.changes_requested_message && (
                  <div>
                    <p className="text-gray-500 font-medium">Changes requested</p>
                    <p className="text-blue-700">{selected.changes_requested_message}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {(selected.status === "pending" || selected.status === "changes_requested") && (
                  <>
                    <Button
                      onClick={() => handleApprove(selected.id)}
                      disabled={processing === selected.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processing === selected.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setRequestChangesOpen(true)}
                      disabled={processing === selected.id}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request changes
                    </Button>
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                      <Input
                        placeholder="Rejection reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 min-w-[180px]"
                      />
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selected.id)}
                        disabled={processing === selected.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Request changes modal */}
      <Dialog open={requestChangesOpen} onOpenChange={setRequestChangesOpen}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Request changes</DialogTitle>
                <DialogDescription>Message will be visible to the applicant.</DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Describe what the applicant should update..."
                value={requestChangesMessage}
                onChange={(e) => setRequestChangesMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestChangesOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRequestChanges(selected.id)}
                  disabled={processing === selected.id}
                  className="bg-[#e63946] hover:bg-[#d62839]"
                >
                  {processing === selected.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
