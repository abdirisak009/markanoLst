"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  PlayCircle,
  Video,
  Clock,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Users,
  Award,
  Code,
  Lightbulb,
  Trophy,
  Loader2,
  AlertTriangle,
  BookOpen,
  PenLine,
} from "lucide-react"
import dynamic from "next/dynamic"

const CodeEditor = dynamic(() => import("@/components/code-editor").then((m) => m.CodeEditor), { ssr: false })
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Course {
  id: number
  title: string
  description: string
  instructor_name: string
  difficulty_level: string
  estimated_duration_minutes: number
}

interface Module {
  id: number
  course_id: number
  title: string
  description: string | null
  order_index: number
  is_active: boolean
  lessons_count?: number
}

interface Lesson {
  id: number
  module_id: number
  title: string
  description: string | null
  video_url: string | null
  video_duration_seconds: number
  lesson_type: string
  order_index: number
  xp_reward: number
  is_active: boolean
  quizzes_count?: number
  tasks_count?: number
}

interface Quiz {
  id: number
  lesson_id: number
  question: string
  question_type: string
  options: string[] | null
  correct_answer: string
  explanation: string | null
  order_index: number
}

interface Task {
  id: number
  lesson_id: number
  task_type: string
  title: string
  instructions: string
  expected_output: string | null
  is_required: boolean
}

const XP_BY_LESSON_TYPE: Record<string, number> = {
  video: 10,
  reading: 5,
  interactive: 20,
  code: 25,
}

