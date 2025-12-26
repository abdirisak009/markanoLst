"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

interface LevelRequest {
  id: number
  student_id: number
  current_level_id: number
  next_level_id: number
  status: string
  requested_at: string
  reviewed_at: string
  rejection_reason: string
  student_name: string
  student_email: string
  current_level_name: string
  next_level_name: string
  track_name: string
}

export default function LevelRequestsPage() {
  const [requests, setRequests] = useState<LevelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedRequest, setSelectedRequest] = useState<LevelRequest | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/gold/level-requests?status=${activeTab === "all" ? "" : activeTab}`)
      const data = await res.json()
      setRequests(data)
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request: LevelRequest) => {
    setProcessing(true)
    try {
      await fetch("/api/gold/level-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          status: "approved",
          reviewed_by: 1, // TODO: Get actual admin ID
        }),
      })
      toast.success(`${request.student_name} waa loo oggolaaday ${request.next_level_name}`)
      fetchRequests()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    setProcessing(true)
    try {
      await fetch("/api/gold/level-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: "rejected",
          reviewed_by: 1,
          rejection_reason: rejectionReason,
        }),
      })
      toast.success("Codsiga waa la diiday")
      setShowRejectDialog(false)
      setSelectedRequest(null)
      setRejectionReason("")
      fetchRequests()
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    } finally {
      setProcessing(false)
    }
  }

  const openRejectDialog = (request: LevelRequest) => {
    setSelectedRequest(request)
    setShowRejectDialog(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("so-SO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "N/A"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-400">
            <Clock className="h-3 w-3 mr-1" /> Sugaya
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" /> La oggolaaday
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-400">
            <XCircle className="h-3 w-3 mr-1" /> La diiday
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/gold">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Codsiyada Level-ka
                {pendingCount > 0 && <Badge className="bg-amber-500 text-white">{pendingCount} cusub</Badge>}
              </h1>
              <p className="text-slate-400">Oggolaaw ama diid codsiyada ardayda ee u gudbida level-ka xiga</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-600">
              <Clock className="h-4 w-4 mr-2" /> Sugaya
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-green-600">
              <CheckCircle className="h-4 w-4 mr-2" /> La oggolaaday
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600">
              <XCircle className="h-4 w-4 mr-2" /> La diiday
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">
              Dhammaan
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">Loading...</p>
                </CardContent>
              </Card>
            ) : requests.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Wali ma jiro codsiyada {activeTab !== "all" ? activeTab : ""}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card
                    key={request.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-500/20 rounded-xl">
                            <User className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{request.student_name}</h3>
                            <p className="text-sm text-slate-400">{request.student_email}</p>

                            <div className="flex items-center gap-2 mt-3 text-sm">
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {request.track_name}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 mt-3 p-3 bg-slate-900/50 rounded-lg">
                              <div className="text-center">
                                <p className="text-xs text-slate-500">Hadda</p>
                                <p className="text-sm font-medium text-white">{request.current_level_name}</p>
                              </div>
                              <ArrowRight className="h-5 w-5 text-amber-400" />
                              <div className="text-center">
                                <p className="text-xs text-slate-500">Cusub</p>
                                <p className="text-sm font-medium text-green-400">{request.next_level_name}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {formatDate(request.requested_at)}
                              </span>
                              {request.rejection_reason && (
                                <span className="flex items-center gap-1 text-red-400">
                                  <MessageSquare className="h-3 w-3" /> {request.rejection_reason}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          {getStatusBadge(request.status)}

                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(request)}
                                disabled={processing}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Oggolaaw
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectDialog(request)}
                                disabled={processing}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Diid
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" /> Diid Codsiga
              </DialogTitle>
              <DialogDescription className="text-slate-400">Qor sababta aad u diideyso codsigan</DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-slate-900 rounded-lg">
                  <p className="text-white font-medium">{selectedRequest.student_name}</p>
                  <p className="text-sm text-slate-400">
                    {selectedRequest.current_level_name} → {selectedRequest.next_level_name}
                  </p>
                </div>

                <div>
                  <Label className="text-slate-300">Sababta Diidmada</Label>
                  <Textarea
                    className="bg-slate-900 border-slate-600 text-white mt-2"
                    placeholder="Tusaale: Wali ma dhamaysan casharka ugu muhiimsan..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 bg-transparent"
                    onClick={() => setShowRejectDialog(false)}
                  >
                    Ka Noqo
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleReject}
                    disabled={processing || !rejectionReason.trim()}
                  >
                    Diid Codsiga
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
