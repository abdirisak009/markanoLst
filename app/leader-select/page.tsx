"use client"

import type React from "react"
import Image from "next/image"

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
      <div className="min-h-screen bg-gradient-to-br from-[#253c5d] via-[#2d4668] to-[#3a5578] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="mb-8 flex justify-center">
            <Image src="/images/logo.png" alt="Markano" width={200} height={120} className="object-contain" priority />
          </div>
          {/* </CHANGE> */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#ee2b50] to-[#ff4365] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#253c5d] mb-4">Guul!</h1>
          <p className="text-gray-600 mb-2">
            Waxaad si guul leh u xulatay {selectedStudents.length} xubin{selectedStudents.length !== 1 ? "ood" : ""} ee
            group-kaaga.
          </p>
          <p className="text-sm text-gray-500">
            Group: <span className="font-semibold text-[#ee2b50]">{verifiedLeader.group_name}</span>
          </p>
        </div>
      </div>
    )
  }

  if (step === 2 && verifiedLeader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#253c5d] via-[#2d4668] to-[#3a5578] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <Image
              src="/images/logo.png"
              alt="Markano"
              width={220}
              height={130}
              className="object-contain mx-auto"
              priority
            />
          </div>
          {/* </CHANGE> */}

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-[#ee2b50] to-[#ff4365] p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Xulo Group Members</h1>
              <p className="text-white/90 text-sm md:text-base">
                Group: <span className="font-semibold">{verifiedLeader.group_name}</span> | Leader:{" "}
                <span className="font-semibold">{verifiedLeader.full_name}</span>
              </p>
            </div>

            <div className="p-6 md:p-8">
              {/* Selection counter */}
              <div className="mb-6 p-4 bg-gradient-to-r from-[#253c5d] to-[#2d4668] rounded-xl">
                <p className="text-white text-center text-lg">
                  Xushay: <span className="font-bold text-[#ee2b50] text-2xl">{selectedStudents.length}</span> arday
                  {selectedStudents.length !== 1 ? "ood" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => toggleStudent(student.student_id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedStudents.includes(student.student_id)
                        ? "border-[#ee2b50] bg-gradient-to-br from-[#ee2b50]/10 to-[#ff4365]/10 shadow-md scale-105"
                        : "border-gray-200 hover:border-[#253c5d] hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#253c5d] truncate">{student.full_name}</p>
                        <p className="text-sm text-gray-500">{student.student_id}</p>
                        <p className="text-xs text-gray-400 capitalize">{student.gender}</p>
                      </div>
                      {selectedStudents.includes(student.student_id) && (
                        <div className="w-8 h-8 bg-gradient-to-br from-[#ee2b50] to-[#ff4365] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSubmitMembers}
                disabled={selectedStudents.length === 0 || loading}
                className="w-full mt-6 bg-gradient-to-r from-[#ee2b50] to-[#ff4365] hover:from-[#d62745] hover:to-[#e53c5a] text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {loading
                  ? "Ku daraya..."
                  : `Ku Dar ${selectedStudents.length} Xubin${selectedStudents.length !== 1 ? "ood" : ""}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#253c5d] via-[#2d4668] to-[#3a5578] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
        <div className="mb-8 flex justify-center">
          <Image src="/images/logo.png" alt="Markano" width={200} height={120} className="object-contain" priority />
        </div>
        {/* </CHANGE> */}

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#ee2b50] to-[#ff4365] rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#253c5d]">Xaqiijinta Leader-ka</h1>
            <p className="text-gray-600 text-xs md:text-sm">Xulo xubnaha group-kaaga</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 mb-1">Khalad</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerifyLeader} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#253c5d] mb-2">University</label>
            <select
              required
              value={formData.university_id}
              onChange={(e) => setFormData({ ...formData, university_id: e.target.value, class_id: "" })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ee2b50] focus:border-[#ee2b50] bg-gray-100 cursor-not-allowed text-sm md:text-base transition-all"
              disabled
            >
              <option value="">Dooro University</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#253c5d] mb-2">Class</label>
            <select
              required
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ee2b50] focus:border-[#ee2b50] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base transition-all"
              disabled={!formData.university_id}
            >
              <option value="">Dooro Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#253c5d] mb-2">Student ID-kaaga</label>
            <input
              type="text"
              required
              value={formData.leader_id}
              onChange={(e) => setFormData({ ...formData, leader_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ee2b50] focus:border-[#ee2b50] text-sm md:text-base transition-all"
              placeholder="Geli Student ID-kaaga"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#ee2b50] to-[#ff4365] hover:from-[#d62745] hover:to-[#e53c5a] text-white py-6 text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Xaqiijinaya..." : "Xaqiiji & Sii Wad"}
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
