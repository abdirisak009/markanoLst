"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, ArrowRight, Sparkles, PartyPopper } from "lucide-react"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const groupId = searchParams.get("groupId")

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9ed674]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1d4041]/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Success Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#1d4041] to-[#9ed674] flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-4 -right-4">
            <PartyPopper className="w-12 h-12 text-[#9ed674] animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -left-4">
            <Sparkles className="w-10 h-10 text-[#9ed674] animate-pulse delay-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Congratulations!</h1>
        <p className="text-xl text-[#9ed674] mb-6">Your E-commerce Plan Has Been Submitted</p>

        <p className="text-gray-400 mb-8">
          Group <span className="text-white font-semibold">{groupId}</span> has successfully submitted their e-commerce
          implementation plan. Your instructor will review it soon.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => router.push("/ecommerce-wizard")}
            variant="outline"
            className="w-full sm:w-auto border-[#1d4041] text-gray-400 hover:text-white hover:border-[#9ed674]/50"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={() => router.push(`/ecommerce-wizard/wizard/${groupId}`)}
            className="w-full sm:w-auto bg-gradient-to-r from-[#1d4041] to-[#9ed674]/80 hover:from-[#9ed674] hover:to-[#1d4041] text-white"
          >
            View Submission
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30 text-left">
          <h3 className="text-white font-semibold mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9ed674] mt-0.5 flex-shrink-0" />
              Your submission will be reviewed by your instructor
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9ed674] mt-0.5 flex-shrink-0" />
              You may receive feedback or approval within 2-3 business days
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9ed674] mt-0.5 flex-shrink-0" />
              You can still edit your submission until it&apos;s approved
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#9ed674] border-t-transparent rounded-full" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
