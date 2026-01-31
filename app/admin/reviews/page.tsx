"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Star, CheckCircle, XCircle, Trash2, Loader2, RefreshCw, MessageCircle } from "lucide-react"
import { getImageSrc } from "@/lib/utils"

type Review = {
  id: number
  reviewer_name: string
  company: string | null
  avatar_url: string | null
  message: string
  course_id: number | null
  course_title: string | null
  rating: number
  reviewer_type: string
  status: string
  created_at: string
  updated_at?: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/reviews")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load reviews")
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success(status === "approved" ? "Review approved" : "Review rejected")
      fetchReviews()
    } catch {
      toast.error("Failed to update review")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review permanently?")) return
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Review deleted")
      fetchReviews()
    } catch {
      toast.error("Failed to delete review")
    }
  }

  const pending = reviews.filter((r) => r.status === "pending")
  const approved = reviews.filter((r) => r.status === "approved")
  const rejected = reviews.filter((r) => r.status === "rejected")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-[#2596be]" />
            Reviews
          </h1>
          <p className="text-[#64748b] mt-1">Approve, reject, or delete student and instructor reviews.</p>
        </div>
        <Button variant="outline" onClick={fetchReviews} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-[#2596be]" />
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <Card className="border-[#2596be]/20">
              <CardHeader>
                <CardTitle className="text-lg">Pending ({pending.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pending.map((r) => (
                  <ReviewRow key={r.id} review={r} onApprove={() => handleStatus(r.id, "approved")} onReject={() => handleStatus(r.id, "rejected")} onDelete={() => handleDelete(r.id)} />
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-[#64748b] py-8 text-center">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <ReviewRow
                      key={r.id}
                      review={r}
                      onApprove={r.status !== "approved" ? () => handleStatus(r.id, "approved") : undefined}
                      onReject={r.status !== "rejected" ? () => handleStatus(r.id, "rejected") : undefined}
                      onDelete={() => handleDelete(r.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function ReviewRow({
  review,
  onApprove,
  onReject,
  onDelete,
}: {
  review: Review
  onApprove?: () => void
  onReject?: () => void
  onDelete: () => void
}) {
  const avatarUrl = review.avatar_url ? (getImageSrc(review.avatar_url) || review.avatar_url) : null
  const initial = (review.reviewer_name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]/50">
      <div className="flex items-center gap-3 shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-[#e2e8f0]" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#2596be]/15 flex items-center justify-center text-[#2596be] font-bold text-sm">{initial}</div>
        )}
        <div>
          <p className="font-semibold text-[#0f172a]">{review.reviewer_name}</p>
          <p className="text-sm text-[#64748b]">{review.company || "—"}</p>
          <div className="flex gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-[#2596be] fill-[#2596be]" : "text-gray-200"}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#475569] text-sm leading-relaxed">&ldquo;{review.message}&rdquo;</p>
        {review.course_title && <p className="text-xs text-[#64748b] mt-1">Course: {review.course_title}</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant={review.status === "approved" ? "default" : review.status === "rejected" ? "destructive" : "secondary"} className="text-xs">
            {review.status}
          </Badge>
          <Badge variant="outline" className="text-xs">{review.reviewer_type}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onApprove && (
          <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={onApprove}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
        )}
        {onReject && (
          <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={onReject}>
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
