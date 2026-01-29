"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Search,
  Edit,
  Eye,
  EyeOff,
  Key,
  Mail,
  User,
  Phone,
  GraduationCap,
  Loader2,
  Save,
  X,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
} from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/image-upload"

interface GoldStudent {
  id: number
  full_name: string
  email: string
  whatsapp_number: string | null
  university: string | null
  field_of_study: string | null
  profile_image: string | null
  account_status: "pending" | "active" | "suspended" | "inactive"
  created_at: string
  updated_at: string
  device_count?: number
}

export default function GoldStudentsPage() {
  const [students, setStudents] = useState<GoldStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<GoldStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<GoldStudent | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    whatsapp_number: "",
    university: "",
    field_of_study: "",
    account_status: "active" as "pending" | "active" | "suspended" | "inactive",
    profile_image: "",
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const [isDevicesDialogOpen, setIsDevicesDialogOpen] = useState(false)
  const [devicesForStudent, setDevicesForStudent] = useState<GoldStudent | null>(null)
  const [devicesList, setDevicesList] = useState<{ id: number; device_id: string; device_label: string | null; last_used_at: string; created_at: string }[]>([])
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [removingDeviceId, setRemovingDeviceId] = useState<number | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredStudents(
        students.filter(
          (student) =>
            student.full_name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query) ||
            student.whatsapp_number?.toLowerCase().includes(query) ||
            student.university?.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, students])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/gold/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(Array.isArray(data) ? data : [])
      } else {
        toast.error("Failed to fetch students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student: GoldStudent) => {
    setSelectedStudent(student)
    setFormData({
      full_name: student.full_name || "",
      email: student.email || "",
      whatsapp_number: student.whatsapp_number || "",
      university: student.university || "",
      field_of_study: student.field_of_study || "",
      account_status: student.account_status || "active",
      profile_image: student.profile_image || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedStudent) return

    setSaving(true)
    try {
      const response = await fetch("/api/gold/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStudent.id,
          full_name: formData.full_name,
          email: formData.email,
          whatsapp_number: formData.whatsapp_number || null,
          university: formData.university || null,
          field_of_study: formData.field_of_study || null,
          account_status: formData.account_status,
        }),
      })

      if (response.ok) {
        // Update profile image separately if changed
        if (formData.profile_image !== selectedStudent.profile_image) {
          await fetch("/api/gold/students/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": selectedStudent.id.toString(),
            },
            body: JSON.stringify({
              profile_image: formData.profile_image,
            }),
          })
        }

        toast.success("Student updated successfully!")
        setIsEditDialogOpen(false)
        fetchStudents()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to update student")
      }
    } catch (error) {
      console.error("Error updating student:", error)
      toast.error("Failed to update student")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!selectedStudent) return

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in both password fields")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/gold/students/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          new_password: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        toast.success("Password changed successfully!")
        setIsPasswordDialogOpen(false)
        setPasswordData({ newPassword: "", confirmPassword: "" })
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  const openDevicesDialog = async (student: GoldStudent) => {
    setDevicesForStudent(student)
    setIsDevicesDialogOpen(true)
    setDevicesList([])
    try {
      setLoadingDevices(true)
      const res = await fetch(`/api/admin/gold/students/${student.id}/devices`)
      if (res.ok) {
        const data = await res.json()
        setDevicesList(Array.isArray(data) ? data : [])
      } else {
        toast.error("Failed to load devices")
      }
    } catch (e) {
      toast.error("Failed to load devices")
    } finally {
      setLoadingDevices(false)
    }
  }

  const removeDevice = async (studentId: number, deviceRowId: number) => {
    if (!confirm("Remove this device? The student will be able to log in from a new device instead.")) return
    try {
      setRemovingDeviceId(deviceRowId)
      const res = await fetch(`/api/admin/gold/students/${studentId}/devices`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deviceRowId }),
      })
      if (res.ok) {
        toast.success("Device removed. Student can now add a new device.")
        setDevicesList((prev) => prev.filter((d) => d.id !== deviceRowId))
        fetchStudents()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to remove device")
      }
    } catch (e) {
      toast.error("Failed to remove device")
    } finally {
      setRemovingDeviceId(null)
    }
  }

  const handleDelete = async (student: GoldStudent) => {
    if (!confirm(`Are you sure you want to delete ${student.full_name}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/gold/students?id=${student.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Student deleted successfully!")
        fetchStudents()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete student")
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Failed to delete student")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
      pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
      suspended: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
      inactive: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-purple-500/20">
              <Users className="h-8 w-8 text-[#e63946]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Gold Students Management</h1>
              <p className="text-gray-400 mt-1">Manage registered students and their accounts</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name, email, WhatsApp, or university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        {loading ? (
          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#e63946] mx-auto mb-4" />
              <p className="text-gray-400">Loading students...</p>
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No students found</p>
              <p className="text-gray-500 text-sm">
                {searchQuery ? "Try a different search term" : "No students have registered yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Students ({filteredStudents.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-gray-400 font-semibold">Student</th>
                      <th className="text-left p-4 text-gray-400 font-semibold">Contact</th>
                      <th className="text-left p-4 text-gray-400 font-semibold">Education</th>
                      <th className="text-left p-4 text-gray-400 font-semibold">Status</th>
                      <th className="text-center p-4 text-gray-400 font-semibold">Devices</th>
                      <th className="text-left p-4 text-gray-400 font-semibold">Joined</th>
                      <th className="text-right p-4 text-gray-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e63946] to-[#d62839] flex items-center justify-center text-white font-bold text-sm">
                              {student.profile_image ? (
                                <img
                                  src={student.profile_image}
                                  alt={student.full_name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                student.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              )}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{student.full_name}</p>
                              <p className="text-gray-400 text-sm">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {student.whatsapp_number && (
                              <p className="text-gray-300 text-sm flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {student.whatsapp_number}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {student.university && (
                              <p className="text-gray-300 text-sm flex items-center gap-2">
                                <GraduationCap className="h-3 w-3" />
                                {student.university}
                              </p>
                            )}
                            {student.field_of_study && (
                              <p className="text-gray-400 text-xs">{student.field_of_study}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(student.account_status)}</td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                              (student.device_count ?? 0) >= 2
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                            }`}
                            title="Allowed devices (max 2)"
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                            {(student.device_count ?? 0)}/2
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-400 text-sm">
                            {new Date(student.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(student)}
                              className="border-white/10 hover:bg-white/5"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student)
                                setIsPasswordDialogOpen(true)
                              }}
                              className="border-white/10 hover:bg-white/5"
                            >
                              <Key className="h-4 w-4 mr-1" />
                              Password
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDevicesDialog(student)}
                              className="border-white/10 hover:bg-white/5"
                            >
                              <Smartphone className="h-4 w-4 mr-1" />
                              Devices
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(student)}
                              className="border-red-500/30 hover:bg-red-500/10 text-red-400"
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
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                <Label className="text-gray-300 font-semibold">Profile Picture</Label>
                <ImageUpload
                  value={formData.profile_image}
                  onChange={(url) => setFormData({ ...formData, profile_image: url })}
                  onRemove={() => setFormData({ ...formData, profile_image: "" })}
                  folder="profile-images"
                  size="lg"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number" className="text-gray-300 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]"
                />
              </div>

              {/* University */}
              <div className="space-y-2">
                <Label htmlFor="university" className="text-gray-300 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  University
                </Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]"
                />
              </div>

              {/* Field of Study */}
              <div className="space-y-2">
                <Label htmlFor="field_of_study" className="text-gray-300">Field of Study</Label>
                <Input
                  id="field_of_study"
                  value={formData.field_of_study}
                  onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                  className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]"
                />
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <Label htmlFor="account_status" className="text-gray-300">Account Status</Label>
                <Select
                  value={formData.account_status}
                  onValueChange={(value: any) => setFormData({ ...formData, account_status: value })}
                >
                  <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-white/10">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c5222f] text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-white/10 hover:bg-white/5"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Change Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-400">
                Change password for <span className="text-white font-semibold">{selectedStudent?.full_name}</span>
              </p>

              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-gray-300">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946] pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-gray-300">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPasswordDialogOpen(false)
                    setPasswordData({ newPassword: "", confirmPassword: "" })
                  }}
                  className="border-white/10 hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Devices Dialog – max 2 devices; remove one to allow student to add new device */}
        <Dialog open={isDevicesDialogOpen} onOpenChange={setIsDevicesDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Allowed devices
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-400 text-sm">
              Student can log in from up to 2 devices. Remove one to let them add a new device.
            </p>
            {devicesForStudent && (
              <p className="text-gray-500 text-xs">
                {devicesForStudent.full_name} ({devicesForStudent.email})
              </p>
            )}
            {loadingDevices ? (
              <div className="py-8 flex items-center justify-center gap-2 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading devices...
              </div>
            ) : devicesList.length === 0 ? (
              <p className="text-gray-500 py-4">No devices registered yet.</p>
            ) : (
              <ul className="space-y-2">
                {devicesList.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="min-w-0">
                      <p className="text-gray-300 text-sm font-mono truncate" title={d.device_id}>
                        {d.device_id.length > 28 ? `${d.device_id.slice(0, 28)}…` : d.device_id}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Last used: {new Date(d.last_used_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => devicesForStudent && removeDevice(devicesForStudent.id, d.id)}
                      disabled={removingDeviceId === d.id}
                      className="border-red-500/30 hover:bg-red-500/10 text-red-400 shrink-0"
                    >
                      {removingDeviceId === d.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
