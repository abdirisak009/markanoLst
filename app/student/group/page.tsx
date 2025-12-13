"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Users, User, Phone, Calendar, DollarSign, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

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
    <div className="min-h-screen bg-gradient-to-br from-[#253c5d] via-[#2d4768] to-[#355173] p-3 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <div className="text-center space-y-4 sm:space-y-6 pt-4 sm:pt-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <Image
                src="/images/markanologo.png"
                alt="Markano Logo"
                width={150}
                height={150}
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          <div className="space-y-2 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">Eeg Group-kaaga</h1>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
              Geli Student ID-kaaga si aad u aragto group-kaaga iyo xubnaha kale
            </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-[#253c5d] text-xl sm:text-2xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ee2b50]/10 flex items-center justify-center">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#ee2b50]" />
              </div>
              Raadi Group-kaaga
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Geli Student ID-kaaga (tusaale: 135472)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="Geli Student ID..."
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchGroup()}
                  className="h-12 sm:h-14 text-base sm:text-lg px-4 sm:px-5 border-2 border-gray-200 focus:border-[#ee2b50] focus:ring-2 focus:ring-[#ee2b50]/20 rounded-xl shadow-sm transition-all"
                />
              </div>
              <Button
                onClick={searchGroup}
                disabled={loading}
                className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-[#ee2b50] to-[#ff3d60] hover:from-[#d02545] hover:to-[#ee2b50] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Raadis...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    Raadi
                  </span>
                )}
              </Button>
            </div>
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-start gap-2 sm:gap-3 shadow-sm animate-in fade-in duration-300">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
                <span className="font-medium text-sm sm:text-base">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Group Information */}
        {groupInfo && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-none shadow-2xl bg-white overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-[#253c5d] via-[#2d4768] to-[#355173] text-white pb-6 sm:pb-8 relative overflow-hidden px-4 sm:px-6">
                <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-5"></div>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl relative z-10">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  {groupInfo.name}
                </CardTitle>
                <CardDescription className="text-white/90 text-base sm:text-lg font-semibold mt-2 relative z-10">
                  {groupInfo.class_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Student ID
                      </p>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#253c5d] tracking-tight break-all">
                        {currentStudentId}
                      </p>
                    </div>
                    {hasPaid ? (
                      <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-green-400">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-base sm:text-lg">Lacagta waa la bixiyay</p>
                          <p className="text-xs sm:text-sm text-green-100">Mahadsanid!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="relative overflow-hidden px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white rounded-xl sm:rounded-2xl shadow-2xl border-2 border-red-400">
                          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-black/10 rounded-full -ml-8 sm:-ml-12 -mb-8 sm:-mb-12"></div>
                          <div className="relative z-10 space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                              <p className="font-bold text-lg sm:text-xl">Digniin Muhiim!</p>
                            </div>
                            <div className="space-y-1 sm:space-y-2 pl-0 sm:pl-13">
                              <p className="text-base sm:text-lg font-semibold leading-relaxed">
                                Lacagta wali madan bixin:{" "}
                                <span className="text-xl sm:text-2xl font-bold block sm:inline mt-1 sm:mt-0">
                                  ${Number(groupInfo.cost_per_member).toFixed(2)}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {members.find((m) => m.student_id === currentStudentId) && (
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-[#253c5d]/5 via-[#ee2b50]/5 to-[#253c5d]/5 rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-inner">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Magaca
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#253c5d] break-words">
                        {members.find((m) => m.student_id === currentStudentId)?.student_name}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl bg-white overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-[#253c5d] via-[#2d4768] to-[#355173] text-white pb-6 sm:pb-8 relative overflow-hidden px-4 sm:px-6">
                <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-5"></div>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-[#253c5d] text-xl sm:text-2xl">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#253c5d]/10 flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#253c5d]" />
                  </div>
                  Xubnaha Group-ka ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 sm:pt-8 space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
                  <div className="group relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-[#253c5d]/10 via-[#253c5d]/5 to-transparent rounded-xl sm:rounded-2xl border-2 border-[#253c5d]/20 shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#253c5d]/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#253c5d] to-[#2d4768] flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Group Leader
                        </p>
                        <p className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mb-1 break-words">
                          {groupInfo.leader_name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium break-all">
                          ID: {groupInfo.leader_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-[#ee2b50]/10 via-[#ee2b50]/5 to-transparent rounded-xl sm:rounded-2xl border-2 border-[#ee2b50]/20 shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#ee2b50]/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#ee2b50] to-[#ff3d60] flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Project Name
                        </p>
                        <p className="font-bold text-base sm:text-lg md:text-xl text-gray-900 break-words">
                          {groupInfo.project_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-green-100 via-green-50 to-transparent rounded-xl sm:rounded-2xl border-2 border-green-300 shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-green-200/30 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Users className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Xubnaha
                        </p>
                        <p className="font-bold text-xl sm:text-2xl text-gray-900">
                          {members.length}{" "}
                          <span className="text-gray-500 text-lg sm:text-xl">/ {groupInfo.capacity}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-orange-100 via-orange-50 to-transparent rounded-xl sm:rounded-2xl border-2 border-orange-300 shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-orange-200/30 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Qiimaha
                        </p>
                        <p className="font-bold text-xl sm:text-2xl text-gray-900">
                          ${Number(groupInfo.cost_per_member).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl bg-white transform hover:scale-[1.01] transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-[#253c5d]/10 via-[#ee2b50]/5 to-[#253c5d]/10 border-b-2 border-gray-200 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-[#253c5d] text-xl sm:text-2xl">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#253c5d]/10 flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#253c5d]" />
                  </div>
                  Xubnaha Group-ka ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {members.map((member, index) => {
                    const isCurrentStudent = member.student_id === currentStudentId
                    return (
                      <div
                        key={member.id}
                        className={`group p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                          isCurrentStudent
                            ? "bg-gradient-to-r from-[#ee2b50]/10 via-[#ff3d60]/10 to-[#ee2b50]/5 border-[#ee2b50] shadow-xl ring-4 ring-[#ee2b50]/20 scale-[1.02]"
                            : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-[#253c5d] hover:shadow-lg hover:scale-[1.01]"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-5 min-w-0 flex-1">
                            <div
                              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-white text-base sm:text-xl shadow-lg flex-shrink-0 ${
                                isCurrentStudent
                                  ? "bg-gradient-to-br from-[#ee2b50] via-[#ff3d60] to-[#ee2b50]"
                                  : "bg-gradient-to-br from-[#253c5d] via-[#2d4768] to-[#355173]"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-base sm:text-lg md:text-xl text-gray-900 flex flex-wrap items-center gap-2 mb-2 break-words">
                                {member.student_name || "N/A"}
                                {isCurrentStudent && (
                                  <Badge className="bg-gradient-to-r from-[#ee2b50] to-[#ff3d60] text-white border-none shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 font-bold whitespace-nowrap">
                                    Adiga
                                  </Badge>
                                )}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                <span className="font-semibold bg-gray-100 px-2 sm:px-3 py-1 rounded-lg break-all">
                                  ID: {member.student_id}
                                </span>
                                <span className="text-gray-400 hidden sm:inline">•</span>
                                <span className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                                  {member.gender}
                                </span>
                                {member.phone && (
                                  <>
                                    <span className="text-gray-400 hidden sm:inline">•</span>
                                    <span className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-green-50 text-green-700 rounded-lg font-medium break-all">
                                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
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
