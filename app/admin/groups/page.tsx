"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
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
  FolderOpen,
  DollarSign,
  Building,
  ArrowRightLeft,
  UserPlus,
  Sparkles,
  Crown,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

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
  class_id: number // Added class_id to Group interface
  paid_count?: number
  unpaid_count?: number
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function GroupsPage() {
  const [selectedUniversityFilter, setSelectedUniversityFilter] = useState<string>("all")
  const [selectedLeaderFilter, setSelectedLeaderFilter] = useState<string>("all")
  const [selectedClassFilterForFetch, setSelectedClassFilterForFetch] = useState<string>("all")

  const groupsUrl = `/api/groups?university_id=${selectedUniversityFilter !== "all" ? selectedUniversityFilter : ""}&leader_id=${selectedLeaderFilter !== "all" ? selectedLeaderFilter : ""}&class_id=${selectedClassFilterForFetch !== "all" ? selectedClassFilterForFetch : ""}`

  const {
    data: groupsData,
    mutate: mutateGroups,
    isLoading: loadingGroups,
  } = useSWR(groupsUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // Cache for 30 seconds
  })

  const { data: universitiesData } = useSWR("/api/universities", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  })

  // Derive state from SWR data
  const groups = Array.isArray(groupsData) ? groupsData : []
  const universities = Array.isArray(universitiesData) ? universitiesData : []
  const loading = loadingGroups

  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
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
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    university_id: "",
    class_id: "",
    leader_id: "",
    capacity: "10",
    project_name: "",
    is_paid: false,
    cost_per_member: "0",
  })

  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [addMembersGroup, setAddMembersGroup] = useState<Group | null>(null)
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState<string[]>([])
  const [loadingAvailableStudents, setLoadingAvailableStudents] = useState(false)
  const [addMembersSearch, setAddMembersSearch] = useState("")

  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferringMember, setTransferringMember] = useState<Member | null>(null)
  const [targetGroupId, setTargetGroupId] = useState<string>("")
  const [transferLoading, setTransferLoading] = useState(false)

  // Search query and filters for the group list
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all")

  const filteredLeaders = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(leaderSearchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(leaderSearchQuery.toLowerCase()),
  )

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
  }, [universities, formData.university_id])

  // Keep these functions for form data
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

      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (res.ok) {
        mutateGroups()
        setShowCreateModal(false)
        setFormData({
          name: "",
          university_id: universities[0]?.id.toString() || "",
          class_id: "",
          leader_id: "",
          capacity: "10",
          project_name: "",
          is_paid: false,
          cost_per_member: "0",
        })
        toast({ title: "Success", description: "Group created successfully" })
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to create group", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" })
    }
  }

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this group?")) return

    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        mutateGroups()
        toast({ title: "Success", description: "Group deleted successfully" })
      } else {
        const errorData = await res.json()
        toast({ title: "Error", description: errorData.error || "Failed to delete group", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete group", variant: "destructive" })
    }
  }

  const handleViewMembers = async (group: Group) => {
    setSelectedGroup(group)
    setShowMembersModal(true)
    setLoadingMembers(true)

    try {
      const res = await fetch(`/api/groups/${group.id}/members`)
      const data = await res.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({ title: "Error", description: "Failed to load members", variant: "destructive" })
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
        mutateGroups()
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to remove member", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove member", variant: "destructive" })
    }
  }

  const handleEditGroup = async (group: Group) => {
    setEditingGroup(group)
    setEditFormData({
      name: group.name,
      university_id: String(group.university_id),
      class_id: String(group.class_id), // Use class_id from the group object
      leader_id: group.leader_student_id,
      capacity: String(group.capacity),
      project_name: group.project_name || "",
      is_paid: group.is_paid,
      cost_per_member: String(group.cost_per_member) || "0",
    })
    setShowEditModal(true)

    // Fetch classes for the university and leaders for the class
    await fetchClassesByUniversity(group.university_id)
    await fetchLeadersByClass(group.class_id) // Use class_id from the group object
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingGroup) return

    try {
      const requestBody = {
        name: editFormData.name,
        leader_student_id: editFormData.leader_id,
        capacity: Number(editFormData.capacity),
        project_name: editFormData.project_name,
        is_paid: editFormData.is_paid,
        cost_per_member: Number(editFormData.cost_per_member),
        class_id: Number(editFormData.class_id), // Include class_id in the update
      }

      const res = await fetch(`/api/groups/${editingGroup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (res.ok) {
        mutateGroups()
        setShowEditModal(false)
        setEditingGroup(null)
        toast({ title: "Success", description: "Group updated successfully" })
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to update group", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update group", variant: "destructive" })
    }
  }

  const handleAddMembers = async (group: Group) => {
    setAddMembersGroup(group)
    setShowAddMembersModal(true)
    setSelectedStudentsToAdd([])
    setAddMembersSearch("")
    setLoadingAvailableStudents(true)
    setAvailableStudents([])

    try {
      const res = await fetch(`/api/students/available-for-group?class_id=${group.class_id}`)
      const data = await res.json()

      if (Array.isArray(data)) {
        setAvailableStudents(data)
      } else {
        setAvailableStudents([])
      }
    } catch (error) {
      setAvailableStudents([])
      toast({ title: "Error", description: "Failed to load available students", variant: "destructive" })
    } finally {
      setLoadingAvailableStudents(false)
    }
  }

  const handleConfirmAddMembers = async () => {
    if (!addMembersGroup || selectedStudentsToAdd.length === 0) return

    try {
      const res = await fetch(`/api/groups/${addMembersGroup.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: selectedStudentsToAdd,
          class_id: addMembersGroup.class_id,
          leader_student_id: addMembersGroup.leader_student_id,
        }),
      })

      if (res.ok) {
        mutateGroups()
        setShowAddMembersModal(false)
        toast({ title: "Success", description: `Added ${selectedStudentsToAdd.length} members to group` })
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to add members", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add members", variant: "destructive" })
    }
  }

  const handleTransferMember = async () => {
    if (!transferringMember || !targetGroupId) return

    setTransferLoading(true)
    try {
      const res = await fetch(`/api/groups/${selectedGroup?.id}/members/${transferringMember.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_group_id: Number(targetGroupId) }),
      })

      if (res.ok) {
        mutateGroups()
        if (selectedGroup) {
          const membersRes = await fetch(`/api/groups/${selectedGroup.id}/members`)
          const membersData = await membersRes.json()
          setMembers(membersData)
        }
        setShowTransferModal(false)
        setTransferringMember(null)
        setTargetGroupId("")
        toast({ title: "Success", description: "Member transferred successfully" })
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to transfer member", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to transfer member", variant: "destructive" })
    } finally {
      setTransferLoading(false)
    }
  }

  const getLeaderSelectionLink = (groupId: number) => {
    return `${window.location.origin}/leader-select?group=${groupId}`
  }

  const getUniversityGroupsLink = (universityId: number) => {
    return `${window.location.origin}/leader-select?university=${universityId}`
  }

  const filteredGroups = useMemo(() => {
    if (!groups || !Array.isArray(groups)) return []

    return groups.filter((group) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.leader_name?.toLowerCase().includes(searchQuery.toLowerCase())

      // Class filter
      const matchesClass = selectedClassFilter === "all" || group.class_name === selectedClassFilter

      // Leader filter
      const matchesLeader = selectedLeaderFilter === "all" || group.leader_name === selectedLeaderFilter

      // University filter
      const matchesUniversity =
        selectedUniversityFilter === "all" || String(group.university_id) === selectedUniversityFilter

      return matchesSearch && matchesClass && matchesLeader && matchesUniversity
    })
  }, [groups, searchQuery, selectedClassFilter, selectedLeaderFilter, selectedUniversityFilter])

  const uniqueClasses = useMemo(() => {
    if (!groups) return []
    return Array.from(new Set(groups.map((g) => g.class_name).filter(Boolean)))
  }, [groups])

  const uniqueLeaders = useMemo(() => {
    if (!groups) return []
    return Array.from(new Set(groups.map((g) => g.leader_name).filter(Boolean)))
  }, [groups])

  // Added filters for university and class to the unique university calculation
  const uniqueUniversities = useMemo(() => {
    if (!groups) return []
    return Array.from(new Set(groups.map((g) => g.university_name).filter(Boolean)))
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#013565]/5 via-white to-[#ff1b4a]/5">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#013565]/20 border-t-[#013565] animate-spin"></div>
            <Users className="w-6 h-6 text-[#013565] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[#013565] font-medium">Loading groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#013565]/5 via-white to-[#ff1b4a]/5 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#013565] to-[#013565]/80 flex items-center justify-center shadow-lg shadow-[#013565]/20">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#013565]">Group Management</h1>
              <p className="text-gray-500 mt-1">Create and manage student groups</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowTransferModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transfer Students
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#013565] to-[#013565]/90 hover:from-[#013565]/90 hover:to-[#013565] text-white shadow-lg shadow-[#013565]/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-[#013565]" />
            <h3 className="font-semibold text-[#013565]">Filter Groups</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Box */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#013565]/20 focus:border-[#013565] transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Filter by University */}
            <Select value={selectedUniversityFilter} onValueChange={setSelectedUniversityFilter}>
              <SelectTrigger className="bg-gray-50 hover:bg-white border-gray-200 h-12 rounded-xl transition-all focus:ring-2 focus:ring-[#013565]/20">
                <SelectValue placeholder="All Universities" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Universities</SelectItem>
                {universities.map((uni) => (
                  <SelectItem key={uni.id} value={String(uni.id)}>
                    {uni.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter by Class */}
            <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
              <SelectTrigger className="bg-gray-50 hover:bg-white border-gray-200 h-12 rounded-xl transition-all focus:ring-2 focus:ring-[#013565]/20">
                <SelectValue placeholder="All Classes" />
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
              <SelectTrigger className="bg-gray-50 hover:bg-white border-gray-200 h-12 rounded-xl transition-all focus:ring-2 focus:ring-[#013565]/20">
                <SelectValue placeholder="All Leaders" />
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

          {(searchQuery ||
            selectedUniversityFilter !== "all" ||
            selectedClassFilter !== "all" ||
            selectedLeaderFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-[#013565]">{filteredGroups.length}</span> of{" "}
                {groups?.length || 0} groups
              </p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedUniversityFilter("all")
                  setSelectedClassFilter("all")
                  setSelectedLeaderFilter("all")
                }}
                className="text-sm text-[#ff1b4a] hover:text-[#ff1b4a]/80 font-medium transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {filteredGroups.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No groups found matching your filters</p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedUniversityFilter("all")
                setSelectedClassFilter("all")
                setSelectedLeaderFilter("all")
              }}
              className="text-[#013565] hover:text-[#013565]/80 font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {Object.entries(groupedByUniversity).map(([universityName, { groups: uniGroups, university_id }]) => (
          <div key={universityName} className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#013565] to-[#013565]/80 flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#013565]">{universityName}</h2>
                  <p className="text-sm text-gray-500">{uniGroups.length} groups</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-[#013565]/20 text-[#013565] hover:bg-[#013565]/5 hover:border-[#013565]/40 transition-all bg-transparent"
                onClick={() => {
                  const link = getUniversityGroupsLink(university_id)
                  navigator.clipboard.writeText(link)
                  toast({ title: "Link Copied!", description: `Groups link for ${universityName} copied to clipboard` })
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Copy Groups Link
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniGroups.map((group, index) => (
                <div
                  key={group.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#013565]/20 overflow-hidden hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Header with gradient */}
                  <div className="bg-gradient-to-r from-[#013565] to-[#013565]/90 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white">{group.name}</h3>
                          <p className="text-sm text-white/70">{group.class_name}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                          className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-white/70 hover:text-[#ff1b4a] hover:bg-white/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Leader Info */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Leader</p>
                        <p className="font-semibold text-gray-800 truncate max-w-[180px]">{group.leader_name}</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#013565]/5 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-[#013565]" />
                          <span className="text-2xl font-bold text-[#013565]">{group.member_count}</span>
                        </div>
                        <p className="text-xs text-gray-500">Members</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BarChart3 className="w-4 h-4 text-gray-600" />
                          <span className="text-2xl font-bold text-gray-700">{group.capacity}</span>
                        </div>
                        <p className="text-xs text-gray-500">Capacity</p>
                      </div>
                    </div>

                    {/* Project Name */}
                    {group.project_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                        <FolderOpen className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{group.project_name}</span>
                      </div>
                    )}

                    {/* Payment Info */}
                    {group.is_paid && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-emerald-700">Payment Required</span>
                          <span className="font-bold text-emerald-600">${group.cost_per_member}</span>
                        </div>
                        {Number(group.member_count) > 0 && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-emerald-600 font-medium">{group.paid_count || 0} Paid</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 text-[#ff1b4a]" />
                              <span className="text-[#ff1b4a] font-medium">{group.unpaid_count || 0} Unpaid</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {Number(group.member_count) > 0 && (
                        <Button
                          onClick={() => handleViewMembers(group)}
                          variant="outline"
                          className="w-full border-[#013565]/30 text-[#013565] hover:bg-[#013565] hover:text-white hover:border-[#013565] transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[#013565]/20"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          View Members ({group.member_count})
                        </Button>
                      )}

                      <Button
                        onClick={() => handleAddMembers(group)}
                        variant="outline"
                        className="w-full border-[#ff1b4a]/30 text-[#ff1b4a] hover:bg-[#ff1b4a] hover:text-white hover:border-[#ff1b4a] transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[#ff1b4a]/20"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Members
                      </Button>

                      {group.is_paid && Number(group.member_count) > 0 && (
                        <Button
                          onClick={() => (window.location.href = `/admin/groups/payments/${group.id}`)}
                          className="w-full bg-gradient-to-r from-[#013565] to-[#013565]/80 hover:from-[#ff1b4a] hover:to-[#ff1b4a]/80 text-white shadow-lg shadow-[#013565]/30 hover:shadow-[#ff1b4a]/30 transition-all duration-300"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Track Payments
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No groups created yet</h3>
            <p className="text-gray-500 mb-6">Click "Create Group" to get started</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#013565] to-[#013565]/90 text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Group
            </Button>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header - Clean design without blue background */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#013565] to-[#013565]/80 flex items-center justify-center shadow-lg shadow-[#013565]/20">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#013565]">Create New Group</h2>
                    <p className="text-gray-500 text-sm mt-1">Fill in the details to create a new group</p>
                  </div>
                </div>
                <button
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
                  }}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-[#013565]/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-[#013565]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#013565]">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Name <span className="text-[#ff1b4a]">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-12 rounded-xl border-gray-200 focus:border-[#013565] focus:ring-[#013565]/20"
                        placeholder="e.g., Group 1 5PT"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 text-[#013565]" />
                        University <span className="text-[#ff1b4a]">*</span>
                      </label>
                      <Select
                        value={formData.university_id}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            university_id: value,
                            class_id: "",
                            leader_id: "",
                          })
                          // Directly call fetchClasses here to update class options
                          if (value) {
                            fetchClasses(value)
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-12 rounded-xl bg-white border-gray-200 focus:border-[#013565]">
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
                        Class <span className="text-[#ff1b4a]">*</span>
                      </label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            class_id: value,
                            leader_id: "",
                          })
                        }
                        disabled={!formData.university_id}
                      >
                        <SelectTrigger className="w-full h-12 rounded-xl bg-white border-gray-200 focus:border-[#013565]">
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
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Crown className="h-4 w-4 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#013565]">Leadership</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Leader <span className="text-[#ff1b4a]">*</span>
                    </label>
                    <Popover open={leaderDropdownOpen} onOpenChange={setLeaderDropdownOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={leaderDropdownOpen}
                          disabled={!formData.class_id}
                          className="w-full h-12 justify-between font-normal bg-white rounded-xl border-gray-200 hover:border-[#013565]/40"
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
                      <PopoverContent className="w-full p-0 bg-white rounded-xl shadow-xl border-0" align="start">
                        <div className="flex flex-col">
                          <div className="flex items-center border-b px-3 bg-gray-50 rounded-t-xl">
                            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search by name or ID..."
                              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                              value={leaderSearchQuery}
                              onChange={(e) => setLeaderSearchQuery(e.target.value)}
                            />
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {filteredLeaders.length === 0 ? (
                              <div className="py-8 text-center text-sm text-gray-500">No student found.</div>
                            ) : (
                              <div className="p-2">
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
                                    className="relative flex w-full items-center rounded-lg px-3 py-3 text-sm outline-none hover:bg-[#013565]/5 transition-colors"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#013565] to-[#013565]/80 flex items-center justify-center text-white font-medium mr-3">
                                      {student.full_name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium text-gray-800">{student.full_name}</span>
                                      <span className="text-xs text-gray-500">
                                        ID: {student.student_id} • {student.gender}
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
                      <p className="text-xs text-gray-500 mt-2">Select a class first to choose a leader</p>
                    )}
                  </div>
                </div>

                {/* Project Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#013565]">Project Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name <span className="text-[#ff1b4a]">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.project_name}
                        onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                        className="w-full h-12 rounded-xl border-gray-200 focus:border-[#013565]"
                        placeholder="e.g., Video Editing Project"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity <span className="text-[#ff1b4a]">*</span>
                      </label>
                      <Input
                        type="number"
                        required
                        min="1"
                        max="50"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full h-12 rounded-xl border-gray-200 focus:border-[#013565]"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Settings Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-[#ff1b4a]/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-[#ff1b4a]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#013565]">Payment Settings</h3>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="is_paid"
                        checked={formData.is_paid}
                        onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                        className="w-5 h-5 text-[#013565] border-gray-300 rounded focus:ring-[#013565] mt-0.5"
                      />
                      <div className="flex-1">
                        <label htmlFor="is_paid" className="text-sm font-medium text-gray-900 cursor-pointer block">
                          This group requires payment
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Enable this if members need to pay a fee to join</p>
                      </div>
                    </div>

                    {formData.is_paid && (
                      <div className="pl-8 animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cost Per Member ($) <span className="text-[#ff1b4a]">*</span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.cost_per_member}
                          onChange={(e) => setFormData({ ...formData, cost_per_member: e.target.value })}
                          className="w-full h-12 rounded-xl border-gray-200 focus:border-[#013565]"
                          placeholder="5.00"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-100">
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
                    }}
                    className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#013565] to-[#013565]/90 hover:from-[#013565]/90 hover:to-[#013565] text-white shadow-lg shadow-[#013565]/20 transition-all hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Group
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMembersModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#013565] to-[#013565]/90 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedGroup.name}</h2>
                      <p className="text-white/70 text-sm mt-1">
                        {selectedGroup.class_name} • Leader: {selectedGroup.leader_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowMembersModal(false)
                      setSelectedGroup(null)
                      setMembers([])
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                {loadingMembers ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full border-4 border-[#013565]/20 border-t-[#013565] animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading members...</p>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-lg">No members added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member, index) => (
                      <div
                        key={member.id}
                        className="bg-gradient-to-r from-[#013565]/5 to-transparent rounded-xl p-4 border border-[#013565]/10 hover:border-[#013565]/20 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#013565] to-[#013565]/80 flex items-center justify-center text-white font-bold shadow-lg shadow-[#013565]/20">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{member.student_name}</h3>
                              <p className="text-sm text-gray-500">ID: {member.student_id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                member.gender === "Male"
                                  ? "bg-[#013565]/10 text-[#013565]"
                                  : "bg-[#ff1b4a]/10 text-[#ff1b4a]"
                              }`}
                            >
                              {member.gender}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(selectedGroup.id, member.student_id)}
                              className="opacity-0 group-hover:opacity-100 text-[#ff1b4a] hover:bg-[#ff1b4a]/10 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <p className="text-sm text-center text-gray-600">
                  Total Members: <span className="font-bold text-[#013565]">{members.length}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingGroup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#013565] to-[#013565]/80 flex items-center justify-center">
                      <Pencil className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[#013565]">Edit Group</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingGroup(null)
                    }}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateGroup} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-150px)]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Enter group name"
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-[#013565]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                  <Select
                    value={String(editingGroup.university_id)}
                    onValueChange={(value) => {
                      const uni = universities.find((u) => u.id === Number(value))
                      if (uni) {
                        setEditFormData((prev) => ({ ...prev, class_id: "", leader_id: "" }))
                        fetchClassesByUniversity(uni.id)
                      }
                    }}
                    disabled
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <Select
                    value={editFormData.class_id ? String(editFormData.class_id) : undefined}
                    onValueChange={(value) => {
                      const cls = classes.find((c) => c.id === Number(value))
                      if (cls) {
                        setEditFormData((prev) => ({ ...prev, class_id: String(cls.id), leader_id: "" }))
                        fetchLeadersByClass(cls.id)
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200 focus:border-[#013565]">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leader</label>
                  <Select
                    value={editFormData.leader_id ? String(editFormData.leader_id) : undefined}
                    onValueChange={(value) => {
                      setEditFormData((prev) => ({ ...prev, leader_id: value }))
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200 focus:border-[#013565]">
                      <SelectValue placeholder="Select leader" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {students.map((leader) => (
                        <SelectItem key={leader.student_id} value={String(leader.student_id)}>
                          {leader.full_name || "No Name"} ({leader.student_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <Input
                    value={editFormData.project_name}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, project_name: e.target.value }))}
                    placeholder="Enter project name"
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-[#013565]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <Input
                    type="number"
                    value={editFormData.capacity}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, capacity: String(Number.parseInt(e.target.value)) || "0" }))
                    }
                    placeholder="15"
                    required
                    min="1"
                    className="h-12 rounded-xl border-gray-200 focus:border-[#013565]"
                  />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-semibold text-[#013565] mb-3">Payment Settings</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="edit-payment"
                      checked={editFormData.is_paid}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, is_paid: e.target.checked }))}
                      className="w-5 h-5 text-[#013565] rounded focus:ring-[#013565]"
                    />
                    <label htmlFor="edit-payment" className="text-sm font-medium text-gray-700">
                      This group requires payment
                    </label>
                  </div>

                  {editFormData.is_paid && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cost Per Member ($)</label>
                      <Input
                        type="number"
                        value={editFormData.cost_per_member}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            cost_per_member: String(Number.parseFloat(e.target.value)) || "0",
                          }))
                        }
                        placeholder="0"
                        required
                        min="0"
                        step="0.01"
                        className="h-12 rounded-xl border-gray-200 focus:border-[#013565]"
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
                    className="flex-1 h-12 rounded-xl border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#013565] to-[#013565]/90 hover:from-[#013565]/90 hover:to-[#013565] text-white shadow-lg"
                  >
                    Update Group
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTransferModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                      <ArrowRightLeft className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#013565]">Transfer Students</h2>
                      <p className="text-sm text-gray-500 mt-1">Move students between groups</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowTransferModal(false)
                      setTargetGroupId("")
                      setTransferringMember(null)
                      setSelectedGroup(null) // Clear selected group when closing
                      setMembers([]) // Clear members list
                    }}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Step 1 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#013565] text-white text-xs flex items-center justify-center">
                      1
                    </span>
                    Source Group
                  </label>
                  <Select
                    value={selectedGroup?.id ? String(selectedGroup.id) : undefined} // Use undefined if no group is selected
                    onValueChange={(value) => {
                      const selected = groups.find((g) => String(g.id) === value) || null
                      setSelectedGroup(selected)
                      setTargetGroupId("")
                      setTransferringMember(null)
                      if (selected) {
                        // Fetch members for the selected group
                        setTransferLoading(true)
                        fetch(`/api/groups/${value}/members`)
                          .then((res) => res.json())
                          .then((data) => {
                            setMembers(Array.isArray(data) ? data : [])
                            setTransferLoading(false)
                          })
                          .catch((err) => {
                            console.error("Error fetching members for transfer:", err)
                            setMembers([])
                            setTransferLoading(false)
                            toast({
                              title: "Error",
                              description: "Failed to load group members for transfer",
                              variant: "destructive",
                            })
                          })
                      } else {
                        setMembers([])
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200 focus:border-[#013565]">
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

                {/* Step 2 */}
                {selectedGroup && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span className="w-6 h-6 rounded-full bg-[#013565] text-white text-xs flex items-center justify-center">
                        2
                      </span>
                      Select Student to Transfer
                    </label>
                    <div className="border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                      {transferLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="w-8 h-8 rounded-full border-4 border-[#013565]/20 border-t-[#013565] animate-spin"></div>
                        </div>
                      ) : members.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">No members in this group</div>
                      ) : (
                        <div className="space-y-3">
                          {members.map((member) => (
                            <div
                              key={member.student_id}
                              onClick={() => setTransferringMember(member)}
                              className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                transferringMember?.student_id === member.student_id
                                  ? "bg-[#013565]/10 border-2 border-[#013565] shadow-sm"
                                  : "hover:bg-gray-50 border border-transparent"
                              }`}
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{member.student_name}</p>
                                <p className="text-sm text-gray-500">ID: {member.student_id}</p>
                              </div>
                              <Check
                                className={`w-5 h-5 ${transferringMember?.student_id === member.student_id ? "text-[#013565]" : "text-gray-300"}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {transferringMember && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span className="w-6 h-6 rounded-full bg-[#013565] text-white text-xs flex items-center justify-center">
                        3
                      </span>
                      Target Group
                    </label>
                    <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                      <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200 focus:border-[#013565]">
                        <SelectValue placeholder="Select target group..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {groups
                          .filter((g) => String(g.id) !== String(selectedGroup?.id))
                          .map((group) => {
                            const availableSpace = group.capacity - group.member_count
                            const canAccept = availableSpace >= 1 // Only need to check for 1 member transfer

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
              <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTransferModal(false)
                    setTargetGroupId("")
                    setTransferringMember(null)
                    setSelectedGroup(null)
                    setMembers([])
                  }}
                  className="flex-1 h-12 rounded-xl border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTransferMember}
                  disabled={!transferringMember || !targetGroupId || transferLoading}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                >
                  {transferLoading ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"></div>
                      Transferring...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-5 h-5 mr-2" />
                      Transfer Student
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showAddMembersModal && addMembersGroup && (
          <Dialog open={showAddMembersModal} onOpenChange={setShowAddMembersModal}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-0 shadow-2xl">
              {/* Header with brand gradient */}
              <div className="bg-gradient-to-r from-[#013565] to-[#014a8f] p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <UserPlus className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">Add Members</DialogTitle>
                    <p className="text-white/80 mt-1">
                      Add students to <span className="font-semibold text-white">{addMembersGroup?.name}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Group Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mb-6 border border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Class</p>
                      <p className="font-bold text-[#013565]">{addMembersGroup?.class_name}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Capacity</p>
                      <p className="font-bold text-[#013565]">
                        {addMembersGroup?.member_count || 0} / {addMembersGroup?.capacity}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Available Slots</p>
                      <p className="font-bold text-[#ff1b4a]">
                        {Math.max(0, (addMembersGroup?.capacity || 0) - (addMembersGroup?.member_count || 0))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search Input for Available Students */}
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Search available students..."
                    value={addMembersSearch}
                    onChange={(e) => setAddMembersSearch(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 focus:border-[#013565]"
                  />
                </div>

                {/* Selection Counter */}
                {selectedStudentsToAdd.length > 0 && (
                  <div className="bg-gradient-to-r from-[#013565]/10 to-[#014a8f]/10 border-2 border-[#013565]/20 rounded-xl p-4 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#013565] text-white flex items-center justify-center font-bold">
                        {selectedStudentsToAdd.length}
                      </div>
                      <span className="font-medium text-[#013565]">Students Selected</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudentsToAdd([])}
                      className="text-gray-500 hover:text-[#ff1b4a] hover:bg-[#ff1b4a]/10"
                    >
                      Clear All
                    </Button>
                  </div>
                )}

                {loadingAvailableStudents ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full border-4 border-[#013565]/20 border-t-[#013565] animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading available students...</p>
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No available students in this class</p>
                    <p className="text-gray-400 text-sm mt-1">All students are already assigned to groups</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableStudents
                      .filter(
                        (student) =>
                          student.full_name.toLowerCase().includes(addMembersSearch.toLowerCase()) ||
                          student.student_id.toLowerCase().includes(addMembersSearch.toLowerCase()),
                      )
                      .map((student) => (
                        <div
                          key={student.student_id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            selectedStudentsToAdd.includes(student.student_id)
                              ? "border-[#013565] bg-[#013565]/5 shadow-md"
                              : "border-gray-100 hover:border-[#013565]/30 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            const availableSlots =
                              (addMembersGroup?.capacity || 0) - (addMembersGroup?.member_count || 0)

                            if (selectedStudentsToAdd.includes(student.student_id)) {
                              // Remove student if already selected
                              setSelectedStudentsToAdd(selectedStudentsToAdd.filter((id) => id !== student.student_id))
                            } else if (selectedStudentsToAdd.length < availableSlots) {
                              // Add student if there are available slots
                              setSelectedStudentsToAdd([...selectedStudentsToAdd, student.student_id])
                            } else {
                              // Notify user if no slots are available
                              toast({
                                title: "No Room",
                                description: "Group is already at full capacity.",
                                variant: "destructive",
                              })
                            }
                          }}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              selectedStudentsToAdd.includes(student.student_id)
                                ? "bg-[#013565] border-[#013565]"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedStudentsToAdd.includes(student.student_id) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#013565] to-[#014a8f] flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {student.full_name?.charAt(0) || "S"}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{student.full_name}</p>
                            <p className="text-sm text-gray-500">ID: {student.student_id}</p>
                          </div>
                          {selectedStudentsToAdd.includes(student.student_id) && (
                            <div className="px-3 py-1 rounded-full bg-[#013565] text-white text-xs font-medium">
                              Selected
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Footer with action buttons */}
              <div className="border-t bg-gray-50 p-4 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddMembersModal(false)}
                  className="flex-1 h-12 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAddMembers}
                  disabled={
                    selectedStudentsToAdd.length === 0 ||
                    (addMembersGroup &&
                      addMembersGroup.capacity - addMembersGroup.member_count < selectedStudentsToAdd.length)
                  }
                  className="flex-1 h-12 bg-gradient-to-r from-[#013565] to-[#014a8f] hover:from-[#012a52] hover:to-[#013d7a] text-white font-semibold shadow-lg shadow-[#013565]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add {selectedStudentsToAdd.length > 0 ? `${selectedStudentsToAdd.length} Members` : "Members"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
