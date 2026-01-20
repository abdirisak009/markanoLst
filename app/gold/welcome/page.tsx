"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Crown, 
  Award, 
  TrendingUp, 
  Flame, 
  BookOpen,
  Target,
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react"

export default function MarkaanoGoldWelcomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if student has already seen welcome
    const storedStudent = localStorage.getItem("gold_student")
    if (!storedStudent) {
      router.push("/gold")
      return
    }
  }, [router])

  const handleStartJourney = () => {
    // Mark welcome as seen (optional - can store in DB)
    router.push("/gold/dashboard")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d62839]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#e63946]/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Header Badge */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#e63946]/20 to-[#d62839]/20 border border-[#e63946]/30 mb-6">
              <Crown className="h-5 w-5 text-[#e63946]" />
              <span className="text-lg font-bold text-[#e63946]">MARKAANO GOLD</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Welcome to Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#e63946] via-[#d62839] to-[#e63946] bg-clip-text text-transparent">
                Learning Journey
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Your premium learning experience starts here. Master new skills, earn achievements, and unlock your potential.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <Card className="bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border border-white/10 hover:border-[#e63946]/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/10">
                    <Target className="h-6 w-6 text-[#e63946]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Clear Learning Path</h3>
                    <p className="text-gray-400 text-sm">
                      Follow a structured journey from beginner to expert with clear milestones.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border border-white/10 hover:border-[#e63946]/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/10">
                    <Award className="h-6 w-6 text-[#e63946]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Earn XP & Levels</h3>
                    <p className="text-gray-400 text-sm">
                      Gain experience points, level up, and unlock achievements as you progress.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border border-white/10 hover:border-[#e63946]/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/10">
                    <Flame className="h-6 w-6 text-[#e63946]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Daily Streaks</h3>
                    <p className="text-gray-400 text-sm">
                      Build consistent learning habits with daily streaks and stay motivated.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] border border-white/10 hover:border-[#e63946]/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/10">
                    <BookOpen className="h-6 w-6 text-[#e63946]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
                    <p className="text-gray-400 text-sm">
                      See exactly where you are, what's next, and how far you've come.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Button
              onClick={handleStartJourney}
              size="lg"
              className="bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c1121f] text-white text-lg px-8 py-6 h-auto shadow-lg shadow-[#e63946]/30 hover:shadow-[#e63946]/50 transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Your Learning Journey
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
