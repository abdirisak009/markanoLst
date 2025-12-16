"use client"

import Link from "next/link"
import { Search, Menu } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-[#1e3a5f] text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/white-logo.png" alt="Markano" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-[#ef4444] transition-colors">
              Home
            </Link>
            <Link href="/bootcamp" className="hover:text-[#ef4444] transition-colors">
              Bootcamp
            </Link>
            <Link href="/hybrid-learning" className="hover:text-[#ef4444] transition-colors">
              Hybrid Learning
            </Link>
            <Link href="/videos" className="hover:text-[#ef4444] transition-colors">
              Videos Posts
            </Link>
            <Link href="/register" className="hover:text-[#ef4444] transition-colors">
              Register
            </Link>
            <Link href="/admin" className="hover:text-[#ef4444] transition-colors">
              Admin
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link href="/" className="block hover:text-[#ef4444] transition-colors">
              Home
            </Link>
            <Link href="/bootcamp" className="block hover:text-[#ef4444] transition-colors">
              Bootcamp
            </Link>
            <Link href="/hybrid-learning" className="block hover:text-[#ef4444] transition-colors">
              Hybrid Learning
            </Link>
            <Link href="/videos" className="block hover:text-[#ef4444] transition-colors">
              Videos Posts
            </Link>
            <Link href="/register" className="block hover:text-[#ef4444] transition-colors">
              Register
            </Link>
            <Link href="/admin" className="block hover:text-[#ef4444] transition-colors">
              Admin
            </Link>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
