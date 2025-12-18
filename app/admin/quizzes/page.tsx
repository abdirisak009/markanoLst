"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Users,
  FileQuestion,
  CheckCircle,
  XCircle,
  BarChart3,
  Link2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Quiz {
  id: number
  title: string
  description: string | null
  class_id: number | null
  university_id: number | null
  class_name: string | null
  university_name: string | null
  time_limit: number | null
  passing_score: number
  max_attempts: number
  status: "draft" | "published" | "closed"
  question_count: number
  attempt_count: number
  access_code: string
  start_date: string | null
  end_date: string | null
  created_at: string
}

interface ClassOption {
  id: number
  name: string
  university_id: number
}

interface UniversityOption {
  id: number
  name: string
}

export default function QuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [universities, setUniversities] = useState<UniversityOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    class_id: "",
    university_id: "",
    time_limit: "",
    passing_score: "60",
    max_attempts: "1",
    shuffle_questions: false,
    shuffle_options: false,
    show_results: true,
    show_correct_answers: false,
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    fetchQuizzes()
    fetchClasses()
    fetchUniversities()
  }, [statusFilter])

  const fetchQuizzes = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)

      const res = await fetch(`/api/admin/quizzes?${params}`)
      const data = await res.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes")
      const data = await res.json()
      setClasses(data.classes || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchUniversities = async () => {
    try {
      const res = await fetch("/api/universities")
      const data = await res.json()
      setUniversities(data.universities || data || [])
    } catch (error) {
      console.error("Error fetching universities:", error)
    }
  }

  const handleCreateQuiz = async () => {
    if (!formData.title.trim()) {
      toast.error("Fadlan gali quiz title")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          class_id: formData.class_id || null,
          university_id: formData.university_id || null,
          time_limit: formData.time_limit ? Number.parseInt(formData.time_limit) : null,
          passing_score: Number.parseInt(formData.passing_score) || 60,
          max_attempts: Number.parseInt(formData.max_attempts) || 1,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("Quiz waa la abuuray!")
        setIsCreateOpen(false)
        setFormData({
          title: "",
          description: "",
          class_id: "",
          university_id: "",
          time_limit: "",
          passing_score: "60",
          max_attempts: "1",
          shuffle_questions: false,
          shuffle_options: false,
          show_results: true,
          show_correct_answers: false,
          start_date: "",
          end_date: "",
        })
        // Navigate to quiz editor
        router.push(`/admin/quizzes/${data.quiz.id}/edit`)
      } else {
        toast.error("Waa la waayay in quiz la abuuro")
      }
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm("Ma hubtaa inaad tirtirto quiz-kan?")) return

    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Quiz waa la tirtiray")
        fetchQuizzes()
      }
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const handlePublishQuiz = async (quizId: number, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published"
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(newStatus === "published" ? "Quiz waa la daabacay!" : "Quiz waa draft noqday")
        fetchQuizzes()
      }
    } catch (error) {
      toast.error("Khalad ayaa dhacay")
    }
  }

  const copyQuizLink = (accessCode: string) => {
    const link = `${window.location.origin}/quiz/${accessCode}`
    navigator.clipboard.writeText(link)
    toast.success("Link waa la copy-garaynay!")
  }

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>
      case "closed":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Closed</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0f172a] p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#e63946] to-[#ff6b6b] rounded-xl shadow-lg shadow-[#e63946]/20">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Quiz Management</h1>
            <p className="text-gray-400 text-sm">Samee, tafatir, oo maamul quizzes-ka</p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:opacity-90 text-white shadow-lg shadow-[#e63946]/20">
              <Plus className="h-4 w-4 mr-2" />
              Quiz Cusub
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1e293b] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#e63946]" />
                Abuur Quiz Cusub
              </DialogTitle>
              <DialogDescription className="text-gray-400">Gali macluumaadka quiz-ka cusub</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Quiz Title *</Label>
                <Input
                  placeholder="e.g., Chapter 1 Quiz"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  placeholder="Sharaxaad quiz-ka..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white text-gray-900 border-gray-300"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">University</Label>
                  <Select
                    value={formData.university_id}
                    onValueChange={(v) => setFormData({ ...formData, university_id: v })}
                  >
                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                      <SelectValue placeholder="Dooro university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Dhammaan</SelectItem>
                      {universities.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Class</Label>
                  <Select value={formData.class_id} onValueChange={(v) => setFormData({ ...formData, class_id: v })}>
                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                      <SelectValue placeholder="Dooro class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Dhammaan</SelectItem>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Waqti (daqiiqo)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.time_limit}
                    onChange={(e) => setFormData({ ...formData, time_limit: e.target.value })}
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Passing Score %</Label>
                  <Input
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })}
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Max Attempts</Label>
                  <Input
                    type="number"
                    value={formData.max_attempts}
                    onChange={(e) => setFormData({ ...formData, max_attempts: e.target.value })}
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">End Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Shuffle su'aalaha</Label>
                  <Switch
                    checked={formData.shuffle_questions}
                    onCheckedChange={(v) => setFormData({ ...formData, shuffle_questions: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Shuffle jawaabaaha</Label>
                  <Switch
                    checked={formData.shuffle_options}
                    onCheckedChange={(v) => setFormData({ ...formData, shuffle_options: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Tus natiijada</Label>
                  <Switch
                    checked={formData.show_results}
                    onCheckedChange={(v) => setFormData({ ...formData, show_results: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Tus jawaabaha saxda</Label>
                  <Switch
                    checked={formData.show_correct_answers}
                    onCheckedChange={(v) => setFormData({ ...formData, show_correct_answers: v })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateQuiz}
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:opacity-90"
                >
                  {creating ? "Sameeynaya..." : "Samee Quiz"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Raadi quiz..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1e293b] border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-[#1e293b] border-white/10 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Dhammaan</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#1e293b]/50 border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileQuestion className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{quizzes.length}</p>
              <p className="text-xs text-gray-400">Total Quizzes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/50 border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{quizzes.filter((q) => q.status === "published").length}</p>
              <p className="text-xs text-gray-400">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/50 border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{quizzes.filter((q) => q.status === "draft").length}</p>
              <p className="text-xs text-gray-400">Drafts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/50 border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {quizzes.reduce((sum, q) => sum + (q.attempt_count || 0), 0)}
              </p>
              <p className="text-xs text-gray-400">Total Attempts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e63946]"></div>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="bg-[#1e293b]/50 border-white/10">
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Quiz ma jirto</h3>
            <p className="text-gray-400 mb-4">Samee quiz-kaaga koowaad</p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b]">
              <Plus className="h-4 w-4 mr-2" />
              Samee Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="bg-[#1e293b]/50 border-white/10 hover:border-[#e63946]/30 transition-all duration-300"
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                      {getStatusBadge(quiz.status)}
                    </div>
                    {quiz.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{quiz.description}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        {quiz.question_count} su'aal
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {quiz.attempt_count} attempts
                      </span>
                      {quiz.time_limit && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {quiz.time_limit} min
                        </span>
                      )}
                      {quiz.class_name && (
                        <Badge variant="outline" className="border-white/20 text-gray-300">
                          {quiz.class_name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyQuizLink(quiz.access_code)}
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      <Link2 className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/quizzes/${quiz.id}/edit`)}
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/quizzes/${quiz.id}/results`)}
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={quiz.status === "published" ? "destructive" : "default"}
                      onClick={() => handlePublishQuiz(quiz.id, quiz.status)}
                      className={
                        quiz.status === "published"
                          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      }
                    >
                      {quiz.status === "published" ? (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
