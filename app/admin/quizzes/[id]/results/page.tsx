"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  HelpCircle,
} from "lucide-react"
import { toast } from "sonner"

interface QuizStats {
  total_attempts: number
  completed_attempts: number
  passed_count: number
  failed_count: number
  pass_rate: number
  average_score: number
  average_time: number
  highest_score: number
  lowest_score: number
}

interface Attempt {
  id: number
  student_id: string
  student_name: string | null
  student_phone: string | null
  student_type: string
  score: number
  total_points: number
  percentage: number
  passed: boolean
  time_spent: number
  submitted_at: string
  status: string
}

interface QuestionStat {
  id: number
  question_text: string
  question_type: string
  points: number
  total_answers: number
  correct_count: number
  success_rate: number
}

export default function QuizResultsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const [quizId, setQuizId] = useState<string | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState<any>(null)
  const [stats, setStats] = useState<QuizStats | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([])

  useEffect(() => {
    const resolveParams = async () => {
      if (params && typeof (params as any).then === "function") {
        const resolved = await (params as Promise<{ id: string }>)
        setQuizId(resolved.id)
      } else {
        setQuizId((params as { id: string }).id)
      }
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (quizId) {
      fetchResults()
    }
  }, [quizId])

  const fetchResults = async () => {
    if (!quizId) return
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}/results`)
      const data = await res.json()

      setQuiz(data.quiz)
      setStats(data.statistics)
      setAttempts(data.attempts || [])
      setQuestionStats(data.questionStats || [])
    } catch (error) {
      console.error("Error fetching results:", error)
      toast.error("Failed to load results")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportToCSV = () => {
    const headers = ["Student ID", "Name", "Phone", "Score", "Percentage", "Passed", "Time", "Submitted"]
    const rows = attempts.map((a) => [
      a.student_id,
      a.student_name || "N/A",
      a.student_phone || "N/A",
      `${a.score}/${a.total_points}`,
      `${a.percentage}%`,
      a.passed ? "Yes" : "No",
      formatTime(a.time_spent || 0),
      formatDate(a.submitted_at),
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quiz-${quiz?.title || "results"}.csv`
    a.click()
    toast.success("CSV downloaded!")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e63946]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/quizzes")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{quiz?.title} - Results</h1>
            <p className="text-gray-400 text-sm">{quiz?.question_count} su'aal</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={exportToCSV}
          className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent"
          disabled={attempts.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <Card className="bg-[#1e293b]/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total_attempts}</p>
                  <p className="text-xs text-gray-400">Total Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b]/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.passed_count}</p>
                  <p className="text-xs text-gray-400">Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b]/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.failed_count}</p>
                  <p className="text-xs text-gray-400">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b]/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#e63946]/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-[#e63946]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.average_score}%</p>
                  <p className="text-xs text-gray-400">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b]/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{formatTime(stats.average_time)}</p>
                  <p className="text-xs text-gray-400">Avg Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pass Rate Progress */}
      {stats && stats.completed_attempts > 0 && (
        <Card className="bg-[#1e293b]/50 border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Pass Rate</h3>
                <p className="text-sm text-gray-400">Percentage of students who passed</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-white">{Math.round(stats.pass_rate)}%</span>
                <p className="text-sm text-gray-400">
                  {stats.passed_count} of {stats.completed_attempts}
                </p>
              </div>
            </div>
            <Progress value={stats.pass_rate} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Lowest: {stats.lowest_score}%</span>
              <span>Highest: {stats.highest_score}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Question Performance */}
        <Card className="bg-[#1e293b]/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#e63946]" />
              Question Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionStats.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {questionStats.map((q, index) => (
                  <div key={q.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-500">Q{index + 1}</span>
                        <span className="text-sm text-white truncate max-w-[200px]">{q.question_text}</span>
                      </div>
                      <Badge
                        className={
                          Number(q.success_rate || 0) >= 70
                            ? "bg-green-500/20 text-green-400"
                            : Number(q.success_rate || 0) >= 40
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }
                      >
                        {q.success_rate || 0}%
                      </Badge>
                    </div>
                    <Progress value={Number(q.success_rate || 0)} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {q.correct_count || 0} correct out of {q.total_answers || 0} answers
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        <Card className="bg-[#1e293b]/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#e63946]" />
              Recent Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No attempts yet</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {attempts.slice(0, 10).map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          attempt.passed ? "bg-green-500/20" : "bg-red-500/20"
                        }`}
                      >
                        {attempt.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{attempt.student_name || attempt.student_id}</p>
                        <p className="text-xs text-gray-400">{formatDate(attempt.submitted_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${attempt.passed ? "text-green-400" : "text-red-400"}`}>
                        {attempt.percentage}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {attempt.score}/{attempt.total_points}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Attempts Table */}
      {attempts.length > 0 && (
        <Card className="bg-[#1e293b]/50 border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="text-white">All Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-gray-400">Student</TableHead>
                    <TableHead className="text-gray-400">Phone</TableHead>
                    <TableHead className="text-gray-400">Score</TableHead>
                    <TableHead className="text-gray-400">Percentage</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Time</TableHead>
                    <TableHead className="text-gray-400">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id} className="border-white/10">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{attempt.student_name || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{attempt.student_id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400">{attempt.student_phone || "N/A"}</TableCell>
                      <TableCell className="text-white">
                        {attempt.score}/{attempt.total_points}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            attempt.percentage >= 70
                              ? "bg-green-500/20 text-green-400"
                              : attempt.percentage >= 40
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }
                        >
                          {attempt.percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attempt.passed ? (
                          <Badge className="bg-green-500/20 text-green-400">Passed</Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-400">{formatTime(attempt.time_spent || 0)}</TableCell>
                      <TableCell className="text-gray-400">{formatDate(attempt.submitted_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
