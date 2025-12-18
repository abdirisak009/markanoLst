"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  GripVertical,
  CheckCircle,
  XCircle,
  HelpCircle,
  ListChecks,
  ToggleLeft,
  Type,
  AlignLeft,
  Link2,
  Eye,
  Settings,
  FileQuestion,
  Copy,
} from "lucide-react"
import { toast } from "sonner"

interface Option {
  id?: number
  option_text: string
  option_image?: string
  is_correct: boolean
  match_pair?: string
}

interface Question {
  id?: number
  quiz_id: number
  question_type: "multiple_choice" | "true_false" | "direct" | "fill_blank" | "matching"
  question_text: string
  question_image?: string
  points: number
  order_index: number
  explanation?: string
  options: Option[]
}

interface Quiz {
  id: number
  title: string
  description: string | null
  class_id: number | null
  university_id: number | null
  time_limit: number | null
  passing_score: number
  max_attempts: number
  shuffle_questions: boolean
  shuffle_options: boolean
  show_results: boolean
  show_correct_answers: boolean
  status: string
  access_code: string
  start_date: string | null
  end_date: string | null
}

const questionTypes = [
  {
    value: "multiple_choice",
    label: "Multiple Choice",
    icon: ListChecks,
    description: "Xulashada badan - hal jawaab sax ah",
  },
  { value: "true_false", label: "True/False", icon: ToggleLeft, description: "Run/Been - laba xulasho" },
  { value: "direct", label: "Direct Question", icon: Type, description: "Su'aal toos ah - arday qoraal ku jawaabo" },
  { value: "fill_blank", label: "Fill in Blank", icon: AlignLeft, description: "Meel bannaan - buuxi meesha madhan" },
  { value: "matching", label: "Matching", icon: Link2, description: "Isku xirka - isku xir labada dhinac" },
]

