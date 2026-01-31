"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Menu, X, MessageCircle, ChevronDown, Sparkles, Crown, LogIn, LogOut, User, Settings, LayoutGrid, BookOpen, ShoppingBag, PlayCircle, Store } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth-modal"
import { SearchBar } from "@/components/search-bar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

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

const SEARCH_CATEGORIES = [
  { id: "courses", label: "Courses", href: "/self-learning" },
  { id: "free-courses", label: "Free Courses", href: "/videos" },
  { id: "ai-tools", label: "AI Tools", href: "/self-learning?category=ai-tools" },
  { id: "store", label: "Store", href: "/store" },
] as const

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
    const mq = window.matchMedia("(max-width: 1023px)")
    const updateBodyClass = () => {
      if (mq.matches) document.body.classList.add("with-mobile-nav")
      else document.body.classList.remove("with-mobile-nav")
    }
    updateBodyClass()
    mq.addEventListener("change", updateBodyClass)
    return () => {
      mq.removeEventListener("change", updateBodyClass)
      document.body.classList.remove("with-mobile-nav")
    }
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
      {/* Top Bar - midka dark ah #3c62b3 */}
      <div className="bg-[#3c62b3] text-white/95 text-xs py-2.5 hidden lg:flex border-b border-[#2d4d8a]/50 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 lg:gap-4 min-w-0 shrink-0">
            <span className="text-white truncate">contact@markano.com</span>
            <span className="opacity-70 flex-shrink-0">|</span>
            <span className="text-white whitespace-nowrap">+252 61 123 4567</span>
          </div>
          <div className="flex items-center gap-2">
            {socialLinks.slice(0, 4).map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded text-white hover:bg-white/20 transition-colors"
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navigation - mobile app feel: compact header + visible search on mobile */}
      <nav
        className={`relative sticky top-0 z-50 transition-all duration-300 lg:overflow-x-hidden ${mobileMenuOpen ? "overflow-visible" : "overflow-x-hidden"} lg:border-b-0 ${scrolled ? "bg-white/98 backdrop-blur-xl shadow-md shadow-[#2596be]/6 py-2 lg:py-3 border-b border-[#2596be]/10" : "bg-white py-2 lg:py-4 border-b border-[#e5e7eb]/80 lg:border-b-0"}`}
      >
        {/* Same tech pattern as hero section - grid 48px/96px so one continuous background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.09]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(37,150,190,0.7) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37,150,190,0.7) 1px, transparent 1px),
              linear-gradient(rgba(60,98,179,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(60,98,179,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px, 48px 48px, 96px 96px, 96px 96px",
          }}
        />
        <div className="container mx-auto px-3 sm:px-4 max-w-full relative z-10">
          <div className="flex items-center justify-between gap-2">
            {/* Logo + Pages dropdown (Courses / AI Tools) + Community (left) */}
            <div className="flex items-center gap-2 lg:gap-3">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 min-w-0 py-1" aria-label="Markano Home">
                <div className="relative flex items-center justify-center h-12 w-36 sm:h-14 sm:w-44 lg:h-16 lg:w-52 xl:h-20 xl:w-64 min-h-[48px]">
                  <Image
                    src="/White.png"
                    alt="Markano - Empowering Minds"
                    width={320}
                    height={96}
                    priority
                    className="w-full h-full object-contain object-left transition-all duration-300 group-hover:opacity-95 group-hover:scale-[1.02]"
                    style={{ minHeight: 48, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4)) drop-shadow(0 2px 6px rgba(37,150,190,0.35))" }}
                  />
                </div>
              </Link>
              {/* Iconic dropdown: Courses & AI Tools (small, left of Community) */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl bg-[#2596be]/10 border border-[#2596be]/20 text-[#2596be] hover:bg-[#2596be]/20 hover:border-[#2596be]/30 hover:shadow-md hover:shadow-[#2596be]/15 transition-all duration-300"
                    aria-label="Courses, Free Courses, AI Tools & Store"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 bg-white border-[#e8f4f3] shadow-xl shadow-[#2596be]/15 rounded-xl" align="start">
                  <Link
                    href="/self-learning"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2596be]/10 text-[#1a1a1a] hover:text-[#2596be] transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-[#2596be]" />
                    <span className="font-medium text-sm">Courses</span>
                  </Link>
                  <Link
                    href="/videos"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2596be]/10 text-[#1a1a1a] hover:text-[#2596be] transition-colors"
                  >
                    <PlayCircle className="h-4 w-4 text-[#2596be]" />
                    <span className="font-medium text-sm">Free Courses</span>
                  </Link>
                  <Link
                    href="/self-learning?category=ai-tools"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2596be]/10 text-[#1a1a1a] hover:text-[#2596be] transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-[#2596be]" />
                    <span className="font-medium text-sm">AI Tools</span>
                  </Link>
                  <Link
                    href="/store"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2596be]/10 text-[#1a1a1a] hover:text-[#2596be] transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-[#2596be]" />
                    <span className="font-medium text-sm">Store</span>
                  </Link>
                </PopoverContent>
              </Popover>
              <button
                onClick={() => router.push("/forum")}
                className="hidden lg:flex group items-center gap-2.5 px-4 py-3 text-[#1a1a1a] hover:text-[#2596be] rounded-xl bg-[#3c62b3]/10 border border-[#3c62b3]/20 hover:bg-[#3c62b3]/15 transition-all duration-300"
              >
                <div className="p-1.5 rounded-lg bg-[#3c62b3]/20 group-hover:bg-[#3c62b3]/30 transition-all">
                  <MessageCircle className="w-4 h-4 text-[#3c62b3]" />
                </div>
                <span className="font-medium text-sm">Community</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#3c62b3] text-white rounded-md uppercase">
                  New
                </span>
              </button>
            </div>

            {/* Center: SearchBar with filters (All, Courses, AI Tools, Community) + suggestions + typo tolerance */}
            <div className="hidden xl:flex flex-1 max-w-2xl mx-4 min-w-0">
              <SearchBar variant="inline" className="w-full" />
            </div>

            {/* Right Section: Search (dropdown on lg when inline hidden) & Social & CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search dropdown (lg only, when inline search hidden) */}
              <div className="relative xl:hidden">
                <button
                  type="button"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2.5 rounded-xl bg-[#f8f8f8] hover:bg-[#f0f0f0] text-[#374151] hover:text-[#2596be] transition-all duration-300 border border-[#e5e7eb] hover:border-[#2596be]/40 hover:shadow-md hover:shadow-[#2596be]/10"
                  aria-label="Open search"
                >
                  <Search className="h-5 w-5" />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-3 w-[min(26rem,92vw)] p-5 bg-white rounded-2xl shadow-xl shadow-[#2596be]/15 border border-[#e8f4f3] animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                    <SearchBar variant="dropdown" onClose={() => setSearchOpen(false)} />
                  </div>
                )}
              </div>

              {/* Social Icons (Compact) */}
              <div className="flex items-center gap-0.5 px-3 py-1.5 bg-[#f8f8f8] rounded-xl border border-[#f5f5f5]">
                {socialLinks.slice(0, 3).map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-[#2596be]/10 transition-all duration-300 text-[#374151] hover:text-[#2596be]"
                  >
                    <social.icon />
                  </a>
                ))}
              </div>

              {/* When logged in: profile icon only (replaces Login); when not: Login + Register */}
              {isLoggedIn ? (
                <Popover open={profilePopoverOpen} onOpenChange={setProfilePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[#3c62b3] hover:bg-[#2d4d8a] border-2 border-[#3c62b3]/80 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md ring-2 ring-white"
                      aria-label="Profile menu"
                    >
                      <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
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
                  <PopoverContent className="w-56 p-2 bg-white border-[#f5f5f5] shadow-xl shadow-[#2596be]/10">
                    <div className="space-y-1">
                      <Link
                        href="/profile?view=settings"
                        onClick={() => setProfilePopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2596be]/5 text-[#2596be] transition-colors"
                      >
                        <User className="h-4 w-4 text-[#2596be]" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/profile?view=settings"
                        onClick={() => setProfilePopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2596be]/5 text-[#2596be] transition-colors"
                      >
                        <Settings className="h-4 w-4 text-[#2596be]" />
                        <span>Settings</span>
                      </Link>
                      <div className="h-px bg-[#f5f5f5] my-1" />
                      <button
                        onClick={() => {
                          handleLogout()
                          setProfilePopoverOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2596be]/5 text-[#2596be] transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="group relative px-5 py-2.5 bg-[#3c62b3] text-white font-semibold rounded-xl shadow-md hover:bg-[#2d4d8a] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Login
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile: Social icons BIDIX calamada (bananka keen – muuqda) */}
            <div className="lg:hidden flex items-center gap-1 flex-shrink-0">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#2596be]/10 text-[#2596be] hover:bg-[#2596be]/15 transition-colors"
                >
                  <social.icon />
                </a>
              ))}
            </div>
            {/* Mobile Menu Button – calamada yar: light blue + glow, grid icon darker blue (sida sawirka) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex-shrink-0 p-2.5 rounded-xl bg-[#2596be]/12 border border-[#2596be]/15 shadow-[0_2px_12px_rgba(37,150,190,0.2)] hover:shadow-[0_4px_16px_rgba(37,150,190,0.25)] hover:bg-[#2596be]/15 transition-all duration-300 active:scale-95 touch-target"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-[#3c62b3]" />
              ) : (
                <LayoutGrid className="h-6 w-6 text-[#3c62b3]" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Mobile-only: real search input (sida laptop – input + dropdown below, no popup) */}
          <div className="lg:hidden mt-3 px-0 w-full">
            <SearchBar variant="dropdown" className="w-full" />
          </div>
        </div>

        {/* Backdrop: marka canvas furan, taabo meel kale oo u xir (sida laptop) */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-[60] bg-black/25"
            aria-hidden
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        {/* Mobile Menu (canvas) – waxa so baxaya marka calamada la taabo, z-index sare si uu u muuqdo */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 z-[70] bg-white border-t border-[#f5f5f5] shadow-xl shadow-[#2596be]/10 transition-all duration-300 max-h-[min(85vh,600px)] overflow-y-auto ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        >
          <div className="container mx-auto px-4 py-5 space-y-4">
            {/* Social icons BIDIX (sida laptop) + Logo midig */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#f5f5f5]">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#2596be]/10 text-[#2596be] hover:bg-[#2596be]/15 transition-colors"
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex-shrink-0 ml-auto" aria-label="Markano Home">
                <div className="relative h-11 w-32 flex items-center justify-center">
                  <Image
                    src="/White.png"
                    alt="Markano"
                    width={128}
                    height={44}
                    className="w-full h-full object-contain object-right"
                    style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4)) drop-shadow(0 2px 6px rgba(37,150,190,0.3))" }}
                  />
                </div>
              </Link>
            </div>
            {/* Mobile Search */}
            <div className="pb-4 border-b border-[#f5f5f5]">
              <SearchBar variant="dropdown" onClose={() => setMobileMenuOpen(false)} />
            </div>

            {/* Waxa home-ka ku jira – canvas same as home */}
            <div className="pb-4 border-b border-[#f5f5f5]">
              <p className="text-[#2596be]/70 text-xs font-semibold uppercase tracking-wider mb-3">Home</p>
              <div className="space-y-2">
                <Link href="/gold" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#2596be]/10 border border-[#2596be]/20 text-[#2596be] font-medium hover:bg-[#2596be]/15 transition-colors w-full text-left">
                  Start learning free
                </Link>
                <Link href="/self-learning" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f8fafb] border border-[#e2e8f0] text-[#1a1a1a] hover:bg-[#2596be]/5 hover:border-[#2596be]/20 transition-colors w-full text-left">
                  <BookOpen className="h-4 w-4 text-[#2596be]" />
                  Courses
                </Link>
                <Link href="/videos" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f8fafb] border border-[#e2e8f0] text-[#1a1a1a] hover:bg-[#2596be]/5 hover:border-[#2596be]/20 transition-colors w-full text-left">
                  <PlayCircle className="h-4 w-4 text-[#2596be]" />
                  Free Courses
                </Link>
                <Link href="/self-learning?category=ai-tools" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f8fafb] border border-[#e2e8f0] text-[#1a1a1a] hover:bg-[#2596be]/5 hover:border-[#2596be]/20 transition-colors w-full text-left">
                  <Sparkles className="h-4 w-4 text-[#2596be]" />
                  AI Tools
                </Link>
              </div>
            </div>

            <button
              onClick={() => {
                router.push("/forum")
                setMobileMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-3.5 text-[#333333] hover:text-[#2596be] rounded-xl hover:bg-[#2596be]/5 transition-all duration-300 w-full text-left bg-[#3c62b3]/10 border border-[#3c62b3]/20"
            >
              <div className="p-2 rounded-lg bg-[#3c62b3]/20">
                <MessageCircle className="w-5 h-5 text-[#3c62b3]" />
              </div>
              <span className="font-medium">Community</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#3c62b3] text-white rounded-md uppercase ml-auto">
                New
              </span>
            </button>

            {/* Contact us */}
            <div className="pt-2 border-t border-[#f5f5f5]">
              <p className="text-[#2596be]/60 text-xs font-semibold uppercase tracking-wider mb-2 px-0">Contact us</p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#f8fafb] border border-[#e2e8f0] hover:bg-[#2596be]/10 hover:border-[#2596be]/20 text-[#2596be]/80 hover:text-[#2596be] transition-colors"
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
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#3c62b3]/10 border border-[#3c62b3]/20">
                    <div className="w-10 h-10 rounded-full bg-[#3c62b3] flex items-center justify-center text-white font-bold text-sm">
                      {studentData?.full_name
                        ? studentData.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                        : "U"}
                    </div>
                    <span className="font-semibold text-[#1a1a1a] truncate">
                      {studentData?.full_name ?? "Profile"}
                    </span>
                  </div>
                  <Link
                    href="/profile?view=settings"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-[#3c62b3] text-white font-semibold rounded-xl shadow-md"
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
                    className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-[#3c62b3]/10 text-[#3c62b3] font-semibold rounded-xl border border-[#3c62b3]/20"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setAuthModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-[#3c62b3] text-white font-semibold rounded-xl shadow-md"
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <MobileBottomNav />
    </>
  )
}

export default Navbar
