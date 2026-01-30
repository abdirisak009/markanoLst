"use client"

/**
 * Minimal loading UI during instructor route transitions.
 * Single thin bar so the app feels fast without a full-page spinner.
 */
export default function InstructorLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-4" aria-hidden>
      <div className="h-0.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-[#2596be] rounded-full animate-pulse" />
      </div>
    </div>
  )
}
