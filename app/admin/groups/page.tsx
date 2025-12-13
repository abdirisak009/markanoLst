"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
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
  ArrowRightLeft,
  UserPlus,
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
  university_id: number
  paid_count?: number // Added for payment status
  unpaid_count?: number // Added for payment status
}

type Member = {
  id: number
  group_id: number
  student_id: string
  class_id: number
  added_by_leader: string | null
  added_at: string
  student_name: string
  full_name?: string
  gender: string
  added_by_name: string | null
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
    leader_id: "", // Changed to string to match student_id
    project_name: "",
    capacity: 0,
    is_paid: false,
    cost_per_member: 0,
  })

  const [showTransferModal, setShowTransferModal] = useState(false)
  const [sourceGroupId, setSourceGroupId] = useState<string>("")
  const [transferMembers, setTransferMembers] = useState<Member[]>([])
  const [selectedMembersToTransfer, setSelectedMembersToTransfer] = useState<string[]>([])
  const [targetGroupId, setTargetGroupId] = useState<string>("")
  const [loadingTransfer, setLoadingTransfer] = useState(false)

  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [addMembersGroup, setAddMembersGroup] = useState<Group | null>(null)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState<string[]>([]) // Changed to string[] to match student_id
  const [loadingAvailableStudents, setLoadingAvailableStudents] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all")
  const [selectedLeaderFilter, setSelectedLeaderFilter] = useState<string>("all")

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

  const handleEditGroup = async (group: any) => {
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

    // Fetch classes for the university and leaders for the class
    if (group.university_id) {
      await fetchClassesByUniversity(group.university_id)
    }
    if (group.class_id) {
      await fetchLeadersByClass(group.class_id)
    }
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

  const handleSourceGroupChange = async (groupId: string) => {
    setSourceGroupId(groupId)
    setSelectedMembersToTransfer([])
    setTargetGroupId("")

    if (!groupId) {
      setTransferMembers([])
      return
    }

    setLoadingTransfer(true)
    try {
      console.log("[v0] Fetching members for source group:", groupId)
      const response = await fetch(`/api/groups/${groupId}/members`)

      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Fetched members:", data)
      setTransferMembers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[v0] Error fetching members:", error)
      toast({
        title: "Error",
        description: "Failed to load group members",
        variant: "destructive",
      })
      setTransferMembers([])
    } finally {
      setLoadingTransfer(false)
    }
  }

  const handleOpenTransferModal = () => {
    console.log("[v0] Opening transfer modal")
    setShowTransferModal(true)
    setSourceGroupId("")
    setTargetGroupId("")
    setTransferMembers([])
    setSelectedMembersToTransfer([])
  }

  const handleTransferStudents = async () => {
    if (!sourceGroupId || !targetGroupId || selectedMembersToTransfer.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select source group, target group, and at least one student",
        variant: "destructive",
      })
      return
    }

    if (sourceGroupId === targetGroupId) {
      toast({
        title: "Validation Error",
        description: "Source and target groups must be different",
        variant: "destructive",
      })
      return
    }

    setLoadingTransfer(true)
    try {
      console.log("[v0] Transferring students:", {
        from: sourceGroupId,
        to: targetGroupId,
        students: selectedMembersToTransfer,
      })

      const response = await fetch("/api/groups/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_group_id: Number.parseInt(sourceGroupId),
          to_group_id: Number.parseInt(targetGroupId),
          student_ids: selectedMembersToTransfer,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to transfer students")
      }

      toast({
        title: "Success",
        description: `Successfully transferred ${selectedMembersToTransfer.length} student(s)`,
      })

      setShowTransferModal(false)
      setSourceGroupId("")
      setTargetGroupId("")
      setTransferMembers([])
      setSelectedMembersToTransfer([])
      fetchGroups()
    } catch (error) {
      console.error("[v0] Transfer error:", error)
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoadingTransfer(false)
    }
  }

  const toggleMemberSelection = (studentId: string) => {
    setSelectedMembersToTransfer((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const handleAddMembers = async (group: Group) => {
    console.log("[v0] Opening add members modal for group:", group.id)
    setAddMembersGroup(group)
    setShowAddMembersModal(true)
    setSelectedStudentsToAdd([])
    setLoadingAvailableStudents(true)

    try {
      const res = await fetch(`/api/groups/students-available?class_id=${group.class_id}`)
      const data = await res.json()
      console.log("[v0] Fetched available students:", data)
      setAvailableStudents(data)
    } catch (error) {
      console.error("Error fetching available students:", error)
    } finally {
      setLoadingAvailableStudents(false)
    }
  }

  const handleSubmitMembers = async () => {
    if (!addMembersGroup || selectedStudentsToAdd.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Submitting members:", selectedStudentsToAdd)
      const res = await fetch(`/api/groups/${addMembersGroup.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: selectedStudentsToAdd,
          class_id: addMembersGroup.class_id,
          leader_student_id: addMembersGroup.leader_student_id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to add members")
      }

      toast({
        title: "Success",
        description: `Successfully added ${selectedStudentsToAdd.length} student(s) to ${addMembersGroup.name}`,
      })

      setShowAddMembersModal(false)
      fetchGroups()
    } catch (error: any) {
      console.error("Error adding members:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add members",
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

  const filteredGroups = useMemo(() => {
    if (!groups) return []

    return groups.filter((group) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) || // Corrected from group_name to name
        group.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.leader_name?.toLowerCase().includes(searchQuery.toLowerCase())

      // Class filter
      const matchesClass = selectedClassFilter === "all" || group.class_name === selectedClassFilter

      // Leader filter
      const matchesLeader = selectedLeaderFilter === "all" || group.leader_name === selectedLeaderFilter

      return matchesSearch && matchesClass && matchesLeader
    })
  }, [groups, searchQuery, selectedClassFilter, selectedLeaderFilter])

  const uniqueClasses = useMemo(() => {
    if (!groups) return []
    return Array.from(new Set(groups.map((g) => g.class_name).filter(Boolean)))
  }, [groups])

  const uniqueLeaders = useMemo(() => {
    if (!groups) return []
    return Array.from(new Set(groups.map((g) => g.leader_name).filter(Boolean)))
  }, [groups])

  const groupedByUniversity = useMemo(() => {
    const grouped: Record<string, { groups: Group[]; university_id: number }> = {}

    filteredGroups.forEach((group) => {
      if (!grouped[group.university_name]) {
        grouped[group.university_name] = {
          groups: [],
          university_id: group.university_id,
        }
      }
      grouped[group.university_name].groups.push(group)
    })

    return grouped
  }, [filteredGroups])

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
          <div className="flex gap-3">
            <Button onClick={handleOpenTransferModal} className="bg-green-600 hover:bg-green-700">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transfer Students
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search groups, projects, or leaders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter by Class */}
            <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter by Leader */}
            <Select value={selectedLeaderFilter} onValueChange={setSelectedLeaderFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter by Leader" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Leaders</SelectItem>
                {uniqueLeaders.map((leaderName) => (
                  <SelectItem key={leaderName} value={leaderName}>
                    {leaderName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || selectedClassFilter !== "all" || selectedLeaderFilter !== "all") && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredGroups.length} of {groups?.length || 0} groups
            </div>
          )}
        </div>

        {filteredGroups.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">No groups found matching your filters</p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedClassFilter("all")
                setSelectedLeaderFilter("all")
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

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

                    {group.is_paid && Number(group.member_count) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Paid:</span>
                          <span className="font-bold text-green-600">{group.paid_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Unpaid:</span>
                          <span className="font-bold text-red-600">{group.unpaid_count || 0}</span>
                        </div>
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

                  {/* Add Members button */}
                  <Button
                    onClick={() => handleAddMembers(group)}
                    variant="outline"
                    className="w-full mt-2 text-purple-600 hover:bg-purple-50 border-purple-200"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Members
                  </Button>

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

        {(() => {
          console.log("[v0] Edit modal state:", { showEditModal, editingGroup: !!editingGroup })
          return null
        })()}

        {showEditModal && editingGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Edit Group</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingGroup(null)
                    }}
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
                      value={String(editingGroup.university_id)}
                      onValueChange={(value) => {
                        const uni = universities.find((u) => u.id === Number(value))
                        if (uni) {
                          setEditForm({ ...editForm, class_id: 0, leader_id: "" })
                          fetchClassesByUniversity(uni.id)
                        }
                      }}
                      disabled
                    >
                      <SelectTrigger className="bg-gray-100">
                        <SelectValue />
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
                    <label className="block text-sm font-medium mb-2">Class</label>
                    <Select
                      value={editForm.class_id ? String(editForm.class_id) : undefined}
                      onValueChange={(value) => {
                        const cls = classes.find((c) => c.id === Number(value))
                        if (cls) {
                          setEditForm({ ...editForm, class_id: cls.id, leader_id: "" })
                          fetchLeadersByClass(cls.id)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={String(cls.id)}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Leader</label>
                    <Select
                      value={editForm.leader_id ? String(editForm.leader_id) : undefined}
                      onValueChange={(value) => {
                        setEditForm({ ...editForm, leader_id: value })
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select leader" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {/* The original code had an error here: 'availableLeaders' was used but not declared.
                            This is a fix to use the 'students' state which contains the relevant leader information after fetchLeadersByClass is called. */}
                        {students.map((leader) => (
                          <SelectItem key={leader.student_id} value={String(leader.student_id)}>
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditModal(false)
                        setEditingGroup(null)
                      }}
                      className="flex-1"
                    >
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

        {showTransferModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">Transfer Students Between Groups</h2>
                  <p className="text-sm text-gray-500 mt-1">Select source group, students, and target group</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowTransferModal(false)
                    setSourceGroupId("")
                    setTargetGroupId("")
                    setTransferMembers([])
                    setSelectedMembersToTransfer([])
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Step 1: Select Source Group */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Step 1: Select Source Group (Group-ka laga qaadayo)
                  </label>
                  <Select value={sourceGroupId} onValueChange={handleSourceGroupChange}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select source group..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={String(group.id)}>
                          {group.name} - {group.class_name} ({group.member_count}/{group.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 2: Select Students */}
                {sourceGroupId && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Step 2: Select Students to Transfer ({selectedMembersToTransfer.length} selected)
                    </label>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {loadingTransfer ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : transferMembers.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">No members in this group</div>
                      ) : (
                        <div className="divide-y">
                          {transferMembers.map((member) => (
                            <label
                              key={member.student_id}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedMembersToTransfer.includes(member.student_id)}
                                onChange={() => toggleMemberSelection(member.student_id)}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                              />
                              <div className="ml-3 flex-1">
                                <p className="font-medium">{member.student_name}</p>
                                <p className="text-sm text-gray-500">ID: {member.student_id}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Select Target Group */}
                {sourceGroupId && selectedMembersToTransfer.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Step 3: Select Target Group (Group-ka loo transfer gareenayo)
                    </label>
                    <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select target group..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {groups
                          .filter((g) => String(g.id) !== sourceGroupId)
                          .map((group) => {
                            const availableSpace = group.capacity - group.member_count
                            const canAccept = availableSpace >= selectedMembersToTransfer.length
                            return (
                              <SelectItem key={group.id} value={String(group.id)} disabled={!canAccept}>
                                {group.name} - {group.class_name} ({group.member_count}/{group.capacity})
                                {!canAccept && " - Not enough space"}
                              </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTransferModal(false)
                    setSourceGroupId("")
                    setTargetGroupId("")
                    setTransferMembers([])
                    setSelectedMembersToTransfer([])
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTransferStudents}
                  disabled={
                    !sourceGroupId || !targetGroupId || selectedMembersToTransfer.length === 0 || loadingTransfer
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loadingTransfer ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Transferring...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Transfer {selectedMembersToTransfer.length} Student(s)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showAddMembersModal && addMembersGroup && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 rounded-lg p-2">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Add Members to Group</h2>
                      <p className="text-purple-100 text-sm">
                        {addMembersGroup.name} ({addMembersGroup.class_name})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddMembersModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Available space:{" "}
                    <span className="font-semibold text-purple-600">
                      {addMembersGroup.capacity - Number(addMembersGroup.member_count)}
                    </span>{" "}
                    / {addMembersGroup.capacity}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: <span className="font-semibold text-indigo-600">{selectedStudentsToAdd.length}</span>{" "}
                    student(s)
                  </p>
                </div>

                {loadingAvailableStudents ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading available students...</p>
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No available students in this class</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableStudents.map((student) => (
                      <div
                        key={student.student_id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedStudentsToAdd.includes(student.student_id)
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedStudentsToAdd((prev) =>
                            prev.includes(student.student_id)
                              ? prev.filter((id) => id !== student.student_id)
                              : [...prev, student.student_id],
                          )
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentsToAdd.includes(student.student_id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{student.full_name}</p>
                          <p className="text-sm text-gray-500">
                            ID: {student.student_id} • {student.gender}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t bg-gray-50 p-4 flex gap-3">
                <Button onClick={() => setShowAddMembersModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitMembers}
                  disabled={
                    selectedStudentsToAdd.length === 0 ||
                    selectedStudentsToAdd.length > addMembersGroup.capacity - Number(addMembersGroup.member_count)
                  }
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add {selectedStudentsToAdd.length} Student(s)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
