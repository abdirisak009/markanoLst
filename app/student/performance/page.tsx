"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2, Sparkles } from "lucide-react"
import Image from "next/image"

interface Assignment {
  id: number
  title: string
  max_marks: number
  marks_obtained: number | null
}

interface StudentInfo {
  student_id: string
  full_name: string
  class_name: string
}

export default function StudentPerformancePage() {
  const [studentId, setStudentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const searchPerformance = async () => {
    if (!studentId.trim()) {
      setError("Fadlan geli Student ID-kaaga")
      return
    }

    setLoading(true)
    setError("")
    setStudent(null)
    setAssignments([])

    try {
      const res = await fetch("/api/students/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch performance")
      }

      setStudent(data.student)
      setAssignments(data.assignments)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wax khalad ah ayaa dhacay")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (obtained: number | null, max: number) => {
    if (obtained === null || obtained === 0) return "text-gray-400"
    const percentage = (obtained / max) * 100
    if (percentage >= 80) return "text-[#ff1b4a]"
    if (percentage >= 60) return "text-[#facc15]"
    if (percentage >= 40) return "text-[#fb923c]"
    return "text-gray-400"
  }

  const formatScore = (score: number | null): string => {
    if (score === null) return "-"
    const num = Number(score)
    return Number.isInteger(num) ? String(num) : num.toFixed(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchPerformance()
    }
  }

  const totalObtained = assignments.reduce((sum, a) => sum + (Number(a.marks_obtained) || 0), 0)
  const totalMax = assignments.reduce((sum, a) => sum + (Number(a.max_marks) || 0), 0)

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-[#ff1b4a]/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#013565]/40 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#ff1b4a]/10 rounded-full blur-[100px] animate-pulse delay-500" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Diagonal Lines */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12 relative z-10">
        <div className="mb-6 sm:mb-10 relative group">
          <div className="absolute inset-0 bg-[#ff1b4a]/30 rounded-full blur-2xl scale-75 group-hover:scale-100 transition-transform duration-500" />
          <Image
            src="/images/markanologo.png"
            alt="Markano"
            width={160}
            height={160}
            className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 relative z-10 drop-shadow-2xl transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Title with gradient */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 text-center">Student Results</h1>
        <p className="text-gray-400 text-sm sm:text-base mb-8 sm:mb-10 text-center max-w-md">
          Geli ID-kaaga si aad u aragto buundooyinkaaga
        </p>

        {/* Search Section with glass effect */}
        <div className="w-full max-w-md space-y-4">
          {/* Search Input */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff1b4a]/20 to-[#013565]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Student ID (e.g., 137489)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 sm:py-5 bg-white/95 backdrop-blur-sm border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff1b4a] focus:ring-4 focus:ring-[#ff1b4a]/20 transition-all duration-300 text-base sm:text-lg font-medium shadow-xl"
              />
            </div>
          </div>

          {/* Button with enhanced styling */}
          <button
            onClick={searchPerformance}
            disabled={loading}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#ff1b4a] to-[#e01543] hover:from-[#e01543] hover:to-[#c91038] text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 text-base sm:text-lg shadow-2xl shadow-[#ff1b4a]/30 hover:shadow-[#ff1b4a]/50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Raadinta...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Check Result
              </span>
            )}
          </button>

          {/* Error Message with animation */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center animate-in fade-in shake duration-300">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section with staggered animations */}
        {student && (
          <div className="w-full max-w-md mt-8 sm:mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Results Card with glass morphism */}
            <div className="bg-[#111d32]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Card Header */}
              <div className="p-6 sm:p-8 text-center border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">{student.full_name}</h2>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff1b4a]/20 to-[#ff1b4a]/10 border border-[#ff1b4a]/30 rounded-full shadow-lg shadow-[#ff1b4a]/10">
                  <span className="text-gray-400 text-sm">ID:</span>
                  <span className="text-[#ff1b4a] font-mono font-bold text-lg">{student.student_id}</span>
                </div>
                {student.class_name && (
                  <p className="text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-[#ff1b4a] rounded-full animate-pulse" />
                    {student.class_name}
                  </p>
                )}
              </div>

              {/* Assignments List */}
              <div className="p-4 sm:p-5 space-y-3">
                {assignments.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Weli ma jiraan assignments</p>
                ) : (
                  assignments.map((assignment, index) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 sm:p-5 bg-[#1a2b47]/60 hover:bg-[#1f3354]/80 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 border border-transparent hover:border-white/10 group"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "fadeInUp 0.5s ease forwards",
                      }}
                    >
                      <span className="text-white font-medium truncate pr-4 text-sm sm:text-base group-hover:text-white/90 transition-colors">
                        {assignment.title}
                      </span>
                      <span
                        className={`font-bold text-lg sm:text-xl whitespace-nowrap transition-all duration-300 group-hover:scale-110 ${getScoreColor(assignment.marks_obtained, assignment.max_marks)}`}
                      >
                        {formatScore(assignment.marks_obtained)}/{assignment.max_marks}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Summary with enhanced styling */}
              {assignments.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-white/10">
                  <div className="flex items-center justify-between p-5 sm:p-6 bg-gradient-to-r from-[#ff1b4a]/20 via-[#ff1b4a]/10 to-[#ff1b4a]/20 rounded-2xl border border-[#ff1b4a]/30 shadow-lg shadow-[#ff1b4a]/10 hover:shadow-[#ff1b4a]/20 transition-all duration-300">
                    <span className="text-gray-300 font-semibold text-base sm:text-lg">Wadarta Guud</span>
                    <span className="text-[#ff1b4a] font-bold text-2xl sm:text-3xl">
                      {formatScore(totalObtained)}/{totalMax}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 sm:py-8 text-center relative z-10">
        <p className="text-gray-500 text-sm">
          Powered by{" "}
          <span className="text-[#ff1b4a] font-bold hover:text-[#ff3d6a] transition-colors cursor-pointer">
            Markano
          </span>{" "}
          Learning Management System
        </p>
      </footer>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
