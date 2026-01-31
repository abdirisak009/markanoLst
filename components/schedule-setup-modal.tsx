"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Loader2 } from "lucide-react"

const DAY_LABELS: { key: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"; label: string }[] = [
  { key: "mon", label: "Isniin" },
  { key: "tue", label: "Talaado" },
  { key: "wed", label: "Arbaco" },
  { key: "thu", label: "Khamiis" },
  { key: "fri", label: "Jimco" },
  { key: "sat", label: "Sabti" },
  { key: "sun", label: "Axad" },
]

interface ScheduleSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: { id: number; title: string } | null
  userId: number | null
  onSuccess: () => void
}

export function ScheduleSetupModal({
  open,
  onOpenChange,
  course,
  userId,
  onSuccess,
}: ScheduleSetupModalProps) {
  const [hoursPerWeek, setHoursPerWeek] = useState(5)
  const [schedule, setSchedule] = useState<Record<string, string>>({
    mon: "",
    tue: "",
    wed: "",
    thu: "",
    fri: "",
    sat: "",
    sun: "",
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (open && course && userId) {
      setFetching(true)
      fetch(`/api/learning/schedule?userId=${userId}&courseId=${course.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.hours_per_week) {
            setHoursPerWeek(data.hours_per_week)
            if (data.schedule && typeof data.schedule === "object") {
              setSchedule((prev) => ({ ...prev, ...data.schedule }))
            }
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false))
    }
  }, [open, course?.id, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course || !userId) return

    const normalized: Record<string, string | null> = {}
    DAY_LABELS.forEach(({ key }) => {
      const v = schedule[key]?.trim()
      normalized[key] = v || null
    })

    const hasAtLeastOneDay = Object.values(normalized).some((v) => v != null && v !== "")
    if (!hasAtLeastOneDay) {
      toast.error("Dooro ugu yaraan 1 maalin oo wakhti ku dhig")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/learning/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          courseId: course.id,
          hours_per_week: hoursPerWeek,
          schedule: normalized,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to save schedule")
      }
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#2596be]">
            <Calendar className="h-5 w-5" />
            Dhig jadwalka barashada
          </DialogTitle>
          <DialogDescription>
            {course
              ? `Koorsada "${course.title}": inta saac isbuuc aad ku dahmeen karto, maalmaha iyo sascada maalin walba.`
              : "Inta saac isbuuc, maalmaha iyo wakhtiga maalin walba."}
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#2596be]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="hours_per_week" className="text-gray-700">
                Inta saac isbuuc aad ku dahmeen karto koorsada *
              </Label>
              <Input
                id="hours_per_week"
                type="number"
                min={1}
                max={168}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10) || 1)}
                className="rounded-xl border-[#2596be]/20 focus:ring-2 focus:ring-[#2596be]/20"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Maalmaha isbuuca iyo sascada maalin walba
              </Label>
              <p className="text-sm text-gray-500">
                Dooro maalmaha aad baranayso oo qor wakhtiga (tusaale: 09:00, 14:30).
              </p>
              <div className="grid gap-3">
                {DAY_LABELS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-24 flex-shrink-0 text-sm font-medium text-gray-700">{label}</div>
                    <Input
                      type="time"
                      value={schedule[key] || ""}
                      onChange={(e) => setSchedule((s) => ({ ...s, [key]: e.target.value }))}
                      className="rounded-xl border-[#2596be]/20 flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-[#2596be]/30"
                onClick={() => onOpenChange(false)}
              >
                Jooji
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-[#2596be] hover:bg-[#1e7a9e] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    La keydiyo...
                  </>
                ) : (
                  "Dhig jadwalka oo bilaab barashada"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
