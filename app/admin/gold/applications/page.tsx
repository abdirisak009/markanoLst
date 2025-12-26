"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User,
  Mail,
  Building2,
  BookOpen,
  FileText,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

interface Application {
  id: number
  student_id: number
  track_id: number
  status: string
  applied_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  student_name: string
  student_email: string
  university: string
  track_name: string
  track_color: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/gold/applications")
      const data = await res.json()
      setApplications(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (app: Application) => {
    try {
      await fetch("/api/gold/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id, status: "approved" }),
      })
      toast.success(`${app.student_name} waa la ansixiyay!`)
      fetchApplications()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleReject = async () => {
    if (!selectedApp) return
    try {
      await fetch("/api/gold/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedApp.id,
          status: "rejected",
          rejection_reason: rejectionReason,
        }),
      })
      toast.success("Codsiga waa la diiday")
      setRejectDialogOpen(false)
      setSelectedApp(null)
      setRejectionReason("")
      fetchApplications()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const openRejectDialog = (app: Application) => {
    setSelectedApp(app)
    setRejectDialogOpen(true)
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.track_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = app.status === activeTab
    return matchesSearch && matchesStatus
  })

  const pendingCount = applications.filter((a) => a.status === "pending").length
  const approvedCount = applications.filter((a) => a.status === "approved").length
  const rejectedCount = applications.filter((a) => a.status === "rejected").length

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("so-SO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-7 w-7 text-amber-500" /> Codsiyada Track-yada
          </h1>
          <p className="text-gray-600">Ansixii ama diid codsiyada ardayda ee Gold tracks-ka</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600">Sugaya</p>
              <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">La Ansixiyay</p>
              <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">La Diiday</p>
              <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Raadi magaca ama email-ka..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Sugaya ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> La Ansixiyay ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" /> La Diiday ({rejectedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : filteredApplications.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Ma jiraan codsyo {activeTab === "pending" ? "sugaya" : ""}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.student_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {app.student_email}
                            </span>
                            {app.university && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {app.university}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              style={{ backgroundColor: app.track_color + "20", color: app.track_color }}
                              className="text-xs"
                            >
                              <BookOpen className="h-3 w-3 mr-1" /> {app.track_name}
                            </Badge>
                            <span className="text-xs text-gray-400">• {formatDate(app.applied_at)}</span>
                          </div>
                          {app.status === "rejected" && app.rejection_reason && (
                            <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-600 flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span>{app.rejection_reason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {app.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(app)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Ansixii
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() => openRejectDialog(app)}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Diid
                          </Button>
                        </div>
                      )}

                      {app.status === "approved" && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" /> La Ansixiyay
                        </Badge>
                      )}

                      {app.status === "rejected" && (
                        <Badge className="bg-red-100 text-red-700">
                          <XCircle className="h-3 w-3 mr-1" /> La Diiday
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" /> Diid Codsiga
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Ma hubtaa inaad diideyso codsiga <strong>{selectedApp?.student_name}</strong> ee{" "}
              <strong>{selectedApp?.track_name}</strong>?
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700">Sababta Diidmada (ikhtiyaari)</label>
              <Textarea
                className="mt-1"
                placeholder="Qor sababta aad u diideyso..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Ka Noqo
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleReject}>
              Diid Codsiga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
