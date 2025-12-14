"use client"

import { useState } from "react"
import { Search, Award, TrendingUp, BookOpen, Trophy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Image from "next/image"

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header with Branding */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative w-16 h-16 bg-white rounded-xl shadow-lg p-2">
              <Image src="/logo.png" alt="Markano Logo" fill className="object-contain p-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Markano Online Learning</h1>
              <p className="text-blue-100 text-sm">Natiijadaada Aad u Eeg</p>
            </div>
          </div>

          {/* Search Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium mb-2 text-blue-100">Geli ID-kaaga (Student ID)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tusaale: 136687"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 h-12 text-lg bg-white !bg-white"
                  />
                </div>
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="h-12 px-8 bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold shadow-lg hover:shadow-xl transition-all mt-6 md:mt-0"
              >
                {loading ? "Raadinta..." : "Raadi Natiijada"}
              </Button>
            </div>
            {error && (
              <p className="mt-4 text-red-200 bg-red-500/20 px-4 py-2 rounded-lg border border-red-300/30">{error}</p>
            )}
          </Card>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="container mx-auto px-4 py-8">
          {/* Student Info Card */}
          <Card className="mb-8 overflow-hidden border-2 border-blue-100 shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{results.student.full_name}</h2>
                  <p className="text-blue-100">Student ID: {results.student.student_id}</p>
                  <p className="text-blue-100">Fasalka: {results.student.class_name}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{results.summary.overall_percentage.toFixed(1)}%</div>
                  <div className="text-sm text-blue-100">Wadarta Guud</div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{results.summary.total_assignments}</div>
                <div className="text-sm text-gray-600">Assignments</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{results.summary.total_marks_obtained}</div>
                <div className="text-sm text-gray-600">Dhibcaha Helay</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{results.summary.total_max_marks}</div>
                <div className="text-sm text-gray-600">Wadarta Guud</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{results.summary.video_awards}</div>
                <div className="text-sm text-gray-600">Video Awards</div>
              </div>
            </div>
          </Card>

          {/* Assignments List */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Dhammaan Assignments-ka</h3>

            {results.assignments.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Wali ma jiraan assignments aad qortay</p>
              </Card>
            ) : (
              results.assignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className={`p-6 border-2 transition-all hover:shadow-lg ${
                    assignment.is_award
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
                      : "bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        {assignment.is_award ? (
                          <Award className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        )}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">{assignment.class_name}</p>
                          {assignment.is_award && (
                            <p className="text-xs text-yellow-700 font-medium mt-1 bg-yellow-100 inline-block px-2 py-1 rounded">
                              🎁 Bonus: {assignment.award_type}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <span>📅 {new Date(assignment.submitted_at).toLocaleDateString("so-SO")}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {assignment.marks_obtained}
                        <span className="text-lg text-gray-500">/{assignment.max_marks}</span>
                      </div>
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                          assignment.percentage,
                        )}`}
                      >
                        {assignment.percentage.toFixed(0)}% - {getGradeLabel(assignment.percentage)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        assignment.percentage >= 80
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : assignment.percentage >= 60
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : assignment.percentage >= 50
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                              : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                      style={{ width: `${assignment.percentage}%` }}
                    />
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Overall Grade Card */}
          <Card className="mt-8 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Heerkaaga Guud</h3>
              <div
                className={`inline-block px-6 py-3 rounded-xl text-xl font-bold border-2 ${getGradeColor(results.summary.overall_percentage)}`}
              >
                {getGradeLabel(results.summary.overall_percentage)}
              </div>
              <p className="text-gray-600 mt-4">
                {results.summary.overall_percentage >= 80
                  ? "🎉 Mahadsanid! Aad ayaad u dadaalay!"
                  : results.summary.overall_percentage >= 60
                    ? "👏 Waa fiican tahay, sii wad dadaalka!"
                    : results.summary.overall_percentage >= 50
                      ? "💪 Waa hagaag, laakiin wax badan ayaa la rabaa!"
                      : "📚 Dadaal dheeraad ah ayaa loo baahan yahay. Waan ku taageernaa!"}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