export default function LearningCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({})
  const [quizzes, setQuizzes] = useState<Record<number, Quiz[]>>({})
  const [tasks, setTasks] = useState<Record<number, Task[]>>({})
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  // Module Dialog
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleDescription, setModuleDescription] = useState("")
  const [moduleOrderIndex, setModuleOrderIndex] = useState("")
  const [moduleFormErrors, setModuleFormErrors] = useState<Record<string, string>>({})
  const [isModuleSubmitting, setIsModuleSubmitting] = useState(false)
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<Module | null>(null)
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false)

  // Lesson Dialog
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonDescription, setLessonDescription] = useState("")
  const [lessonVideoUrl, setLessonVideoUrl] = useState("")
  const [lessonVideoDuration, setLessonVideoDuration] = useState("")
  const [lessonType, setLessonType] = useState("video")
  const [lessonOrderIndex, setLessonOrderIndex] = useState("")
  const [lessonXpReward, setLessonXpReward] = useState("10")
  const [lessonFormErrors, setLessonFormErrors] = useState<Record<string, string>>({})
  const [isLessonSubmitting, setIsLessonSubmitting] = useState(false)
  const [lessonStatus, setLessonStatus] = useState<"draft" | "published">("published")
  const [cancelLessonConfirmOpen, setCancelLessonConfirmOpen] = useState(false)
  const [lessonWizardStep, setLessonWizardStep] = useState(1)
  // Code lesson
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [codeStarterCode, setCodeStarterCode] = useState("")
  const [codeInstructions, setCodeInstructions] = useState("")
  const [codeExpectedOutput, setCodeExpectedOutput] = useState("")
  const [codeSolutionCode, setCodeSolutionCode] = useState("")
  // Reading lesson (uses lessonDescription as markdown)
  // Interactive: uses lessonDescription + note to add quizzes/tasks after
  const [deleteLessonTarget, setDeleteLessonTarget] = useState<Lesson | null>(null)
  const [deleteLessonOpen, setDeleteLessonOpen] = useState(false)

  // Quiz Dialog
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [quizQuestion, setQuizQuestion] = useState("")
  const [quizType, setQuizType] = useState("multiple_choice")
  const [quizOptions, setQuizOptions] = useState("")
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState("")
  const [quizExplanation, setQuizExplanation] = useState("")
  const [quizFormErrors, setQuizFormErrors] = useState<Record<string, string>>({})
  const [isQuizSubmitting, setIsQuizSubmitting] = useState(false)
  const [deleteQuizTarget, setDeleteQuizTarget] = useState<Quiz | null>(null)
  const [deleteQuizOpen, setDeleteQuizOpen] = useState(false)

  // Task Dialog
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTaskLessonId, setSelectedTaskLessonId] = useState<number | null>(null)
  const [taskType, setTaskType] = useState("reflection")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskInstructions, setTaskInstructions] = useState("")
  const [taskExpectedOutput, setTaskExpectedOutput] = useState("")
  const [taskIsRequired, setTaskIsRequired] = useState(true)
  const [taskFormErrors, setTaskFormErrors] = useState<Record<string, string>>({})
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false)
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null)
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false)
  // Coding Practice Fields
  const [taskProgrammingLanguage, setTaskProgrammingLanguage] = useState("javascript")
  const [taskStarterCode, setTaskStarterCode] = useState("")
  const [taskTestCases, setTaskTestCases] = useState("")
  const [taskSolutionCode, setTaskSolutionCode] = useState("")

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const courseRes = await fetch(`/api/learning/courses/${courseId}`, { credentials: "include" })
      if (!courseRes.ok) {
        const errorData = await courseRes.json().catch(() => ({}))
        if (errorData.error?.includes("blocked")) {
          toast.error(`Access denied: ${errorData.error}. Please try again later.`)
          return
        }
        throw new Error(errorData.error || "Failed to fetch course")
      }
      const courseData = await courseRes.json()
      
      // Check if response is an error object
      if (courseData.error) {
        toast.error(courseData.error)
        return
      }
      
      setCourse(courseData)

      // Fetch modules
      const modulesRes = await fetch(`/api/learning/modules?courseId=${courseId}`, { credentials: "include" })
      if (!modulesRes.ok) {
        const errorData = await modulesRes.json().catch(() => ({}))
        if (errorData.error?.includes("blocked")) {
          toast.error(`Access denied: ${errorData.error}. Please try again later.`)
          return
        }
        throw new Error(errorData.error || "Failed to fetch modules")
      }
      const modulesData = await modulesRes.json()
      
      // Check if response is an error object
      if (modulesData.error) {
        toast.error(modulesData.error)
        setModules([])
        return
      }
      
      // Ensure modulesData is an array
      const modulesArray = Array.isArray(modulesData) ? modulesData : []
      setModules(modulesArray)

      // Fetch lessons for each module
      const lessonsData: Record<number, Lesson[]> = {}
      const quizzesData: Record<number, Quiz[]> = {}
      const tasksData: Record<number, Task[]> = {}

      for (const module of modulesArray) {
        try {
          const lessonsRes = await fetch(`/api/learning/lessons?moduleId=${module.id}`, { credentials: "include" })
          if (lessonsRes.ok) {
            const lessonsList = await lessonsRes.json()
            const lessonsArray = Array.isArray(lessonsList) ? lessonsList : []
            lessonsData[module.id] = lessonsArray

            // Fetch quizzes and tasks for each lesson
            for (const lesson of lessonsArray) {
              try {
                const quizzesRes = await fetch(`/api/learning/quizzes?lessonId=${lesson.id}`, { credentials: "include" })
                if (quizzesRes.ok) {
                  const quizzesList = await quizzesRes.json()
                  quizzesData[lesson.id] = Array.isArray(quizzesList) ? quizzesList : []
                }

                const tasksRes = await fetch(`/api/learning/tasks?lessonId=${lesson.id}`, { credentials: "include" })
                if (tasksRes.ok) {
                  const tasksList = await tasksRes.json()
                  tasksData[lesson.id] = Array.isArray(tasksList) ? tasksList : []
                }
              } catch (error) {
                console.error(`Error fetching quizzes/tasks for lesson ${lesson.id}:`, error)
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching lessons for module ${module.id}:`, error)
        }
      }

      setLessons(lessonsData)
      setQuizzes(quizzesData)
      setTasks(tasksData)

      // Expand first module by default
      if (modulesArray.length > 0) {
        setExpandedModules(new Set([modulesArray[0].id]))
      }
    } catch (error) {
      console.error("Error fetching course data:", error)
      toast.error("Failed to load course data")
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const toggleLesson = (lessonId: number) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId)
    } else {
      newExpanded.add(lessonId)
    }
    setExpandedLessons(newExpanded)
  }

  // Module CRUD
  const validateModuleForm = (): boolean => {
    const t = moduleTitle.trim()
    const err: Record<string, string> = {}
    if (!t) err.moduleTitle = "Module title is required"
    else if (t.length < 2) err.moduleTitle = "Title must be at least 2 characters"
    setModuleFormErrors(err)
    return Object.keys(err).length === 0
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateModuleForm()) return
    setModuleFormErrors({})
    const titleTrim = moduleTitle.trim()
    const descTrim = (moduleDescription || "").trim().slice(0, 2000)

    setIsModuleSubmitting(true)
    try {
      const method = editingModule ? "PUT" : "POST"
      const body = editingModule
        ? {
            id: editingModule.id,
            title: titleTrim,
            description: descTrim || null,
            order_index: editingModule.order_index,
            is_active: true,
          }
        : {
            course_id: Number(courseId),
            title: titleTrim,
            description: descTrim || null,
            order_index: modules.length,
          }

      const response = await fetch("/api/learning/modules", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to save module")

      toast.success(editingModule ? "Module updated" : "Module created")
      fetchCourseData()
      closeModuleDialog()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save module")
    } finally {
      setIsModuleSubmitting(false)
    }
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleTitle(module.title)
    setModuleDescription(module.description || "")
    setModuleOrderIndex(module.order_index.toString())
    setIsModuleDialogOpen(true)
  }

  const openDeleteModuleConfirm = (module: Module) => {
    setDeleteModuleTarget(module)
    setDeleteModuleOpen(true)
  }

  const confirmDeleteModule = async () => {
    if (!deleteModuleTarget) return
    const id = deleteModuleTarget.id
    setDeleteModuleOpen(false)
    setDeleteModuleTarget(null)
    try {
      const response = await fetch(`/api/learning/modules?id=${id}`, { method: "DELETE", credentials: "include" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to delete module")
      toast.success("Module deleted")
      fetchCourseData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete module")
    }
  }

  const closeModuleDialog = () => {
    setIsModuleDialogOpen(false)
    setEditingModule(null)
    setModuleTitle("")
    setModuleDescription("")
    setModuleOrderIndex("")
    setModuleFormErrors({})
  }

  // Lesson CRUD — Validation: title 5–120; Video URL required only for video type
  const validateLessonForm = (): boolean => {
    const t = lessonTitle.trim()
    const err: Record<string, string> = {}
    if (!selectedModuleId && !editingLesson) err.module = "Please select a module"
    if (!t) err.lessonTitle = "Lesson title is required"
    else if (t.length < 5) err.lessonTitle = "Title must be at least 5 characters"
    else if (t.length > 120) err.lessonTitle = "Title must be at most 120 characters"
    if (lessonType === "video") {
      const videoUrl = (lessonVideoUrl || "").trim()
      if (!videoUrl) err.lessonVideoUrl = "Video URL is required"
      else if (!/^https?:\/\/.+/.test(videoUrl)) err.lessonVideoUrl = "Enter a valid URL (e.g. YouTube, Vimeo)"
    }
    const xp = parseInt(lessonXpReward, 10)
    if (isNaN(xp) || xp < 0) err.lessonXpReward = "XP must be 0 or more"
    if (lessonType === "code" && !(codeInstructions || "").trim()) err.codeInstructions = "Instructions are required for code lessons"
    setLessonFormErrors(err)
    return Object.keys(err).length === 0
  }

  const setLessonTypeAndXp = (type: string) => {
    setLessonType(type)
    const defaultXp = XP_BY_LESSON_TYPE[type] ?? 10
    setLessonXpReward(String(defaultXp))
  }

  const isLessonFormValidForPublish = (): boolean => {
    const t = lessonTitle.trim()
    if (!t || t.length < 5 || t.length > 120) return false
    if (!editingLesson && !selectedModuleId) return false
    if (lessonType === "video") {
      const u = (lessonVideoUrl || "").trim()
      if (!u || !/^https?:\/\/.+/.test(u)) return false
    }
    const xp = parseInt(lessonXpReward, 10)
    if (isNaN(xp) || xp < 0) return false
    if (lessonType === "code" && !(codeInstructions || "").trim()) return false
    return true
  }

  const buildLessonDescription = (): string | null => {
    if (lessonType === "code") {
      const payload = {
        type: "code",
        language: codeLanguage,
        starterCode: codeStarterCode,
        instructions: codeInstructions.trim(),
        expectedOutput: (codeExpectedOutput || "").trim() || undefined,
        solutionCode: (codeSolutionCode || "").trim() || undefined,
      }
      return JSON.stringify(payload)
    }
    return (lessonDescription || "").trim().slice(0, 5000) || null
  }

  const handleCreateLesson = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault()
    if (!validateLessonForm() && !asDraft) return
    if (asDraft) {
      setLessonFormErrors({})
    } else if (!validateLessonForm() || (!selectedModuleId && !editingLesson)) return
    if (!selectedModuleId && !editingLesson) return
    setLessonFormErrors({})
    const mid = selectedModuleId ?? editingLesson!.module_id
    const titleTrim = lessonTitle.trim().slice(0, 120)
    const description = buildLessonDescription()
    const xp = Math.max(0, parseInt(lessonXpReward, 10) || 10)
    const vidSec = Math.max(0, parseInt(lessonVideoDuration, 10) || 0)
    const isActive = asDraft ? false : lessonStatus === "published"

    setIsLessonSubmitting(true)
    try {
      const method = editingLesson ? "PUT" : "POST"
      const body = editingLesson
        ? {
            id: editingLesson.id,
            title: titleTrim,
            description,
            video_url: lessonType === "video" ? (lessonVideoUrl || "").trim() || null : null,
            video_duration_seconds: lessonType === "video" ? vidSec : 0,
            lesson_type: lessonType,
            order_index: editingLesson.order_index,
            xp_reward: xp,
            is_active: asDraft ? false : isActive,
          }
        : {
            module_id: mid,
            title: titleTrim,
            description,
            video_url: lessonType === "video" ? (lessonVideoUrl || "").trim() || null : null,
            video_duration_seconds: lessonType === "video" ? vidSec : 0,
            lesson_type: lessonType,
            order_index: lessons[mid]?.length || 0,
            xp_reward: xp,
            is_active: asDraft ? false : lessonStatus === "published",
          }

      const response = await fetch("/api/learning/lessons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to save lesson")

      toast.success(asDraft ? "Saved as draft" : editingLesson ? "Lesson updated" : "Lesson created")
      fetchCourseData()
      closeLessonDialog()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save lesson")
    } finally {
      setIsLessonSubmitting(false)
    }
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setSelectedModuleId(lesson.module_id)
    setLessonTitle(lesson.title)
    setLessonDescription(lesson.description || "")
    setLessonVideoUrl(lesson.video_url || "")
    setLessonVideoDuration(lesson.video_duration_seconds.toString())
    setLessonType(lesson.lesson_type)
    setLessonOrderIndex(lesson.order_index.toString())
    setLessonXpReward(lesson.xp_reward.toString())
    setLessonStatus(lesson.is_active ? "published" : "draft")
    if (lesson.lesson_type === "code" && lesson.description) {
      try {
        const parsed = JSON.parse(lesson.description) as { language?: string; starterCode?: string; instructions?: string; expectedOutput?: string; solutionCode?: string }
        if (parsed && typeof parsed === "object") {
          setCodeLanguage(parsed.language || "javascript")
          setCodeStarterCode(parsed.starterCode || "")
          setCodeInstructions(parsed.instructions || "")
          setCodeExpectedOutput(parsed.expectedOutput || "")
          setCodeSolutionCode(parsed.solutionCode || "")
        }
      } catch {
        setCodeInstructions(lesson.description)
      }
    } else {
      setCodeLanguage("javascript")
      setCodeStarterCode("")
      setCodeInstructions("")
      setCodeExpectedOutput("")
      setCodeSolutionCode("")
    }
    setLessonWizardStep(1)
    setIsLessonDialogOpen(true)
  }

  const openDeleteLessonConfirm = (lesson: Lesson) => {
    setDeleteLessonTarget(lesson)
    setDeleteLessonOpen(true)
  }

  const confirmDeleteLesson = async () => {
    if (!deleteLessonTarget) return
    const id = deleteLessonTarget.id
    setDeleteLessonOpen(false)
    setDeleteLessonTarget(null)
    try {
      const response = await fetch(`/api/learning/lessons?id=${id}`, { method: "DELETE", credentials: "include" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to delete lesson")
      toast.success("Lesson deleted")
      fetchCourseData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete lesson")
    }
  }

  const closeLessonDialog = () => {
    setIsLessonDialogOpen(false)
    setEditingLesson(null)
    setSelectedModuleId(null)
    setLessonTitle("")
    setLessonDescription("")
    setLessonVideoUrl("")
    setLessonVideoDuration("")
    setLessonType("video")
    setLessonOrderIndex("")
    setLessonXpReward("10")
    setLessonStatus("published")
    setCodeLanguage("javascript")
    setCodeStarterCode("")
    setCodeInstructions("")
    setCodeExpectedOutput("")
    setCodeSolutionCode("")
    setLessonFormErrors({})
    setCancelLessonConfirmOpen(false)
    setLessonWizardStep(1)
  }

  // Quiz CRUD
  const validateQuizForm = (): boolean => {
    const err: Record<string, string> = {}
    if (!editingQuiz && !selectedLessonId) err.lesson = "Please select a lesson"
    const q = quizQuestion.trim()
    if (!q) err.quizQuestion = "Question is required"
    else if (q.length < 2) err.quizQuestion = "Question must be at least 2 characters"
    if (quizType === "multiple_choice") {
      const opts = quizOptions ? quizOptions.split("\n").filter(o => o.trim()) : []
      if (opts.length < 2) err.quizOptions = "Add at least 2 options (one per line)"
      else if (quizCorrectAnswer.trim() && !opts.includes(quizCorrectAnswer.trim())) err.quizCorrectAnswer = "Correct answer must be one of the options above"
    }
    if ((quizType === "short_answer" || quizType === "true_false") && !quizCorrectAnswer.trim()) err.quizCorrectAnswer = "Correct answer is required"
    setQuizFormErrors(err)
    return Object.keys(err).length === 0
  }

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateQuizForm()) return
    if (!selectedLessonId && !editingQuiz) return
    setQuizFormErrors({})
    const lessonId = selectedLessonId ?? editingQuiz!.lesson_id
    const questionTrim = quizQuestion.trim().slice(0, 2000)
    const optionsArray = quizType === "multiple_choice" && quizOptions ? quizOptions.split("\n").filter(o => o.trim()) : null
    const explanationTrim = (quizExplanation || "").trim().slice(0, 2000) || null

    setIsQuizSubmitting(true)
    try {
      const method = editingQuiz ? "PUT" : "POST"
      const body = editingQuiz
        ? {
            id: editingQuiz.id,
            question: questionTrim,
            question_type: quizType,
            options: optionsArray,
            correct_answer: quizCorrectAnswer.trim(),
            explanation: explanationTrim,
            order_index: editingQuiz.order_index,
          }
        : {
            lesson_id: lessonId,
            question: questionTrim,
            question_type: quizType,
            options: optionsArray,
            correct_answer: quizCorrectAnswer.trim(),
            explanation: explanationTrim,
            order_index: quizzes[lessonId]?.length || 0,
          }

      const response = await fetch("/api/learning/quizzes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to save quiz")

      toast.success(editingQuiz ? "Quiz updated" : "Quiz created")
      fetchCourseData()
      closeQuizDialog()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save quiz")
    } finally {
      setIsQuizSubmitting(false)
    }
  }

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setSelectedLessonId(quiz.lesson_id)
    setQuizQuestion(quiz.question)
    setQuizType(quiz.question_type)
    setQuizOptions(quiz.options ? quiz.options.join("\n") : "")
    setQuizCorrectAnswer(quiz.correct_answer)
    setQuizExplanation(quiz.explanation || "")
    setQuizFormErrors({})
    setIsQuizDialogOpen(true)
  }

  const openDeleteQuizConfirm = (quiz: Quiz) => {
    setDeleteQuizTarget(quiz)
    setDeleteQuizOpen(true)
  }

  const confirmDeleteQuiz = async () => {
    if (!deleteQuizTarget) return
    const id = deleteQuizTarget.id
    setDeleteQuizOpen(false)
    setDeleteQuizTarget(null)
    try {
      const response = await fetch(`/api/learning/quizzes?id=${id}`, { method: "DELETE", credentials: "include" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to delete quiz")
      toast.success("Quiz deleted")
      fetchCourseData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete quiz")
    }
  }

  const closeQuizDialog = () => {
    setIsQuizDialogOpen(false)
    setEditingQuiz(null)
    setSelectedLessonId(null)
    setQuizQuestion("")
    setQuizType("multiple_choice")
    setQuizOptions("")
    setQuizCorrectAnswer("")
    setQuizExplanation("")
    setQuizFormErrors({})
  }

  // Task CRUD
  const validateTaskForm = (): boolean => {
    const err: Record<string, string> = {}
    if (!editingTask && !selectedTaskLessonId) err.lesson = "Please select a lesson"
    const t = taskTitle.trim()
    if (!t) err.taskTitle = "Task title is required"
    else if (t.length < 2) err.taskTitle = "Title must be at least 2 characters"
    const inst = taskInstructions.trim()
    if (!inst) err.taskInstructions = "Instructions are required"
    if (taskType === "coding_practice" && taskTestCases.trim()) {
      try {
        const parsed = JSON.parse(taskTestCases)
        if (!Array.isArray(parsed)) err.taskTestCases = "Test cases must be a JSON array"
      } catch {
        err.taskTestCases = "Invalid JSON for test cases"
      }
    }
    setTaskFormErrors(err)
    return Object.keys(err).length === 0
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateTaskForm()) return
    if (!selectedTaskLessonId && !editingTask) return
    setTaskFormErrors({})
    const lessonId = selectedTaskLessonId ?? editingTask!.lesson_id
    const titleTrim = taskTitle.trim().slice(0, 200)
    const instructionsTrim = taskInstructions.trim().slice(0, 5000)
    const expectedTrim = (taskExpectedOutput || "").trim().slice(0, 2000) || null
    let testCasesParsed: unknown = null
    if (taskType === "coding_practice" && taskTestCases.trim()) {
      try { testCasesParsed = JSON.parse(taskTestCases) } catch { /* validated above */ }
    }

    setIsTaskSubmitting(true)
    try {
      const method = editingTask ? "PUT" : "POST"
      const body = editingTask
        ? {
            id: editingTask.id,
            task_type: taskType,
            title: titleTrim,
            instructions: instructionsTrim,
            expected_output: expectedTrim,
            is_required: taskIsRequired,
            ...(taskType === "coding_practice" && {
              programming_language: taskProgrammingLanguage,
              starter_code: (taskStarterCode || "").trim() || null,
              test_cases: testCasesParsed,
              solution_code: (taskSolutionCode || "").trim() || null,
            }),
          }
        : {
            lesson_id: lessonId,
            task_type: taskType,
            title: titleTrim,
            instructions: instructionsTrim,
            expected_output: expectedTrim,
            is_required: taskIsRequired,
            ...(taskType === "coding_practice" && {
              programming_language: taskProgrammingLanguage,
              starter_code: (taskStarterCode || "").trim() || null,
              test_cases: testCasesParsed,
              solution_code: (taskSolutionCode || "").trim() || null,
            }),
          }

      const response = await fetch("/api/learning/tasks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to save task")

      toast.success(editingTask ? "Task updated" : "Task created")
      fetchCourseData()
      closeTaskDialog()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save task")
    } finally {
      setIsTaskSubmitting(false)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setSelectedTaskLessonId(task.lesson_id)
    setTaskType(task.task_type)
    setTaskTitle(task.title)
    setTaskInstructions(task.instructions)
    setTaskExpectedOutput(task.expected_output || "")
    setTaskIsRequired(task.is_required)
    setTaskFormErrors({})
    const ext = task as Task & { programming_language?: string; starter_code?: string; test_cases?: unknown; solution_code?: string }
    setTaskProgrammingLanguage(ext.programming_language || "javascript")
    setTaskStarterCode(ext.starter_code || "")
    setTaskTestCases(ext.test_cases ? JSON.stringify(ext.test_cases, null, 2) : "")
    setTaskSolutionCode(ext.solution_code || "")
    setIsTaskDialogOpen(true)
  }

  const openDeleteTaskConfirm = (task: Task) => {
    setDeleteTaskTarget(task)
    setDeleteTaskOpen(true)
  }

  const confirmDeleteTask = async () => {
    if (!deleteTaskTarget) return
    const id = deleteTaskTarget.id
    setDeleteTaskOpen(false)
    setDeleteTaskTarget(null)
    try {
      const response = await fetch(`/api/learning/tasks?id=${id}`, { method: "DELETE", credentials: "include" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to delete task")
      toast.success("Task deleted")
      fetchCourseData()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete task")
    }
  }

  const closeTaskDialog = () => {
    setIsTaskDialogOpen(false)
    setEditingTask(null)
    setSelectedTaskLessonId(null)
    setTaskType("reflection")
    setTaskTitle("")
    setTaskInstructions("")
    setTaskExpectedOutput("")
    setTaskIsRequired(true)
    setTaskFormErrors({})
    setTaskProgrammingLanguage("javascript")
    setTaskStarterCode("")
    setTaskTestCases("")
    setTaskSolutionCode("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#2596be] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading course data...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Course not found</p>
        <Button onClick={() => router.push("/admin/learning-courses")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/learning-courses")}
              className="text-gray-600 hover:text-[#2596be] hover:bg-[#2596be]/10 transition-all rounded-xl px-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <Button
              onClick={() => {
                setSelectedModuleId(null)
                setModuleTitle("")
                setModuleDescription("")
                setModuleOrderIndex("")
                setIsModuleDialogOpen(true)
              }}
              className="bg-[#2596be] hover:bg-[#1e7a9e] text-white shadow-lg shadow-[#2596be]/25 hover:shadow-xl hover:shadow-[#2596be]/30 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-5 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>

          {/* Course Hero Card – no gradient */}
          <div className="relative overflow-hidden rounded-3xl bg-[#1e3d6e] p-8 sm:p-10 text-white shadow-2xl shadow-black/10 ring-1 ring-white/10">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.07]" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#3c62b3]/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" aria-hidden="true" />
            <div className="relative z-10">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">Course</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-white/90 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
                  {course.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase font-bold tracking-wider">Instructor</p>
                    <p className="text-sm sm:text-base font-semibold text-white">{course.instructor_name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase font-bold tracking-wider">Difficulty</p>
                    <span className="inline-block mt-0.5 px-3 py-1 rounded-full bg-white/25 text-white text-sm font-semibold capitalize">
                      {course.difficulty_level}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase font-bold tracking-wider">Duration</p>
                    <p className="text-sm sm:text-base font-semibold text-white">
                      {Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        {modules.length === 0 ? (
          <Card className="border-2 border-dashed border-[#2596be]/20 rounded-3xl bg-white shadow-lg overflow-hidden">
            <CardContent className="p-16 sm:p-20 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#2596be]/10 ring-4 ring-[#2596be]/10 mb-8">
                <FolderOpen className="h-12 w-12 text-[#2596be]" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">No modules yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-base leading-relaxed">
                Create your first module to organize lessons and start building your course structure
              </p>
              <Button
                onClick={() => {
                  setSelectedModuleId(null)
                  setModuleTitle("")
                  setModuleDescription("")
                  setModuleOrderIndex("")
                  setIsModuleDialogOpen(true)
                }}
                className="bg-[#2596be] hover:bg-[#1e7a9e] text-white shadow-lg shadow-[#2596be]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all rounded-xl h-12 px-8 font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {modules.map((module, moduleIndex) => (
              <Card
                key={module.id}
                className={cn(
                  "rounded-2xl overflow-hidden bg-white transition-all duration-300",
                  "border border-[#2596be]/15 hover:border-[#2596be]/35",
                  "shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-[#2596be]/10 hover:-translate-y-0.5",
                  "ring-1 ring-black/5"
                )}
              >
                <CardHeader className="p-0">
                  <div className="flex items-stretch">
                    <div className="w-1.5 sm:w-2 flex-shrink-0 bg-[#2596be] rounded-l-2xl" aria-hidden="true" />
                    <div className="flex-1 flex items-center justify-between gap-4 p-5 sm:p-6">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="p-2.5 rounded-xl hover:bg-[#2596be]/10 transition-colors shrink-0"
                          aria-label={expandedModules.has(module.id) ? "Collapse module" : "Expand module"}
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="h-5 w-5 text-[#2596be]" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-[#2596be]" />
                          )}
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-[#2596be]/15 flex items-center justify-center shrink-0 ring-2 ring-[#2596be]/10">
                          <FolderOpen className="h-6 w-6 text-[#2596be]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                              {module.title}
                            </CardTitle>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2596be]/10 text-[#2596be] border border-[#2596be]/20">
                              Module {moduleIndex + 1}
                            </span>
                          </div>
                          {module.description && (
                            <CardDescription className="text-gray-600 text-sm mt-0.5 line-clamp-2">
                              {module.description}
                            </CardDescription>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3c62b3]/10 text-[#3c62b3] text-sm font-medium border border-[#3c62b3]/20">
                              <PlayCircle className="h-3.5 w-3.5" />
                              {lessons[module.id]?.length || 0} Lessons
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedModuleId(module.id)
                            setLessonTitle("")
                            setLessonDescription("")
                            setLessonVideoUrl("")
                            setLessonVideoDuration("")
                            setLessonType("video")
                            setLessonOrderIndex("")
                            setLessonXpReward("10")
                            setLessonStatus("published")
                            setLessonWizardStep(1)
                            setIsLessonDialogOpen(true)
                          }}
                          className="bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl font-medium shadow-md"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Add Lesson
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditModule(module)} className="rounded-xl border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openDeleteModuleConfirm(module)} className="rounded-xl text-red-600 hover:bg-red-50 border-red-200">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {expandedModules.has(module.id) && (
                  <CardContent className="p-6 sm:p-8 bg-[#2596be]/[0.03] border-t border-[#2596be]/10">
                    {lessons[module.id] && lessons[module.id].length > 0 ? (
                      <div className="space-y-4">
                        {lessons[module.id].map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className={cn(
                              "rounded-2xl p-5 sm:p-6 bg-white transition-all duration-300",
                              "border border-[#2596be]/15 hover:border-[#2596be]/30",
                              "shadow-md hover:shadow-lg hover:shadow-[#2596be]/5",
                              "ring-1 ring-black/[0.04]"
                            )}
                          >
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <button
                                  onClick={() => toggleLesson(lesson.id)}
                                  className="p-2.5 rounded-xl hover:bg-[#2596be]/10 transition-colors shrink-0"
                                  aria-label={expandedLessons.has(lesson.id) ? "Collapse lesson" : "Expand lesson"}
                                >
                                  {expandedLessons.has(lesson.id) ? (
                                    <ChevronDown className="h-4 w-4 text-[#2596be]" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-[#2596be]" />
                                  )}
                                </button>
                                <div className="w-11 h-11 rounded-xl bg-[#2596be]/15 flex items-center justify-center shrink-0 ring-2 ring-[#2596be]/10">
                                  <PlayCircle className="h-5 w-5 text-[#2596be]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">{lesson.title}</h4>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3c62b3]/10 text-[#3c62b3] border border-[#3c62b3]/20">
                                      {lesson.xp_reward} XP
                                    </span>
                                  </div>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{lesson.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#2596be]/10 text-[#2596be] border border-[#2596be]/15">
                                      <HelpCircle className="h-3 w-3" />
                                      {quizzes[lesson.id]?.length || 0} Quizzes
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                      <FileText className="h-3 w-3" />
                                      {tasks[lesson.id]?.length || 0} Tasks
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLessonId(lesson.id)
                                    setQuizQuestion("")
                                    setQuizType("multiple_choice")
                                    setQuizOptions("")
                                    setQuizCorrectAnswer("")
                                    setQuizExplanation("")
                                    setIsQuizDialogOpen(true)
                                  }}
                                  className="rounded-xl border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10 font-medium"
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                                  Quiz
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTaskLessonId(lesson.id)
                                    setTaskType("reflection")
                                    setTaskTitle("")
                                    setTaskInstructions("")
                                    setTaskExpectedOutput("")
                                    setTaskIsRequired(true)
                                    setIsTaskDialogOpen(true)
                                  }}
                                  className="rounded-xl border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 font-medium"
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                                  Task
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleEditLesson(lesson)} className="rounded-xl border-gray-300 hover:bg-gray-50">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openDeleteLessonConfirm(lesson)} className="rounded-xl text-red-600 hover:bg-red-50 border-red-200">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {expandedLessons.has(lesson.id) && (
                              <div className="pl-12 space-y-4 mt-4 border-t border-gray-200 pt-4">
                                {/* Quizzes Section */}
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 rounded-lg bg-blue-100">
                                      <HelpCircle className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <h5 className="text-base font-bold text-gray-900">
                                      Quizzes ({quizzes[lesson.id]?.length || 0})
                                    </h5>
                                  </div>
                                  {quizzes[lesson.id] && quizzes[lesson.id].length > 0 ? (
                                    <div className="space-y-3">
                                      {quizzes[lesson.id].map((quiz, quizIndex) => (
                                        <div
                                          key={quiz.id}
                                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all"
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm mt-0.5">
                                                {quizIndex + 1}
                                              </div>
                                              <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900 mb-1">{quiz.question}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                                  <Badge variant="outline" className="text-xs">
                                                    {quiz.question_type.replace('_', ' ')}
                                                  </Badge>
                                                  <span className="text-gray-500">Answer: <span className="font-semibold text-green-700">{quiz.correct_answer}</span></span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 ml-4">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleEditQuiz(quiz)}
                                              className="hover:bg-blue-50"
                                            >
                                              <Edit className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => openDeleteQuizConfirm(quiz)}
                                              className="hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No quizzes yet. Click "+ Quiz" to add one.</p>
                                  )}
                                </div>

                                {/* Tasks Section */}
                                <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 rounded-lg bg-green-100">
                                      <FileText className="h-5 w-5 text-green-700" />
                                    </div>
                                    <h5 className="text-base font-bold text-gray-900">
                                      Tasks ({tasks[lesson.id]?.length || 0})
                                    </h5>
                                  </div>
                                  {tasks[lesson.id] && tasks[lesson.id].length > 0 ? (
                                    <div className="space-y-3">
                                      {tasks[lesson.id].map((task, taskIndex) => (
                                        <div
                                          key={task.id}
                                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200 hover:border-green-300 hover:shadow-md transition-all"
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm mt-0.5">
                                                {taskIndex + 1}
                                              </div>
                                              <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900 mb-1">{task.title}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                                  <Badge variant="outline" className="text-xs">
                                                    {task.task_type}
                                                  </Badge>
                                                  <span className={task.is_required ? "text-green-700 font-semibold" : "text-gray-500"}>
                                                    {task.is_required ? "Required" : "Optional"}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 ml-4">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleEditTask(task)}
                                              className="hover:bg-green-50"
                                            >
                                              <Edit className="h-4 w-4 text-green-600" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => openDeleteTaskConfirm(task)}
                                              className="hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No tasks yet. Click "+ Task" to add one.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-14 rounded-2xl border-2 border-dashed border-[#2596be]/20 bg-[#2596be]/5">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#2596be]/15 ring-4 ring-[#2596be]/10 mb-5">
                          <PlayCircle className="h-10 w-10 text-[#2596be]" />
                        </div>
                        <p className="text-gray-700 mb-2 font-semibold">No lessons in this module</p>
                        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Add your first lesson to start building content.</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedModuleId(module.id)
                            setLessonTitle("")
                            setLessonDescription("")
                            setLessonVideoUrl("")
                            setLessonVideoDuration("")
                            setLessonType("video")
                            setLessonOrderIndex("")
                            setLessonXpReward("10")
                            setLessonStatus("published")
                            setLessonWizardStep(1)
                            setIsLessonDialogOpen(true)
                          }}
                          className="bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl font-medium shadow-md"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Lesson
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={(open) => { setIsModuleDialogOpen(open); if (!open) setModuleFormErrors({}); }}>
        <DialogContent className="sm:max-w-[500px] border-[#2596be]/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
            <DialogDescription>Add a module to organize lessons in this course</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateModule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moduleTitle">Module Title <span className="text-red-600">*</span></Label>
              <Input
                id="moduleTitle"
                value={moduleTitle}
                onChange={(e) => { setModuleTitle(e.target.value); setModuleFormErrors((p) => ({ ...p, moduleTitle: "" })); }}
                placeholder="e.g. Introduction to JavaScript"
                maxLength={200}
                required
                className={moduleFormErrors.moduleTitle ? "border-red-500 focus:ring-red-500" : "focus:ring-2 focus:ring-[#2596be] border-gray-200"}
                aria-invalid={!!moduleFormErrors.moduleTitle}
              />
              {moduleFormErrors.moduleTitle && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{moduleFormErrors.moduleTitle}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleDescription">Description</Label>
              <Textarea
                id="moduleDescription"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Brief description of this module"
                rows={3}
                maxLength={2000}
                className="resize-none focus:ring-2 focus:ring-[#2596be] border-gray-200"
              />
              <p className="text-xs text-gray-500">{moduleDescription.length} / 2000</p>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={closeModuleDialog} disabled={isModuleSubmitting} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isModuleSubmitting} className="flex-1 bg-[#2596be] hover:bg-[#1e7a9e] text-white font-semibold disabled:opacity-70">
                {isModuleSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : editingModule ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Creation Wizard – beautiful, interactive, step-by-step */}
      <Dialog open={isLessonDialogOpen} onOpenChange={(open) => { setIsLessonDialogOpen(open); if (!open) { setLessonFormErrors({}); setCancelLessonConfirmOpen(false); setLessonWizardStep(1); } }}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-hidden p-0 border-0 shadow-2xl rounded-2xl bg-white">
          {/* Wizard header + stepper — clean, no heavy color */}
          <div className="rounded-t-2xl border-b border-gray-200 bg-white px-6 pt-5 pb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                <PenLine className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-gray-900">
                  {editingLesson ? "Edit Lesson" : "Create New Lesson"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-gray-500 text-sm">
                  Step {lessonWizardStep} of 4 — Professional LMS wizard
                </DialogDescription>
              </div>
            </div>
            {/* Stepper */}
            <div className="flex items-center gap-0">
              {[
                { step: 1, label: "Basic info", icon: FolderOpen },
                { step: 2, label: "Type & XP", icon: PlayCircle },
                { step: 3, label: "Content", icon: FileText },
                { step: 4, label: "Publish", icon: CheckCircle2 },
              ].map(({ step, label, icon: Icon }, i) => (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => step < lessonWizardStep && setLessonWizardStep(step)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 transition-all duration-300 rounded-lg py-2 px-1 min-w-0",
                      lessonWizardStep === step && "ring-2 ring-[#2596be]/40 ring-offset-2 ring-offset-white",
                      lessonWizardStep > step && "cursor-pointer hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold text-sm transition-all duration-300",
                      lessonWizardStep > step && "bg-[#2596be]/10 border-[#2596be]/30 text-[#2596be]",
                      lessonWizardStep === step && "bg-[#2596be] text-white border-[#2596be] shadow-md scale-105",
                      lessonWizardStep < step && "bg-slate-100 border-slate-200 text-slate-400"
                    )}>
                      {lessonWizardStep > step ? <CheckCircle2 className="h-5 w-5 text-[#2596be]" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={cn("text-[10px] sm:text-xs font-semibold truncate w-full text-center", lessonWizardStep === step ? "text-gray-900" : lessonWizardStep > step ? "text-gray-600" : "text-gray-400")}>{label}</span>
                  </button>
                  {i < 3 && (
                    <div className={cn("flex-1 h-0.5 mx-0.5 rounded-full transition-all duration-300", lessonWizardStep > step ? "bg-[#2596be]/30" : "bg-slate-200")} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (lessonWizardStep < 4) { const ok = lessonWizardStep === 1 ? (selectedModuleId || editingLesson) && lessonTitle.trim().length >= 5 && lessonTitle.trim().length <= 120 : true; if (ok) setLessonWizardStep(lessonWizardStep + 1); else validateLessonForm(); } else handleCreateLesson(e, false); }} className="flex flex-col max-h-[calc(90vh-200px)]">
            <div className="flex-1 overflow-y-auto px-6 py-6 min-h-[280px]">
              {/* Step 1: Basic info */}
              {lessonWizardStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-[#2596be]" />
                    Basic info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {!editingLesson && (
                      <div className="space-y-2 sm:col-span-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="lessonModule" className="text-sm font-semibold text-gray-700">Module <span className="text-red-500">*</span></Label>
                          <Button type="button" variant="outline" size="sm" className="h-8 text-xs rounded-xl border-white bg-white/10 text-white hover:bg-white/20 border-white/30" onClick={() => { setIsLessonDialogOpen(false); setIsModuleDialogOpen(true); }}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Create new module
                          </Button>
                        </div>
                        <Select value={selectedModuleId?.toString() || ""} onValueChange={(v) => { setSelectedModuleId(Number(v)); setLessonFormErrors((p) => ({ ...p, module: "" })); }}>
                          <SelectTrigger className={cn("h-11 rounded-xl border-gray-200 bg-white", lessonFormErrors.module ? "border-red-500 ring-1 ring-red-500/20" : "focus:ring-2 focus:ring-[#2596be]")}>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            {modules.map((m) => (
                              <SelectItem key={m.id} value={m.id.toString()}>{m.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {lessonFormErrors.module && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{lessonFormErrors.module}</p>}
                      </div>
                    )}
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="lessonTitle" className="text-sm font-semibold text-gray-700">Lesson title <span className="text-red-500">*</span></Label>
                      <Input
                        id="lessonTitle"
                        value={lessonTitle}
                        onChange={(e) => { setLessonTitle(e.target.value); setLessonFormErrors((p) => ({ ...p, lessonTitle: "" })); }}
                        placeholder="e.g. Variables and Data Types (5–120 chars)"
                        maxLength={120}
                        className={cn("h-11 rounded-xl border-gray-200 bg-white", lessonFormErrors.lessonTitle ? "border-red-500 ring-1 ring-red-500/20" : "focus:ring-2 focus:ring-[#2596be]")}
                      />
                      <p className="text-xs text-gray-500">{lessonTitle.length} / 120 — min 5 characters</p>
                      {lessonFormErrors.lessonTitle && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{lessonFormErrors.lessonTitle}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lessonDescription" className="text-sm font-semibold text-gray-700">Description (learning outcomes)</Label>
                    <Textarea
                      id="lessonDescription"
                      value={lessonDescription}
                      onChange={(e) => setLessonDescription(e.target.value)}
                      placeholder="• What will students learn? Bullet points supported. Markdown for reading lessons."
                      rows={4}
                      maxLength={5000}
                      className="resize-none rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#2596be]"
                    />
                    <p className="text-xs text-gray-500">{lessonDescription.length} / 5000</p>
                  </div>
                </div>
              )}

              {/* Step 2: Lesson type + XP */}
              {lessonWizardStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-[#2596be]" />
                    Lesson type
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { value: "video", label: "Video", icon: Video },
                      { value: "reading", label: "Reading", icon: BookOpen },
                      { value: "interactive", label: "Interactive", icon: Lightbulb },
                      { value: "code", label: "Code", icon: Code },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLessonTypeAndXp(value)}
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-2xl border-2 py-5 px-4 transition-all duration-200",
                          lessonType === value
                            ? "border-[#2596be] bg-[#2596be]/15 text-[#2596be] shadow-lg shadow-[#2596be]/20 scale-[1.02]"
                            : "border-gray-200 bg-slate-50 text-gray-600 hover:border-[#2596be]/50 hover:bg-[#2596be]/5 hover:scale-[1.01]"
                        )}
                      >
                        <Icon className="h-7 w-7" />
                        <span className="text-sm font-bold">{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 p-4">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
                      <Award className="h-4 w-4 text-amber-600" />
                      XP reward
                    </h4>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="lessonXpReward" className="text-sm font-semibold text-gray-700 shrink-0">XP</Label>
                      <Input
                        id="lessonXpReward"
                        type="number"
                        value={lessonXpReward}
                        onChange={(e) => { setLessonXpReward(e.target.value); setLessonFormErrors((p) => ({ ...p, lessonXpReward: "" })); }}
                        min={0}
                        className={cn("h-11 rounded-xl border-gray-200 bg-white w-28", lessonFormErrors.lessonXpReward ? "border-red-500" : "focus:ring-2 focus:ring-[#2596be]")}
                      />
                      <span className="text-xs text-gray-600">Auto by type — editable</span>
                    </div>
                    {lessonFormErrors.lessonXpReward && <p className="text-xs text-red-600 flex items-center gap-1 mt-2"><AlertTriangle className="h-3.5 w-3.5" />{lessonFormErrors.lessonXpReward}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Content by type */}
              {lessonWizardStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {lessonType === "video" && (
                <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/30 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-sky-700 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video lesson
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="lessonVideoUrl" className="text-sm font-semibold text-gray-700">Video URL <span className="text-red-500">*</span></Label>
                      <Input
                        id="lessonVideoUrl"
                        value={lessonVideoUrl}
                        onChange={(e) => { setLessonVideoUrl(e.target.value); setLessonFormErrors((p) => ({ ...p, lessonVideoUrl: "" })); }}
                        placeholder="YouTube, Vimeo, or any video URL..."
                        className={cn("h-10 rounded-xl border-gray-200 bg-white", lessonFormErrors.lessonVideoUrl ? "border-red-500 ring-1 ring-red-500/20" : "focus:ring-2 focus:ring-[#2596be]")}
                      />
                      {lessonFormErrors.lessonVideoUrl && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{lessonFormErrors.lessonVideoUrl}</p>}
                      <p className="text-xs text-gray-500">Accepts any http(s) URL. Title/thumbnail/duration can be fetched later.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lessonVideoDuration" className="text-sm font-semibold text-gray-700">Duration (sec)</Label>
                      <Input id="lessonVideoDuration" type="number" value={lessonVideoDuration} onChange={(e) => setLessonVideoDuration(e.target.value)} min={0} placeholder="0" className="h-10 rounded-xl border-gray-200 bg-white w-28 focus:ring-2 focus:ring-[#2596be]" />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4B: Reading lesson */}
              {lessonType === "reading" && (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Reading content
                  </h3>
                  <Textarea
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    placeholder="Use markdown: **bold**, ## headings, ```code blocks```, [links](url), images. Learning outcomes above."
                    rows={6}
                    maxLength={5000}
                    className="resize-none rounded-xl border-gray-200 bg-white font-mono text-sm focus:ring-2 focus:ring-[#2596be]"
                  />
                  <p className="text-xs text-gray-500">Headings, code blocks, images, links supported.</p>
                </div>
              )}

              {/* SECTION 4C: Interactive lesson */}
              {lessonType === "interactive" && (
                <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/30 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Interactive
                  </h3>
                  <Textarea
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    placeholder="Describe the quiz/practice. After creating the lesson, add Quizzes and Tasks below."
                    rows={3}
                    maxLength={5000}
                    className="resize-none rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#2596be]"
                  />
                  <p className="text-xs text-amber-700">Add quizzes and tasks from the lesson card after saving.</p>
                </div>
              )}

              {/* SECTION 4D: Code lesson */}
              {lessonType === "code" && (
                <div className="space-y-4 rounded-xl border border-violet-200 bg-violet-50/30 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-violet-700 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Code lesson
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Programming language</Label>
                      <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                        <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#2596be]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Instructions / problem <span className="text-red-500">*</span></Label>
                    <Textarea
                      value={codeInstructions}
                      onChange={(e) => { setCodeInstructions(e.target.value); setLessonFormErrors((p) => ({ ...p, codeInstructions: "" })); }}
                      placeholder="Describe the coding task and what students must implement."
                      rows={3}
                      className={cn("resize-none rounded-xl border-gray-200 bg-white", lessonFormErrors.codeInstructions ? "border-red-500" : "focus:ring-2 focus:ring-[#2596be]")}
                    />
                    {lessonFormErrors.codeInstructions && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{lessonFormErrors.codeInstructions}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Starter code</Label>
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-[#1e1e1e]">
                      <CodeEditor value={codeStarterCode} onChange={(v) => setCodeStarterCode(v ?? "")} language={codeLanguage} height="200px" theme="vs-dark" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Expected output / test cases</Label>
                    <Textarea value={codeExpectedOutput} onChange={(e) => setCodeExpectedOutput(e.target.value)} placeholder="Describe expected output or paste test cases." rows={2} className="resize-none rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#2596be]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Solution code <span className="text-gray-400 text-xs">(hidden from students)</span></Label>
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-[#1e1e1e]">
                      <CodeEditor value={codeSolutionCode} onChange={(v) => setCodeSolutionCode(v ?? "")} language={codeLanguage} height="160px" theme="vs-dark" />
                    </div>
                  </div>
                </div>
              )}
                </div>
              )}

              {/* Step 4: Visibility & publish */}
              {lessonWizardStep === 4 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#2596be]" />
                    Visibility &amp; status
                  </h3>
                  <div className="flex flex-wrap items-center gap-6 rounded-2xl border-2 border-[#2596be]/20 bg-[#2596be]/5 p-5">
                    <div className="flex items-center gap-3">
                      <input type="radio" id="lessonStatusPublished" name="lessonStatus" checked={lessonStatus === "published"} onChange={() => setLessonStatus("published")} className="h-4 w-4 rounded-full border-2 border-[#2596be] text-[#2596be focus:ring-[#2596be]" />
                      <Label htmlFor="lessonStatusPublished" className="text-sm font-semibold cursor-pointer">Published</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="radio" id="lessonStatusDraft" name="lessonStatus" checked={lessonStatus === "draft"} onChange={() => setLessonStatus("draft")} className="h-4 w-4 rounded-full border-2 border-[#2596be] text-[#2596be focus:ring-[#2596be]" />
                      <Label htmlFor="lessonStatusDraft" className="text-sm font-semibold cursor-pointer">Draft</Label>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Choose &quot;Create lesson&quot; to publish or save as draft.</p>
                </div>
              )}
            </div>

            {/* Wizard footer: Back / Next or Cancel / Save draft / Create */}
            <div className="shrink-0 flex flex-wrap items-center gap-3 px-6 py-4 border-t border-gray-200 bg-slate-50 rounded-b-2xl">
              {lessonWizardStep < 4 ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setLessonWizardStep((s) => Math.max(1, s - 1))} disabled={lessonWizardStep === 1} className="h-11 rounded-xl border-gray-300 font-semibold px-5">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={lessonWizardStep === 1 && ((!selectedModuleId && !editingLesson) || lessonTitle.trim().length < 5 || lessonTitle.trim().length > 120)}
                    className="ml-auto h-11 rounded-xl bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#1e7a9e] hover:to-[#2d4a8a] text-white font-semibold shadow-lg shadow-[#2596be]/25 px-8 disabled:opacity-60"
                  >
                    Next step
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => setLessonWizardStep(3)} disabled={isLessonSubmitting} className="h-11 rounded-xl border-gray-300 font-semibold px-5">
                    Back
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setCancelLessonConfirmOpen(true)} disabled={isLessonSubmitting} className="h-11 rounded-xl border-gray-300 font-semibold hover:border-red-200 hover:text-red-600 px-5">
                    Cancel
                  </Button>
                  <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); handleCreateLesson(e, true); }} disabled={isLessonSubmitting || (!selectedModuleId && !editingLesson) || lessonTitle.trim().length < 5} className="h-11 rounded-xl border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 px-5">
                    {isLessonSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save as draft
                  </Button>
                  <Button type="submit" disabled={isLessonSubmitting || !isLessonFormValidForPublish()} className="h-11 rounded-xl bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#1e7a9e] hover:to-[#2d4a8a] text-white font-semibold shadow-lg shadow-[#2596be]/25 px-8 disabled:opacity-60">
                    {isLessonSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : editingLesson ? "Update lesson" : "Create lesson"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel lesson confirmation */}
      <Dialog open={cancelLessonConfirmOpen} onOpenChange={setCancelLessonConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-5 w-5" /> Discard changes?</DialogTitle>
            <DialogDescription>Your lesson changes will not be saved. Are you sure?</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setCancelLessonConfirmOpen(false)}>Keep editing</Button>
            <Button variant="destructive" className="flex-1" onClick={() => { setCancelLessonConfirmOpen(false); closeLessonDialog(); }}>Discard</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Module confirmation */}
      <Dialog open={deleteModuleOpen} onOpenChange={setDeleteModuleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" /> Delete module?</DialogTitle>
            <DialogDescription>Are you sure you want to delete &quot;{deleteModuleTarget?.title}&quot;? All lessons in this module will also be deleted. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setDeleteModuleOpen(false); setDeleteModuleTarget(null); }}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDeleteModule}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Lesson confirmation */}
      <Dialog open={deleteLessonOpen} onOpenChange={setDeleteLessonOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" /> Delete lesson?</DialogTitle>
            <DialogDescription>Are you sure you want to delete &quot;{deleteLessonTarget?.title}&quot;? All quizzes and tasks in this lesson will also be deleted. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setDeleteLessonOpen(false); setDeleteLessonTarget(null); }}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDeleteLesson}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={(open) => { setIsQuizDialogOpen(open); if (!open) setQuizFormErrors({}); }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl bg-white">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingQuiz ? "Edit Quiz Question" : "Create New Quiz Question"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a quiz question to test student understanding
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateQuiz} className="space-y-5 pt-4">
            {!editingQuiz && (
              <div className="space-y-2">
                <Label htmlFor="quizLesson" className="text-sm font-semibold text-gray-700">
                  Lesson <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={selectedLessonId?.toString() || ""}
                  onValueChange={(v) => { setSelectedLessonId(Number(v)); setQuizFormErrors((p) => ({ ...p, lesson: "" })); }}
                >
                  <SelectTrigger className={cn("h-11 rounded-xl border-gray-300 bg-white shadow-sm", quizFormErrors.lesson ? "border-red-500 ring-1 ring-red-500/20" : "focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}>
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(lessons)
                      .flat()
                      .map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()}>{l.title}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {quizFormErrors.lesson && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{quizFormErrors.lesson}</p>}
              </div>
            )}

            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="quizQuestion" className="text-sm font-semibold text-gray-700">
                Question <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="quizQuestion"
                value={quizQuestion}
                onChange={(e) => { setQuizQuestion(e.target.value); setQuizFormErrors((p) => ({ ...p, quizQuestion: "" })); }}
                placeholder="Enter your question here..."
                rows={4}
                maxLength={2000}
                className={cn("resize-none rounded-xl border-gray-300", quizFormErrors.quizQuestion ? "border-red-500 ring-1 ring-red-500/20" : "focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}
                aria-invalid={!!quizFormErrors.quizQuestion}
              />
              {quizFormErrors.quizQuestion && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{quizFormErrors.quizQuestion}</p>}
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label htmlFor="quizType" className="text-sm font-semibold text-gray-700">
                Question Type
              </Label>
              <Select value={quizType} onValueChange={setQuizType}>
                <SelectTrigger className="h-11 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Multiple Choice Options */}
            {quizType === "multiple_choice" && (
              <div className="space-y-3 p-5 rounded-xl bg-[#2596be]/5 border border-[#2596be]/20">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="h-5 w-5 text-[#2596be]" />
                  <Label htmlFor="quizOptions" className="text-sm font-semibold text-gray-700">
                    Answer Options <span className="text-red-600">*</span>
                  </Label>
                </div>
                <Textarea
                  id="quizOptions"
                  value={quizOptions}
                  onChange={(e) => { setQuizOptions(e.target.value); setQuizFormErrors((p) => ({ ...p, quizOptions: "" })); }}
                  placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                  rows={6}
                  className={cn("resize-none rounded-xl text-base border bg-white font-mono text-sm", quizFormErrors.quizOptions ? "border-red-500 ring-1 ring-red-500/20" : "border-[#2596be]/30 focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}
                  aria-invalid={!!quizFormErrors.quizOptions}
                />
                {quizFormErrors.quizOptions && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{quizFormErrors.quizOptions}</p>}
                <div className="flex items-start gap-2 text-xs text-gray-600 bg-white/80 p-3 rounded-lg border border-[#2596be]/10">
                  <span className="text-[#2596be] font-semibold">Tip:</span>
                  <span>Enter each option on a new line (Option A, Option B, …).</span>
                </div>
              </div>
            )}

            {/* Correct Answer */}
            <div className="space-y-3">
              <Label htmlFor="quizCorrectAnswer" className="text-sm font-semibold text-gray-700">
                Correct Answer <span className="text-red-600">*</span>
              </Label>
              
              {quizType === "multiple_choice" && quizOptions ? (
                <Select
                  value={quizCorrectAnswer}
                  onValueChange={(v) => { setQuizCorrectAnswer(v); setQuizFormErrors((p) => ({ ...p, quizCorrectAnswer: "" })); }}
                >
                  <SelectTrigger className={cn("h-11 rounded-xl text-base bg-white", quizFormErrors.quizCorrectAnswer ? "border-red-500 ring-1 ring-red-500/20" : "border-[#2596be]/30 focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}>
                    <SelectValue placeholder="Select the correct answer from options above" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizOptions
                      .split("\n")
                      .filter((opt) => opt.trim())
                      .map((option, index) => (
                        <SelectItem key={index} value={option.trim()} className="text-base py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#2596be]/15 flex items-center justify-center text-[#2596be] font-semibold text-sm">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span>{option.trim()}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : quizType === "true_false" ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setQuizCorrectAnswer("True")}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      quizCorrectAnswer === "True"
                        ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
                        : "bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        quizCorrectAnswer === "True"
                          ? "bg-white/20 text-white"
                          : "bg-green-100 text-green-600"
                      }`}>
                        ✓
                      </div>
                      <span className="text-lg font-bold">True</span>
                      <span className={`text-xs ${quizCorrectAnswer === "True" ? "text-white/90" : "text-gray-500"}`}>
                        This statement is correct
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizCorrectAnswer("False")}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      quizCorrectAnswer === "False"
                        ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30 scale-105"
                        : "bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        quizCorrectAnswer === "False"
                          ? "bg-white/20 text-white"
                          : "bg-red-100 text-red-600"
                      }`}>
                        ✗
                      </div>
                      <span className="text-lg font-bold">False</span>
                      <span className={`text-xs ${quizCorrectAnswer === "False" ? "text-white/90" : "text-gray-500"}`}>
                        This statement is incorrect
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <Input
                  id="quizCorrectAnswer"
                  value={quizCorrectAnswer}
                  onChange={(e) => { setQuizCorrectAnswer(e.target.value); setQuizFormErrors((p) => ({ ...p, quizCorrectAnswer: "" })); }}
                  placeholder="Enter the correct answer"
                  className={cn("h-11 rounded-xl text-base border-gray-300", quizFormErrors.quizCorrectAnswer ? "border-red-500 ring-1 ring-red-500/20" : "focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}
                  aria-invalid={!!quizFormErrors.quizCorrectAnswer}
                />
              )}
              {quizFormErrors.quizCorrectAnswer && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{quizFormErrors.quizCorrectAnswer}</p>}
              {quizType === "multiple_choice" && !quizOptions?.trim() && !quizFormErrors.quizCorrectAnswer && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Add options above first, then select the correct one
                </p>
              )}
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label htmlFor="quizExplanation" className="text-sm font-semibold text-gray-700">
                Explanation <span className="text-gray-400 text-xs">(Optional)</span>
              </Label>
              <Textarea
                id="quizExplanation"
                value={quizExplanation}
                onChange={(e) => setQuizExplanation(e.target.value)}
                placeholder="Explain why this answer is correct. This will be shown to students after they answer."
                rows={3}
                maxLength={2000}
                className="resize-none rounded-xl focus:ring-2 focus:ring-[#2596be] border-gray-300"
              />
              <p className="text-xs text-gray-500">{quizExplanation.length} / 2000 — helps students learn from mistakes</p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={closeQuizDialog}
                disabled={isQuizSubmitting}
                className="flex-1 h-11 rounded-xl border-gray-300 hover:bg-gray-50 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isQuizSubmitting}
                className="flex-1 h-11 rounded-xl bg-[#2596be] hover:bg-[#1e7a9e] text-white shadow-lg shadow-[#2596be]/25 font-semibold disabled:opacity-70"
              >
                {isQuizSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                ) : editingQuiz ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Update Quiz</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" /> Create Quiz</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Quiz confirmation */}
      <Dialog open={deleteQuizOpen} onOpenChange={setDeleteQuizOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" /> Delete quiz?</DialogTitle>
            <DialogDescription>Are you sure you want to delete this quiz question? &quot;{deleteQuizTarget?.question ? (deleteQuizTarget.question.length > 80 ? deleteQuizTarget.question.slice(0, 80) + "…" : deleteQuizTarget.question) : ""}&quot; — This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setDeleteQuizOpen(false); setDeleteQuizTarget(null); }}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDeleteQuiz}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={(open) => { setIsTaskDialogOpen(open); if (!open) setTaskFormErrors({}); }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl bg-white">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900">{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription className="text-gray-600">Add a task or reflection prompt to this lesson</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-5 pt-4">
            {!editingTask && (
              <div className="space-y-2">
                <Label htmlFor="taskLesson" className="text-sm font-semibold text-gray-700">Lesson <span className="text-red-600">*</span></Label>
                <Select
                  value={selectedTaskLessonId?.toString() || ""}
                  onValueChange={(v) => { setSelectedTaskLessonId(Number(v)); setTaskFormErrors((p) => ({ ...p, lesson: "" })); }}
                >
                  <SelectTrigger className={cn("h-11 rounded-xl border-gray-300 bg-white shadow-sm", taskFormErrors.lesson ? "border-red-500 ring-1 ring-red-500/20" : "focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}>
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(lessons)
                      .flat()
                      .map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()}>{l.title}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {taskFormErrors.lesson && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{taskFormErrors.lesson}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="taskType" className="text-sm font-semibold text-gray-700">Task Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger className="h-11 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reflection">Reflection</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="coding_practice">Coding Practice</SelectItem>
                  <SelectItem value="submission">Submission</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Coding Practice Fields - Compact with Tabs */}
            {taskType === "coding_practice" && (
              <div className="space-y-4">
                {/* Language Selection - Always Visible */}
                <div className="space-y-2 p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <Label htmlFor="taskProgrammingLanguage" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Code className="h-4 w-4 text-purple-600" />
                    Programming Language <span className="text-red-600">*</span>
                  </Label>
                  <Select value={taskProgrammingLanguage} onValueChange={setTaskProgrammingLanguage}>
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="c">C</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabs for Organized Sections */}
                <Tabs defaultValue="basics" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basics" className="text-xs sm:text-sm">
                      <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Basics
                    </TabsTrigger>
                    <TabsTrigger value="code" className="text-xs sm:text-sm">
                      <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="text-xs sm:text-sm">
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Advanced
                    </TabsTrigger>
                  </TabsList>

                  {/* Basics Tab - Instructions & Output */}
                  <TabsContent value="basics" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="taskInstructions" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        Instructions for Students <span className="text-red-600">*</span>
                      </Label>
                      <Textarea
                        id="taskInstructions"
                        value={taskInstructions}
                        onChange={(e) => { setTaskInstructions(e.target.value); setTaskFormErrors((p) => ({ ...p, taskInstructions: "" })); }}
                        placeholder={
                          taskProgrammingLanguage === "html"
                            ? "Example: Create a webpage with a header, navigation menu, and footer. Use semantic HTML5 elements."
                            : taskProgrammingLanguage === "css"
                            ? "Example: Style the provided HTML to create a responsive layout with a centered container, colorful buttons, and smooth animations."
                            : taskProgrammingLanguage === "javascript"
                            ? "Example: Write a function that takes an array of numbers and returns the sum of all even numbers."
                            : taskProgrammingLanguage === "python"
                            ? "Example: Write a function that calculates the factorial of a number using recursion."
                            : taskProgrammingLanguage === "java"
                            ? "Example: Create a class that implements a calculator with methods for addition, subtraction, multiplication, and division."
                            : taskProgrammingLanguage === "cpp"
                            ? "Example: Write a program that reads numbers from input and finds the maximum value."
                            : taskProgrammingLanguage === "c"
                            ? "Example: Write a function that reverses a string without using library functions."
                            : taskProgrammingLanguage === "php"
                            ? "Example: Create a function that validates an email address and returns true or false."
                            : taskProgrammingLanguage === "ruby"
                            ? "Example: Write a method that takes an array and returns only the unique elements."
                            : taskProgrammingLanguage === "go"
                            ? "Example: Create a function that takes a slice of integers and returns the average."
                            : taskProgrammingLanguage === "rust"
                            ? "Example: Write a function that calculates the Fibonacci sequence up to n terms."
                            : taskProgrammingLanguage === "typescript"
                            ? "Example: Create an interface and a class that implements it with type safety."
                            : "Provide clear step-by-step instructions for students to solve this problem..."
                        }
                        rows={4}
                        maxLength={5000}
                        className={cn("resize-none rounded-xl text-sm border", taskFormErrors.taskInstructions ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-300 focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}
                        aria-invalid={!!taskFormErrors.taskInstructions}
                      />
                      {taskFormErrors.taskInstructions && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{taskFormErrors.taskInstructions}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taskExpectedOutput" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Expected Output <span className="text-gray-400 text-xs">(Optional)</span>
                      </Label>
                      <Textarea
                        id="taskExpectedOutput"
                        value={taskExpectedOutput}
                        onChange={(e) => setTaskExpectedOutput(e.target.value)}
                        placeholder={
                          taskProgrammingLanguage === "html"
                            ? "Example: A complete HTML page with proper structure, semantic elements, and accessibility features."
                            : taskProgrammingLanguage === "css"
                            ? "Example: A styled page with responsive design, smooth transitions, and modern UI elements."
                            : taskProgrammingLanguage === "javascript"
                            ? "Example: Function returns 30 when given [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                            : taskProgrammingLanguage === "python"
                            ? "Example: factorial(5) returns 120"
                            : taskProgrammingLanguage === "java"
                            ? "Example: Calculator.add(5, 3) returns 8"
                            : taskProgrammingLanguage === "cpp"
                            ? "Example: Program outputs 'Maximum: 42' when given [10, 42, 5, 20]"
                            : taskProgrammingLanguage === "c"
                            ? "Example: reverseString('hello') returns 'olleh'"
                            : taskProgrammingLanguage === "php"
                            ? "Example: validateEmail('test@example.com') returns true"
                            : taskProgrammingLanguage === "ruby"
                            ? "Example: unique([1, 2, 2, 3]) returns [1, 2, 3]"
                            : taskProgrammingLanguage === "go"
                            ? "Example: average([10, 20, 30]) returns 20"
                            : taskProgrammingLanguage === "rust"
                            ? "Example: fibonacci(5) returns [0, 1, 1, 2, 3]"
                            : taskProgrammingLanguage === "typescript"
                            ? "Example: Class implements interface correctly with proper types"
                            : "Describe what the final output or result should look like..."
                        }
                        rows={3}
                        className="resize-none text-sm focus:ring-2 focus:ring-green-500 border-gray-300"
                      />
                    </div>
                  </TabsContent>

                  {/* Code Tab - Starter Code */}
                  <TabsContent value="code" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="taskStarterCode" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-amber-600" />
                        Initial Code Template <span className="text-gray-400 text-xs">(Optional)</span>
                      </Label>
                      <Textarea
                        id="taskStarterCode"
                        value={taskStarterCode}
                        onChange={(e) => setTaskStarterCode(e.target.value)}
                        placeholder={
                          taskProgrammingLanguage === "html"
                            ? "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Your Title</title>\n</head>\n<body>\n  <!-- Your HTML code here -->\n</body>\n</html>"
                            : taskProgrammingLanguage === "css"
                            ? "/* Your CSS styles here */\nbody {\n  margin: 0;\n  padding: 0;\n  /* Add your CSS styles */\n}\n\n.container {\n  /* Style your container */\n}"
                            : taskProgrammingLanguage === "javascript"
                            ? "function solution() {\n  // Your JavaScript code here\n  return null;\n}\n\n// Example: Write your function logic here"
                            : taskProgrammingLanguage === "python"
                            ? "def solution():\n    # Your Python code here\n    pass\n\n# Example: Write your function logic here"
                            : taskProgrammingLanguage === "java"
                            ? "public class Solution {\n    public static void main(String[] args) {\n        // Your Java code here\n    }\n}"
                            : taskProgrammingLanguage === "cpp"
                            ? "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your C++ code here\n    return 0;\n}"
                            : taskProgrammingLanguage === "c"
                            ? "#include <stdio.h>\n\nint main() {\n    // Your C code here\n    return 0;\n}"
                            : taskProgrammingLanguage === "php"
                            ? "<?php\nfunction solution() {\n    // Your PHP code here\n}\n?>"
                            : taskProgrammingLanguage === "ruby"
                            ? "def solution\n  # Your Ruby code here\nend"
                            : taskProgrammingLanguage === "go"
                            ? "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // Your Go code here\n}"
                            : taskProgrammingLanguage === "rust"
                            ? "fn main() {\n    // Your Rust code here\n}"
                            : taskProgrammingLanguage === "typescript"
                            ? "function solution(): any {\n  // Your TypeScript code here\n  return null;\n}"
                            : "// Write your code here"
                        }
                        rows={8}
                        className="resize-none font-mono text-xs focus:ring-2 focus:ring-amber-500 border-gray-300"
                      />
                      <p className="text-xs text-gray-500">Code template that students will start with (leave empty for blank start)</p>
                    </div>
                  </TabsContent>

                  {/* Advanced Tab - Test Cases & Solution */}
                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="taskTestCases" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-pink-600" />
                        Test Cases <span className="text-gray-400 text-xs">(Optional)</span>
                      </Label>
                      <Textarea
                        id="taskTestCases"
                        value={taskTestCases}
                        onChange={(e) => { setTaskTestCases(e.target.value); setTaskFormErrors((p) => ({ ...p, taskTestCases: "" })); }}
                        placeholder='[{"input": "5", "expected_output": "25", "is_hidden": false}]'
                        rows={5}
                        className={cn("resize-none rounded-xl font-mono text-xs border", taskFormErrors.taskTestCases ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-300 focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}
                        aria-invalid={!!taskFormErrors.taskTestCases}
                      />
                      {taskFormErrors.taskTestCases && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{taskFormErrors.taskTestCases}</p>}
                      <p className="text-xs text-gray-500">
                        JSON format: {'[{"input": "...", "expected_output": "...", "is_hidden": false}]'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taskSolutionCode" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        Reference Solution <span className="text-gray-400 text-xs">(Admin only)</span>
                      </Label>
                      <Textarea
                        id="taskSolutionCode"
                        value={taskSolutionCode}
                        onChange={(e) => setTaskSolutionCode(e.target.value)}
                        placeholder="// Write the correct solution here for your reference"
                        rows={6}
                        className="resize-none font-mono text-xs focus:ring-2 focus:ring-gray-500 border-gray-300"
                      />
                      <p className="text-xs text-gray-500">Your reference solution - hidden from students</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            {/* Title - Always shown */}
            <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <Label htmlFor="taskTitle" className="text-sm font-semibold text-gray-700">
                Task Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="taskTitle"
                value={taskTitle}
                onChange={(e) => { setTaskTitle(e.target.value); setTaskFormErrors((p) => ({ ...p, taskTitle: "" })); }}
                placeholder="e.g. Create a Calculator Function"
                maxLength={200}
                className={cn("h-11 rounded-xl border-gray-300 bg-white shadow-sm", taskFormErrors.taskTitle ? "border-red-500 ring-1 ring-red-500/20" : "focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}
                aria-invalid={!!taskFormErrors.taskTitle}
              />
              {taskFormErrors.taskTitle && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{taskFormErrors.taskTitle}</p>}
            </div>

            {/* Instructions - For non-coding tasks */}
            {taskType !== "coding_practice" && (
              <div className="space-y-2 p-4 rounded-xl bg-[#2596be]/5 border border-[#2596be]/20">
                <Label htmlFor="taskInstructionsNonCoding" className="text-sm font-semibold text-gray-700">
                  Instructions <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="taskInstructionsNonCoding"
                  value={taskInstructions}
                  onChange={(e) => { setTaskInstructions(e.target.value); setTaskFormErrors((p) => ({ ...p, taskInstructions: "" })); }}
                  placeholder="Provide clear instructions for this task"
                  rows={4}
                  maxLength={5000}
                  className={cn("resize-none rounded-xl border bg-white", taskFormErrors.taskInstructions ? "border-red-500 ring-1 ring-red-500/20" : "border-[#2596be]/30 focus:ring-2 focus:ring-[#2596be] focus:border-[#2596be]")}
                  aria-invalid={!!taskFormErrors.taskInstructions}
                />
                {taskFormErrors.taskInstructions && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4 shrink-0" />{taskFormErrors.taskInstructions}</p>}
                <p className="text-xs text-gray-500">{taskInstructions.length} / 5000</p>
              </div>
            )}

            {/* Expected Output - For non-coding tasks */}
            {taskType !== "coding_practice" && (
              <div className="space-y-2 p-4 rounded-lg bg-green-50 border border-green-200">
                <Label htmlFor="taskExpectedOutput" className="text-sm font-semibold text-gray-700">
                  Expected Output <span className="text-gray-400 text-xs">(Optional)</span>
                </Label>
                <Textarea
                  id="taskExpectedOutput"
                  value={taskExpectedOutput}
                  onChange={(e) => setTaskExpectedOutput(e.target.value)}
                  placeholder="What you expect students to submit"
                  rows={3}
                  className="focus:ring-2 focus:ring-green-500 border-green-300"
                />
              </div>
            )}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <Label htmlFor="taskIsRequired" className="text-sm font-semibold text-gray-700">Required</Label>
                <p className="text-xs text-gray-500">Is this task required to complete the lesson?</p>
              </div>
              <Switch id="taskIsRequired" checked={taskIsRequired} onCheckedChange={setTaskIsRequired} />
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={closeTaskDialog} disabled={isTaskSubmitting} className="flex-1 h-11 rounded-xl border-gray-300 font-medium">
                Cancel
              </Button>
              <Button type="submit" disabled={isTaskSubmitting} className="flex-1 h-11 rounded-xl bg-[#2596be] hover:bg-[#1e7a9e] text-white font-semibold disabled:opacity-70">
                {isTaskSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : editingTask ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Task confirmation */}
      <Dialog open={deleteTaskOpen} onOpenChange={setDeleteTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" /> Delete task?</DialogTitle>
            <DialogDescription>Are you sure you want to delete &quot;{deleteTaskTarget?.title}&quot;? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setDeleteTaskOpen(false); setDeleteTaskTarget(null); }}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDeleteTask}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
