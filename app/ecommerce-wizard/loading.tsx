export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#e63946] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading E-commerce Wizard...</p>
      </div>
    </div>
  )
}
