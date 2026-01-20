"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Play,
  CheckCircle2,
  XCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Sparkles,
  Lightbulb,
  Code,
  PlayCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { CodeEditor } from "@/components/code-editor"

interface Lesson {
  id: number
  title: string
  description: string
  video_url: string
  video_duration_seconds: number
  xp_reward: number
  course_id: number
  course_title: string
  module_title: string
  quizzes: Array<{
    id: number
    question: string
    question_type: string
    options: string[]
    correct_answer: string
    explanation: string
  }>
  tasks: Array<{
    id: number
    task_type: string
    title: string
    instructions: string
    is_required: boolean
    programming_language?: string
    starter_code?: string
    test_cases?: Array<{ input: string; expected_output: string; is_hidden: boolean }>
  }>
  progress: {
    status: string
    video_watched: boolean
    quiz_completed: boolean
    task_completed: boolean
    quiz_score: number
  } | null
  is_unlocked: boolean
}

// Convert YouTube URL to embed format
const convertToEmbedUrl = (url: string | null): string | null => {
  if (!url) return null

  // If already an embed URL, return as is
  if (url.includes("youtube.com/embed/")) {
    return url
  }

  // Extract video ID from various YouTube URL formats
  let videoId: string | null = null

  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (watchMatch) {
    videoId = watchMatch[1]
  }

  // Format: https://youtu.be/VIDEO_ID
  if (!videoId) {
    const shortMatch = url.match(/youtu\.be\/([^&\n?#]+)/)
    if (shortMatch) {
      videoId = shortMatch[1]
    }
  }

  // If we found a video ID, return embed URL
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`
  }

  // If it's not a YouTube URL, return as is (might be Vimeo or direct video)
  return url
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  const videoRef = useRef<HTMLVideoElement>(null)

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<"video" | "quiz" | "task">("video")
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizFeedback, setQuizFeedback] = useState<Record<number, any>>({})
  const [taskSubmission, setTaskSubmission] = useState("")
  const [taskCode, setTaskCode] = useState("")
  const [codeOutput, setCodeOutput] = useState<{ stdout: string; stderr: string; status?: any; is_markup?: boolean } | null>(null)
  const [isRunningCode, setIsRunningCode] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [videoWatched, setVideoWatched] = useState(false)
  const [completionAnimation, setCompletionAnimation] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("gold_student") || localStorage.getItem("verified_student_id")
    if (!storedUser) {
      router.push("/student-login")
      return
    }

    const user = typeof storedUser === "string" ? JSON.parse(storedUser) : { id: storedUser }
    setUserId(user.id || user)
    fetchLesson(user.id || user)
  }, [lessonId, router])

  const fetchLesson = async (userId: number) => {
    try {
      const res = await fetch(`/api/learning/lessons/${lessonId}?userId=${userId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch lesson")
      }

      setLesson(data)
      setVideoWatched(data.progress?.video_watched || false)
      
      // Initialize code editor with starter code if it's a coding practice task
      const codingTask = data.tasks?.find((t: any) => t.task_type === "coding_practice")
      if (codingTask?.starter_code) {
        setTaskCode(codingTask.starter_code)
      }
      
      // Set current step based on progress
      if (data.progress?.task_completed) {
        setCurrentStep("task")
      } else if (data.progress?.quiz_completed) {
        setCurrentStep("task")
      } else if (data.progress?.video_watched) {
        setCurrentStep("quiz")
      }
    } catch (error) {
      console.error("Error fetching lesson:", error)
      toast.error("Failed to load lesson")
    } finally {
      setLoading(false)
    }
  }

  const handleVideoWatched = async () => {
    if (!userId || !lesson || videoWatched) return

    try {
      await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          lesson_id: lesson.id,
          video_watched: true,
          video_progress_percentage: 100,
        }),
      })

      setVideoWatched(true)
      if (lesson.quizzes.length > 0) {
        setCurrentStep("quiz")
      } else if (lesson.tasks.length > 0) {
        setCurrentStep("task")
      } else {
        await completeLesson()
      }
    } catch (error) {
      console.error("Error updating video progress:", error)
    }
  }

  const handleQuizSubmit = async (quizId: number, answer: string) => {
    if (!userId || !lesson) return

    try {
      const res = await fetch("/api/learning/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          quiz_id: quizId,
          user_answer: answer,
        }),
      })

      const data = await res.json()
      setQuizFeedback({ ...quizFeedback, [quizId]: data })

      if (data.all_quizzes_completed) {
        // Update progress
        await fetch("/api/learning/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            lesson_id: lesson.id,
            quiz_completed: true,
            quiz_score: data.quiz_score,
          }),
        })

        if (lesson.tasks.length > 0) {
          setCurrentStep("task")
        } else {
          await completeLesson()
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Failed to submit quiz")
    }
  }

  const handleRunCode = async () => {
    if (!lesson || !taskCode.trim()) {
      toast.error("Please write some code first")
      return
    }

    const codingTask = lesson.tasks.find((t) => t.task_type === "coding_practice")
    if (!codingTask?.programming_language) {
      toast.error("Invalid coding task")
      return
    }

    setIsRunningCode(true)
    setCodeOutput(null)

    try {
      const res = await fetch("/api/learning/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: taskCode,
          language: codingTask.programming_language,
          stdin: "", // Can be enhanced to support test case inputs
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to execute code")
      }

      setCodeOutput({
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        status: data.status,
        is_markup: data.is_markup || false,
      })

      if (data.is_markup) {
        toast.success("HTML/CSS code ready for preview!")
      } else if (data.status?.id === 3) {
        toast.success("Code executed successfully!")
      } else {
        toast.warning(`Execution ${data.status?.description || "completed with issues"}`)
      }
    } catch (error: any) {
      console.error("Error running code:", error)
      toast.error(error.message || "Failed to execute code")
      setCodeOutput({
        stdout: "",
        stderr: error.message || "Execution failed",
      })
    } finally {
      setIsRunningCode(false)
    }
  }

  const handleTaskSubmit = async () => {
    if (!userId || !lesson) {
      toast.error("Please provide your response")
      return
    }

    const currentTask = lesson.tasks[0]
    const isCodingTask = currentTask?.task_type === "coding_practice"

    if (isCodingTask && !taskCode.trim()) {
      toast.error("Please write your code")
      return
    }

    if (!isCodingTask && !taskSubmission.trim()) {
      toast.error("Please provide your response")
      return
    }

    try {
      const submissionContent = isCodingTask ? taskCode : taskSubmission
      
      await fetch("/api/learning/task/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          task_id: lesson.tasks[0].id,
          submission_content: submissionContent,
        }),
      })

      await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          lesson_id: lesson.id,
          task_completed: true,
        }),
      })

      await completeLesson()
    } catch (error) {
      console.error("Error submitting task:", error)
      toast.error("Failed to submit task")
    }
  }

  const completeLesson = async () => {
    if (!userId || !lesson) return

    try {
      await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          lesson_id: lesson.id,
          video_watched: true,
          quiz_completed: lesson.quizzes.length === 0 || lesson.progress?.quiz_completed,
          task_completed: lesson.tasks.length === 0 || true,
        }),
      })

      // Update streak
      await fetch("/api/learning/gamification/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          xp_earned: lesson.xp_reward,
        }),
      })

      setCompletionAnimation(true)
      toast.success(`Lesson completed! +${lesson.xp_reward} XP earned`)

      // Redirect after animation
      setTimeout(() => {
        router.push(`/learning/courses/${lesson.course_id}`)
      }, 2000)
    } catch (error) {
      console.error("Error completing lesson:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
            <p className="text-gray-600 mb-4">This lesson doesn't exist or you don't have access.</p>
            <Button onClick={() => router.push("/learning/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!lesson.is_unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Lesson Locked</h2>
            <p className="text-gray-600 mb-4">Complete the previous lesson to unlock this one.</p>
            <Button onClick={() => router.push(`/learning/courses/${lesson.course_id}`)}>
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Completion Animation */}
      {completionAnimation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-12 text-center animate-scale-in">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-50 animate-ping" />
              <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Lesson Completed!</h2>
            <p className="text-xl text-gray-600 mb-4">+{lesson.xp_reward} XP Earned</p>
            <div className="flex items-center justify-center gap-2 text-amber-500">
              <Trophy className="h-6 w-6" />
              <span className="font-semibold">Great job!</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/learning/courses/${lesson.course_id}`)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{lesson.module_title}</Badge>
            <Badge variant="outline">{lesson.course_title}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          <p className="text-gray-600">{lesson.description}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${currentStep === "video" ? "text-blue-600" : videoWatched ? "text-green-600" : "text-gray-400"}`}>
              {videoWatched ? <CheckCircle2 className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              <span className="font-medium">Watch Video</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4">
              <div className={`h-full transition-all ${videoWatched ? "bg-green-500" : "bg-gray-200"}`} style={{ width: videoWatched ? "100%" : "0%" }} />
            </div>
            <div className={`flex items-center gap-2 ${currentStep === "quiz" ? "text-blue-600" : lesson.progress?.quiz_completed ? "text-green-600" : "text-gray-400"}`}>
              {lesson.progress?.quiz_completed ? <CheckCircle2 className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
              <span className="font-medium">Quiz</span>
            </div>
            {lesson.tasks.length > 0 && (
              <>
                <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                  <div className={`h-full transition-all ${lesson.progress?.task_completed ? "bg-green-500" : "bg-gray-200"}`} style={{ width: lesson.progress?.task_completed ? "100%" : "0%" }} />
                </div>
                <div className={`flex items-center gap-2 ${currentStep === "task" ? "text-blue-600" : lesson.progress?.task_completed ? "text-green-600" : "text-gray-400"}`}>
                  {lesson.progress?.task_completed ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  <span className="font-medium">Task</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Video Step */}
        {currentStep === "video" && (
          <Card>
            <CardHeader>
              <CardTitle>Watch the Lesson</CardTitle>
              <CardDescription>Complete the video to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg mb-4 relative">
                {lesson.video_url ? (
                  <iframe
                    src={convertToEmbedUrl(lesson.video_url)}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Play className="h-16 w-16" />
                  </div>
                )}
              </div>
              <Button
                onClick={handleVideoWatched}
                disabled={videoWatched}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {videoWatched ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Video Watched
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Watched
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quiz Step */}
        {currentStep === "quiz" && lesson.quizzes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Quiz</CardTitle>
              <CardDescription>Test your understanding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {lesson.quizzes.map((quiz, index) => {
                const feedback = quizFeedback[quiz.id]
                const userAnswer = quizAnswers[quiz.id]

                return (
                  <div key={quiz.id} className="border rounded-lg p-6">
                    <div className="flex items-start gap-2 mb-4">
                      <Badge variant="outline">Question {index + 1}</Badge>
                      {feedback && (
                        <Badge variant={feedback.is_correct ? "default" : "destructive"}>
                          {feedback.is_correct ? "Correct" : "Incorrect"}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{quiz.question}</h3>

                    {quiz.question_type === "multiple_choice" && (
                      <div className="space-y-2">
                        {quiz.options?.map((option: string, optIndex: number) => (
                          <Button
                            key={optIndex}
                            variant={userAnswer === option ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => {
                              setQuizAnswers({ ...quizAnswers, [quiz.id]: option })
                              if (!feedback) {
                                handleQuizSubmit(quiz.id, option)
                              }
                            }}
                            disabled={!!feedback}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}

                    {feedback && (
                      <div className={`mt-4 p-4 rounded-lg ${feedback.is_correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                        <div className="flex items-start gap-2">
                          {feedback.is_correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={`font-medium ${feedback.is_correct ? "text-green-900" : "text-red-900"}`}>
                              {feedback.is_correct ? "Correct!" : "Incorrect"}
                            </p>
                            {quiz.explanation && (
                              <p className={`text-sm mt-1 ${feedback.is_correct ? "text-green-700" : "text-red-700"}`}>
                                {quiz.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {lesson.progress?.quiz_completed && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-900">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Quiz completed! Score: {lesson.progress.quiz_score}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Task Step */}
        {currentStep === "task" && lesson.tasks.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {lesson.tasks[0].task_type === "coding_practice" && (
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Code className="h-5 w-5 text-purple-600" />
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle>{lesson.tasks[0].title}</CardTitle>
                  <CardDescription className="mt-2">{lesson.tasks[0].instructions}</CardDescription>
                  {lesson.tasks[0].task_type === "coding_practice" && lesson.tasks[0].programming_language && (
                    <Badge className="mt-2 bg-purple-100 text-purple-700">
                      {lesson.tasks[0].programming_language.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lesson.tasks[0].task_type === "coding_practice" ? (
                  <>
                    {/* Code Editor */}
                    <div>
                      <Label className="mb-2 block">Write Your Code</Label>
                      <CodeEditor
                        value={taskCode}
                        onChange={(value) => setTaskCode(value || "")}
                        language={lesson.tasks[0].programming_language || "javascript"}
                        height="400px"
                        theme="vs-dark"
                      />
                    </div>

                    {/* Run Code Button */}
                    <Button
                      onClick={handleRunCode}
                      disabled={isRunningCode || !taskCode.trim() || lesson.progress?.task_completed}
                      variant="outline"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      {isRunningCode ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running Code...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Run Code
                        </>
                      )}
                    </Button>

                    {/* Code Output */}
                    {codeOutput && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Output</Label>
                          {codeOutput.is_markup && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPreview(!showPreview)}
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                              {showPreview ? "Hide Preview" : "Show Preview"}
                            </Button>
                          )}
                        </div>
                        {codeOutput.is_markup && showPreview ? (
                          <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <iframe
                              srcDoc={codeOutput.stdout}
                              className="w-full h-96 border-0"
                              title="HTML/CSS Preview"
                              sandbox="allow-scripts allow-same-origin"
                            />
                          </div>
                        ) : (
                          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
                            {codeOutput.stdout && (
                              <div className="mb-2">
                                <div className="text-gray-500 mb-1">stdout:</div>
                                <div className="whitespace-pre-wrap">{codeOutput.stdout}</div>
                              </div>
                            )}
                            {codeOutput.stderr && (
                              <div className="text-red-400">
                                <div className="text-gray-500 mb-1">stderr:</div>
                                <div className="whitespace-pre-wrap">{codeOutput.stderr}</div>
                              </div>
                            )}
                            {codeOutput.status && (
                              <div className="text-gray-500 mt-2 text-xs">
                                Status: {codeOutput.status.description}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      onClick={handleTaskSubmit}
                      disabled={!taskCode.trim() || lesson.progress?.task_completed}
                      className="w-full bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white"
                    >
                      {lesson.progress?.task_completed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Task Completed
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Submit Code
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Regular Task (Text Response) */}
                    <div>
                      <Label htmlFor="task-submission">Your Response</Label>
                      <Textarea
                        id="task-submission"
                        value={taskSubmission}
                        onChange={(e) => setTaskSubmission(e.target.value)}
                        placeholder="Share your thoughts, reflections, or complete the task..."
                        className="mt-2 min-h-[200px]"
                      />
                    </div>
                    <Button
                      onClick={handleTaskSubmit}
                      disabled={!taskSubmission.trim() || lesson.progress?.task_completed}
                      className="w-full bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white"
                    >
                      {lesson.progress?.task_completed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Task Completed
                        </>
                      ) : (
                        "Submit Task"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lesson Complete */}
        {lesson.progress?.status === "completed" && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Completed!</h2>
              <p className="text-gray-600 mb-4">You earned {lesson.xp_reward} XP</p>
              <Button
                onClick={() => router.push(`/learning/courses/${lesson.course_id}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue to Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
