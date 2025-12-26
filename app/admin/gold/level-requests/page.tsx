"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Search, User, Mail, ArrowRight, Layers, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface LevelRequest {
  id: number
  student_id: number
  current_level_id: number
  next_level_id: number
  status: string
  requested_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  student_name: string
  student_email: string
  current_level_name: string
  current_level_order: number
  next_level_name: string
  next_level_order: number
  track_name: string
  track_id: number
}

export default function LevelRequestsPage() {
  return (
    <Suspense fallback={null}>
      <LevelRequestsContent />
    </Suspense>
  )
}

function LevelRequestsContent() {
  const [requests, setRequests] = useState<LevelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedReq, setSelectedReq] = useState<LevelRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/gold/level-requests")
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (req: LevelRequest) => {
    try {
      await fetch("/api/gold/level-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, status: "approved" }),
      })
      toast.success(`${req.student_name} waxaa loo ogolaaday ${req.next_level_name}!`)
      fetchRequests()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleReject = async () => {
    if (!selectedReq) return
    try {
      await fetch("/api/gold/level-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReq.id,
          status: "rejected",
          rejection_reason: rejectionReason,
        }),
      })
      toast.success("Codsiga waa la diiday")
      setRejectDialogOpen(false)
      setSelectedReq(null)
      setRejectionReason("")
      fetchRequests()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const openRejectDialog = (req: LevelRequest) => {
    setSelectedReq(req)
    setRejectDialogOpen(true)
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.track_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = req.status === activeTab
    return matchesSearch && matchesStatus
  })

  const pendingCount = requests.filter((r) => r.status === "pending").length
  const approvedCount = requests.filter((r) => r.status === "approved").length
  const rejectedCount = requests.filter((r) => r.status === "rejected").length

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
            <Layers className="h-7 w-7 text-purple-500" /> Codsiyada Level-yada
          </h1>
          <p className="text-gray-600">Ansixii ama diid codsiyada ardayda ee level-yada cusub</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Sugaya</p>
              <p className="text-2xl font-bold text-purple-700">{pendingCount}</p>
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
          ) : filteredRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Ma jiraan codsyo {activeTab === "pending" ? "sugaya" : ""}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{req.student_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {req.student_email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-blue-100 text-blue-700 text-xs">{req.track_name}</Badge>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                                Level {req.current_level_order}: {req.current_level_name}
                              </span>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <span className="px-2 py-0.5 bg-purple-100 rounded text-purple-700">
                                Level {req.next_level_order}: {req.next_level_name}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 mt-2 block">{formatDate(req.requested_at)}</span>
                          {req.status === "rejected" && req.rejection_reason && (
                            <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-600 flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span>{req.rejection_reason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(req)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Ansixii
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() => openRejectDialog(req)}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Diid
                          </Button>
                        </div>
                      )}

                      {req.status === "approved" && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" /> La Ansixiyay
                        </Badge>
                      )}

                      {req.status === "rejected" && (
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
              Ma hubtaa inaad diideyso codsiga <strong>{selectedReq?.student_name}</strong> ee{" "}
              <strong>{selectedReq?.next_level_name}</strong>?
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
