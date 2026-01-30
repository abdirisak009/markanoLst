"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Loader2, Upload, Camera } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface Profile {
  id: number
  full_name: string
  email: string
  phone: string | null
  profile_image_url: string | null
  bio: string | null
  status: string
  created_at: string
  updated_at: string
  university_id: number | null
  university_name: string | null
}

export default function InstructorProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ bio: "", phone: "" })

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile) {
      setForm({ bio: profile.bio || "", phone: profile.phone || "" })
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/instructor/profile", { credentials: "include", cache: "no-store" })
      if (res.status === 401) {
        window.location.href = "/instructor/login?redirect=/instructor/profile"
        return
      }
      if (!res.ok) throw new Error("Failed to load profile")
      const data = await res.json()
      setProfile(data)
    } catch {
      toast.error("Failed to load profile")
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image (JPEG, PNG, GIF, WebP)")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/instructor/profile/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      if (!data.url) throw new Error("No image URL returned")
      toast.success("Profile image updated")
      setProfile((p) =>
        p ? { ...p, profile_image_url: data.url, updated_at: new Date().toISOString() } : null
      )
      fetch("/api/instructor/profile", { credentials: "include", cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((fresh) => fresh && setProfile(fresh))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed"
      toast.error(msg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/instructor/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: form.bio.trim() || null, phone: form.phone.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      toast.success("Profile updated")
      setProfile((p) => (p ? { ...p, ...data } : null))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (!profile && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-slate-600 font-medium">Could not load profile</p>
        <Button variant="outline" className="mt-4" onClick={fetchProfile}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="h-7 w-7 text-[#e63946]" />
          Profile
        </h1>
        <p className="text-slate-500 mt-1">Manage your profile and profile image</p>
      </div>

      {loading && !profile ? (
        <div className="max-w-2xl space-y-6 animate-pulse">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-48 bg-slate-100 rounded mt-2" />
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-slate-200" />
              <div className="h-10 w-32 bg-slate-200 rounded" />
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="h-5 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-64 bg-slate-100 rounded mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 bg-slate-100 rounded" />
              <div className="h-10 bg-slate-100 rounded" />
              <div className="h-24 bg-slate-100 rounded" />
              <div className="h-10 w-28 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        </div>
      ) : profile ? (
      <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm max-w-2xl">
        <CardHeader>
          <CardTitle>Profile image</CardTitle>
          <CardDescription>Upload a profile photo (JPEG, PNG, GIF, WebP — max 5MB)</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
          <div className="relative">
            {profile.profile_image_url ? (
              <div
                key={profile.profile_image_url + (profile.updated_at || "")}
                className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100"
              >
                <img
                  src={`/api/instructor/profile/image?v=${(profile.updated_at || profile.profile_image_url || "").toString().replace(/\D/g, "").slice(0, 14) || Date.now()}`}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    const next = e.currentTarget.nextElementSibling as HTMLElement
                    if (next) next.style.display = "flex"
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full bg-slate-200 flex items-center justify-center hidden"
                  style={{ display: "none" }}
                  aria-hidden
                >
                  <User className="w-14 h-14 text-slate-400" />
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="h-14 w-14 text-slate-400" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            {uploading ? "Uploading..." : "Change photo"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm max-w-2xl mt-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Name and email are from your application. You can update bio and phone.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-500">Full name</Label>
              <p className="font-medium text-slate-800">{profile.full_name}</p>
            </div>
            <div>
              <Label className="text-slate-500">Email</Label>
              <p className="font-medium text-slate-800">{profile.email}</p>
            </div>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+252..."
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Short bio about your teaching experience"
                  rows={4}
                  className="border-slate-200 resize-none"
                />
              </div>
              <Button type="submit" disabled={saving} className="bg-[#e63946] hover:bg-[#d62839]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      </div>
      ) : null}
    </div>
  )
}
