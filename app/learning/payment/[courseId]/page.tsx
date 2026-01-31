"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Phone,
  Smartphone,
  HandCoins,
  Building2,
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
  const [wafiPayPhone, setWafiPayPhone] = useState("")
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

    if (selectedPaymentMethod === "wafi_pay") {
      const phone = wafiPayPhone.trim()
      if (!phone) {
        toast.error("Please enter your Wafi Pay phone number")
        return
      }
      if (phone.length < 8) {
        toast.error("Please enter a valid phone number")
        return
      }
    }

    setProcessing(true)

    try {
      const payload: Record<string, unknown> = {
        user_id: userId,
        course_id: course.id,
        amount: typeof course.price === "number" ? course.price : parseFloat(String(course.price || 0)),
        payment_method: selectedPaymentMethod,
      }
      if (selectedPaymentMethod === "wafi_pay" && wafiPayPhone.trim()) {
        payload.payment_reference = wafiPayPhone.trim()
      }
      const res = await fetch("/api/learning/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-8 flex items-center justify-between">
            <div className="h-10 w-32 rounded-xl bg-[#2596be]/10 animate-pulse" />
            <div className="h-5 w-24 rounded-lg bg-[#2596be]/10 animate-pulse" />
          </div>
          <div className="mb-8 h-24 rounded-2xl bg-[#2596be]/10 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border-2 border-[#2596be]/10 bg-white p-6 animate-pulse">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-[#2596be]/15" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-40 rounded-lg bg-[#2596be]/15" />
                      <div className="h-4 w-full max-w-md rounded bg-[#2596be]/10" />
                      <div className="h-4 w-3/4 rounded bg-[#2596be]/10" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-8 w-16 rounded-lg bg-[#2596be]/10" />
                        <div className="h-8 w-16 rounded-lg bg-[#2596be]/10" />
                        <div className="h-8 w-20 rounded-lg bg-[#2596be]/10" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-6 pt-2">
                <div className="h-5 w-28 rounded bg-[#2596be]/10 animate-pulse" />
                <div className="h-5 w-24 rounded bg-[#2596be]/10 animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-2xl border-2 border-[#2596be]/15 bg-white p-6 space-y-6 animate-pulse sticky top-8">
                <div className="h-8 w-36 rounded-lg bg-[#2596be]/15" />
                <div className="space-y-4">
                  <div className="h-20 rounded-xl bg-[#2596be]/10" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 rounded-lg bg-[#2596be]/10" />
                    ))}
                  </div>
                </div>
                <div className="h-px bg-[#2596be]/15" />
                <div className="h-16 rounded-xl bg-[#2596be]/15" />
                <div className="h-14 w-full rounded-xl bg-[#2596be]/20" />
              </div>
            </div>
          </div>
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
      badges: [
        { label: "Cash", Icon: HandCoins },
        { label: "Bank", Icon: Building2 },
        { label: "In Person", Icon: Banknote },
      ],
    },
    {
      id: "wafi_pay",
      name: "Wafi Pay",
      description: "Secure payment through Wafi Pay. Enter the phone number you will use to send payment.",
      icon: Wallet,
      providers: ["Hormuud", "Sahal", "Zaad"],
    },
    {
      id: "mastercard",
      name: "Mastercard",
      description: "Pay with your Mastercard. Admin will review and approve your enrollment.",
      icon: CreditCard,
      showMastercardLogo: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <Button
              onClick={() => router.push(`/learning/courses/${course.id}`)}
              variant="ghost"
              className="text-gray-600 hover:text-[#2596be] hover:bg-[#2596be]/10 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="h-4 w-4 text-emerald-500" />
              <span>Secure checkout</span>
            </div>
          </div>

          <div className="mb-8 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2596be]/10 via-[#3c62b3]/5 to-[#2596be]/10 border border-[#2596be]/15">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-1">
              Choose Payment Method
            </h1>
            <p className="text-gray-600">Select your preferred payment method to enroll in this course</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              <div className="space-y-5">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = selectedPaymentMethod === method.id
                  const badges = "badges" in method ? method.badges : null
                  const providers = "providers" in method ? (method as { providers?: string[] }).providers : null
                  const showMastercardLogo = "showMastercardLogo" in method && (method as { showMastercardLogo?: boolean }).showMastercardLogo

                  return (
                    <Card
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`cursor-pointer transition-all duration-300 bg-white border-2 rounded-2xl shadow-sm hover:shadow-lg ${
                        isSelected
                          ? "border-[#2596be] shadow-[0_12px_32px_rgba(37,150,190,0.18)] scale-[1.01] ring-2 ring-[#2596be]/20"
                          : "border-[#2596be]/12 hover:border-[#2596be]/35"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-5">
                          <div
                            className={`flex-shrink-0 p-4 rounded-2xl bg-[#2596be]/10 border-2 border-[#2596be]/20 transition-all ${isSelected ? "ring-2 ring-[#2596be]/30 bg-[#2596be]/15" : ""}`}
                          >
                            {method.id === "mastercard" && showMastercardLogo ? (
                              <div className="flex items-center justify-center gap-0.5" style={{ width: 40, height: 40 }}>
                                <div className="w-6 h-6 rounded-full bg-[#eb001b] opacity-90" style={{ marginRight: -6 }} />
                                <div className="w-6 h-6 rounded-full bg-[#f79e1b] opacity-90" style={{ marginLeft: -6 }} />
                              </div>
                            ) : (
                              <Icon className="h-7 w-7 text-[#2596be]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <h3 className="text-xl font-bold text-[#0f172a]">{method.name}</h3>
                              {isSelected && (
                                <div className="p-2 rounded-full bg-[#2596be] shadow-md">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                            {badges && (
                              <div className="flex flex-wrap gap-2">
                                {badges.map((b) => (
                                  <span key={b.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2596be]/5 border border-[#2596be]/15 text-xs font-semibold text-[#2596be]">
                                    <b.Icon className="h-3.5 w-3.5" />
                                    {b.label}
                                  </span>
                                ))}
                              </div>
                            )}
                            {providers && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {providers.map((p) => (
                                  <span key={p} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#2596be]/10 to-[#3c62b3]/10 border border-[#2596be]/20 text-sm font-bold text-[#0f172a]">
                                    <Smartphone className="h-4 w-4 text-[#2596be]" />
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                            {method.id === "wafi_pay" && isSelected && (
                              <div className="mt-4 pt-4 border-t border-[#2596be]/15" onClick={(e) => e.stopPropagation()}>
                                <Label htmlFor="wafi-pay-phone" className="text-sm font-semibold text-[#0f172a] flex items-center gap-2 mb-2">
                                  <Phone className="h-4 w-4 text-[#2596be]" />
                                  Wafi Pay phone number (lacagta ka diraysa)
                                </Label>
                                <Input
                                  id="wafi-pay-phone"
                                  type="tel"
                                  placeholder="e.g. 0612345678"
                                  value={wafiPayPhone}
                                  onChange={(e) => setWafiPayPhone(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-white border-[#2596be]/30 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 text-[#0f172a] rounded-xl"
                                />
                                <p className="text-xs text-gray-500 mt-1.5">Geli lambarka taleefanka ee aad Wafi Pay (Hormuud/Sahal/Zaad) ugu bixiso lacagta.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white border-2 border-[#2596be]/20 rounded-2xl shadow-[0_8px_24px_rgba(37,150,190,0.1)] sticky top-8 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-[#0f172a] text-2xl font-bold flex items-center gap-2">
                    <Award className="h-6 w-6 text-[#2596be]" />
                    Order Summary
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#2596be]/5 border border-[#2596be]/15">
                      <BookOpen className="h-5 w-5 text-[#2596be] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#0f172a] font-semibold mb-1 truncate">{course.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{course.description || "Course description"}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-[#2596be]/10">
                        <span className="text-gray-600 text-sm">Modules</span>
                        <span className="text-[#0f172a] font-semibold">{course.modules.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-[#2596be]/10">
                        <span className="text-gray-600 text-sm">Lessons</span>
                        <span className="text-[#0f172a] font-semibold">{totalLessons}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-[#2596be]/10">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 text-sm">Duration</span>
                        </div>
                        <span className="text-[#0f172a] font-semibold">
                          {Math.floor(course.estimated_duration_minutes / 60)}h {course.estimated_duration_minutes % 60}m
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-[#2596be]/10">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-[#2596be]" />
                          <span className="text-gray-600 text-sm">Total XP</span>
                        </div>
                        <span className="text-[#2596be] font-bold">{totalXP}</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-[#2596be]/15" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#2596be]/10 border-2 border-[#2596be]/20">
                      <span className="text-[#0f172a] font-semibold">Total Amount</span>
                      {isFree ? (
                        <span className="text-2xl font-bold text-emerald-600">FREE</span>
                      ) : (
                        <span className="text-2xl font-bold text-[#2596be]">${coursePrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={
                      !selectedPaymentMethod ||
                      processing ||
                      isFree ||
                      (selectedPaymentMethod === "wafi_pay" && !wafiPayPhone.trim())
                    }
                    className="w-full bg-[#2596be] hover:bg-[#1e7a9e] text-white font-bold h-14 text-lg shadow-lg shadow-[#2596be]/25 hover:shadow-[#2596be]/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
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

      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-[500px] bg-white border-2 border-[#2596be]/20 shadow-2xl shadow-[#2596be]/15 overflow-hidden rounded-2xl p-0">
          <div className="relative z-10 p-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[#2596be]/10 border-2 border-[#2596be]/30 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-[#2596be]" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-[#0f172a]">
                Payment Request Submitted!
              </h2>
              <p className="text-gray-600 text-base">
                Your payment request has been submitted. Admin will review and approve your enrollment soon. The course will be available once approved.
              </p>

              {course && (
                <div className="mt-6 p-4 rounded-xl bg-[#2596be]/5 border border-[#2596be]/20">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#2596be]" />
                    <div className="text-left">
                      <p className="text-[#0f172a] font-semibold">{course.title}</p>
                      <p className="text-gray-500 text-sm">Enrollment pending admin approval</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {selectedPaymentMethod === "offline" ? (
                  <Button
                    onClick={() => router.push("/learning/my-courses")}
                    className="flex-1 bg-[#2596be] hover:bg-[#1e7a9e] text-white font-bold h-12 rounded-xl"
                  >
                    Go to My Courses
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push(`/learning/courses/${course?.id}`)}
                    className="flex-1 bg-[#2596be] hover:bg-[#1e7a9e] text-white font-bold h-12 rounded-xl"
                  >
                    Start Learning
                  </Button>
                )}
              </div>

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
