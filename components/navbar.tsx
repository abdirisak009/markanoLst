"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Menu, X, PlayCircle, MessageCircle, ChevronDown, Sparkles, Crown, GraduationCap, LogIn, LogOut, User, Settings, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth-modal"

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.28-.073-1.689-.073-4.948 0-3.259.014-3.667.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C8.333 3.986 8.741 4 12 4c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
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
  { href: "/videos", label: "Videos", icon: PlayCircle },
  { href: "/forum", label: "Forum", icon: MessageCircle },
  { href: "/self-learning", label: "Self Learning", icon: GraduationCap },
  { href: "/profile", label: "Students", icon: Users, isGold: true },
]

const socialLinks = [
  { href: "https://facebook.com/markano", icon: FacebookIcon, label: "Facebook", color: "#1877f2" },
  { href: "https://instagram.com/markano", icon: InstagramIcon, label: "Instagram", color: "#e4405f" },
  { href: "https://youtube.com/markano", icon: YoutubeIcon, label: "YouTube", color: "#ff0000" },
  { href: "https://tiktok.com/@markano", icon: TiktokIcon, label: "TikTok", color: "#000000" },
  { href: "https://t.me/markano", icon: TelegramIcon, label: "Telegram", color: "#0088cc" },
]

export function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [studentData, setStudentData] = useState<any>(null)
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const storedStudent = localStorage.getItem("gold_student")
      if (storedStudent) {
        try {
          const parsed = JSON.parse(storedStudent)
          setStudentData(parsed)
          setIsLoggedIn(true)
        } catch {
          setIsLoggedIn(false)
          setStudentData(null)
        }
      } else {
        setIsLoggedIn(false)
        setStudentData(null)
      }
    }
    
    checkAuth()
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener("storage", checkAuth)
    
    // Also check on mount and periodically
    const interval = setInterval(checkAuth, 1000)
    
    return () => {
      window.removeEventListener("storage", checkAuth)
      clearInterval(interval)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("gold_student")
    document.cookie = "goldStudentId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "gold_student_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setIsLoggedIn(false)
    router.push("/student-login")
    router.refresh()
  }

  return (
    <>
      {/* Top Bar with Social Media */}
      <div className="bg-gradient-to-r from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] text-white/70 text-xs py-2.5 hidden lg:block border-b border-white/5">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#e63946]/10 rounded-full border border-[#e63946]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e63946] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e63946]"></span>
              </span>
              <span className="font-medium text-[#e63946]">New</span>
            </div>
            <span className="text-white/50">|</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              New bootcamp is opening - <span className="text-[#e63946] font-semibold">Register Now</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/50">Contact us:</span>
            <div className="flex items-center gap-1">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = social.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
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
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0a0f]/95 backdrop-blur-xl shadow-2xl shadow-black/20 py-3" : "bg-gradient-to-r from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] py-4"}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/images/markano-logo-new.png"
                  alt="Markano - Empowering Minds"
                  width={220}
                  height={60}
                  className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.hasDropdown ? (
                    <>
                      <button
                        className={`group relative flex items-center gap-2.5 px-4 py-3 text-white/70 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/5`}
                      >
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover:from-[#e63946]/30 group-hover:to-[#e63946]/10 transition-all duration-300">
                          <item.icon className="w-4 h-4 text-[#e63946]" />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === item.label ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <div
                        className={`absolute top-full left-0 mt-2 w-64 bg-[#0a0a0f]/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden transition-all duration-300 ${activeDropdown === item.label ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-3"}`}
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
                    <button
                      onClick={() => {
                        if (item.isGold) {
                          setAuthModalOpen(true)
                        } else {
                          router.push(item.href)
                        }
                      }}
                      className={`group relative flex items-center gap-2.5 px-4 py-3 text-white/70 hover:text-white rounded-xl hover:bg-white/5 ${
                        item.label === "Forum"
                          ? "bg-gradient-to-r from-[#22d3ee]/10 to-transparent border border-[#22d3ee]/20"
                          : item.isGold
                            ? "bg-gradient-to-r from-[#e63946]/10 to-transparent border border-[#e63946]/20"
                            : ""
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg transition-all duration-300 ${
                          item.label === "Forum"
                            ? "bg-gradient-to-br from-[#22d3ee]/30 to-[#22d3ee]/10 group-hover:from-[#22d3ee]/40 group-hover:to-[#22d3ee]/20"
                            : item.isGold
                              ? "bg-gradient-to-br from-[#e63946]/30 to-[#e63946]/10 group-hover:from-[#e63946]/40 group-hover:to-[#e63946]/20"
                              : "bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 group-hover:from-[#e63946]/30 group-hover:to-[#e63946]/10"
                        }`}
                      >
                        <item.icon
                          className={`w-4 h-4 ${
                            item.label === "Forum"
                              ? "text-[#22d3ee]"
                              : item.isGold
                                ? "text-[#e63946]"
                                : "text-[#e63946]"
                          }`}
                        />
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.label === "Forum" && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#22d3ee] text-[#0a0a0f] rounded-md uppercase">
                          New
                        </span>
                      )}
                      {item.isGold && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#e63946] text-white rounded-md uppercase">
                          Login
                        </span>
                      )}
                    </button>
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
                    className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = social.color)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>

              {/* Profile Icon with Dropdown */}
              {isLoggedIn ? (
                <Popover open={profilePopoverOpen} onOpenChange={setProfilePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button className="relative p-2 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#d62839]/10 hover:from-[#e63946]/30 hover:to-[#d62839]/20 border border-[#e63946]/30 hover:border-[#e63946]/50 transition-all duration-300 hover:scale-105">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e63946] to-[#d62839] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#e63946]/30">
                        {studentData?.full_name
                          ? studentData.full_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "U"}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2 bg-gradient-to-br from-[#0f1419] to-[#0a0a0f] border-[#e63946]/30 shadow-2xl">
                    <div className="space-y-1">
                      <Link
                        href="/profile?view=settings"
                        onClick={() => setProfilePopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#e63946]/10 text-white transition-colors"
                      >
                        <User className="h-4 w-4 text-[#e63946]" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/profile?view=settings"
                        onClick={() => setProfilePopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#e63946]/10 text-white transition-colors"
                      >
                        <Settings className="h-4 w-4 text-[#e63946]" />
                        <span>Settings</span>
                      </Link>
                      <div className="h-px bg-[#e63946]/20 my-1" />
                      <button
                        onClick={() => {
                          handleLogout()
                          setProfilePopoverOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="group relative px-5 py-2.5 bg-gradient-to-r from-[#e63946] to-[#d62839] text-white font-semibold rounded-xl shadow-lg shadow-[#e63946]/25 hover:shadow-[#e63946]/40 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#d62839] to-[#e63946] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 border border-white/10"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/98 backdrop-blur-xl border-t border-white/10 transition-all duration-500 ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
          <div className="container mx-auto px-4 py-6 space-y-2">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.isGold) {
                    setAuthModalOpen(true)
                    setMobileMenuOpen(false)
                  } else {
                    router.push(item.href)
                    setMobileMenuOpen(false)
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3.5 text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-300 w-full text-left ${
                  item.isGold ? "bg-gradient-to-r from-[#e63946]/10 to-transparent border border-[#e63946]/20" : ""
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    item.isGold
                      ? "bg-gradient-to-br from-[#e63946]/30 to-[#e63946]/10"
                      : "bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.isGold ? "text-[#e63946]" : "text-[#e63946]"}`} />
                </div>
                <span className="font-medium">{item.label}</span>
                {item.isGold && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#e63946] text-white rounded-md uppercase ml-auto">
                    Login
                  </span>
                )}
              </button>
            ))}

            {/* Mobile Social Links */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-white/40 text-sm mb-3 px-4">Contact us</p>
              <div className="flex items-center gap-2 px-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                    style={{ color: social.color }}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile Profile/Login */}
            <div className="pt-4">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    href="/profile?view=settings"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-gradient-to-r from-[#e63946] to-[#d62839] text-white font-semibold rounded-xl shadow-lg shadow-[#e63946]/25"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-gradient-to-r from-[#e63946] to-[#d62839] text-white font-semibold rounded-xl shadow-lg shadow-[#e63946]/25"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  )
}

export default Navbar
