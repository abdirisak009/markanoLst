"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertTriangle, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUniversityStudents, type UniversityStudent } from "@/lib/admin-data"

export default function AllStudentsPage() {
  const [students, setStudents] = useState<UniversityStudent[]>([])
  const [needsAttention, setNeedsAttention] = useState(0)

  useEffect(() => {
    const allStudents = getUniversityStudents()
    setStudents(allStudents)
    setNeedsAttention(allStudents.filter((s) => s.avgProgress < 50).length)
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Student Management</h1>
          <p className="text-gray-500 mt-1">Track and monitor student progress</p>
        </div>
      </div>

      {needsAttention > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-400 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-semibold text-orange-800">Students Needing Attention</p>
              <p className="text-sm text-orange-700">{needsAttention} students with below 50% average completion.</p>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-[#1e3a5f]">All Students</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Showing {students.length} students</p>
            </div>
            <select className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm hover:shadow-md transition-all">
              <option>All Classes</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Avg Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Watch Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`transition-all hover:bg-pink-50 hover:shadow-sm ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{student.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">—</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium text-xs">
                        {student.completedLessons} / {student.totalLessons}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all"
                            style={{ width: `${student.avgProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{student.avgProgress.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{student.watchTime}m</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
