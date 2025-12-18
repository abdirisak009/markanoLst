import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-[#e63946]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-12 h-12 text-[#e63946]" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/ecommerce-wizard"
            className="px-6 py-3 bg-[#e63946] text-white font-medium rounded-xl hover:bg-[#c1121f] transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Wizard
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-[#1e293b] text-white font-medium rounded-xl hover:bg-[#2d3a4f] transition-colors flex items-center gap-2 border border-[#e63946]/20"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
