"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, ArrowRight, Sparkles, PartyPopper, ShoppingBag } from "lucide-react"
import { Suspense } from "react"
import Image from "next/image"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const groupId = searchParams.get("groupId")

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      {/* Background Effects with Markano colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e63946]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#013565]/30 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Confetti-like elements */}
        <div
          className="absolute top-20 left-[20%] w-4 h-4 bg-[#e63946] rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-32 right-[25%] w-3 h-3 bg-[#e63946] rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="absolute top-40 left-[30%] w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        />
        <div
          className="absolute top-28 right-[35%] w-3 h-3 bg-[#e63946] rounded-full animate-bounce"
          style={{ animationDelay: "0.6s" }}
        />
        <div
          className="absolute top-36 left-[40%] w-4 h-4 bg-white/50 rounded-full animate-bounce"
          style={{ animationDelay: "0.8s" }}
        />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Markano Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image src="/images/markano-logo.png" alt="Markano" width={40} height={40} className="object-contain" />
          <span className="text-white font-bold text-xl">Markano</span>
        </div>

        {/* Success Icon with Markano colors */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#e63946] to-[#c1121f] flex items-center justify-center animate-scale-in shadow-2xl shadow-[#e63946]/30">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-4 -right-4">
            <PartyPopper className="w-12 h-12 text-[#e63946] animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -left-4">
            <Sparkles className="w-10 h-10 text-[#e63946] animate-pulse delay-500" />
          </div>
          <div className="absolute -top-2 -left-6">
            <ShoppingBag className="w-8 h-8 text-white/50 animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fadeIn">Congratulations!</h1>
        <p className="text-xl text-[#e63946] mb-6 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
          Your E-commerce Plan Has Been Submitted
        </p>

        <p className="text-gray-400 mb-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          {groupId ? (
            <>
              Group <span className="text-white font-semibold">{groupId}</span> has successfully submitted their
              e-commerce implementation plan.
            </>
          ) : (
            <>Your group has successfully submitted the e-commerce implementation plan.</>
          )}{" "}
          Your instructor will review it soon.
        </p>

        {/* Actions */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn"
          style={{ animationDelay: "0.3s" }}
        >
          <Button
            onClick={() => router.push("/ecommerce-wizard")}
            variant="outline"
            className="w-full sm:w-auto border-[#e63946]/30 text-gray-400 hover:text-white hover:border-[#e63946] hover:bg-[#e63946]/10 bg-transparent transition-all duration-300"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          {groupId && (
            <Button
              onClick={() => router.push(`/ecommerce-wizard/wizard/${groupId}`)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#e63946] to-[#c1121f] hover:shadow-lg hover:shadow-[#e63946]/30 text-white transition-all duration-300"
            >
              View Submission
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Info Box with Markano colors */}
        <div
          className="mt-12 p-6 rounded-xl bg-[#1e293b]/50 border border-[#e63946]/20 text-left animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#e63946]" />
            What happens next?
          </h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#e63946]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-[#e63946]" />
              </div>
              Your submission will be reviewed by your instructor
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#e63946]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-[#e63946]" />
              </div>
              You may receive feedback or approval within 2-3 business days
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#e63946]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-[#e63946]" />
              </div>
              You can still edit your submission until it&apos;s approved
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div
          className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-sm animate-fadeIn"
          style={{ animationDelay: "0.5s" }}
        >
          <span>Powered by</span>
          <span className="text-[#e63946] font-semibold">Markano</span>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
