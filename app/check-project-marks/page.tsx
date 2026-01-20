"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Sparkles, Trophy, Star, Award, ExternalLink, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface TemporaryActivity {
  id: number
  activity: string
  created_at: string
  updated_at: string
}

export default function CheckProjectMarksPage() {
  const [studentId, setStudentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [studentMarks, setStudentMarks] = useState<TemporaryActivity | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [submittingRating, setSubmittingRating] = useState(false)

  const handleRatingSubmit = async (selectedRating: number) => {
    if (!studentMarks) return

    try {
      setSubmittingRating(true)
      const response = await fetch("/api/admin/temporary-activities/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: studentMarks.id,
          rating: selectedRating,
          student_id: studentId.trim(),
        }),
      })

      if (response.ok) {
        setRating(selectedRating)
        toast.success("Thank you for your rating!")
        // Update local state
        setStudentMarks({ ...studentMarks, rating: selectedRating })
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to submit rating")
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast.error("Failed to submit rating")
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleCheckMarks = async () => {
    if (!studentId.trim()) {
      toast.error("Please enter your Student ID")
      return
    }

    try {
      setLoading(true)
      setStudentMarks(null)
      setShowPopup(false)

      // Use dedicated search endpoint
      const response = await fetch(`/api/admin/temporary-activities/search?studentId=${encodeURIComponent(studentId.trim())}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch marks" }))
        throw new Error(errorData.error || "Failed to fetch marks")
      }

      const foundActivity = await response.json()

      if (foundActivity) {
        setStudentMarks(foundActivity)
        setRating(foundActivity.rating || 0)
        setShowPopup(true)

        // Send automatic WhatsApp message
        try {
          const whatsappResponse = await fetch("/api/admin/temporary-activities/send-whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: studentId.trim(),
              activity_marks: foundActivity.activity,
            }),
          })

          const whatsappData = await whatsappResponse.json()
          
          if (whatsappData.success) {
            console.log("WhatsApp message sent successfully")
          } else if (whatsappData.found === false) {
            console.log("Student not found in university_students table - WhatsApp not sent")
          } else if (whatsappData.hasPhone === false) {
            console.log("Student found but no phone number - WhatsApp not sent")
          } else {
            console.warn("Failed to send WhatsApp:", whatsappData.error)
          }
        } catch (whatsappError) {
          // Don't show error to user, just log it
          console.error("Error sending WhatsApp message:", whatsappError)
        }
      } else {
        toast.error(`No marks found for Student ID: ${studentId.trim()}`)
      }
    } catch (error) {
      console.error("Error checking marks:", error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Main Card - Dark, Amazing and Beautiful */}
        <Card className="w-full max-w-md bg-[#0a0a0f] border-2 border-[#e63946]/20 backdrop-blur-2xl shadow-2xl animate-slide-up relative overflow-hidden">
          {/* Animated Border Glow */}
          <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-[#e63946]/30 via-purple-500/20 to-[#e63946]/30 animate-border-glow" style={{
            maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
            padding: '2px'
          }} />
          
          {/* Dark Base with Amazing Patterns */}
          <div className="absolute inset-0 bg-[#0a0a0f] opacity-95" />
          
          {/* Amazing Pattern Layers */}
          <div className="absolute inset-0 opacity-30">
            {/* Animated Radial Gradients */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(230, 57, 70, 0.3) 0%, transparent 60%),
                radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 60%),
                radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 60%)
              `,
              backgroundSize: '200% 200%',
              animation: 'pattern-move 25s ease infinite'
            }} />
            
            {/* Diagonal Line Patterns */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(230, 57, 70, 0.08) 10px, rgba(230, 57, 70, 0.08) 20px)',
            }} />
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(147, 51, 234, 0.06) 15px, rgba(147, 51, 234, 0.06) 30px)',
            }} />
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(230, 57, 70, 0.04) 20px, rgba(230, 57, 70, 0.04) 40px)',
            }} />
            
            {/* Dot Grid Pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(230, 57, 70, 0.15) 1.5px, transparent 1.5px)',
              backgroundSize: '25px 25px',
            }} />
            
            {/* Hexagonal Pattern Effect */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(230, 57, 70, 0.03) 2px, rgba(230, 57, 70, 0.03) 4px),
                repeating-linear-gradient(60deg, transparent, transparent 2px, rgba(147, 51, 234, 0.03) 2px, rgba(147, 51, 234, 0.03) 4px),
                repeating-linear-gradient(120deg, transparent, transparent 2px, rgba(230, 57, 70, 0.03) 2px, rgba(230, 57, 70, 0.03) 4px)
              `,
            }} />
          </div>
          
          {/* Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent animate-shimmer-overlay pointer-events-none" />
          
          {/* Corner Glow Accents */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#e63946]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          
          <CardContent className="p-8 sm:p-10 space-y-6 relative z-10">
            {/* Logo Inside Form - Amazing Design */}
            <div className="text-center mb-6 animate-fade-in">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-4">
                {/* Glowing Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-[#e63946]/30 animate-spin-slow" style={{ animationDuration: '8s' }} />
                <div className="absolute inset-2 rounded-full border border-purple-500/20 animate-spin-slow-reverse" style={{ animationDuration: '12s' }} />
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#e63946]/30 via-purple-500/20 to-[#e63946]/30 rounded-full blur-xl animate-pulse" />
                <div className="absolute -inset-4 bg-gradient-to-br from-[#e63946]/10 to-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Logo */}
                <div className="relative w-full h-full z-10">
                  <Image
                    src="/images/markano-logo-new.png"
                    alt="Markano"
                    fill
                    className="object-contain drop-shadow-[0_0_40px_rgba(230,57,70,1)] animate-float-logo"
                    priority
                  />
                </div>
                
                {/* Sparkle Effects */}
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#e63946] rounded-full blur-sm animate-sparkle" style={{ animationDelay: '0s' }} />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-purple-400 rounded-full blur-sm animate-sparkle" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-0 w-2 h-2 bg-yellow-400 rounded-full blur-sm animate-sparkle" style={{ animationDelay: '2s' }} />
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] mb-4 shadow-lg shadow-[#e63946]/30 animate-pulse-slow relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Check Your Project Marks
              </h2>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <label htmlFor="studentId" className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-[#e63946] to-purple-500 rounded-full" />
                  Student ID
                </label>
                <div className="relative group">
                  {/* Input Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e63946] via-purple-500 to-[#e63946] rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
                  
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Enter your Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !loading && handleCheckMarks()}
                    className="relative bg-[#0a0a0f] border-2 border-white/15 text-white text-base sm:text-lg py-6 sm:py-7 focus:border-[#e63946] focus:ring-4 focus:ring-[#e63946]/40 transition-all duration-300 placeholder:text-gray-600 shadow-inner"
                    disabled={loading}
                  />
                  
                  {/* Animated Border on Focus */}
                  <div className="absolute inset-0 rounded-md border-2 border-[#e63946] opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none" />
                  
                  {/* Inner Glow */}
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-[#e63946]/0 via-[#e63946]/10 to-[#e63946]/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              <Button
                onClick={handleCheckMarks}
                disabled={loading || !studentId.trim()}
                className="w-full bg-gradient-to-r from-[#e63946] via-[#ff6b6b] to-[#e63946] hover:from-[#d62839] hover:via-[#e63946] hover:to-[#d62839] text-white font-black py-6 sm:py-7 text-base sm:text-lg shadow-2xl shadow-[#e63946]/40 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group border-2 border-[#e63946]/50"
              >
                {/* Multiple Shimmer Effects */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#e63946]/50 via-white/20 to-[#e63946]/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500" style={{ animationDelay: '0.2s' }} />
                
                {/* Pulsing Glow */}
                <div className="absolute inset-0 bg-[#e63946] opacity-0 group-hover:opacity-20 animate-pulse" />
                
                {/* Button Content */}
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Check Project Marks
                    </>
                  )}
                </span>
                
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/30" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <p className="text-gray-500 text-xs sm:text-sm">© 2025 Markano. All rights reserved.</p>
        </div>
      </div>

      {/* Congratulations Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10 text-white max-w-md p-0 overflow-hidden">
          <div className="relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#e63946]/20 to-purple-500/20 blur-2xl" />

            {/* Content */}
            <div className="relative z-10 p-8 text-center">
              {/* Animated Icons */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-24 h-24 text-[#e63946] animate-pulse" />
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#e63946]/50 animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2">
                  <Star className="w-8 h-8 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Award className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
              </div>

              <DialogTitle className="text-3xl font-black mb-3 bg-gradient-to-r from-[#e63946] to-[#ff6b6b] bg-clip-text text-transparent">
                Congratulations! 🎉
              </DialogTitle>

              <DialogDescription className="text-gray-300 text-lg mb-6">
                {studentMarks ? "Your project marks:" : "Your project marks have been successfully recorded!"}
              </DialogDescription>

              {studentMarks && (
                <div className="mb-6 p-6 bg-gradient-to-br from-[#e63946]/10 to-purple-500/10 rounded-xl border border-[#e63946]/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Student ID:</span>
                      <span className="text-white font-bold text-lg">{studentId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Activity Marks:</span>
                      <span className="text-[#e63946] font-black text-2xl">{studentMarks.activity.replace(/Student ID:.*?/i, "").trim() || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Submitted:</span>
                      <span className="text-gray-300 text-sm">
                        {new Date(studentMarks.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!studentMarks && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Your submission has been received</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Marks will be available soon</span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setShowPopup(false)}
                className="w-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white font-bold py-6 text-lg shadow-lg shadow-[#e63946]/30"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Star Rating Component - Below Popup */}
      {studentMarks && showPopup && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-auto">
          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-2 border-[#e63946]/30 shadow-2xl animate-slide-up">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-white font-bold mb-4 text-lg flex items-center justify-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    Rate Your Experience
                  </p>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRatingSubmit(star)
                        }}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        disabled={submittingRating}
                        className="transition-all duration-200 transform hover:scale-125 active:scale-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{ pointerEvents: submittingRating ? 'none' : 'auto' }}
                      >
                        <Star
                          className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ${
                            star <= (hoveredRating || rating)
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                              : "text-gray-600 fill-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-gray-300 text-sm mt-3 font-medium">
                      You rated {rating} {rating === 1 ? "star" : "stars"} ⭐
                    </p>
                  )}
                  {submittingRating && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Loader2 className="w-4 h-4 animate-spin text-[#e63946]" />
                      <span className="text-gray-400 text-sm">Submitting rating...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pattern-move {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes float-logo {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.02);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes border-glow {
          0%, 100% {
            opacity: 0.3;
            box-shadow: 0 0 20px rgba(230, 57, 70, 0.3), 0 0 40px rgba(147, 51, 234, 0.2);
          }
          50% {
            opacity: 0.6;
            box-shadow: 0 0 30px rgba(230, 57, 70, 0.5), 0 0 60px rgba(147, 51, 234, 0.4);
          }
        }

        @keyframes shimmer-overlay {
          0% {
            transform: translateX(-100%) translateY(-100%);
          }
          100% {
            transform: translateX(100%) translateY(100%);
          }
        }

        .animate-border-glow {
          animation: border-glow 3s ease-in-out infinite;
        }

        .animate-shimmer-overlay {
          animation: shimmer-overlay 4s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 12s linear infinite;
        }

        .animate-float-logo {
          animation: float-logo 4s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        /* Mobile Optimizations */
        @media (max-width: 640px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: 100dvh; /* Dynamic viewport height for mobile */
          }
        }
      `}</style>
    </div>
  )
}
