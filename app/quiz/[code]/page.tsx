"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  Clock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  Send,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface Option {
  id: number
  option_text: string
  option_image?: string
  match_pair?: string
}

interface Question {
  id: number
  question_type: string
  question_text: string
  question_image?: string
  points: number
  options: Option[]
}

interface Quiz {
  id: number
  title: string
  description: string | null
  time_limit: number | null
  passing_score: number
  question_count: number
  show_results: boolean
}

interface Answer {
  question_id: number
  selected_option_id?: number
  answer_text?: string
  matching_answers?: { left: number; right: string }[]
}

type ViewState = "login" | "quiz" | "result"

export default function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const [view, setView] = useState<ViewState>("login")
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Login state
  const [studentId, setStudentId] = useState("")
  const [phone, setPhone] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [studentInfo, setStudentInfo] = useState<{ id: string; name: string; type: string } | null>(null)

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  // Result state
  const [result, setResult] = useState<{
    score: number
    total_points: number
    percentage: number
    passed: boolean
    passing_score: number
  } | null>(null)

  // Matching state
  const [matchingSelections, setMatchingSelections] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    fetchQuiz()
  }, [resolvedParams.code])

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && view === "quiz") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft, view])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quiz/${resolvedParams.code}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Quiz not available")
        return
      }

      setQuiz(data.quiz)
      setQuestions(data.questions)

      // Initialize answers array
      setAnswers(
        data.questions.map((q: Question) => ({
          question_id: q.id,
          selected_option_id: undefined,
          answer_text: undefined,
          matching_answers: undefined,
        })),
      )
    } catch (err) {
      setError("Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!studentId && !phone) {
      toast.error("Fadlan gali Student ID ama Phone number")
      return
    }

    setVerifying(true)
    try {
      const res = await fetch(`/api/quiz/${resolvedParams.code}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, phone }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error)
        return
      }

      setStudentInfo(data.student)
      setView("quiz")
      setStartTime(Date.now())

      // Set timer if time limit exists
      if (quiz?.time_limit) {
        setTimeLeft(quiz.time_limit * 60) // Convert minutes to seconds
      }

      toast.success(`Welcome, ${data.student.name}!`)
    } catch (err) {
      toast.error("Verification failed")
    } finally {
      setVerifying(false)
    }
  }

  const handleAnswerChange = (questionId: number, value: any, type: string) => {
    setAnswers((prev) =>
      prev.map((a) => {
        if (a.question_id !== questionId) return a

        switch (type) {
          case "multiple_choice":
          case "true_false":
            return { ...a, selected_option_id: value }
          case "direct":
          case "fill_blank":
            return { ...a, answer_text: value }
          case "matching":
            return { ...a, matching_answers: value }
          default:
            return a
        }
      }),
    )
  }

  const handleMatchingChange = (questionId: number, optionId: number, matchPair: string) => {
    const currentAnswer = answers.find((a) => a.question_id === questionId)
    const currentMatches = currentAnswer?.matching_answers || []

    const updatedMatches = [...currentMatches.filter((m) => m.left !== optionId), { left: optionId, right: matchPair }]

    handleAnswerChange(questionId, updatedMatches, "matching")
    setMatchingSelections({ ...matchingSelections, [optionId]: matchPair })
  }

  const handleSubmit = async () => {
    if (!studentInfo || !quiz) return

    setSubmitting(true)
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      const res = await fetch(`/api/quiz/${resolvedParams.code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentInfo.id,
          student_type: studentInfo.type,
          student_phone: phone || null,
          answers,
          time_spent: timeSpent,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error)
        return
      }

      if (quiz.show_results && data.score !== undefined) {
        setResult({
          score: data.score,
          total_points: data.total_points,
          percentage: data.percentage,
          passed: data.passed,
          passing_score: data.passing_score,
        })
      }

      setView("result")
      toast.success("Quiz submitted successfully!")
    } catch (err) {
      toast.error("Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e63946] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#1e293b] border-white/10">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Quiz Not Available</h2>
            <p className="text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login View
  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#1e293b] border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <Image src="/images/ll.png" alt="Markano" fill className="object-contain" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">{quiz?.title}</CardTitle>
            <CardDescription className="text-gray-400">{quiz?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Info */}
            <div className="flex justify-center gap-4 text-sm">
              <Badge variant="outline" className="border-white/20 text-gray-300 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                {quiz?.question_count} su'aal
              </Badge>
              {quiz?.time_limit && (
                <Badge variant="outline" className="border-white/20 text-gray-300 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {quiz.time_limit} min
                </Badge>
              )}
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              <p className="text-center text-gray-400 text-sm">Gali Student ID-gaaga ama Phone number-kaaga</p>

              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student ID
                </Label>
                <Input
                  placeholder="e.g., STU001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div className="text-center text-gray-500 text-sm">ama</div>

              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  placeholder="e.g., 0612345678 ama 612345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <Button
                onClick={handleVerify}
                disabled={verifying || (!studentId && !phone)}
                className="w-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:opacity-90"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Bilow Quiz-ka
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Result View
  if (view === "result") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#1e293b] border-white/10 shadow-2xl">
          <CardContent className="p-8 text-center">
            {result ? (
              <>
                <div
                  className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    result.passed
                      ? "bg-gradient-to-br from-green-500 to-emerald-500"
                      : "bg-gradient-to-br from-red-500 to-rose-500"
                  }`}
                >
                  {result.passed ? (
                    <Trophy className="h-12 w-12 text-white" />
                  ) : (
                    <XCircle className="h-12 w-12 text-white" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {result.passed ? "Hambalyo!" : "Isku day mar kale"}
                </h2>

                <div className="text-5xl font-bold mb-2">
                  <span className={result.passed ? "text-green-400" : "text-red-400"}>{result.percentage}%</span>
                </div>

                <p className="text-gray-400 mb-6">
                  {result.score} / {result.total_points} dhibcood
                </p>

                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Passing Score</span>
                    <span className="text-white">{result.passing_score}%</span>
                  </div>
                  <Progress value={result.percentage} className="h-2" />
                </div>

                <Badge className={result.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                  {result.passed ? "PASSED" : "NOT PASSED"}
                </Badge>
              </>
            ) : (
              <>
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Quiz Submitted!</h2>
                <p className="text-gray-400">Jawaabtiinaadigii waxa la diray macallinka</p>
              </>
            )}

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="mt-6 border-white/20 text-gray-300 hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Ka bax
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz View
  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] p-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/images/ll.png" alt="Markano" fill className="object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{quiz?.title}</h1>
              <p className="text-sm text-gray-400">{studentInfo?.name}</p>
            </div>
          </div>

          {timeLeft !== null && (
            <Badge
              className={`text-lg px-4 py-2 ${
                timeLeft < 60
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : timeLeft < 300
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-blue-500/20 text-blue-400"
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm text-gray-400">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="max-w-3xl mx-auto bg-[#1e293b] border-white/10 shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-[#e63946]/20 text-[#e63946]">Su'aal {currentQuestion + 1}</Badge>
            <Badge variant="outline" className="border-white/20 text-gray-400">
              {question.points} dhibcood
            </Badge>
          </div>
          <CardTitle className="text-xl text-white leading-relaxed">{question.question_text}</CardTitle>
          {question.question_image && (
            <div className="mt-4 relative h-48 rounded-lg overflow-hidden">
              <Image
                src={question.question_image || "/placeholder.svg"}
                alt="Question"
                fill
                className="object-contain"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Multiple Choice / True False */}
          {(question.question_type === "multiple_choice" || question.question_type === "true_false") && (
            <RadioGroup
              value={answers.find((a) => a.question_id === question.id)?.selected_option_id?.toString()}
              onValueChange={(v) => handleAnswerChange(question.id, Number.parseInt(v), question.question_type)}
            >
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                    answers.find((a) => a.question_id === question.id)?.selected_option_id === option.id
                      ? "border-[#e63946] bg-[#e63946]/10"
                      : "border-white/10 hover:border-white/30 bg-white/5"
                  }`}
                  onClick={() => handleAnswerChange(question.id, option.id, question.question_type)}
                >
                  <RadioGroupItem value={option.id.toString()} className="border-white/30" />
                  <span className="text-white">{option.option_text}</span>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Direct / Fill Blank */}
          {(question.question_type === "direct" || question.question_type === "fill_blank") && (
            <div className="space-y-2">
              <Label className="text-gray-300">Jawaabta</Label>
              <Textarea
                placeholder={
                  question.question_type === "fill_blank" ? "Buuxi meesha banaan..." : "Qor jawaabta halkan..."
                }
                value={answers.find((a) => a.question_id === question.id)?.answer_text || ""}
                onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
                className="bg-white text-gray-900 border-gray-300 min-h-[120px]"
              />
            </div>
          )}

          {/* Matching */}
          {question.question_type === "matching" && (
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">Isku xir labada dhinac</p>
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center gap-4">
                  <div className="flex-1 p-3 bg-white/5 rounded-lg text-white">{option.option_text}</div>
                  <ArrowRight className="h-4 w-4 text-[#e63946]" />
                  <select
                    value={matchingSelections[option.id] || ""}
                    onChange={(e) => handleMatchingChange(question.id, option.id, e.target.value)}
                    className="flex-1 p-3 bg-white text-gray-900 rounded-lg border border-gray-300"
                  >
                    <option value="">Dooro...</option>
                    {question.options.map((opt) => (
                      <option key={opt.id} value={opt.match_pair}>
                        {opt.match_pair}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Navigation */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
            disabled={currentQuestion === 0}
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:opacity-90"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:opacity-90"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>

      {/* Question Navigation Dots */}
      <div className="max-w-3xl mx-auto mt-6 flex flex-wrap justify-center gap-2">
        {questions.map((_, index) => {
          const answer = answers[index]
          const hasAnswer =
            answer?.selected_option_id ||
            answer?.answer_text ||
            (answer?.matching_answers && answer.matching_answers.length > 0)

          return (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                currentQuestion === index
                  ? "bg-[#e63946] text-white"
                  : hasAnswer
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-white/10 text-gray-400 hover:bg-white/20"
              }`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
