"use client"

import { Navbar } from "@/components/navbar"
import { ReviewForm } from "@/components/review-form"
import { Star } from "lucide-react"
import Link from "next/link"

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f8] via-white to-[#f0f9f8]">
      <Navbar />
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2596be]/10 text-[#2596be] text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-[#2596be]" />
            Share your experience
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-3">
            Submit a review
          </h1>
          <p className="text-[#64748b] text-lg">
            Your name, company, photo, message, and star rating. Optionally choose the course you completed. Reviews appear after admin approval.
          </p>
        </div>
        <div className="bg-white rounded-3xl border-2 border-[#2596be]/15 shadow-[0_16px_48px_rgba(37,150,190,0.08)] p-6 md:p-10">
          <ReviewForm />
        </div>
        <p className="text-center mt-6 text-sm text-[#64748b]">
          <Link href="/" className="text-[#2596be] font-medium hover:underline">
            ← Back to home
          </Link>
        </p>
      </section>
    </div>
  )
}
