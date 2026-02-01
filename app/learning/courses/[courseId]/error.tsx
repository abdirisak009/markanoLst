"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function CourseError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Course page error]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafb] via-[#ffffff] to-[#f8fafb] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#e2e8f0] shadow-xl p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#2596be]/10 flex items-center justify-center mx-auto mb-4 border border-[#2596be]/20">
          <BookOpen className="h-8 w-8 text-[#2596be]" />
        </div>
        <h1 className="text-xl font-bold text-[#0f172a] mb-2">Something went wrong</h1>
        <p className="text-[#64748b] text-sm mb-6">
          The lesson page could not load. Please try again or go back to courses.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-[#2596be] hover:bg-[#1e7a9e] text-white rounded-xl font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button asChild variant="outline" className="border-[#2596be]/30 text-[#2596be] hover:bg-[#2596be]/10 rounded-xl">
            <Link href="/learning/courses">Back to courses</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
