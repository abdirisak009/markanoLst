"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileSpreadsheet } from "lucide-react"

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
      const res = await fetch(`/api/reports/ungrouped-students?class_id=${selectedClass}`)
      const data = await res.json()
      setUngroupedStudents(data)
    } catch (error) {
      console.error("Error fetching ungrouped students:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    const headers = ["Student ID", "Full Name", "Gender", "Class", "University"]
    const rows = ungroupedStudents.map((s) => [s.student_id, s.full_name, s.gender, s.class_name, s.university_name])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url

    const className = classes.find((c) => c.id.toString() === selectedClass)?.name || "class"
    a.download = `Students-Group-laanta-${className}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Group Reports</h1>
            <p className="text-gray-600">Liiska ardayda aan group lahayn (Students without groups)</p>
          </div>
        </div>
      </div>

      <Card className="p-6 mb-6 shadow-lg border-0 bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Doorashada Class-ka (Filter Options)</h2>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setUngroupedStudents([])
              }}
              disabled={!selectedUniversity}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Dooro Class</option>
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
            >
              {loading ? "Ku shaqeynaya..." : "Soo Bandhig Liiska"}
            </Button>
          </div>
        </div>
      </Card>

      {ungroupedStudents.length > 0 && (
        <Card className="p-6 shadow-lg border-0 bg-white">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ardayda Group La'aanta Ah</h2>
              <p className="text-gray-600 mt-1">
                Wadarta: <span className="font-semibold text-blue-600">{ungroupedStudents.length}</span> students
              </p>
            </div>
            <Button
              onClick={exportToExcel}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Daji Excel (Download Excel)
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Magaca Oo Dhan (Full Name)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Jinsiga (Gender)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ungroupedStudents.map((student, index) => (
                  <tr key={student.student_id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{student.student_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.class_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedClass && ungroupedStudents.length === 0 && !loading && (
        <Card className="p-12 text-center shadow-lg border-0 bg-white">
          <div className="inline-flex p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
            <Users className="w-16 h-16 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Waa Fiican!</h3>
          <p className="text-gray-600">Dhammaan ardayda class-kan waxay ka tirsan yihiin groups!</p>
          <p className="text-gray-500 text-sm mt-1">(All students in this class are assigned to groups)</p>
        </Card>
      )}
    </div>
  )
}
