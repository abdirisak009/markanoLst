"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Plus, Edit, Trash2, Search } from "lucide-react"

interface University {
  id: number
  name: string
  abbreviation: string
  created_at?: string
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
  })

  useEffect(() => {
    loadUniversities()
  }, [])

  const loadUniversities = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/universities")
      if (response.ok) {
        const data = await response.json()
        setUniversities(data)
      }
    } catch (error) {
      console.error("Failed to load universities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingUniversity) {
        // Update existing university
        const response = await fetch("/api/universities", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingUniversity.id, ...formData }),
        })
        if (response.ok) {
          await loadUniversities()
        }
      } else {
        // Create new university
        const response = await fetch("/api/universities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (response.ok) {
          await loadUniversities()
        }
      }

      setShowDialog(false)
      setEditingUniversity(null)
      setFormData({ name: "", abbreviation: "" })
    } catch (error) {
      console.error("Failed to save university:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (university: University) => {
    setEditingUniversity(university)
    setFormData({
      name: university.name,
      abbreviation: university.abbreviation,
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this university?")) {
      setLoading(true)
      try {
        const response = await fetch(`/api/universities?id=${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          await loadUniversities()
        }
      } catch (error) {
        console.error("Failed to delete university:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const filteredUniversities = universities.filter(
    (uni) =>
      uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Universities
              </h1>
              <p className="text-gray-600 mt-1">Manage the list of universities</p>
            </div>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg gap-2"
                onClick={() => {
                  setEditingUniversity(null)
                  setFormData({ name: "", abbreviation: "" })
                }}
              >
                <Plus className="h-5 w-5" />
                Add University
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingUniversity ? "Edit University" : "Add University"}
                </DialogTitle>
                <p className="text-sm text-gray-600">Enter university information</p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    University Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Somali International University"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abbreviation" className="text-sm font-medium text-gray-700">
                    Abbreviation *
                  </Label>
                  <Input
                    id="abbreviation"
                    placeholder="e.g., SIU"
                    value={formData.abbreviation}
                    onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  >
                    {loading ? "Saving..." : editingUniversity ? "Update" : "Add"} University
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search universities by name or abbreviation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 pl-12 bg-white shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">All Universities</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {filteredUniversities.length} {filteredUniversities.length === 1 ? "university" : "universities"} in the
              system
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {loading && universities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Loading universities...</div>
            ) : filteredUniversities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? "No universities found matching your search" : "No universities added yet"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUniversities.map((university, index) => (
                  <div
                    key={university.id}
                    className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{university.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Abbreviation:</span> {university.abbreviation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(university)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(university.id)}
                        className="hover:bg-red-50 hover:border-red-300"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
