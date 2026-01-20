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
} from "lucide-react"
import { toast } from "sonner"

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

  // Quiz Dialog
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [quizQuestion, setQuizQuestion] = useState("")
  const [quizType, setQuizType] = useState("multiple_choice")
  const [quizOptions, setQuizOptions] = useState("")
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState("")
  const [quizExplanation, setQuizExplanation] = useState("")

  // Task Dialog
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTaskLessonId, setSelectedTaskLessonId] = useState<number | null>(null)
  const [taskType, setTaskType] = useState("reflection")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskInstructions, setTaskInstructions] = useState("")
  const [taskExpectedOutput, setTaskExpectedOutput] = useState("")
  const [taskIsRequired, setTaskIsRequired] = useState(true)
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
      const courseRes = await fetch(`/api/learning/courses/${courseId}`)
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
      const modulesRes = await fetch(`/api/learning/modules?courseId=${courseId}`)
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
          const lessonsRes = await fetch(`/api/learning/lessons?moduleId=${module.id}`)
          if (lessonsRes.ok) {
            const lessonsList = await lessonsRes.json()
            const lessonsArray = Array.isArray(lessonsList) ? lessonsList : []
            lessonsData[module.id] = lessonsArray

            // Fetch quizzes and tasks for each lesson
            for (const lesson of lessonsArray) {
              try {
                const quizzesRes = await fetch(`/api/learning/quizzes?lessonId=${lesson.id}`)
                if (quizzesRes.ok) {
                  const quizzesList = await quizzesRes.json()
                  quizzesData[lesson.id] = Array.isArray(quizzesList) ? quizzesList : []
                }

                const tasksRes = await fetch(`/api/learning/tasks?lessonId=${lesson.id}`)
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
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingModule ? "PUT" : "POST"
      const body = editingModule
        ? {
            id: editingModule.id,
            title: moduleTitle,
            description: moduleDescription || null,
            order_index: editingModule.order_index, // Keep existing order when editing
            is_active: true,
          }
        : {
            course_id: Number(courseId),
            title: moduleTitle,
            description: moduleDescription || null,
            order_index: modules.length, // Automatic: next available index
          }

      const response = await fetch("/api/learning/modules", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Failed to save module")
      }

      toast.success(editingModule ? "Module updated" : "Module created")
      fetchCourseData()
      closeModuleDialog()
    } catch (error: any) {
      toast.error(error.message || "Failed to save module")
    }
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleTitle(module.title)
    setModuleDescription(module.description || "")
    setModuleOrderIndex(module.order_index.toString())
    setIsModuleDialogOpen(true)
  }

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Are you sure you want to delete this module? All lessons will also be deleted.")) return

    try {
      const response = await fetch(`/api/learning/modules?id=${moduleId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete module")
      toast.success("Module deleted")
      fetchCourseData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete module")
    }
  }

  const closeModuleDialog = () => {
    setIsModuleDialogOpen(false)
    setEditingModule(null)
    setModuleTitle("")
    setModuleDescription("")
    setModuleOrderIndex("")
  }

  // Lesson CRUD
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedModuleId) {
      toast.error("Please select a module")
      return
    }

    try {
      const method = editingLesson ? "PUT" : "POST"
      const body = editingLesson
        ? {
            id: editingLesson.id,
            title: lessonTitle,
            description: lessonDescription || null,
            video_url: lessonVideoUrl || null,
            video_duration_seconds: parseInt(lessonVideoDuration) || 0,
            lesson_type: lessonType,
            order_index: editingLesson.order_index, // Keep existing order when editing
            xp_reward: parseInt(lessonXpReward) || 10,
            is_active: true,
          }
        : {
            module_id: selectedModuleId,
            title: lessonTitle,
            description: lessonDescription || null,
            video_url: lessonVideoUrl || null,
            video_duration_seconds: parseInt(lessonVideoDuration) || 0,
            lesson_type: lessonType,
            order_index: lessons[selectedModuleId]?.length || 0, // Automatic: next available index in module
            xp_reward: parseInt(lessonXpReward) || 10,
          }

      const response = await fetch("/api/learning/lessons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Failed to save lesson")
      }

      toast.success(editingLesson ? "Lesson updated" : "Lesson created")
      fetchCourseData()
      closeLessonDialog()
    } catch (error: any) {
      toast.error(error.message || "Failed to save lesson")
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
    setIsLessonDialogOpen(true)
  }

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Are you sure you want to delete this lesson? All quizzes and tasks will also be deleted.")) return

    try {
      const response = await fetch(`/api/learning/lessons?id=${lessonId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete lesson")
      toast.success("Lesson deleted")
      fetchCourseData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete lesson")
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
  }

  // Quiz CRUD
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedLessonId) {
      toast.error("Please select a lesson")
      return
    }

    try {
      const method = editingQuiz ? "PUT" : "POST"
      const optionsArray = quizType === "multiple_choice" && quizOptions ? quizOptions.split("\n").filter(o => o.trim()) : null

      const body = editingQuiz
        ? {
            id: editingQuiz.id,
            question: quizQuestion,
            question_type: quizType,
            options: optionsArray,
            correct_answer: quizCorrectAnswer,
            explanation: quizExplanation || null,
            order_index: editingQuiz.order_index,
          }
        : {
            lesson_id: selectedLessonId,
            question: quizQuestion,
            question_type: quizType,
            options: optionsArray,
            correct_answer: quizCorrectAnswer,
            explanation: quizExplanation || null,
            order_index: quizzes[selectedLessonId]?.length || 0,
          }

      const response = await fetch("/api/learning/quizzes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Failed to save quiz")
      }

      toast.success(editingQuiz ? "Quiz updated" : "Quiz created")
      fetchCourseData()
      closeQuizDialog()
    } catch (error: any) {
      toast.error(error.message || "Failed to save quiz")
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
    setIsQuizDialogOpen(true)
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return

    try {
      const response = await fetch(`/api/learning/quizzes?id=${quizId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete quiz")
      toast.success("Quiz deleted")
      fetchCourseData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete quiz")
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
  }

  // Task CRUD
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTaskLessonId) {
      toast.error("Please select a lesson")
      return
    }

    try {
      const method = editingTask ? "PUT" : "POST"
      const body = editingTask
        ? {
            id: editingTask.id,
            task_type: taskType,
            title: taskTitle,
            instructions: taskInstructions,
            expected_output: taskExpectedOutput || null,
            is_required: taskIsRequired,
            ...(taskType === "coding_practice" && {
              programming_language: taskProgrammingLanguage,
              starter_code: taskStarterCode || null,
              test_cases: taskTestCases ? JSON.parse(taskTestCases) : null,
              solution_code: taskSolutionCode || null,
            }),
          }
        : {
            lesson_id: selectedTaskLessonId,
            task_type: taskType,
            title: taskTitle,
            instructions: taskInstructions,
            expected_output: taskExpectedOutput || null,
            is_required: taskIsRequired,
            ...(taskType === "coding_practice" && {
              programming_language: taskProgrammingLanguage,
              starter_code: taskStarterCode || null,
              test_cases: taskTestCases ? JSON.parse(taskTestCases) : null,
              solution_code: taskSolutionCode || null,
            }),
          }

      const response = await fetch("/api/learning/tasks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Failed to save task")
      }

      toast.success(editingTask ? "Task updated" : "Task created")
      fetchCourseData()
      closeTaskDialog()
    } catch (error: any) {
      toast.error(error.message || "Failed to save task")
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
    // Coding practice fields
    setTaskProgrammingLanguage((task as any).programming_language || "javascript")
    setTaskStarterCode((task as any).starter_code || "")
    setTaskTestCases((task as any).test_cases ? JSON.stringify((task as any).test_cases, null, 2) : "")
    setTaskSolutionCode((task as any).solution_code || "")
    setIsTaskDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(`/api/learning/tasks?id=${taskId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete task")
      toast.success("Task deleted")
      fetchCourseData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task")
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
    // Reset coding practice fields
    setTaskProgrammingLanguage("javascript")
    setTaskStarterCode("")
    setTaskTestCases("")
    setTaskSolutionCode("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mb-4"></div>
          <p className="text-gray-600">Loading course data...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/admin/learning-courses")}
              className="text-gray-600 hover:text-[#e63946] hover:bg-[#e63946]/10"
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
              className="bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white shadow-lg shadow-[#e63946]/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-[#e63946]/10 via-[#d62839]/5 to-transparent border border-[#e63946]/20 rounded-2xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{course.title}</h1>
            {course.description && (
              <p className="text-lg text-gray-700 mb-6">{course.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#e63946]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Instructor</p>
                  <p className="text-base font-semibold text-gray-900">{course.instructor_name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#e63946]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Difficulty</p>
                  <Badge className="bg-[#e63946]/10 text-[#e63946] border-[#e63946]/30">
                    {course.difficulty_level}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#e63946]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Duration</p>
                  <p className="text-base font-semibold text-gray-900">
                    {Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        {modules.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#e63946]/10 to-[#d62839]/10 mb-6">
                <FolderOpen className="h-10 w-10 text-[#e63946]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No modules yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
                className="bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white shadow-lg shadow-[#e63946]/30 h-12 px-8"
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
                className="border-2 border-gray-200 hover:border-[#e63946]/40 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden bg-white"
              >
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="p-2 rounded-lg hover:bg-[#e63946]/10 transition-colors"
                      >
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="h-5 w-5 text-[#e63946]" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-[#e63946]" />
                        )}
                      </button>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946]/10 to-[#d62839]/5">
                        <FolderOpen className="h-6 w-6 text-[#e63946]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {module.title}
                          </CardTitle>
                          <Badge className="bg-[#e63946]/10 text-[#e63946] border-[#e63946]/30">
                            Module {moduleIndex + 1}
                          </Badge>
                        </div>
                        {module.description && (
                          <CardDescription className="text-gray-600 mt-1">
                            {module.description}
                          </CardDescription>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <PlayCircle className="h-3 w-3 mr-1" />
                            {lessons[module.id]?.length || 0} Lessons
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedModuleId(module.id)
                          setLessonTitle("")
                          setLessonDescription("")
                          setLessonVideoUrl("")
                          setLessonVideoDuration("")
                          setLessonType("video")
                          setLessonOrderIndex("")
                          setLessonXpReward("10")
                          setIsLessonDialogOpen(true)
                        }}
                        className="border-[#e63946]/30 text-[#e63946] hover:bg-[#e63946]/10"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Lesson
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditModule(module)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedModules.has(module.id) && (
                  <CardContent className="p-6 bg-gradient-to-br from-gray-50/50 to-white">
                    {lessons[module.id] && lessons[module.id].length > 0 ? (
                      <div className="space-y-4">
                        {lessons[module.id].map((lesson, lessonIndex) => (
                          <div 
                            key={lesson.id} 
                            className="border-2 border-gray-200 rounded-xl p-5 bg-white hover:border-[#e63946]/40 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4 flex-1">
                                <button
                                  onClick={() => toggleLesson(lesson.id)}
                                  className="p-2 rounded-lg hover:bg-[#e63946]/10 transition-colors"
                                >
                                  {expandedLessons.has(lesson.id) ? (
                                    <ChevronDown className="h-4 w-4 text-[#e63946]" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-[#e63946]" />
                                  )}
                                </button>
                                <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#e63946]/10 to-[#d62839]/5">
                                  <PlayCircle className="h-5 w-5 text-[#e63946]" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-bold text-gray-900 text-lg">{lesson.title}</h4>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                      {lesson.xp_reward} XP
                                    </Badge>
                                  </div>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600">{lesson.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      <HelpCircle className="h-3 w-3 mr-1" />
                                      {quizzes[lesson.id]?.length || 0} Quizzes
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      <FileText className="h-3 w-3 mr-1" />
                                      {tasks[lesson.id]?.length || 0} Tasks
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
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
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
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
                                  className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                                  Task
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditLesson(lesson)}
                                  className="hover:bg-gray-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {expandedLessons.has(lesson.id) && (
                              <div className="pl-12 space-y-4 mt-4 border-t border-gray-200 pt-4">
                                {/* Quizzes Section */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
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
                                              onClick={() => handleDeleteQuiz(quiz.id)}
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
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
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
                                              onClick={() => handleDeleteTask(task.id)}
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
                      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#e63946]/10 to-[#d62839]/5 mb-4">
                          <PlayCircle className="h-8 w-8 text-[#e63946]" />
                        </div>
                        <p className="text-gray-600 mb-4 font-medium">No lessons in this module</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedModuleId(module.id)
                            setLessonTitle("")
                            setLessonDescription("")
                            setLessonVideoUrl("")
                            setLessonVideoDuration("")
                            setLessonType("video")
                            setLessonOrderIndex("")
                            setLessonXpReward("10")
                            setIsLessonDialogOpen(true)
                          }}
                          className="border-[#e63946]/30 text-[#e63946] hover:bg-[#e63946]/10"
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
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
            <DialogDescription>Add a module to organize lessons in this course</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateModule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moduleTitle">Module Title *</Label>
              <Input
                id="moduleTitle"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Introduction to JavaScript"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleDescription">Description</Label>
              <Textarea
                id="moduleDescription"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Brief description of this module"
                rows={3}
              />
            </div>
            {/* Order Index is automatically calculated - hidden from form */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={closeModuleDialog} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white">
                {editingModule ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
            <DialogDescription>Add a lesson to this module</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            {!editingLesson && (
              <div className="space-y-2">
                <Label htmlFor="lessonModule">Module *</Label>
                <Select value={selectedModuleId?.toString() || ""} onValueChange={(v) => setSelectedModuleId(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="lessonTitle">Lesson Title *</Label>
              <Input
                id="lessonTitle"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Variables and Data Types"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonDescription">Description</Label>
              <Textarea
                id="lessonDescription"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="Brief description of this lesson"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lessonType">Lesson Type</Label>
                <Select value={lessonType} onValueChange={setLessonType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonXpReward">XP Reward</Label>
                <Input
                  id="lessonXpReward"
                  type="number"
                  value={lessonXpReward}
                  onChange={(e) => setLessonXpReward(e.target.value)}
                  placeholder="10"
                  min="0"
                />
                <p className="text-xs text-gray-500">XP points students earn for completing this lesson</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonVideoUrl">Video URL</Label>
              <Input
                id="lessonVideoUrl"
                value={lessonVideoUrl}
                onChange={(e) => setLessonVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonVideoDuration">Video Duration (seconds)</Label>
              <Input
                id="lessonVideoDuration"
                type="number"
                value={lessonVideoDuration}
                onChange={(e) => setLessonVideoDuration(e.target.value)}
                min="0"
              />
            </div>
            {/* Order Index is automatically calculated - hidden from form */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={closeLessonDialog} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white">
                {editingLesson ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingQuiz ? "Edit Quiz Question" : "Create New Quiz Question"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a quiz question to test student understanding
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateQuiz} className="space-y-6 mt-6">
            {!editingQuiz && (
              <div className="space-y-2">
                <Label htmlFor="quizLesson" className="text-sm font-semibold text-gray-700">
                  Lesson <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={selectedLessonId?.toString() || ""}
                  onValueChange={(v) => setSelectedLessonId(Number(v))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(lessons)
                      .flat()
                      .map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()}>
                          {l.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
                onChange={(e) => setQuizQuestion(e.target.value)}
                placeholder="Enter your question here..."
                rows={4}
                required
                className="resize-none text-base focus:ring-2 focus:ring-[#e63946] border-gray-300"
              />
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label htmlFor="quizType" className="text-sm font-semibold text-gray-700">
                Question Type
              </Label>
              <Select value={quizType} onValueChange={setQuizType}>
                <SelectTrigger className="h-11">
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
              <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  <Label htmlFor="quizOptions" className="text-sm font-semibold text-gray-700">
                    Answer Options <span className="text-red-600">*</span>
                  </Label>
                </div>
                <Textarea
                  id="quizOptions"
                  value={quizOptions}
                  onChange={(e) => setQuizOptions(e.target.value)}
                  placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                  rows={6}
                  required
                  className="resize-none text-base focus:ring-2 focus:ring-blue-500 border-blue-300 bg-white font-mono text-sm"
                />
                <div className="flex items-start gap-2 text-xs text-gray-600 bg-white/60 p-3 rounded-lg border border-blue-200">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-semibold">💡 Tip:</span>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Enter each option on a new line:</p>
                    <p className="font-mono text-gray-700">Option A</p>
                    <p className="font-mono text-gray-700">Option B</p>
                    <p className="font-mono text-gray-700">Option C</p>
                  </div>
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
                  onValueChange={setQuizCorrectAnswer}
                  required
                >
                  <SelectTrigger className="h-12 bg-green-50 border-green-300 focus:ring-green-500 text-base">
                    <SelectValue placeholder="Select the correct answer from options above" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizOptions
                      .split("\n")
                      .filter((opt) => opt.trim())
                      .map((option, index) => (
                        <SelectItem key={index} value={option.trim()} className="text-base py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
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
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
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
                        ? "bg-gradient-to-br from-red-500 to-rose-600 border-red-600 text-white shadow-lg shadow-red-500/30 scale-105"
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
                  onChange={(e) => setQuizCorrectAnswer(e.target.value)}
                  placeholder="Enter the correct answer"
                  required
                  className="h-12 text-base focus:ring-2 focus:ring-[#e63946]"
                />
              )}
              {quizType === "multiple_choice" && !quizOptions && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <span>⚠️</span> Please add options above first
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
                className="resize-none focus:ring-2 focus:ring-[#e63946] border-gray-300"
              />
              <p className="text-xs text-gray-500">This explanation helps students learn from their mistakes</p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={closeQuizDialog}
                className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white shadow-lg shadow-[#e63946]/30 font-semibold"
              >
                {editingQuiz ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Update Quiz
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quiz
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription>Add a task or reflection prompt to this lesson</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            {!editingTask && (
              <div className="space-y-2">
                <Label htmlFor="taskLesson">Lesson *</Label>
                <Select
                  value={selectedTaskLessonId?.toString() || ""}
                  onValueChange={(v) => setSelectedTaskLessonId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(lessons)
                      .flat()
                      .map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()}>
                          {l.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
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
                <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
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
                        onChange={(e) => setTaskInstructions(e.target.value)}
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
                        required
                        className="resize-none text-sm focus:ring-2 focus:ring-blue-500 border-gray-300"
                      />
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
                        onChange={(e) => setTaskTestCases(e.target.value)}
                        placeholder='[{"input": "5", "expected_output": "25", "is_hidden": false}]'
                        rows={5}
                        className="resize-none font-mono text-xs focus:ring-2 focus:ring-pink-500 border-gray-300"
                      />
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
            <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200">
              <Label htmlFor="taskTitle" className="text-sm font-semibold text-gray-700">
                Task Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="taskTitle"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Create a Calculator Function"
                required
                className="h-11"
              />
            </div>

            {/* Instructions - For non-coding tasks */}
            {taskType !== "coding_practice" && (
              <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <Label htmlFor="taskInstructions" className="text-sm font-semibold text-gray-700">
                  Instructions <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="taskInstructions"
                  value={taskInstructions}
                  onChange={(e) => setTaskInstructions(e.target.value)}
                  placeholder="Provide clear instructions for this task"
                  rows={4}
                  required
                  className="focus:ring-2 focus:ring-blue-500 border-blue-300"
                />
              </div>
            )}

            {/* Expected Output - For non-coding tasks */}
            {taskType !== "coding_practice" && (
              <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
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
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="taskIsRequired">Required</Label>
                <p className="text-xs text-gray-500">Is this task required to complete the lesson?</p>
              </div>
              <Switch id="taskIsRequired" checked={taskIsRequired} onCheckedChange={setTaskIsRequired} />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={closeTaskDialog} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white">
                {editingTask ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
