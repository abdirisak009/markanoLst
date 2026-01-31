"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getImageSrc } from "@/lib/utils"

const MAX_MESSAGE = 500

type CourseOption = { id: number; title: string }

export function ReviewForm() {
  const [reviewer_name, setReviewerName] = useState("")
  const [company, setCompany] = useState("")
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [course_id, setCourseId] = useState<number | "">("")
  const [course_title, setCourseTitle] = useState("")
  const [rating, setRating] = useState(5)
  const [reviewer_type, setReviewerType] = useState<"student" | "instructor">("student")
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch("/api/learning/courses")
      .then((res) => res.ok ? res.json() : [])
      .then((data: CourseOption[] | { courses?: CourseOption[] }) => {
        const list = Array.isArray(data) ? data : (data as { courses?: CourseOption[] }).courses ?? []
        setCourses(list as CourseOption[])
      })
      .catch(() => setCourses([]))
  }, [])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, etc.)")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }
    setAvatarFile(file)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("folder", "reviews")
      formData.set("type", "image")
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        setAvatarUrl(data.url)
        toast.success("Photo uploaded")
      } else {
        toast.error(data.error || "Upload failed")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewer_name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!message.trim()) {
      toast.error("Message is required")
      return
    }
    if (message.length > MAX_MESSAGE) {
      toast.error(`Message must be at most ${MAX_MESSAGE} characters`)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_name: reviewer_name.trim(),
          company: company.trim() || undefined,
          avatar_url: avatar_url || undefined,
          message: message.trim(),
          course_id: course_id === "" ? undefined : course_id,
          course_title: course_title || undefined,
          rating,
          reviewer_type,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to submit review")
        return
      }
      toast.success("Review submitted! It will appear after admin approval.")
      setReviewerName("")
      setCompany("")
      setAvatarUrl(null)
      setAvatarFile(null)
      setMessage("")
      setCourseId("")
      setCourseTitle("")
      setRating(5)
    } catch {
      toast.error("Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  const displayUrl = avatar_url ? getImageSrc(avatar_url) || avatar_url : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your name *</Label>
          <Input
            id="name"
            value={reviewer_name}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="e.g. Amina Hassan"
            required
            maxLength={255}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company you work for</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Tech Company"
            maxLength={255}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Profile photo (optional)</Label>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#2596be]/30 bg-white text-[#2596be] font-medium hover:bg-[#2596be]/10 transition-colors">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
          {displayUrl && (
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#2596be]/20 bg-gray-100">
              <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          )}
          {avatarFile && !displayUrl && uploading && (
            <Loader2 className="w-8 h-8 animate-spin text-[#2596be]" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your review * (max {MAX_MESSAGE} characters)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your experience with Markano..."
          required
          maxLength={MAX_MESSAGE}
          rows={4}
          className="resize-none"
        />
        <p className="text-sm text-[#64748b] text-right">{message.length} / {MAX_MESSAGE}</p>
      </div>

      <div className="space-y-2">
        <Label>Course you completed (optional)</Label>
        <select
          value={course_id === "" ? "" : course_id}
          onChange={(e) => {
            const v = e.target.value
            setCourseId(v === "" ? "" : parseInt(v, 10))
            const c = courses.find((x) => x.id === parseInt(v, 10))
            setCourseTitle(c ? c.title : "")
          }}
          className="w-full h-10 rounded-md border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 outline-none"
        >
          <option value="">— Select course —</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Who is leaving this review?</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reviewer_type"
              checked={reviewer_type === "student"}
              onChange={() => setReviewerType("student")}
              className="text-[#2596be]"
            />
            <span>Student</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reviewer_type"
              checked={reviewer_type === "instructor"}
              onChange={() => setReviewerType("instructor")}
              className="text-[#2596be]"
            />
            <span>Instructor</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Star rating *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#2596be]/40"
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${i <= rating ? "text-[#2596be] fill-[#2596be]" : "text-gray-300"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#2596be] hover:bg-[#1e7a9e] text-white font-semibold py-6 rounded-xl"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit review"
        )}
      </Button>
    </form>
  )
}
