"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Plus, Edit, Trash2, Search, GraduationCap, Building2 } from "lucide-react"

interface University {
  id: number
  name: string
  abbreviation: string
}

interface Class {
  id: number
  name: string
  type: string
  university_id: number
  university_name?: string
  description: string
  created_at: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    type: "University",
    university_id: "",
    description: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [classesRes, universitiesRes] = await Promise.all([fetch("/api/classes"), fetch("/api/universities")])

      const classesData = await classesRes.json()
      const universitiesData = await universitiesRes.json()

      setClasses(classesData)
      setUniversities(universitiesData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingClass) {
        await fetch("/api/classes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingClass.id,
            ...formData,
            university_id: formData.university_id ? Number(formData.university_id) : null,
          }),
        })
      } else {
        await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            university_id: formData.university_id ? Number(formData.university_id) : null,
          }),
        })
      }

      setShowDialog(false)
      setEditingClass(null)
      setFormData({ name: "", type: "University", university_id: "", description: "" })
      loadData()
    } catch (error) {
      console.error("Failed to save class:", error)
    }
  }

  const handleEdit = (cls: Class) => {
    setEditingClass(cls)
    setFormData({
      name: cls.name,
      type: cls.type,
      university_id: String(cls.university_id || ""),
      description: cls.description,
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this class?")) {
      try {
        await fetch(`/api/classes?id=${id}`, {
          method: "DELETE",
        })
        loadData()
      } catch (error) {
        console.error("Failed to delete class:", error)
      }
    }
  }

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.university_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const pennClasses = filteredClasses.filter((cls) => cls.type === "Penn")
  const universityClasses = filteredClasses.filter((cls) => cls.type === "University")

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600">Create and manage Penn and University classes</p>
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 gap-2 shadow-lg"
              onClick={() => {
                setEditingClass(null)
                setFormData({ name: "", type: "University", university_id: "", description: "" })
              }}
            >
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>{editingClass ? "Edit Class" : "Add Class"}</DialogTitle>
              <p className="text-sm text-gray-600">Enter class information</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Class Type *</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="Penn"
                      checked={formData.type === "Penn"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, university_id: "" })}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm font-medium">Penn Students</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="University"
                      checked={formData.type === "University"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm font-medium">University Students</span>
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., SIU-Semester 1-A-FullTime"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              {formData.type === "University" && (
                <div>
                  <Label htmlFor="university">University *</Label>
                  <select
                    id="university"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.university_id}
                    onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                    required
                  >
                    <option value="">Select university</option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name} ({uni.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter class description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                >
                  {editingClass ? "Update" : "Add"} Class
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search classes by name or university..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-yellow-600" />
            <div>
              <CardTitle className="text-base font-semibold">Penn Creative Lab Classes</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{pennClasses.length} classes</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pennClasses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No Penn classes yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pennClasses.map((cls, index) => (
                    <tr
                      key={cls.id}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cls.description || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(cls.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(cls)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(cls.id)}
                            className="hover:bg-red-50 hover:border-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-semibold">University Classes</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{universityClasses.length} classes</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {universityClasses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? "No classes match your search" : "No university classes yet"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {universityClasses.map((cls, index) => (
                    <tr
                      key={cls.id}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cls.university_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cls.description || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(cls.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(cls)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(cls.id)}
                            className="hover:bg-red-50 hover:border-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
