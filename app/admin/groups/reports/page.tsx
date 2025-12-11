"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown, Users } from "lucide-react"

interface University {
  id: number
  name: string
}

interface Class {
  id: number
  name: string
  university_id: number
}

interface UngroupedStudent {
  student_id: string
  full_name: string
  gender: string
  class_name: string
  university_name: string
}

export default function GroupReportsPage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [ungroupedStudents, setUngroupedStudents] = useState<UngroupedStudent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUniversities()
  }, [])

  useEffect(() => {
    if (selectedUniversity) {
      fetchClasses(selectedUniversity)
    }
  }, [selectedUniversity])

  const fetchUniversities = async () => {
    try {
      const res = await fetch("/api/universities")
      const data = await res.json()
      setUniversities(data)
    } catch (error) {
      console.error("Error fetching universities:", error)
    }
  }

  const fetchClasses = async (universityId: string) => {
    try {
      const res = await fetch(`/api/classes?university_id=${universityId}`)
      const data = await res.json()
      setClasses(data)
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchUngroupedStudents = async () => {
    if (!selectedClass) return

    setLoading(true)
    try {
      const res = await fetch(`/api/groups/ungrouped-students?class_id=${selectedClass}`)
      const data = await res.json()
      setUngroupedStudents(data)
    } catch (error) {
      console.error("Error fetching ungrouped students:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ["Student ID", "Full Name", "Gender", "Class", "University"]
    const csvContent = [
      headers.join(","),
      ...ungroupedStudents.map((s) => [s.student_id, s.full_name, s.gender, s.class_name, s.university_name].join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ungrouped-students-${selectedClass}.csv`
    a.click()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Group Reports</h1>
            <p className="text-gray-600">View students not assigned to any group</p>
          </div>
        </div>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
            <select
              value={selectedUniversity}
              onChange={(e) => {
                setSelectedUniversity(e.target.value)
                setSelectedClass("")
                setUngroupedStudents([])
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setUngroupedStudents([])
              }}
              disabled={!selectedUniversity}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={fetchUngroupedStudents}
              disabled={!selectedClass || loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </div>
      </Card>

      {ungroupedStudents.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Ungrouped Students ({ungroupedStudents.length})</h2>
            <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent">
              <FileDown className="w-4 h-4" />
              Export to CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Full Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ungroupedStudents.map((student, index) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.student_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.gender}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.class_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedClass && ungroupedStudents.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">All students in this class are assigned to groups!</p>
        </Card>
      )}
    </div>
  )
}
