"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Users, User, Phone, Calendar, DollarSign, CheckCircle, XCircle } from "lucide-react"
import { MarkanoLogo } from "@/components/markano-logo"

interface GroupMember {
  id: number
  student_id: string
  student_name: string
  gender: string
  phone: string
  added_at: string
}

interface GroupInfo {
  id: number
  name: string
  class_name: string
  university_name: string
  leader_name: string
  leader_id: string
  project_name: string
  capacity: number
  cost_per_member: number
  is_paid: boolean
  joined_at: string
}

export default function StudentGroupPage() {
  const [studentId, setStudentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [currentStudentId, setCurrentStudentId] = useState("")
  const [hasPaid, setHasPaid] = useState(false)

  const searchGroup = async () => {
    if (!studentId.trim()) {
      setError("Fadlan geli Student ID-kaaga")
      return
    }

    setLoading(true)
    setError("")
    setGroupInfo(null)
    setMembers([])

    try {
      const res = await fetch("/api/students/group-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch group info")
      }

      const data = await res.json()
      setGroupInfo(data.group)
      setMembers(data.members)
      setCurrentStudentId(data.currentStudent)
      setHasPaid(data.hasPaid)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ma helin group-ka")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A6FA5] via-[#5A7FB5] to-[#6A8FC5] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <MarkanoLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-white">Eeg Group-kaaga</h1>
          <p className="text-white/90">Geli Student ID-kaaga si aad u aragto group-kaaga iyo xubnaha kale</p>
        </div>

        {/* Search Box */}
        <Card className="border-2 border-white/30 shadow-lg bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#4A6FA5]">
              <Search className="w-5 h-5" />
              Raadi Group-kaaga
            </CardTitle>
            <CardDescription>Geli Student ID-kaaga (tusaale: 135472)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Geli Student ID..."
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchGroup()}
                className="text-lg"
              />
              <Button onClick={searchGroup} disabled={loading} className="bg-[#FF6B6B] hover:bg-[#E55555] px-8">
                {loading ? "Raadis..." : "Raadi"}
              </Button>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Group Information */}
        {groupInfo && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Current Student Card - Highlighted */}
            <Card className="border-4 border-[#FF6B6B] shadow-xl bg-white">
              <CardHeader className="bg-[#FF6B6B] text-white">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Macluumaadkaaga
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="text-2xl font-bold text-gray-900">{currentStudentId}</p>
                    </div>
                    <Badge className={hasPaid ? "bg-green-600" : "bg-red-600"} variant="default">
                      {hasPaid ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Unpaid
                        </span>
                      )}
                    </Badge>
                  </div>
                  {members[0] && (
                    <div>
                      <p className="text-sm text-gray-600">Magaca</p>
                      <p className="text-xl font-semibold text-gray-900">{members[0].student_name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Group Details */}
            <Card className="border-2 border-white/30 shadow-lg bg-white/95">
              <CardHeader className="bg-[#4A6FA5] text-white">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  {groupInfo.name}
                </CardTitle>
                <CardDescription className="text-white/90">{groupInfo.class_name}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-[#4A6FA5]/10 rounded-lg border border-[#4A6FA5]/20">
                    <User className="w-5 h-5 text-[#4A6FA5]" />
                    <div>
                      <p className="text-sm text-gray-600">Group Leader</p>
                      <p className="font-semibold text-gray-900">{groupInfo.leader_name}</p>
                      <p className="text-sm text-gray-500">ID: {groupInfo.leader_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#FF6B6B]/10 rounded-lg border border-[#FF6B6B]/20">
                    <Calendar className="w-5 h-5 text-[#FF6B6B]" />
                    <div>
                      <p className="text-sm text-gray-600">Project Name</p>
                      <p className="font-semibold text-gray-900">{groupInfo.project_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Xubnaha</p>
                      <p className="font-semibold text-gray-900">
                        {members.length} / {groupInfo.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Qiimaha</p>
                      <p className="font-semibold text-gray-900">${groupInfo.cost_per_member.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card className="border-2 border-white/30 shadow-lg bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#4A6FA5]">
                  <Users className="w-6 h-6" />
                  Xubnaha Group-ka ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member, index) => {
                    const isCurrentStudent = member.student_id === currentStudentId
                    return (
                      <div
                        key={member.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCurrentStudent
                            ? "bg-[#FF6B6B]/10 border-[#FF6B6B] shadow-md"
                            : "bg-white border-gray-200 hover:border-[#4A6FA5]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                isCurrentStudent ? "bg-[#FF6B6B]" : "bg-[#4A6FA5]"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 flex items-center gap-2">
                                {member.student_name || "N/A"}
                                {isCurrentStudent && (
                                  <Badge variant="outline" className="bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]">
                                    Adiga
                                  </Badge>
                                )}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>ID: {member.student_id}</span>
                                <span>•</span>
                                <span>{member.gender}</span>
                                {member.phone && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {member.phone}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
