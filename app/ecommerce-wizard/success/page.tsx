"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Home,
  ArrowRight,
  Sparkles,
  PartyPopper,
  ShoppingCart,
  CreditCard,
  Package,
  Truck,
  Store,
  Star,
  Rocket,
} from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import Image from "next/image"

const FLOATING_ICONS = [
  { Icon: ShoppingCart, delay: "0s", duration: "15s", left: "5%" },
  { Icon: CreditCard, delay: "2s", duration: "18s", left: "15%" },
  { Icon: Package, delay: "4s", duration: "20s", left: "25%" },
  { Icon: Truck, delay: "1s", duration: "17s", left: "35%" },
  { Icon: Store, delay: "3s", duration: "19s", left: "55%" },
  { Icon: Star, delay: "5s", duration: "16s", left: "65%" },
  { Icon: Rocket, delay: "2s", duration: "21s", left: "75%" },
  { Icon: Sparkles, delay: "4s", duration: "14s", left: "85%" },
]

const CONFETTI_COLORS = ["#e63946", "#ff6b6b", "#ffd166", "#06d6a0", "#118ab2"]

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const groupId = searchParams.get("groupId")
  const [mounted, setMounted] = useState(false)
  const [confetti, setConfetti] = useState<Array<{ id: number; left: string; color: string; delay: string }>>([])

  useEffect(() => {
    setMounted(true)
    // Generate confetti particles
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: `${Math.random() * 3}s`,
    }))
    setConfetti(particles)
  }, [])

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(230,57,70,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(230,57,70,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#e63946]/10 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#ff6b6b]/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e63946]/5 rounded-full blur-[120px]" />

        {/* Floating e-commerce icons */}
        {mounted &&
          FLOATING_ICONS.map((item, index) => (
            <div
              key={index}
              className="absolute bottom-0 opacity-10"
              style={{
                left: item.left,
                animation: `float-up ${item.duration} linear infinite`,
                animationDelay: item.delay,
              }}
            >
              <item.Icon className="w-8 h-8 text-[#e63946]" />
            </div>
          ))}

        {/* Confetti particles */}
        {mounted &&
          confetti.map((particle) => (
            <div
              key={particle.id}
              className="absolute top-0 w-2 h-2 rounded-full opacity-80"
              style={{
                left: particle.left,
                backgroundColor: particle.color,
                animation: `confetti-fall 4s ease-in-out infinite`,
                animationDelay: particle.delay,
              }}
            />
          ))}
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <div className="flex justify-center mb-6 animate-fade-in">
          <Image src="/markano-logo.png" alt="Markano" width={120} height={40} className="opacity-80" />
        </div>

        <div className="relative mb-8 animate-scale-in">
          <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center shadow-2xl shadow-[#e63946]/30 animate-pulse">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-4 -right-4 animate-bounce">
            <PartyPopper className="w-12 h-12 text-[#ffd166]" />
          </div>
          <div className="absolute -bottom-2 -left-4 animate-pulse" style={{ animationDelay: "0.5s" }}>
            <Sparkles className="w-10 h-10 text-[#e63946]" />
          </div>
        </div>

        <h1
          className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Congratulations!
        </h1>
        <p className="text-xl text-[#e63946] mb-6 font-semibold animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Your E-commerce Plan Has Been Submitted
        </p>

        <p className="text-gray-400 mb-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          Group <span className="text-white font-semibold bg-[#e63946]/20 px-2 py-1 rounded">{groupId}</span> has
          successfully submitted their e-commerce implementation plan. Your instructor will review it soon.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <Button
            onClick={() => router.push("/ecommerce-wizard")}
            variant="outline"
            className="w-full sm:w-auto border-[#e63946]/30 text-gray-300 hover:text-white hover:border-[#e63946] hover:bg-[#e63946]/10 transition-all duration-300"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={() => router.push(`/ecommerce-wizard/wizard/${groupId}`)}
            className="w-full sm:w-auto bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e63946] text-white shadow-lg shadow-[#e63946]/30 hover:shadow-xl hover:shadow-[#e63946]/40 transition-all duration-300 hover:scale-105"
          >
            View Submission
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div
          className="mt-12 p-6 rounded-2xl bg-[#1e293b]/80 border border-[#e63946]/20 text-left backdrop-blur-sm animate-fade-in shadow-xl"
          style={{ animationDelay: "0.6s" }}
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#e63946]" />
            What happens next?
          </h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#e63946]/5 transition-colors duration-200">
              <CheckCircle2 className="w-5 h-5 text-[#e63946] mt-0.5 flex-shrink-0" />
              <span>Your submission will be reviewed by your instructor</span>
            </li>
            <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#e63946]/5 transition-colors duration-200">
              <CheckCircle2 className="w-5 h-5 text-[#e63946] mt-0.5 flex-shrink-0" />
              <span>You may receive feedback or approval within 2-3 business days</span>
            </li>
            <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#e63946]/5 transition-colors duration-200">
              <CheckCircle2 className="w-5 h-5 text-[#e63946] mt-0.5 flex-shrink-0" />
              <span>You can still edit your submission until it&apos;s approved</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: "0.7s" }}>
          Powered by <span className="text-[#e63946] font-semibold">Markano</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.1;
          }
          90% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-10 h-10 border-3 border-[#e63946] border-t-transparent rounded-full" />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
