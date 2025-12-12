"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users, Plus, Trash2, X, ChevronDown, Search, ExternalLink } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"

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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(group.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">Create New Group</h2>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Study Group A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                  <select
                    required
                    value={formData.university_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        university_id: e.target.value,
                        class_id: "",
                        leader_id: "",
                        capacity: "10",
                        project_name: "",
                        is_paid: false,
                        cost_per_member: "0",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        class_id: e.target.value,
                        leader_id: "",
                        capacity: "10",
                        project_name: "",
                        is_paid: false,
                        cost_per_member: "0",
                      })
                    }
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leader</label>
                  <Popover open={leaderDropdownOpen} onOpenChange={setLeaderDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={leaderDropdownOpen}
                        disabled={!formData.class_id}
                        className="w-full justify-between font-normal bg-transparent"
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
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="flex flex-col">
                        <div className="flex items-center border-b px-3">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500"
                            value={leaderSearchQuery}
                            onChange={(e) => setLeaderSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Final Year Project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Max Members)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 10"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Settings</h3>

                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="is_paid"
                      checked={formData.is_paid}
                      onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_paid" className="text-sm font-medium text-gray-700 cursor-pointer">
                      This group requires payment
                    </label>
                  </div>

                  {formData.is_paid && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost Per Member ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost_per_member}
                        onChange={(e) => setFormData({ ...formData, cost_per_member: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 50.00"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
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
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
      </div>
    </div>
  )
}
