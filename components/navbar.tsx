"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Menu,
  X,
  GraduationCap,
  PlayCircle,
  UserPlus,
  Settings,
  ChevronDown,
  MessageCircle,
  Sparkles,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225 1.664 4.771 4.919 4.919 1.266.057 1.644.069 4.849.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

const navItems = [
  {
    href: "/learning",
    label: "Learning",
    icon: GraduationCap,
    hasDropdown: true,
    dropdownItems: [
      { href: "/bootcamp", label: "Web Dev Bootcamp" },
      { href: "/hybrid-learning", label: "Hybrid Learning" },
    ],
  },
  { href: "/videos", label: "Videos", icon: PlayCircle },
  { href: "/forum", label: "Forum", icon: MessageCircle },
  { href: "/register", label: "Register", icon: UserPlus },
  { href: "/admin", label: "Admin", icon: Settings },
]

const socialLinks = [
  { href: "https://facebook.com/markano", icon: FacebookIcon, label: "Facebook", color: "#1877f2" },
  { href: "https://instagram.com/markano", icon: InstagramIcon, label: "Instagram", color: "#e4405f" },
  { href: "https://youtube.com/markano", icon: YoutubeIcon, label: "YouTube", color: "#ff0000" },
  { href: "https://tiktok.com/@markano", icon: TiktokIcon, label: "TikTok", color: "#000000" },
  { href: "https://t.me/markano", icon: TelegramIcon, label: "Telegram", color: "#0088cc" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Top Bar with Social Media */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white/70 text-xs py-2.5 hidden lg:block border-b border-white/5">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#e63946]/10 rounded-full border border-[#e63946]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e63946] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e63946]"></span>
              </span>
              <span className="text-[#e63946] font-medium">LIVE</span>
            </div>
            <span className="text-white/60">Somalia's #1 Tech Education Platform</span>
            <div className="flex items-center gap-1 text-[#22d3ee]">
              <Sparkles className="w-3 h-3" />
              <span className="text-[10px] font-medium">Empowering Minds</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Follow us:</span>
            <div className="flex items-center gap-1">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
                  title={social.label}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0f172a]/98 backdrop-blur-2xl shadow-2xl shadow-black/30 border-b border-white/5"
            : "bg-[#0f172a]/90 backdrop-blur-xl"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#e63946]/20 via-transparent to-[#22d3ee]/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-full" />

              {/* Logo container with border animation */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#e63946] via-[#ff6b6b] to-[#e63946] rounded-xl opacity-0 group-hover:opacity-50 blur transition-all duration-500" />
                <div className="relative bg-[#0f172a] rounded-lg p-1">
                  <Image
                    src="/images/markano-logo.png"
                    alt="Markano - Empowering Minds"
                    width={180}
                    height={50}
                    className="h-12 w-auto relative z-10 transition-all duration-500 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item, index) => (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.hasDropdown ? (
                    <>
                      <button className="group relative flex items-center gap-2.5 px-4 py-3 text-white/70 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover:from-[#e63946]/30 group-hover:to-[#e63946]/10 transition-all duration-300">
                          <item.icon className="w-4 h-4 text-[#e63946]" />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ${activeDropdown === item.label ? "rotate-180 text-[#e63946]" : ""}`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <div
                        className={`absolute top-full left-0 mt-2 w-64 bg-[#1e293b]/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden transition-all duration-300 ${activeDropdown === item.label ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-3"}`}
                      >
                        <div className="p-2">
                          {item.dropdownItems?.map((dropItem, dropIndex) => (
                            <Link
                              key={dropIndex}
                              href={dropItem.href}
                              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-xl hover:bg-gradient-to-r hover:from-[#e63946]/10 hover:to-transparent transition-all duration-300 group"
                            >
                              <div className="w-2 h-2 rounded-full bg-[#e63946]/50 group-hover:bg-[#e63946] group-hover:shadow-lg group-hover:shadow-[#e63946]/50 transition-all duration-300" />
                              <span className="font-medium">{dropItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-2.5 px-4 py-3 text-white/70 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/5 ${item.label === "Forum" ? "bg-gradient-to-r from-[#22d3ee]/10 to-transparent border border-[#22d3ee]/20" : ""}`}
                    >
                      <div
                        className={`p-1.5 rounded-lg transition-all duration-300 ${
                          item.label === "Forum"
                            ? "bg-gradient-to-br from-[#22d3ee]/30 to-[#22d3ee]/10 group-hover:from-[#22d3ee]/40 group-hover:to-[#22d3ee]/20"
                            : "bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover:from-[#e63946]/30 group-hover:to-[#e63946]/10"
                        }`}
                      >
                        <item.icon
                          className={`w-4 h-4 ${item.label === "Forum" ? "text-[#22d3ee]" : "text-[#e63946]"}`}
                        />
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.label === "Forum" && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#22d3ee] text-[#0f172a] rounded-md uppercase">
                          New
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section: Search & Social & CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 border border-white/10 hover:border-[#e63946]/30 hover:shadow-lg hover:shadow-[#e63946]/10"
                >
                  <Search className="h-5 w-5" />
                </button>

                {/* Search Dropdown */}
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-3 w-96 p-5 bg-[#1e293b]/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <Input
                        type="search"
                        placeholder="Search courses, tutorials, topics..."
                        className="pl-11 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#e63946]/50 rounded-xl text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 text-xs font-medium bg-[#e63946]/10 text-[#e63946] rounded-lg border border-[#e63946]/20 hover:bg-[#e63946]/20 cursor-pointer transition-colors">
                        HTML & CSS
                      </span>
                      <span className="px-3 py-1.5 text-xs font-medium bg-[#22d3ee]/10 text-[#22d3ee] rounded-lg border border-[#22d3ee]/20 hover:bg-[#22d3ee]/20 cursor-pointer transition-colors">
                        JavaScript
                      </span>
                      <span className="px-3 py-1.5 text-xs font-medium bg-[#4ade80]/10 text-[#4ade80] rounded-lg border border-[#4ade80]/20 hover:bg-[#4ade80]/20 cursor-pointer transition-colors">
                        Python
                      </span>
                      <span className="px-3 py-1.5 text-xs font-medium bg-[#a855f7]/10 text-[#a855f7] rounded-lg border border-[#a855f7]/20 hover:bg-[#a855f7]/20 cursor-pointer transition-colors">
                        React
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Icons (Compact) */}
              <div className="flex items-center gap-0.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                {socialLinks.slice(0, 3).map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
                    title={social.label}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/register" className="relative group ml-1 px-6 py-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#e63946] via-[#ff6b6b] to-[#e63946] rounded-xl transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#e63946] via-[#ff6b6b] to-[#e63946] rounded-xl blur-xl opacity-50 group-hover:opacity-80 transition-all duration-500" />
                <span className="relative z-10 flex items-center gap-2 text-white font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden fixed inset-0 top-20 bg-gradient-to-b from-[#0f172a] to-[#1e293b] z-40 transition-all duration-500 ${
            mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="container mx-auto px-4 py-8 h-full overflow-y-auto">
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-12 py-6 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-2xl"
              />
            </div>

            {/* Nav Items */}
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <div key={index}>
                  {item.hasDropdown ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-4 px-4 py-4 rounded-2xl text-white/80 bg-white/5">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5">
                          <item.icon className="w-5 h-5 text-[#e63946]" />
                        </div>
                        <span className="font-semibold text-lg">{item.label}</span>
                      </div>
                      <div className="ml-6 space-y-1 border-l-2 border-[#e63946]/20 pl-4">
                        {item.dropdownItems?.map((dropItem, dropIndex) => (
                          <Link
                            key={dropIndex}
                            href={dropItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#e63946]" />
                            <span className="font-medium">{dropItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-white/80 hover:text-white transition-all duration-300 ${
                        item.label === "Forum"
                          ? "bg-gradient-to-r from-[#22d3ee]/10 to-transparent border border-[#22d3ee]/20"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl ${
                          item.label === "Forum"
                            ? "bg-gradient-to-br from-[#22d3ee]/20 to-[#22d3ee]/5"
                            : "bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5"
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${item.label === "Forum" ? "text-[#22d3ee]" : "text-[#e63946]"}`}
                        />
                      </div>
                      <span className="font-semibold text-lg">{item.label}</span>
                      {item.label === "Forum" && (
                        <span className="ml-auto px-2 py-1 text-xs font-bold bg-[#22d3ee] text-[#0f172a] rounded-lg">
                          NEW
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-white/40 text-sm mb-4 uppercase tracking-wider">Follow us on social media</p>
              <div className="flex items-center gap-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5"
                    title={social.label}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="relative block w-full py-5 overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#e63946] via-[#ff6b6b] to-[#e63946]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#e63946] via-[#ff6b6b] to-[#e63946] blur-xl opacity-50" />
                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-bold text-lg">
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
