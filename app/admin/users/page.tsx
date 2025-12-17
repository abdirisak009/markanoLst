"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Plus, Edit, Trash2, Shield, ShieldCheck, Search, Eye, EyeOff, Loader2, Activity } from "lucide-react"

// All available permissions grouped by category
const PERMISSION_GROUPS = {
  Dashboard: [{ key: "dashboard_view", label: "Arag Dashboard" }],
  Ardayda: [
    { key: "students_view", label: "Arag Ardayda" },
    { key: "students_edit", label: "Tafatir Ardayda" },
    { key: "penn_students_view", label: "Arag Penn Students" },
    { key: "penn_students_edit", label: "Tafatir Penn Students" },
    { key: "university_students_view", label: "Arag University Students" },
    { key: "university_students_edit", label: "Tafatir University Students" },
  ],
  Waxbarashada: [
    { key: "universities_view", label: "Arag Jaamacadaha" },
    { key: "universities_edit", label: "Tafatir Jaamacadaha" },
    { key: "classes_view", label: "Arag Fasallada" },
    { key: "classes_edit", label: "Tafatir Fasallada" },
    { key: "courses_view", label: "Arag Koorsayaasha" },
    { key: "courses_edit", label: "Tafatir Koorsayaasha" },
  ],
  Muuqaallada: [
    { key: "videos_view", label: "Arag Muuqaallada" },
    { key: "videos_edit", label: "Tafatir Muuqaallada" },
    { key: "video_analytics_view", label: "Arag Video Analytics" },
  ],
  "Assignments & Groups": [
    { key: "assignments_view", label: "Arag Assignments" },
    { key: "assignments_edit", label: "Tafatir Assignments" },
    { key: "groups_view", label: "Arag Groups" },
    { key: "groups_edit", label: "Tafatir Groups" },
    { key: "group_reports_view", label: "Arag Group Reports" },
    { key: "challenges_view", label: "Arag Challenges" },
    { key: "challenges_edit", label: "Tafatir Challenges" },
  ],
  Maaliyadda: [
    { key: "payments_view", label: "Arag Lacag-bixinta" },
    { key: "payments_edit", label: "Tafatir Lacag-bixinta" },
    { key: "expenses_view", label: "Arag Kharashaadka" },
    { key: "expenses_edit", label: "Tafatir Kharashaadka" },
    { key: "financial_report_view", label: "Arag Warbixinta Maaliyadda" },
  ],
  "Analytics & Reports": [
    { key: "performance_view", label: "Arag Performance" },
    { key: "analytics_view", label: "Arag Analytics" },
    { key: "approvals_view", label: "Arag Approvals" },
    { key: "approvals_edit", label: "Tafatir Approvals" },
    { key: "qr_codes_view", label: "Arag QR Codes" },
    { key: "qr_codes_edit", label: "Samee QR Codes" },
  ],
  Maamulka: [
    { key: "users_view", label: "Arag Users" },
    { key: "users_edit", label: "Tafatir Users (Admin)" },
  ],
}

