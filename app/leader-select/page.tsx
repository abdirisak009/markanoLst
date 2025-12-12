"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Users, AlertCircle } from "lucide-react"

interface University {
  id: number
  name: string
}

interface Class {
  id: number
  name: string
}

interface Student {
  id: number
  student_id: string
  full_name: string
  gender: string
}

interface Group {
  id: number
  name: string
  class_id: number
  leader_student_id: string
}

function LeaderSelectContent() {
  const searchParams = useSearchParams()
  const universityIdParam = searchParams.get("university")

  const [step, setStep] = useState(1)
  const [universities, setUniversities] = useState<University[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  const [formData, setFormData] = useState({
    university_id: universityIdParam || "",
    class_id: "",
    leader_id: "",
  })

  const [verifiedLeader, setVerifiedLeader] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUniversities()
    if (universityIdParam) {
      setFormData((prev) => ({ ...prev, university_id: universityIdParam }))
    }
  }, [universityIdParam])

  useEffect(() => {
    if (formData.university_id) {
      fetchClasses()
    }
  }, [formData.university_id])

  const fetchUniversities = async () => {
    const res = await fetch("/api/universities")
    const data = await res.json()
    setUniversities(data)
  }

  const fetchClasses = async () => {
    const res = await fetch("/api/classes")
    const allClasses = await res.json()
    const filtered = allClasses.filter((c: any) => c.university_id === Number(formData.university_id))
    setClasses(filtered)
  }

  const handleVerifyLeader = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] ====== Leader Verification Attempt ======")
    console.log("[v0] Form data:", formData)

    try {
      const payload = {
        university_id: formData.university_id,
        class_id: formData.class_id,
        student_id: formData.leader_id,
      }

      console.log("[v0] Sending verification request with payload:", payload)

      const res = await fetch("/api/groups/leader-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("[v0] Response status:", res.status)
      console.log("[v0] Response ok:", res.ok)

      const data = await res.json()
      console.log("[v0] Response data:", data)

      if (res.ok) {
        console.log("[v0] ✅ Leader verified successfully!")
        setVerifiedLeader(data)
        setStep(2)
        fetchAvailableStudents(data.class_id)
      } else {
        console.error("[v0] ❌ Verification failed:", data.error)
        setError(data.error || "Leader not found or not assigned to any group in this class")
      }
    } catch (error) {
      console.error("[v0] ❌ Exception during verification:", error)
      console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
      setError("An error occurred during verification. Check the console for details.")
    } finally {
      setLoading(false)
      console.log("[v0] ====== Leader Verification Complete ======")
    }
  }

  const fetchAvailableStudents = async (classId: number) => {
    try {
      const res = await fetch(`/api/groups/students-available?class_id=${classId}`)
      const data = await res.json()

      // Ensure data is an array before setting
      if (Array.isArray(data)) {
        setStudents(data)
      } else {
        console.error("[v0] Available students response is not an array:", data)
        setStudents([])
        setError("Failed to load available students")
      }
    } catch (error) {
      console.error("[v0] Error fetching available students:", error)
      setStudents([])
      setError("Failed to load available students")
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const handleSubmitMembers = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one member")
      return
    }

    setError("")
    setLoading(true)

    try {
      console.log("[v0] ============ CLIENT SUBMISSION START ============")
      console.log("[v0] Submitting members:", {
        group_id: verifiedLeader.group_id,
        student_ids: selectedStudents,
        class_id: verifiedLeader.class_id,
        leader_student_id: verifiedLeader.student_id,
      })

      const apiUrl = `/api/groups/${verifiedLeader.group_id}/members`
      console.log("[v0] API URL:", apiUrl)

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: selectedStudents,
          class_id: verifiedLeader.class_id,
          leader_student_id: verifiedLeader.student_id,
        }),
      })

      console.log("[v0] Response status:", res.status)
      console.log("[v0] Response ok:", res.ok)

      const data = await res.json()
      console.log("[v0] Server response data:", data)

      if (res.ok) {
        console.log("[v0] ✅ Successfully added members!")
        console.log("[v0] ============ CLIENT SUBMISSION SUCCESS ============")
        setStep(3)
      } else {
        console.error("[v0] ❌ Failed to add members:", data.error)
        console.error("[v0] Error details:", data.details)
        console.error("[v0] ============ CLIENT SUBMISSION FAILED ============")
        setError(data.error || "Failed to add members. Check console for details.")
      }
    } catch (error) {
      console.error("[v0] ❌ Exception while submitting members:", error)
      console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
      console.error("[v0] ============ CLIENT SUBMISSION ERROR ============")
      setError(`An error occurred while adding members: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Success!</h1>
          <p className="text-gray-600 mb-2">
            You have successfully selected {selectedStudents.length} member{selectedStudents.length !== 1 ? "s" : ""}{" "}
            for your group.
          </p>
          <p className="text-sm text-gray-500">
            Group: <span className="font-semibold">{verifiedLeader.group_name}</span>
          </p>
        </div>
      </div>
    )
  }

  if (step === 2 && verifiedLeader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Select Group Members
              </h1>
              <p className="text-gray-600">
                Group: <span className="font-semibold">{verifiedLeader.group_name}</span> | Leader:{" "}
                <span className="font-semibold">{verifiedLeader.full_name}</span>
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Selected: <span className="font-bold text-blue-500">{selectedStudents.length}</span> student
                {selectedStudents.length !== 1 ? "s" : ""}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => toggleStudent(student.student_id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedStudents.includes(student.student_id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{student.full_name}</p>
                        <p className="text-sm text-gray-500">{student.student_id}</p>
                      </div>
                      {selectedStudents.includes(student.student_id) && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmitMembers}
              disabled={selectedStudents.length === 0 || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 text-lg"
            >
              {loading
                ? "Submitting..."
                : `Submit ${selectedStudents.length} Member${selectedStudents.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leader Verification</h1>
            <p className="text-gray-600 text-sm">Select members for your group</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 mb-1">Error</p>
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-red-500 mt-2">Check the browser console (F12) for detailed logs</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerifyLeader} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
            <select
              required
              value={formData.university_id}
              onChange={(e) => setFormData({ ...formData, university_id: e.target.value, class_id: "" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
              disabled
            >
              <option value="">Select University</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              required
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.university_id}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Student ID</label>
            <input
              type="text"
              required
              value={formData.leader_id}
              onChange={(e) => setFormData({ ...formData, leader_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your student ID"
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 text-lg">
            Verify & Continue
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LeaderSelectPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LeaderSelectContent />
    </Suspense>
  )
}
