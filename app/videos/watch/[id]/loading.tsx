import { Play } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Play className="h-16 w-16 mx-auto mb-4 text-[#1e3a5f] animate-pulse" />
        <p className="text-gray-600">Loading video...</p>
      </div>
    </div>
  )
}