export default function QuizEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("questions")
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>("")

  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    question_image: "",
    points: 1,
    explanation: "",
    options: [] as Option[],
    correct_answer: "", // For direct/fill_blank
  })

  useEffect(() => {
    fetchQuiz()
  }, [resolvedParams.id])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/admin/quizzes/${resolvedParams.id}`)
      const data = await res.json()
      setQuiz(data.quiz)
      setQuestions(data.questions || [])
    } catch (error) {
      console.error("Error fetching quiz:", error)
      toast.error("Khalad ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuiz = async () => {
    if (!quiz) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      })
      if (res.ok) {
        toast.success("Quiz waa la keydiyay!")
      }
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    } finally {
      setSaving(false)
    }
  }

  const initializeOptions = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return [
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ]
      case "true_false":
        return [
          { option_text: "True", is_correct: false },
          { option_text: "False", is_correct: false },
        ]
      case "matching":
        return [
          { option_text: "", is_correct: true, match_pair: "" },
          { option_text: "", is_correct: true, match_pair: "" },
          { option_text: "", is_correct: true, match_pair: "" },
        ]
      default:
        return []
    }
  }

  const handleSelectQuestionType = (type: string) => {
    setSelectedQuestionType(type)
    setNewQuestion({
      question_text: "",
      question_image: "",
      points: 1,
      explanation: "",
      options: initializeOptions(type),
      correct_answer: "",
    })
  }

  const handleAddOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { option_text: "", is_correct: false, match_pair: "" }],
    })
  }

  const handleRemoveOption = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index),
    })
  }

  const handleOptionChange = (index: number, field: string, value: any) => {
    const updatedOptions = [...newQuestion.options]
    if (field === "is_correct" && selectedQuestionType !== "matching") {
      // For single answer questions, only one can be correct
      updatedOptions.forEach((opt, i) => {
        opt.is_correct = i === index ? value : false
      })
    } else {
      updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    }
    setNewQuestion({ ...newQuestion, options: updatedOptions })
  }

  const handleSaveQuestion = async () => {
    if (!newQuestion.question_text.trim()) {
      toast.error("Fadlan gali su'aasha")
      return
    }

    // Validate based on question type
    if (selectedQuestionType === "multiple_choice" || selectedQuestionType === "true_false") {
      const hasCorrect = newQuestion.options.some((o) => o.is_correct)
      if (!hasCorrect) {
        toast.error("Fadlan dooro jawaabta saxda ah")
        return
      }
      const hasOptions = newQuestion.options.every((o) => o.option_text.trim())
      if (!hasOptions) {
        toast.error("Fadlan buuxi dhammaan xulashooyinka")
        return
      }
    }

    if (
      (selectedQuestionType === "direct" || selectedQuestionType === "fill_blank") &&
      !newQuestion.correct_answer.trim()
    ) {
      toast.error("Fadlan gali jawaabta saxda ah")
      return
    }

    if (selectedQuestionType === "matching") {
      const hasAllPairs = newQuestion.options.every((o) => o.option_text.trim() && o.match_pair?.trim())
      if (!hasAllPairs) {
        toast.error("Fadlan buuxi dhammaan isku-xirka")
        return
      }
    }

    try {
      const questionData = {
        question_type: selectedQuestionType,
        question_text: newQuestion.question_text,
        question_image: newQuestion.question_image || null,
        points: newQuestion.points,
        explanation: newQuestion.explanation || null,
        options:
          selectedQuestionType === "direct" || selectedQuestionType === "fill_blank"
            ? [{ option_text: newQuestion.correct_answer, is_correct: true }]
            : newQuestion.options,
      }

      const url = editingQuestion
        ? `/api/admin/quizzes/questions/${editingQuestion.id}`
        : `/api/admin/quizzes/${resolvedParams.id}/questions`

      const res = await fetch(url, {
        method: editingQuestion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      })

      if (res.ok) {
        toast.success(editingQuestion ? "Su'aasha waa la cusboonaysiiyay!" : "Su'aasha waa lagu daray!")
        setIsAddQuestionOpen(false)
        setSelectedQuestionType("")
        setEditingQuestion(null)
        fetchQuiz()
      }
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Ma hubtaa inaad tirtirto su'aashan?")) return

    try {
      const res = await fetch(`/api/admin/quizzes/questions/${questionId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Su'aasha waa la tirtiray")
        fetchQuiz()
      }
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setSelectedQuestionType(question.question_type)
    setNewQuestion({
      question_text: question.question_text,
      question_image: question.question_image || "",
      points: question.points,
      explanation: question.explanation || "",
      options: question.options || [],
      correct_answer:
        question.question_type === "direct" || question.question_type === "fill_blank"
          ? question.options?.[0]?.option_text || ""
          : "",
    })
    setIsAddQuestionOpen(true)
  }

  const copyQuizLink = () => {
    if (!quiz) return
    const link = `${window.location.origin}/quiz/${quiz.access_code}`
    navigator.clipboard.writeText(link)
    toast.success("Link waa la copy-garaynay!")
  }

  const getQuestionTypeIcon = (type: string) => {
    const found = questionTypes.find((t) => t.value === type)
    return found ? found.icon : HelpCircle
  }

  const getQuestionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      multiple_choice: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      true_false: "bg-green-500/20 text-green-400 border-green-500/30",
      direct: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      fill_blank: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      matching: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    }
    const labels: Record<string, string> = {
      multiple_choice: "Multiple Choice",
      true_false: "True/False",
      direct: "Direct Question",
      fill_blank: "Fill in Blank",
      matching: "Matching",
    }
    return <Badge className={colors[type] || "bg-gray-500/20 text-gray-400"}>{labels[type] || type}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e63946]"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] p-6 flex items-center justify-center">
        <p className="text-white">Quiz not found</p>
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
            <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
            <p className="text-gray-400 text-sm">
              {questions.length} su'aal • Access Code:{" "}
              <span className="text-[#e63946] font-mono">{quiz.access_code}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={copyQuizLink}
            className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/quiz/${quiz.access_code}/preview`, "_blank")}
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSaveQuiz} disabled={saving} className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b]">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1e293b] border-white/10 mb-6">
          <TabsTrigger value="questions" className="data-[state=active]:bg-[#e63946] data-[state=active]:text-white">
            <FileQuestion className="h-4 w-4 mr-2" />
            Su'aalaha ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#e63946] data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          {/* Add Question Button */}
          <Dialog
            open={isAddQuestionOpen}
            onOpenChange={(open) => {
              setIsAddQuestionOpen(open)
              if (!open) {
                setSelectedQuestionType("")
                setEditingQuestion(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:opacity-90 mb-4">
                <Plus className="h-4 w-4 mr-2" />
                Ku dar Su'aal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#e63946]" />
                  {editingQuestion ? "Edit Su'aal" : "Ku dar Su'aal Cusub"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedQuestionType ? "Buuxi su'aasha iyo jawaabaheeda" : "Dooro nooca su'aasha"}
                </DialogDescription>
              </DialogHeader>

              {!selectedQuestionType ? (
                /* Question Type Selection */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {questionTypes.map((type) => (
                    <Card
                      key={type.value}
                      className="bg-[#0f172a] border-white/10 hover:border-[#e63946]/50 cursor-pointer transition-all"
                      onClick={() => handleSelectQuestionType(type.value)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="p-2 bg-[#e63946]/20 rounded-lg">
                          <type.icon className="h-5 w-5 text-[#e63946]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{type.label}</h4>
                          <p className="text-sm text-gray-400">{type.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                /* Question Form */
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuestionType("")}
                      className="text-gray-400"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    {getQuestionTypeBadge(selectedQuestionType)}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Su'aasha *</Label>
                    <Textarea
                      placeholder="Qor su'aasha halkan..."
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      className="bg-white text-gray-900 border-gray-300 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Points</Label>
                      <Input
                        type="number"
                        value={newQuestion.points}
                        onChange={(e) =>
                          setNewQuestion({ ...newQuestion, points: Number.parseInt(e.target.value) || 1 })
                        }
                        className="bg-white text-gray-900 border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Image URL (optional)</Label>
                      <Input
                        placeholder="https://..."
                        value={newQuestion.question_image}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question_image: e.target.value })}
                        className="bg-white text-gray-900 border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Multiple Choice / True False Options */}
                  {(selectedQuestionType === "multiple_choice" || selectedQuestionType === "true_false") && (
                    <div className="space-y-3">
                      <Label className="text-gray-300">Xulashooyinka</Label>
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOptionChange(index, "is_correct", !option.is_correct)}
                            className={`p-2 rounded-lg transition-colors ${
                              option.is_correct ? "bg-green-500/20 text-green-400" : "bg-white/10 text-gray-400"
                            }`}
                          >
                            {option.is_correct ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          </button>
                          <Input
                            placeholder={`Xulasho ${index + 1}`}
                            value={option.option_text}
                            onChange={(e) => handleOptionChange(index, "option_text", e.target.value)}
                            className="bg-white text-gray-900 border-gray-300 flex-1"
                            disabled={selectedQuestionType === "true_false"}
                          />
                          {selectedQuestionType === "multiple_choice" && newQuestion.options.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {selectedQuestionType === "multiple_choice" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddOption}
                          className="border-white/20 text-gray-300 bg-transparent"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ku dar xulasho
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Direct / Fill Blank Answer */}
                  {(selectedQuestionType === "direct" || selectedQuestionType === "fill_blank") && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Jawaabta Saxda ah *</Label>
                      <Input
                        placeholder="Gali jawaabta saxda ah..."
                        value={newQuestion.correct_answer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                        className="bg-white text-gray-900 border-gray-300"
                      />
                      <p className="text-xs text-gray-500">
                        Arday-gu wuxuu qoraa jawaabtiisa, waa la barbardhigayaa tan aad galiso
                      </p>
                    </div>
                  )}

                  {/* Matching Pairs */}
                  {selectedQuestionType === "matching" && (
                    <div className="space-y-3">
                      <Label className="text-gray-300">Isku-xirka</Label>
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="Dhinaca bidix"
                            value={option.option_text}
                            onChange={(e) => handleOptionChange(index, "option_text", e.target.value)}
                            className="bg-white text-gray-900 border-gray-300 flex-1"
                          />
                          <Link2 className="h-4 w-4 text-[#e63946]" />
                          <Input
                            placeholder="Dhinaca midig"
                            value={option.match_pair || ""}
                            onChange={(e) => handleOptionChange(index, "match_pair", e.target.value)}
                            className="bg-white text-gray-900 border-gray-300 flex-1"
                          />
                          {newQuestion.options.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                        className="border-white/20 text-gray-300 bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ku dar pair
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-300">Sharaxaad (optional)</Label>
                    <Textarea
                      placeholder="Sharaxaad la tuso ka dib jawaabta..."
                      value={newQuestion.explanation}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                      className="bg-white text-gray-900 border-gray-300"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddQuestionOpen(false)
                        setSelectedQuestionType("")
                        setEditingQuestion(null)
                      }}
                      className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveQuestion}
                      className="flex-1 bg-gradient-to-r from-[#e63946] to-[#ff6b6b]"
                    >
                      {editingQuestion ? "Update Su'aal" : "Ku dar Su'aal"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Questions List */}
          {questions.length === 0 ? (
            <Card className="bg-[#1e293b]/50 border-white/10">
              <CardContent className="p-12 text-center">
                <FileQuestion className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Su'aal ma jirto</h3>
                <p className="text-gray-400">Ku dar su'aalaha quiz-kaaga</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => {
                const TypeIcon = getQuestionTypeIcon(question.question_type)
                return (
                  <Card
                    key={question.id}
                    className="bg-[#1e293b]/50 border-white/10 hover:border-[#e63946]/30 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <GripVertical className="h-5 w-5 cursor-move" />
                          <span className="font-mono text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getQuestionTypeBadge(question.question_type)}
                            <Badge variant="outline" className="border-white/20 text-gray-400">
                              {question.points} points
                            </Badge>
                          </div>
                          <p className="text-white mb-3">{question.question_text}</p>

                          {/* Show options preview */}
                          {(question.question_type === "multiple_choice" ||
                            question.question_type === "true_false") && (
                            <div className="flex flex-wrap gap-2">
                              {question.options?.map((opt, i) => (
                                <span
                                  key={i}
                                  className={`text-sm px-2 py-1 rounded ${
                                    opt.is_correct ? "bg-green-500/20 text-green-400" : "bg-white/5 text-gray-400"
                                  }`}
                                >
                                  {opt.option_text}
                                </span>
                              ))}
                            </div>
                          )}

                          {question.question_type === "matching" && (
                            <div className="flex flex-wrap gap-2">
                              {question.options?.map((opt, i) => (
                                <span key={i} className="text-sm px-2 py-1 rounded bg-white/5 text-gray-400">
                                  {opt.option_text} → {opt.match_pair}
                                </span>
                              ))}
                            </div>
                          )}

                          {(question.question_type === "direct" || question.question_type === "fill_blank") && (
                            <span className="text-sm px-2 py-1 rounded bg-green-500/20 text-green-400">
                              Jawaab: {question.options?.[0]?.option_text}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id!)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-[#1e293b]/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Quiz Title</Label>
                  <Input
                    value={quiz.title}
                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Status</Label>
                  <Select value={quiz.status} onValueChange={(v) => setQuiz({ ...quiz, status: v })}>
                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={quiz.time_limit || ""}
                    onChange={(e) =>
                      setQuiz({ ...quiz, time_limit: e.target.value ? Number.parseInt(e.target.value) : null })
                    }
                    className="bg-white text-gray-900 border-gray-300"
                    placeholder="No limit"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={quiz.passing_score}
                    onChange={(e) => setQuiz({ ...quiz, passing_score: Number.parseInt(e.target.value) || 60 })}
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Max Attempts</Label>
                  <Input
                    type="number"
                    value={quiz.max_attempts}
                    onChange={(e) => setQuiz({ ...quiz, max_attempts: Number.parseInt(e.target.value) || 1 })}
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <h3 className="font-medium text-white">Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Shuffle Questions</Label>
                    <Switch
                      checked={quiz.shuffle_questions}
                      onCheckedChange={(v) => setQuiz({ ...quiz, shuffle_questions: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Shuffle Options</Label>
                    <Switch
                      checked={quiz.shuffle_options}
                      onCheckedChange={(v) => setQuiz({ ...quiz, shuffle_options: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Show Results</Label>
                    <Switch
                      checked={quiz.show_results}
                      onCheckedChange={(v) => setQuiz({ ...quiz, show_results: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Show Correct Answers</Label>
                    <Switch
                      checked={quiz.show_correct_answers}
                      onCheckedChange={(v) => setQuiz({ ...quiz, show_correct_answers: v })}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveQuiz}
                disabled={saving}
                className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b]"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
