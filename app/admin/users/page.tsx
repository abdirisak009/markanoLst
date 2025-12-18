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
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Search,
  Eye,
  EyeOff,
  Loader2,
  Activity,
  Mail,
  User,
  Lock,
  CheckCircle2,
  XCircle,
  Crown,
  UserCog,
  Key,
} from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

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
  profile_image?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
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
    profile_image: "", // Added profile_image
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")

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

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords-ku isma mid aha")
      return
    }
    if (passwordData.newPassword.length < 4) {
      setPasswordError("Password-ku waa inuu ka badan yahay 4 xaraf")
      return
    }

    setSaving(true)
    setPasswordError("")
    try {
      const res = await fetch(`/api/admin/users/${selectedUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedUser,
          password: passwordData.newPassword,
        }),
      })

      if (res.ok) {
        setIsChangePasswordOpen(false)
        setPasswordData({ newPassword: "", confirmPassword: "" })
        alert("Password-ka si guul leh ayaa loo bedelay!")
      } else {
        const error = await res.json()
        setPasswordError(error.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordError("Khalad ayaa dhacay")
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
      profile_image: user.profile_image || "",
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

  // Add open change password dialog function
  const openChangePasswordDialog = (user: AdminUser) => {
    setSelectedUser(user)
    setPasswordData({ newPassword: "", confirmPassword: "" })
    setPasswordError("")
    setIsChangePasswordOpen(true)
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
      profile_image: "", // Reset profile_image
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
    <div className="p-6 space-y-6">
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
            <Button className="bg-[#ff1b4a] hover:bg-[#e0173f] text-white shadow-lg shadow-[#ff1b4a]/25">
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
              <div className="flex justify-center">
                <div className="text-center">
                  <Label className="text-gray-700 font-medium block mb-3">Profile Image</Label>
                  <ImageUpload
                    value={formData.profile_image}
                    onChange={(url) => setFormData({ ...formData, profile_image: url })}
                    onRemove={() => setFormData({ ...formData, profile_image: "" })}
                    folder="users/avatars"
                    size="lg"
                  />
                </div>
              </div>

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

      <Card className="bg-white border-gray-200 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Raadi username, magac, ama email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl focus:border-[#ff1b4a] focus:ring-[#ff1b4a]/20 placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#013565] to-[#0a4d8c] text-white">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg">Users</span>
              <span className="ml-2 text-sm font-normal text-white/70">({filteredUsers.length} users)</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-[#ff1b4a]" />
              <p className="text-gray-500 mt-3">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Ma jiraan users</p>
              <p className="text-gray-400 text-sm mt-1">Ku dar user cusub si aad u bilowdo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border border-gray-100 hover:border-[#ff1b4a]/30 hover:shadow-lg hover:shadow-[#ff1b4a]/5 transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#013565] to-[#ff1b4a] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {user.profile_image ? (
                            <img
                              src={user.profile_image || "/placeholder.svg"}
                              alt="Profile"
                              className="w-full h-full rounded-2xl object-cover"
                            />
                          ) : (
                            (user.full_name?.charAt(0) || user.username?.charAt(0) || "U").toUpperCase()
                          )}
                        </div>
                        {user.status === "active" ? (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                            <XCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-lg">{user.full_name || user.username}</h3>
                          <Badge
                            className={
                              user.role === "superadmin"
                                ? "bg-gradient-to-r from-[#ff1b4a] to-[#ff6b35] text-white border-0"
                                : user.role === "admin"
                                  ? "bg-gradient-to-r from-[#013565] to-[#0a4d8c] text-white border-0"
                                  : user.role === "manager"
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                            }
                          >
                            {user.role === "superadmin" && <Crown className="h-3 w-3 mr-1" />}
                            {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                            {user.role === "manager" && <UserCog className="h-3 w-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />@{user.username}
                          </span>
                          {user.email && (
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="bg-[#013565]/5 text-[#013565] border-[#013565]/20 px-3 py-1.5"
                      >
                        <Shield className="h-3.5 w-3.5 mr-1.5" />
                        {user.permissions?.length || 0} permissions
                      </Badge>

                      <div className="flex items-center gap-1.5 ml-2">
                        {/* Change Password Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openChangePasswordDialog(user)}
                          className="border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl h-9 w-9 p-0"
                          title="Beddel Password"
                        >
                          <Key className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPermissionsDialog(user)}
                          className="border-[#ff1b4a]/20 bg-[#ff1b4a]/5 hover:bg-[#ff1b4a]/10 text-[#ff1b4a] rounded-xl h-9 w-9 p-0"
                          title="Permissions"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          className="border-[#013565]/20 bg-[#013565]/5 hover:bg-[#013565]/10 text-[#013565] rounded-xl h-9 w-9 p-0"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="border-red-200 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl h-9 w-9 p-0"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Preview */}
                  {user.permissions && user.permissions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {user.permissions.slice(0, 6).map((perm) => (
                          <Badge
                            key={perm}
                            variant="outline"
                            className="text-xs bg-gray-50 border-gray-200 text-gray-600 rounded-lg px-2 py-1"
                          >
                            {perm.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {user.permissions.length > 6 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-[#ff1b4a]/5 border-[#ff1b4a]/20 text-[#ff1b4a] rounded-lg px-2 py-1"
                          >
                            +{user.permissions.length - 6} more
                          </Badge>
                        )}
                      </div>
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

      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md p-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Key className="h-6 w-6 text-white" />
                </div>
                Beddel Password
              </DialogTitle>
              <p className="text-white/80 text-sm mt-1">
                Beddel password-ka {selectedUser?.full_name || selectedUser?.username}
              </p>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {passwordError}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Password Cusub</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="pl-10 pr-10 bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="Geli password cusub"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Xaqiiji Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="pl-10 bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="Ku celi password-ka"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
                className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Jooji
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Beddel Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
