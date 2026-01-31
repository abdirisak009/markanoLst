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
import { toast } from "sonner"

const DAY_LABELS: { key: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
]

type DaySchedule = { start: string; end: string }

const emptySchedule = (): Record<string, DaySchedule> =>
  Object.fromEntries(DAY_LABELS.map(({ key }) => [key, { start: "", end: "" }]))

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
  const today = new Date().toISOString().slice(0, 10)
  const defaultEnd = new Date()
  defaultEnd.setMonth(defaultEnd.getMonth() + 3)
  const defaultEndStr = defaultEnd.toISOString().slice(0, 10)

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(defaultEndStr)
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(emptySchedule())
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (open && course && userId) {
      setFetching(true)
      fetch(`/api/learning/schedule?userId=${userId}&courseId=${course.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.start_date) setStartDate(String(data.start_date).slice(0, 10))
          if (data?.end_date) setEndDate(String(data.end_date).slice(0, 10))
          if (data?.schedule && typeof data.schedule === "object") {
            const next = emptySchedule()
            DAY_LABELS.forEach(({ key }) => {
              const v = data.schedule[key]
              if (v && typeof v === "object" && "start" in v && "end" in v) {
                next[key] = { start: String(v.start || ""), end: String(v.end || "") }
              } else if (typeof v === "string" && v.trim()) {
                next[key] = { start: v.trim(), end: v.trim() }
              }
            })
            setSchedule(next)
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false))
    }
  }, [open, course?.id, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course || !userId) return

    if (!startDate.trim() || !endDate.trim()) {
      toast.error("Please select start date and end date")
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date must be after start date")
      return
    }

    const normalized: Record<string, { start: string; end: string } | null> = {}
    DAY_LABELS.forEach(({ key }) => {
      const s = schedule[key]?.start?.trim()
      const e = schedule[key]?.end?.trim()
      if (s && e) normalized[key] = { start: s, end: e }
      else normalized[key] = null
    })

    const hasAtLeastOneDay = Object.values(normalized).some((v) => v != null)
    if (!hasAtLeastOneDay) {
      toast.error("Select at least one day with start and end time")
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
          start_date: startDate,
          end_date: endDate,
          schedule: normalized,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to save schedule")
      }
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      console.error(err)
      toast.error("Something went wrong. Please try again.")
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
            Set your schedule
          </DialogTitle>
          <DialogDescription>
            {course
              ? `To start "${course.title}": 1) Choose course period (from date – to date), 2) Select days of the week, 3) Set start and end time for each day.`
              : "Set your schedule: course period (from date – to date), days of the week, and start/end time per day."}
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#2596be]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Course period: from date – to date */}
            <div className="space-y-3">
              <Label className="text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Course period (from date – to date) *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="start_date" className="text-sm text-gray-600">Start date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl border-[#2596be]/20 focus:ring-2 focus:ring-[#2596be]/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="end_date" className="text-sm text-gray-600">End date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl border-[#2596be]/20 focus:ring-2 focus:ring-[#2596be]/20"
                  />
                </div>
              </div>
            </div>

            {/* 2 & 3. Days of the week + from hour – to hour per day */}
            <div className="space-y-3">
              <Label className="text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Days of the week and time per day (from hour – to hour)
              </Label>
              <p className="text-sm text-gray-500">
                Select the days you study and set start and end time (e.g. 09:00 – 11:00).
              </p>
              <div className="grid gap-3">
                {DAY_LABELS.map(({ key, label }) => (
                  <div key={key} className="flex flex-wrap items-center gap-2 sm:gap-3 p-2 rounded-xl bg-gray-50/80 border border-gray-200/80">
                    <div className="w-20 flex-shrink-0 text-sm font-medium text-gray-700">{label}</div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Input
                        type="time"
                        value={schedule[key]?.start || ""}
                        onChange={(e) =>
                          setSchedule((s) => ({
                            ...s,
                            [key]: { ...s[key], start: e.target.value, end: s[key]?.end || "" },
                          }))
                        }
                        className="rounded-xl border-[#2596be]/20 flex-1 max-w-[120px]"
                        placeholder="Start"
                      />
                      <span className="text-gray-400 text-sm">–</span>
                      <Input
                        type="time"
                        value={schedule[key]?.end || ""}
                        onChange={(e) =>
                          setSchedule((s) => ({
                            ...s,
                            [key]: { ...s[key], start: s[key]?.start || "", end: e.target.value },
                          }))
                        }
                        className="rounded-xl border-[#2596be]/20 flex-1 max-w-[120px]"
                        placeholder="End"
                      />
                    </div>
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-[#2596be] hover:bg-[#1e7a9e] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save schedule and start learning"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
