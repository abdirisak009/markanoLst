"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Lock,
  Shield,
  Award,
  BookOpen,
  Clock,
  Zap,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface Course {
  id: number
  title: string
  description: string | null
  price: number | string
  thumbnail_url: string | null
  difficulty_level: string | null
  estimated_duration_minutes: number
  modules: Array<{
    id: number
    lessons: Array<{ id: number }>
  }>
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId ? parseInt(String(params.courseId)) : null

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const storedStudent = localStorage.getItem("gold_student")
    if (!storedStudent) {
      toast.error("Please login first")
      router.push(`/self-learning/courses/${courseId}`)
      return
    }

    const studentData = JSON.parse(storedStudent)
    setUserId(studentData.id)

    // Fetch course details
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/learning/courses/${courseId}`)
        if (!res.ok) throw new Error("Failed to fetch course")
        const data = await res.json()
        setCourse(data)
      } catch (error: any) {
        toast.error(error.message || "Failed to load course")
        router.push(`/self-learning/courses/${courseId}`)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId, router])

  const handlePayment = async () => {
    if (!course || !userId) return
    
    const coursePrice = typeof course.price === "string" ? parseFloat(course.price) : course.price
    const isFree = coursePrice === 0
    
    // Handle free courses
    if (isFree) {
      setProcessing(true)
      try {
        const res = await fetch("/api/learning/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            course_id: course.id,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to enroll")
        }

        toast.success("Successfully enrolled in course!")
        router.push(`/learning/courses/${course.id}`)
      } catch (error: any) {
        toast.error(error.message || "Failed to enroll in course")
      } finally {
        setProcessing(false)
      }
      return
    }

    if (!selectedPaymentMethod || !userId || !course) {
      toast.error("Please select a payment method")
      return
    }

    setProcessing(true)

    try {
      const res = await fetch("/api/learning/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          course_id: course.id,
          amount: typeof course.price === "number" ? course.price : parseFloat(String(course.price || 0)),
          payment_method: selectedPaymentMethod,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Payment processing failed")
      }

      if (selectedPaymentMethod === "offline") {
        setPaymentSuccess(true)
        setShowSuccessPopup(true)
        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push("/learning/my-courses")
        }, 3000)
      } else if (selectedPaymentMethod === "wafi_pay" || selectedPaymentMethod === "mastercard") {
        // For online payments, show success popup
        setPaymentSuccess(true)
        setShowSuccessPopup(true)
        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push(`/learning/courses/${course.id}`)
        }, 3000)
      }
    } catch (error: any) {
      toast.error(error.message || "Payment processing failed")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e63946] mb-4"></div>
          <p className="text-gray-300">Loading payment...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  const coursePrice = typeof course.price === "number" ? course.price : parseFloat(String(course.price || 0))
  const isFree = coursePrice === 0
  const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
  const totalXP = totalLessons * 10

  const paymentMethods = [
    {
      id: "offline",
      name: "Offline Payment",
      description: "Pay later or in person. Admin will review and approve your enrollment.",
      icon: Banknote,
      color: "from-blue-500/20 to-indigo-500/10",
      borderColor: "border-blue-500/30",
      hoverBorder: "hover:border-blue-500/50",
    },
    {
      id: "wafi_pay",
      name: "Wafi Pay",
      description: "Secure payment through Wafi Pay. Admin will review and approve your enrollment.",
      icon: Wallet,
      color: "from-purple-500/20 to-pink-500/10",
      borderColor: "border-purple-500/30",
      hoverBorder: "hover:border-purple-500/50",
    },
    {
      id: "mastercard",
      name: "Mastercard",
      description: "Pay with your Mastercard. Admin will review and approve your enrollment.",
      icon: CreditCard,
      color: "from-amber-500/20 to-orange-500/10",
      borderColor: "border-amber-500/30",
      hoverBorder: "hover:border-amber-500/50",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d62839]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <Navbar />

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Button
            onClick={() => router.push(`/self-learning/courses/${course.id}`)}
            variant="ghost"
            className="mb-6 text-gray-400 hover:text-white hover:bg-[#e63946]/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <div className="animate-fade-in">
                <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  Choose Payment Method
                </h1>
                <p className="text-gray-400 text-lg">Select your preferred payment method to enroll in this course</p>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method, idx) => {
                  const Icon = method.icon
                  const isSelected = selectedPaymentMethod === method.id

                  return (
                    <Card
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`cursor-pointer transition-all duration-300 bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-2 ${
                        isSelected
                          ? `${method.borderColor} ${method.hoverBorder} border-opacity-100 shadow-2xl shadow-[#e63946]/20 scale-[1.02]`
                          : "border-[#e63946]/20 hover:border-[#e63946]/40"
                      } animate-fade-in`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-4 rounded-xl bg-gradient-to-br ${method.color} ${
                              isSelected ? "scale-110 rotate-3" : ""
                            } transition-all duration-300`}
                          >
                            <Icon className="h-6 w-6 text-[#e63946]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-white">{method.name}</h3>
                              {isSelected && (
                                <div className="p-1.5 rounded-full bg-[#e63946]">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">{method.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Security Badges */}
              <div className="flex items-center gap-4 pt-4 animate-fade-in delay-500">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Lock className="h-4 w-4 text-green-400" />
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border-2 border-[#e63946]/40 sticky top-8 overflow-hidden relative group">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/0 via-[#e63946]/5 to-[#e63946]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="relative z-10">
                  <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                    <Award className="h-6 w-6 text-[#e63946]" />
                    Order Summary
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 relative z-10">
                  {/* Course Info */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-[#e63946]/10 to-[#d62839]/5 border border-[#e63946]/20">
                      <BookOpen className="h-5 w-5 text-[#e63946] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold mb-1 truncate">{course.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{course.description || "Course description"}</p>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f]/50 border border-[#e63946]/10">
                        <span className="text-gray-400 text-sm">Modules</span>
                        <span className="text-white font-semibold">{course.modules.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f]/50 border border-[#e63946]/10">
                        <span className="text-gray-400 text-sm">Lessons</span>
                        <span className="text-white font-semibold">{totalLessons}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f]/50 border border-[#e63946]/10">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Duration</span>
                        </div>
                        <span className="text-white font-semibold">
                          {Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f]/50 border border-[#e63946]/10">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-[#e63946]" />
                          <span className="text-gray-400 text-sm">Total XP</span>
                        </div>
                        <span className="text-[#e63946] font-bold">{totalXP}</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-[#e63946]/30 to-transparent" />

                  {/* Price */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-[#e63946]/20 via-[#d62839]/15 to-[#e63946]/20 border border-[#e63946]/30">
                      <span className="text-gray-300 font-semibold">Total Amount</span>
                      {isFree ? (
                        <span className="text-3xl font-black text-green-400">FREE</span>
                      ) : (
                        <span className="text-3xl font-black text-white">${coursePrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  {/* Pay Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={!selectedPaymentMethod || processing || isFree}
                    className="w-full bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] hover:from-[#d62839] hover:via-[#c1121f] hover:to-[#d62839] text-white font-bold h-14 text-lg shadow-2xl shadow-[#e63946]/40 hover:shadow-[#e63946]/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                    {processing ? (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </span>
                    ) : isFree ? (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <CheckCircle2 className="h-5 w-5" />
                        Enroll for Free
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <Lock className="h-5 w-5" />
                        Complete Payment
                        <ArrowLeft className="h-5 w-5 rotate-180" />
                      </span>
                    )}
                  </Button>

                  {isFree && (
                    <p className="text-center text-xs text-gray-400">
                      This course is free. Click above to enroll immediately.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup - Amazing Design */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-[500px] !bg-gradient-to-br !from-[#0a0a0f] !via-[#0f1419] !to-[#0a0a0f] border-2 border-green-500/40 shadow-2xl shadow-green-500/20 overflow-hidden relative !fixed !top-[50%] !left-[50%] !-translate-x-[50%] !-translate-y-[50%] !transform p-0">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 opacity-50" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="relative z-10 p-8">
            {/* Success Icon with Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Outer Circle - Pulsing */}
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-green-500/10 animate-pulse" />
                
                {/* Main Circle */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50 animate-scale-in">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                
                {/* Sparkles around icon */}
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-green-400 animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse delay-300" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-white bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent">
                Payment Request Submitted!
              </h2>
              
              <p className="text-gray-300 text-lg">
                Your payment request has been submitted. Admin will review and approve your enrollment soon. The course will be available once approved.
              </p>

              {course && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <div className="text-left">
                      <p className="text-white font-semibold">{course.title}</p>
                      <p className="text-gray-400 text-sm">Enrollment pending admin approval</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                {selectedPaymentMethod === "offline" ? (
                  <Button
                    onClick={() => router.push("/learning/my-courses")}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold h-12"
                  >
                    Go to My Courses
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push(`/learning/courses/${course?.id}`)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold h-12"
                  >
                    Start Learning
                  </Button>
                )}
              </div>

              {/* Auto-redirect notice */}
              <p className="text-gray-500 text-xs mt-4">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