interface AdminUser {
  id: number
  username: string
  email: string
  full_name: string
  role: string
  status: string
  last_login: string | null
  created_at: string
  permissions: string[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    role: "user",
    status: "active",
    permissions: [] as string[],
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchUsers()
        setIsAddDialogOpen(false)
        resetForm()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchUsers()
        setIsEditDialogOpen(false)
        resetForm()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Ma hubtaa inaad rabto inaad tirtirto user-kan?")) return

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedUser,
          permissions: formData.permissions,
        }),
      })

      if (res.ok) {
        fetchUsers()
        setIsPermissionsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error updating permissions:", error)
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (user: AdminUser) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email || "",
      full_name: user.full_name || "",
      password: "",
      role: user.role || "user",
      status: user.status || "active",
      permissions: user.permissions || [],
    })
    setIsEditDialogOpen(true)
  }

  const openPermissionsDialog = (user: AdminUser) => {
    setSelectedUser(user)
    setFormData({
      ...formData,
      permissions: user.permissions || [],
    })
    setIsPermissionsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      full_name: "",
      password: "",
      role: "user",
      status: "active",
      permissions: [],
    })
    setSelectedUser(null)
    setShowPassword(false)
  }

  const togglePermission = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }))
  }

  const selectAllInGroup = (groupPermissions: { key: string }[]) => {
    const keys = groupPermissions.map((p) => p.key)
    const allSelected = keys.every((k) => formData.permissions.includes(k))

    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !keys.includes(p)),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...keys])],
      }))
    }
  }

  const selectAllPermissions = () => {
    const allKeys = Object.values(PERMISSION_GROUPS)
      .flat()
      .map((p) => p.key)
    const allSelected = allKeys.every((k) => formData.permissions.includes(k))

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected ? [] : allKeys,
    }))
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-7 w-7 text-[#ff1b4a]" />
            Maamulka Users
          </h1>
          <p className="text-gray-400 mt-1">Samee, tafatir, oo sii permissions users-ka</p>
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#ff1b4a] hover:bg-[#e0173f] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Ku dar User Cusub
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#013565] to-[#ff1b4a] p-6 rounded-t-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  Ku dar User Cusub
                </DialogTitle>
                <p className="text-white/80 text-sm mt-1">Samee user cusub oo sii permissions</p>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Macluumaadka User-ka
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Username *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="pl-10 bg-gray-50 border-gray-200 text-gray-900 focus:border-[#ff1b4a] focus:ring-[#ff1b4a]/20 h-12 rounded-xl"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Email</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 bg-gray-50 border-gray-200 text-gray-900 focus:border-[#ff1b4a] focus:ring-[#ff1b4a]/20 h-12 rounded-xl"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Magaca Buuxa</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="pl-10 bg-gray-50 border-gray-200 text-gray-900 focus:border-[#ff1b4a] focus:ring-[#ff1b4a]/20 h-12 rounded-xl"
                      placeholder="Full Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Password *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-12 bg-gray-50 border-gray-200 text-gray-900 focus:border-[#ff1b4a] focus:ring-[#ff1b4a]/20 h-12 rounded-xl"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role & Status Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Role & Status
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Role</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl focus:border-[#ff1b4a] focus:ring-[#ff1b4a]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                        <SelectItem value="admin" className="rounded-lg focus:bg-[#ff1b4a]/10 focus:text-[#ff1b4a]">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#ff1b4a]" />
                            Admin (Full Access)
                          </div>
                        </SelectItem>
                        <SelectItem value="manager" className="rounded-lg focus:bg-[#ff1b4a]/10 focus:text-[#ff1b4a]">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-yellow-500" />
                            Manager
                          </div>
                        </SelectItem>
                        <SelectItem value="user" className="rounded-lg focus:bg-[#ff1b4a]/10 focus:text-[#ff1b4a]">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            User
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl focus:border-[#ff1b4a] focus:ring-[#ff1b4a]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                        <SelectItem value="active" className="rounded-lg focus:bg-green-50 focus:text-green-600">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive" className="rounded-lg focus:bg-red-50 focus:text-red-600">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-red-500" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Permissions
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllPermissions}
                    className="text-xs border-[#ff1b4a] text-[#ff1b4a] hover:bg-[#ff1b4a] hover:text-white rounded-lg transition-all bg-transparent"
                  >
                    {Object.values(PERMISSION_GROUPS)
                      .flat()
                      .every((p) => formData.permissions.includes(p.key))
                      ? "Ka saar Dhammaan"
                      : "Dooro Dhammaan"}
                  </Button>
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                    <div
                      key={group}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#ff1b4a]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-[#013565]">{group}</span>
                        <button
                          type="button"
                          onClick={() => selectAllInGroup(permissions)}
                          className="text-xs text-[#ff1b4a] hover:text-[#e0173f] font-medium px-3 py-1 rounded-full bg-[#ff1b4a]/10 hover:bg-[#ff1b4a]/20 transition-colors"
                        >
                          {permissions.every((p) => formData.permissions.includes(p.key)) ? "Ka saar" : "Dooro"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permissions.map((perm) => (
                          <label
                            key={perm.key}
                            className={`flex items-center gap-3 text-sm cursor-pointer p-2.5 rounded-lg transition-all ${
                              formData.permissions.includes(perm.key)
                                ? "bg-[#ff1b4a]/10 text-[#ff1b4a] border border-[#ff1b4a]/30"
                                : "hover:bg-gray-100 text-gray-600 border border-transparent"
                            }`}
                          >
                            <Checkbox
                              checked={formData.permissions.includes(perm.key)}
                              onCheckedChange={() => togglePermission(perm.key)}
                              className="border-gray-300 data-[state=checked]:bg-[#ff1b4a] data-[state=checked]:border-[#ff1b4a]"
                            />
                            {perm.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Permissions count */}
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
                  <Activity className="h-4 w-4 text-[#ff1b4a]" />
                  <span>
                    <strong className="text-[#ff1b4a]">{formData.permissions.length}</strong> permissions la doortay
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11"
                >
                  Jooji
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={saving || !formData.username || !formData.password}
                  className="bg-gradient-to-r from-[#ff1b4a] to-[#ff6b35] hover:from-[#e0173f] hover:to-[#e05a2d] text-white rounded-xl px-6 h-11 shadow-lg shadow-[#ff1b4a]/25 disabled:opacity-50 disabled:shadow-none"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Samee User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-[#0a1628] border-white/10">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Raadi username, magac, ama email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#111d32] border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-[#0a1628] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#ff1b4a]" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff1b4a]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Ma jiraan users</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#111d32] rounded-xl p-4 border border-white/5 hover:border-[#ff1b4a]/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff1b4a] to-[#ff6b35] flex items-center justify-center text-white font-bold text-lg">
                        {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{user.full_name || user.username}</h3>
                          <Badge
                            variant="outline"
                            className={
                              user.role === "admin"
                                ? "border-[#ff1b4a] text-[#ff1b4a]"
                                : user.role === "manager"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-gray-500 text-gray-400"
                            }
                          >
                            {user.role}
                          </Badge>
                          {user.status === "active" ? (
                            <Users className="h-4 w-4 text-green-500" />
                          ) : (
                            <Users className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">@{user.username}</p>
                        {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-[#013565] text-white">
                        {user.permissions?.length || 0} permissions
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPermissionsDialog(user)}
                        className="border-white/20 hover:bg-[#ff1b4a]/20 hover:border-[#ff1b4a]"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="border-white/20 hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="border-white/20 hover:bg-red-500/20 hover:border-red-500 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Show permissions preview */}
                  {user.permissions && user.permissions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {user.permissions.slice(0, 5).map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs border-white/10 text-gray-400">
                          {perm.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {user.permissions.length > 5 && (
                        <Badge variant="outline" className="text-xs border-white/10 text-gray-400">
                          +{user.permissions.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#013565] to-[#0a4d8c] p-6 rounded-t-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                Wax ka beddel User
              </DialogTitle>
              <p className="text-white/80 text-sm mt-1">Tafatir macluumaadka user-ka</p>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4" />
                Macluumaadka User-ka
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Username *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="pl-10 bg-gray-50 border-gray-200 text-gray-900 focus:border-[#013565] focus:ring-[#013565]/20 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Email</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-gray-50 border-gray-200 text-gray-900 focus:border-[#013565] focus:ring-[#013565]/20 h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Magaca Buuxa</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="pl-10 bg-gray-50 border-gray-200 text-gray-900 focus:border-[#013565] focus:ring-[#013565]/20 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Password Cusub (iska dhaaf haddii aadan beddeleyn)</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-12 bg-gray-50 border-gray-200 text-gray-900 focus:border-[#013565] focus:ring-[#013565]/20 h-12 rounded-xl"
                    placeholder="Geli password cusub..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role & Status Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4" />
                Role & Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Role</Label>
                  <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl focus:border-[#013565] focus:ring-[#013565]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                      <SelectItem value="admin" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-[#ff1b4a]" />
                          Admin (Full Access)
                        </div>
                      </SelectItem>
                      <SelectItem value="manager" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-yellow-500" />
                          Manager
                        </div>
                      </SelectItem>
                      <SelectItem value="user" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          User
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl focus:border-[#013565] focus:ring-[#013565]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                      <SelectItem value="active" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-500" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-red-500" />
                          Inactive
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11"
              >
                Jooji
              </Button>
              <Button
                onClick={handleEditUser}
                disabled={saving || !formData.username}
                className="bg-gradient-to-r from-[#013565] to-[#0a4d8c] hover:from-[#012a52] hover:to-[#083d6e] text-white rounded-xl px-6 h-11 shadow-lg shadow-[#013565]/25 disabled:opacity-50 disabled:shadow-none"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                Kaydi Isbeddelka
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        open={isPermissionsDialogOpen}
        onOpenChange={(open) => {
          setIsPermissionsDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#ff1b4a] to-[#ff6b35] p-6 rounded-t-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                Permissions
              </DialogTitle>
              <p className="text-white/90 text-sm mt-1 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {selectedUser?.full_name || selectedUser?.username}
              </p>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-gray-500 text-sm">Dooro waxa user-kan arki karo iyo wuxu tafatiri karo</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllPermissions}
                className="border-[#ff1b4a] text-[#ff1b4a] hover:bg-[#ff1b4a] hover:text-white rounded-lg transition-all bg-transparent"
              >
                {Object.values(PERMISSION_GROUPS)
                  .flat()
                  .every((p) => formData.permissions.includes(p.key))
                  ? "Ka saar Dhammaan"
                  : "Dooro Dhammaan"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                <div
                  key={group}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#ff1b4a]/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-[#013565]">{group}</span>
                    <button
                      type="button"
                      onClick={() => selectAllInGroup(permissions)}
                      className="text-xs text-[#ff1b4a] hover:text-[#e0173f] font-medium px-3 py-1 rounded-full bg-[#ff1b4a]/10 hover:bg-[#ff1b4a]/20 transition-colors"
                    >
                      {permissions.every((p) => formData.permissions.includes(p.key)) ? "Ka saar" : "Dooro dhammaan"}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {permissions.map((perm) => (
                      <label
                        key={perm.key}
                        className={`flex items-center gap-3 text-sm cursor-pointer p-2.5 rounded-lg transition-all ${
                          formData.permissions.includes(perm.key)
                            ? "bg-[#ff1b4a]/10 text-[#ff1b4a] border border-[#ff1b4a]/30"
                            : "hover:bg-gray-100 text-gray-600 border border-transparent"
                        }`}
                      >
                        <Checkbox
                          checked={formData.permissions.includes(perm.key)}
                          onCheckedChange={() => togglePermission(perm.key)}
                          className="border-gray-300 data-[state=checked]:bg-[#ff1b4a] data-[state=checked]:border-[#ff1b4a]"
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
                <Activity className="h-4 w-4 text-[#ff1b4a]" />
                <span>
                  <strong className="text-[#ff1b4a]">{formData.permissions.length}</strong> permissions la doortay
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsPermissionsDialogOpen(false)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11"
                >
                  Jooji
                </Button>
                <Button
                  onClick={handleUpdatePermissions}
                  disabled={saving}
                  className="bg-gradient-to-r from-[#ff1b4a] to-[#ff6b35] hover:from-[#e0173f] hover:to-[#e05a2d] text-white rounded-xl px-6 h-11 shadow-lg shadow-[#ff1b4a]/25 disabled:opacity-50 disabled:shadow-none"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                  Kaydi Permissions
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
