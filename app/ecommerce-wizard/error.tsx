"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] E-commerce Wizard Error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#e63946]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-[#e63946]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-8">{error.message || "An unexpected error occurred. Please try again."}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#e63946] text-white font-medium rounded-xl hover:bg-[#c1121f] transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-[#1e293b] text-white font-medium rounded-xl hover:bg-[#2d3a4f] transition-colors flex items-center gap-2 border border-[#e63946]/20"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
