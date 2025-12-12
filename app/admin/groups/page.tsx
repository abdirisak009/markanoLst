"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Users,
  Plus,
  Trash2,
  X,
  ChevronDown,
  Search,
  ExternalLink,
  Pencil,
  BookOpen,
  UserCircle,
  FolderOpen,
  DollarSign,
  Building,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface University {
  id: number
  name: string
  abbreviation: string
}

interface Class {
  id: number
  name: string
  university_id: number
  university_name: string
}

interface Student {
  id: number
  student_id: string
  full_name: string
  class_id: number
  gender: string
}

interface Group {
  id: number
  name: string
  university_name: string
  class_name: string
  leader_name: string
  leader_student_id: string
  member_count: number
  created_at: string
  capacity: number
  project_name: string
  is_paid: boolean
  cost_per_member: number
}

interface Member {
  id: number
  student_id: string
  student_name: string
  gender: string
  added_by_name: string
  added_at: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [leaderDropdownOpen, setLeaderDropdownOpen] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    university_id: "",
    class_id: "",
    leader_id: "",
    capacity: "10",
    project_name: "",
    is_paid: false,
    cost_per_member: "0",
  })
  const [leaderSearchQuery, setLeaderSearchQuery] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    class_id: 0,
    leader_id: 0,
    project_name: "",
    capacity: 0,
    is_paid: false,
    cost_per_member: 0,
  })

  const filteredLeaders = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(leaderSearchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(leaderSearchQuery.toLowerCase()),
  )

  useEffect(() => {
    fetchGroups()
    fetchUniversities()

    const interval = setInterval(() => {
      fetchGroups()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (formData.university_id) {
      fetchClasses(formData.university_id)
    }
  }, [formData.university_id])

  useEffect(() => {
    if (formData.class_id) {
      fetchStudents(formData.class_id)
    }
  }, [formData.class_id])

  useEffect(() => {
    if (universities.length > 0 && !formData.university_id) {
      setFormData((prev) => ({
        ...prev,
        university_id: universities[0].id.toString(),
      }))
    }
  }, [universities])

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups")
      const data = await res.json()
      setGroups(data)
    } catch (error) {
      console.error("Error fetching groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUniversities = async () => {
    const res = await fetch("/api/universities")
    const data = await res.json()
    setUniversities(data)
  }

  const fetchClasses = async (universityId: string) => {
    const res = await fetch("/api/classes")
    const allClasses = await res.json()
    const filtered = allClasses.filter((c: Class) => c.university_id === Number(universityId))
    setClasses(filtered)
  }

  const fetchStudents = async (classId: string) => {
    const res = await fetch("/api/university-students")
    const allStudents = await res.json()
    const filtered = allStudents.filter((s: Student) => s.class_id === Number(classId))
    setStudents(filtered)
  }

  const fetchClassesByUniversity = async (universityId: number) => {
    const res = await fetch(`/api/universities/${universityId}/classes`)
    const data = await res.json()
    setClasses(data)
  }

  const fetchLeadersByClass = async (classId: number) => {
    const res = await fetch(`/api/classes/${classId}/leaders`)
    const data = await res.json()
    setStudents(data)
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const requestBody = {
        ...formData,
        leader_student_id: formData.leader_id,
        university_id: Number(formData.university_id),
        class_id: Number(formData.class_id),
        capacity: Number(formData.capacity),
        cost_per_member: Number(formData.cost_per_member),
      }

      console.log("[v0] Creating group with data:", requestBody)

      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (res.ok) {
        setShowCreateModal(false)
        setFormData({
          name: "",
          university_id: "",
          class_id: "",
          leader_id: "",
          capacity: "10",
          project_name: "",
          is_paid: false,
          cost_per_member: "0",
        })
        fetchGroups()
      } else {
        const error = await res.json()
        console.error("[v0] Failed to create group:", error)
      }
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this group?")) return

    try {
      await fetch(`/api/groups?id=${id}`, { method: "DELETE" })
      fetchGroups()
    } catch (error) {
      console.error("Error deleting group:", error)
    }
  }

  const handleViewMembers = async (group: Group) => {
    setSelectedGroup(group)
    setShowMembersModal(true)
    setLoadingMembers(true)

    try {
      const res = await fetch(`/api/groups/${group.id}/members`)
      const data = await res.json()
      console.log("[v0] Fetched members for group", group.id, ":", data)
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleRemoveMember = async (groupId: number, studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the group?")) {
      return
    }

    try {
      const res = await fetch(`/api/groups/${groupId}/members/${studentId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Student removed from group successfully",
        })
        // Refresh the members list
        if (selectedGroup) {
          handleViewMembers(selectedGroup)
        }
        // Refresh the groups list to update member count
        fetchGroups()
      } else {
        throw new Error("Failed to remove member")
      }
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove student from group",
        variant: "destructive",
      })
    }
  }

  const handleEditGroup = (group: any) => {
    console.log("[v0] Opening edit modal for group:", group)
    setEditingGroup(group)
    setEditForm({
      name: group.name,
      class_id: group.class_id,
      leader_id: group.leader_student_id,
      project_name: group.project_name || "",
      capacity: group.capacity,
      is_paid: group.is_paid,
      cost_per_member: Number(group.cost_per_member) || 0,
    })
    setShowEditModal(true)
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingGroup) return

    try {
      console.log("[v0] Updating group:", editingGroup.id, editForm)

      const response = await fetch(`/api/groups/${editingGroup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          class_id: editForm.class_id,
          leader_student_id: editForm.leader_id,
          project_name: editForm.project_name,
          capacity: editForm.capacity,
          is_paid: editForm.is_paid,
          cost_per_member: editForm.is_paid ? editForm.cost_per_member : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update group")
      }

      console.log("[v0] Group updated successfully")
      toast({
        title: "Success",
        description: "Group updated successfully",
      })

      setShowEditModal(false)
      setEditingGroup(null)
      fetchGroups()
      fetchUniversities()
      fetchClasses()
    } catch (error) {
      console.error("[v0] Error updating group:", error)
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      })
    }
  }

  const getLeaderSelectionLink = (groupId: number) => {
    return `${window.location.origin}/leader-select?group=${groupId}`
  }

  const getUniversityGroupsLink = (universityId: number) => {
    return `${window.location.origin}/leader-select?university=${universityId}`
  }

  const groupedByUniversity = groups.reduce(
    (acc, group) => {
      const uni = group.university_name
      if (!acc[uni]) {
        acc[uni] = { groups: [], university_id: 0 }
      }
      acc[uni].groups.push(group)
      if (acc[uni].university_id === 0) {
        const foundUni = universities.find((u) => u.name === uni)
        if (foundUni) acc[uni].university_id = foundUni.id
      }
      return acc
    },
    {} as Record<string, { groups: Group[]; university_id: number }>,
  )

  const availableLeaders = students

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading groups...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Group Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage student groups</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </Button>
        </div>

        {Object.entries(groupedByUniversity).map(([universityName, { groups: uniGroups, university_id }]) => (
          <div key={universityName} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{universityName}</h2>
              <Button
                variant="outline"
                className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                onClick={() => {
                  const link = getUniversityGroupsLink(university_id)
                  navigator.clipboard.writeText(link)
                  alert(`Universal groups link for ${universityName} copied to clipboard!`)
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Copy Groups Link
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.class_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGroup(group)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(group.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Leader:</span>
                      <span className="font-medium">{group.leader_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Members:</span>
                      <span className="font-bold text-blue-600">{group.member_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-bold text-blue-600">{group.capacity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Project Name:</span>
                      <span className="font-medium">{group.project_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Payment Required:</span>
                      <span className="font-medium">{group.is_paid ? "Yes" : "No"}</span>
                    </div>
                    {group.is_paid && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cost Per Member ($):</span>
                        <span className="font-medium">{group.cost_per_member}</span>
                      </div>
                    )}
                  </div>

                  {Number(group.member_count) > 0 && (
                    <Button
                      onClick={() => handleViewMembers(group)}
                      variant="outline"
                      className="w-full mt-4 text-blue-600 hover:bg-blue-50 border-blue-200"
                    >
                      <X className="w-4 h-4 mr-2" />
                      View Members ({group.member_count})
                    </Button>
                  )}

                  {group.is_paid && Number(group.member_count) > 0 && (
                    <Button
                      onClick={() => (window.location.href = `/admin/groups/payments/${group.id}`)}
                      variant="outline"
                      className="w-full mt-2 text-green-600 hover:bg-green-50 border-green-200"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Track Payments
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No groups created yet. Click "Create Group" to get started.</p>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Create New Group</h2>
                    <p className="text-blue-100 text-sm mt-1">Fill in the details to create a new group</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateGroup} className="p-8 space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full"
                        placeholder="e.g., Group 1 5PT"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4" />
                        University <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.university_id}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            university_id: value,
                            class_id: "",
                            leader_id: "",
                            capacity: "10",
                            project_name: "",
                            is_paid: false,
                            cost_per_member: "0",
                          })
                        }}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select University" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {universities.map((uni) => (
                            <SelectItem key={uni.id} value={String(uni.id)}>
                              {uni.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            class_id: value,
                            leader_id: "",
                            capacity: "10",
                            project_name: "",
                            is_paid: false,
                            cost_per_member: "0",
                          })
                        }
                        disabled={!formData.university_id}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {formData.university_id && classes.length === 0 && (
                            <SelectItem value="none" disabled>
                              No classes available
                            </SelectItem>
                          )}
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={String(cls.id)}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Leadership Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <UserCircle className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Leadership</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Leader <span className="text-red-500">*</span>
                    </label>
                    <Popover open={leaderDropdownOpen} onOpenChange={setLeaderDropdownOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={leaderDropdownOpen}
                          disabled={!formData.class_id}
                          className="w-full justify-between font-normal bg-white"
                        >
                          {formData.leader_id
                            ? students.find((s) => s.student_id === formData.leader_id)?.full_name +
                              " (" +
                              formData.leader_id +
                              ")"
                            : "Select Leader"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 bg-white" align="start">
                        <div className="flex flex-col">
                          <div className="flex items-center border-b px-3 bg-white">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                              type="text"
                              placeholder="Search by name or ID..."
                              className="flex h-10 w-full rounded-md bg-white py-3 text-sm outline-none placeholder:text-gray-500"
                              value={leaderSearchQuery}
                              onChange={(e) => setLeaderSearchQuery(e.target.value)}
                            />
                          </div>
                          <div className="max-h-[300px] overflow-y-auto bg-white">
                            {filteredLeaders.length === 0 ? (
                              <div className="py-6 text-center text-sm text-gray-500">No student found.</div>
                            ) : (
                              <div className="p-1">
                                {filteredLeaders.map((student) => (
                                  <button
                                    key={student.student_id}
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        leader_id: student.student_id,
                                      }))
                                      setLeaderDropdownOpen(false)
                                      setLeaderSearchQuery("")
                                    }}
                                    className="relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                                  >
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">{student.full_name}</span>
                                      <span className="text-xs text-gray-500">
                                        ID: {student.student_id} | Gender: {student.gender}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {!formData.class_id && (
                      <p className="text-xs text-gray-500 mt-1">Select a class first to choose a leader</p>
                    )}
                  </div>
                </div>

                {/* Project Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <FolderOpen className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.project_name}
                        onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                        className="w-full"
                        placeholder="e.g., Video Editing Project"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity (Max Members) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        required
                        min="1"
                        max="50"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Settings Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="is_paid"
                        checked={formData.is_paid}
                        onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <label htmlFor="is_paid" className="text-sm font-medium text-gray-900 cursor-pointer block">
                          This group requires payment
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          Enable this if members need to pay a fee to join this group
                        </p>
                      </div>
                    </div>

                    {formData.is_paid && (
                      <div className="pl-8 animate-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cost Per Member ($) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.cost_per_member}
                          onChange={(e) => setFormData({ ...formData, cost_per_member: e.target.value })}
                          className="w-full"
                          placeholder="5.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter the amount each member needs to pay</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({
                        name: "",
                        university_id: "",
                        class_id: "",
                        leader_id: "",
                        capacity: "10",
                        project_name: "",
                        is_paid: false,
                        cost_per_member: "0",
                      })
                      setLeaderDropdownOpen(false)
                    }}
                    className="flex-1 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    Create Group
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMembersModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedGroup.name} - Members</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedGroup.class_name} • Leader: {selectedGroup.leader_name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowMembersModal(false)
                    setSelectedGroup(null)
                    setMembers([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading members...</div>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No members added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{member.student_name}</h3>
                            <p className="text-sm text-gray-600">ID: {member.student_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              member.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {member.gender}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(selectedGroup.id, member.student_id)}
                            className="text-red-600 hover:bg-red-50 border-red-200"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Total Members: <span className="font-bold text-blue-600">{members.length}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Edit Group</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleUpdateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Group Name</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter group name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">University</label>
                    <Select
                      value={universities.find((u) => u.id === editingGroup.university_id)?.name}
                      onValueChange={(value) => {
                        const uni = universities.find((u) => u.name === value)
                        if (uni) {
                          setEditForm({ ...editForm, class_id: 0 })
                          fetchClassesByUniversity(uni.id)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {universities.map((uni) => (
                          <SelectItem key={uni.id} value={uni.name}>
                            {uni.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Class</label>
                    <Select
                      value={classes.find((c) => c.id === editForm.class_id)?.name}
                      onValueChange={(value) => {
                        const cls = classes.find((c) => c.name === value)
                        if (cls) {
                          setEditForm({ ...editForm, class_id: cls.id, leader_id: 0 })
                          fetchLeadersByClass(cls.id)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.name}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Leader</label>
                    <Select
                      value={availableLeaders.find((l) => l.student_id === editForm.leader_id)?.full_name}
                      onValueChange={(value) => {
                        const leader = availableLeaders.find((l) => l.full_name === value)
                        if (leader) setEditForm({ ...editForm, leader_id: leader.student_id })
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select leader" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {availableLeaders.map((leader) => (
                          <SelectItem key={leader.student_id} value={String(leader.id)}>
                            {leader.full_name || "No Name"} ({leader.student_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Project Name</label>
                    <Input
                      value={editForm.project_name}
                      onChange={(e) => setEditForm({ ...editForm, project_name: e.target.value })}
                      placeholder="Enter project name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Capacity (Max Members)</label>
                    <Input
                      type="number"
                      value={editForm.capacity}
                      onChange={(e) => setEditForm({ ...editForm, capacity: Number.parseInt(e.target.value) || 0 })}
                      placeholder="15"
                      required
                      min="1"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Payment Settings</h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        id="edit-payment"
                        checked={editForm.is_paid}
                        onChange={(e) => setEditForm({ ...editForm, is_paid: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="edit-payment" className="text-sm font-medium">
                        This group requires payment
                      </label>
                    </div>

                    {editForm.is_paid && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Cost Per Member ($)</label>
                        <Input
                          type="number"
                          value={editForm.cost_per_member}
                          onChange={(e) =>
                            setEditForm({ ...editForm, cost_per_member: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="0"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Update Group
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
