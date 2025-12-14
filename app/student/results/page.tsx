"use client"

import { useState } from "react"
import { Search, Award, TrendingUp, BookOpen, Trophy, CheckCircle2, Calendar, GraduationCap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Assignment {
  id: number
  title: string
  class_name: string
  max_marks: number
  marks_obtained: number
  percentage: number
  submitted_at: string
  is_award?: boolean
  award_type?: string
}

interface StudentResults {
  student: {
    id: number
    full_name: string
    student_id: string
    class_name: string
  }
  assignments: Assignment[]
  summary: {
    total_assignments: number
    total_marks_obtained: number
    total_max_marks: number
    overall_percentage: number
    video_awards: number
  }
}

export default function StudentResultsPage() {
  const [studentId, setStudentId] = useState("")
  const [results, setResults] = useState<StudentResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!studentId.trim()) {
      setError("Fadlan geli ID-kaaga")
      return
    }

    setLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch(`/api/student-results?studentId=${studentId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError("Arday lama helin ID-gan. Fadlan hubi ID-kaaga")
        } else {
          setError("Wax khalad ah ayaa dhacay. Fadlan isku day mar kale")
        }
        return
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError("Wax khalad ah ayaa dhacay. Fadlan hubi internetkaaga")
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (percentage >= 60) return "text-blue-600 bg-blue-50 border-blue-200"
    if (percentage >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 80) return "A - Aad u Fiican"
    if (percentage >= 60) return "B - Fiican"
    if (percentage >= 50) return "C - Dhexdhexaad"
    return "D - Liita"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8f] to-[#1e4a6f] text-white shadow-2xl overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ef4444] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-white/30">
                <img src="/logo.png" alt="Markano Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                  Markano Online Learning
                </h1>
                <p className="text-blue-100 text-lg font-medium">Natiijadaada Professional ah</p>
              </div>
            </div>
          </div>

          <Card className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl border-white/30 shadow-2xl">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#ef4444] rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Eeg Natiijadaada</h2>
                  <p className="text-blue-100">Geli Student ID-kaaga si aad u aragto dhamaan marks-kaaga</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-blue-100">Student ID</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ef4444] to-[#dc2626] rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Tusaale: 136687"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-14 pr-6 h-16 text-lg bg-white text-gray-900 border-0 shadow-xl rounded-xl focus:ring-2 focus:ring-[#ef4444] font-medium"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] text-white text-lg font-bold shadow-2xl hover:shadow-[#ef4444]/50 transition-all hover:scale-[1.02] rounded-xl"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Raadinta...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Raadi Natiijada
                    </span>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-6 bg-red-500/20 backdrop-blur-sm border-2 border-red-300/50 px-6 py-4 rounded-xl">
                  <p className="text-red-100 font-medium text-center">{error}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full">
            <path
              d="M0 0L60 8.3C120 16.7 240 33.3 360 41.7C480 50 600 50 720 45C840 40 960 30 1080 28.3C1200 26.7 1320 33.3 1380 36.7L1440 40V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V0Z"
              fill="rgb(248 250 252)"
            />
          </svg>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="container mx-auto px-4 py-12">
          <Card className="mb-10 overflow-hidden border-0 shadow-2xl">
            <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white p-8">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-xl">
                      <GraduationCap className="w-9 h-9 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-2">{results.student.full_name}</h2>
                      <div className="flex flex-wrap gap-4 text-blue-100">
                        <span className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          ID: {results.student.student_id}
                        </span>
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Fasalka: {results.student.class_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center border-2 border-white/30 shadow-2xl">
                    <div className="text-5xl font-bold mb-1">{results.summary.overall_percentage.toFixed(1)}%</div>
                    <div className="text-sm font-medium text-blue-100">Wadarta Guud</div>
                    <div className="mt-2 px-4 py-1 bg-white/20 rounded-full text-xs font-bold">
                      {getGradeLabel(results.summary.overall_percentage).split(" - ")[0]}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="group hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow mb-3">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{results.summary.total_assignments}</div>
                  <div className="text-sm text-gray-600 font-medium">Assignments</div>
                </div>
              </div>

              <div className="group hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow mb-3">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{results.summary.total_marks_obtained}</div>
                  <div className="text-sm text-gray-600 font-medium">Dhibcaha Helay</div>
                </div>
              </div>

              <div className="group hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow mb-3">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{results.summary.total_max_marks}</div>
                  <div className="text-sm text-gray-600 font-medium">Wadarta Guud</div>
                </div>
              </div>

              <div className="group hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow mb-3">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{results.summary.video_awards}</div>
                  <div className="text-sm text-gray-600 font-medium">Video Awards</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Assignments List */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Dhammaan Assignments-ka</h3>
            </div>

            {results.assignments.length === 0 ? (
              <Card className="p-16 text-center shadow-lg border-2 border-gray-100">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-xl font-medium">Wali ma jiraan assignments aad qortay</p>
              </Card>
            ) : (
              results.assignments.map((assignment, index) => (
                <Card
                  key={assignment.id}
                  className={`p-8 border-2 transition-all hover:shadow-2xl hover:scale-[1.01] ${
                    assignment.is_award
                      ? "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-yellow-300 shadow-lg shadow-yellow-100"
                      : "bg-white hover:border-blue-300 shadow-lg"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex-1 w-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                            assignment.is_award
                              ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                              : "bg-gradient-to-br from-blue-500 to-indigo-600"
                          }`}
                        >
                          {assignment.is_award ? (
                            <Award className="w-7 h-7 text-white" />
                          ) : (
                            <BookOpen className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 font-medium mb-2">{assignment.class_name}</p>
                          {assignment.is_award && (
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                              <Trophy className="w-3.5 h-3.5" />
                              Bonus: {assignment.award_type}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(assignment.submitted_at).toLocaleDateString("so-SO")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-full transition-all rounded-full shadow-sm ${
                            assignment.percentage >= 80
                              ? "bg-gradient-to-r from-green-400 via-green-500 to-emerald-600"
                              : assignment.percentage >= 60
                                ? "bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600"
                                : assignment.percentage >= 50
                                  ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500"
                                  : "bg-gradient-to-r from-red-400 via-red-500 to-rose-600"
                          }`}
                          style={{ width: `${assignment.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-center md:text-right">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        {assignment.marks_obtained}
                        <span className="text-2xl text-gray-500 font-semibold">/{assignment.max_marks}</span>
                      </div>
                      <div
                        className={`inline-block px-5 py-2.5 rounded-xl text-base font-bold border-2 shadow-md ${getGradeColor(
                          assignment.percentage,
                        )}`}
                      >
                        {assignment.percentage.toFixed(0)}%
                      </div>
                      <div className="mt-2 text-sm font-semibold text-gray-700">
                        {getGradeLabel(assignment.percentage)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <Card className="mt-10 overflow-hidden border-0 shadow-2xl">
            <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-12">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
              </div>

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 border-4 border-white/40 shadow-2xl">
                  <Award className="w-14 h-14 text-white" />
                </div>
                <h3 className="text-4xl font-bold mb-4">Heerkaaga Guud</h3>
                <div
                  className={`inline-block px-10 py-5 rounded-2xl text-3xl font-bold border-4 shadow-2xl mb-6 ${
                    results.summary.overall_percentage >= 80
                      ? "bg-green-500 border-green-300 text-white"
                      : results.summary.overall_percentage >= 60
                        ? "bg-blue-500 border-blue-300 text-white"
                        : results.summary.overall_percentage >= 50
                          ? "bg-yellow-500 border-yellow-300 text-white"
                          : "bg-red-500 border-red-300 text-white"
                  }`}
                >
                  {getGradeLabel(results.summary.overall_percentage)}
                </div>
                <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
                  {results.summary.overall_percentage >= 80
                    ? "🎉 Mahadsanid! Aad ayaad u dadaalay! Waxaad ka mid tahay ardayda ugu fiican!"
                    : results.summary.overall_percentage >= 60
                      ? "👏 Waa fiican tahay, sii wad dadaalka! Waxaad ku socotaa jid fiican!"
                      : results.summary.overall_percentage >= 50
                        ? "💪 Waa hagaag, laakiin wax badan ayaa la rabaa! Sii dadaal!"
                        : "📚 Dadaal dheeraad ah ayaa loo baahan yahay. Waan ku taageernaa! Ma quusanid!"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <footer className="mt-20 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <img src="/images/white-logo.png" alt="Markano" className="h-10" />
          </div>
          <p className="text-gray-400 text-lg">&copy; 2025 Markano Online Learning. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">Empowering learners worldwide</p>
        </div>
      </footer>
    </div>
  )
}
