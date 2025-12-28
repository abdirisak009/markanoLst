export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#e63946] border-t-transparent animate-spin" />
        <p className="text-white/70">Loading...</p>
      </div>
    </div>
  )
}
