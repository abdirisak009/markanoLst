import { Award } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Award className="h-12 w-12 text-amber-500 mx-auto animate-pulse" />
        <p className="mt-4 text-slate-400">Loading Markano Gold...</p>
      </div>
    </div>
  )
}
