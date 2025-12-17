"use client"

import { useEffect, useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { CourseCard } from "@/components/course-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  PlayCircle,
  Code,
  Shield,
  Target,
  Zap,
  Monitor,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  Terminal,
  Lock,
  Cpu,
  Globe,
  Layers,
} from "lucide-react"

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  thumbnail: string | null
  rating: number
  students_count: number
  type: string
  modules_count: number
  lessons_count: number
  created_at: string
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return (
    <span ref={countRef}>
      {count}
      {suffix}
    </span>
  )
}

// Scroll Animation Hook
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// Floating Code Lines Component
function FloatingCodeLines() {
  const codeLines = [
    { code: '<div class="hero">', color: "#e63946", delay: "0s", top: "10%", left: "5%" },
    { code: "function learn() {", color: "#22d3ee", delay: "0.5s", top: "20%", right: "8%" },
    { code: "  return success;", color: "#4ade80", delay: "1s", top: "35%", left: "3%" },
    { code: "@keyframes grow {", color: "#f59e0b", delay: "1.5s", top: "50%", right: "5%" },
    { code: "const future = await", color: "#a78bfa", delay: "2s", top: "65%", left: "7%" },
    { code: "  skills.map(s =>", color: "#fb7185", delay: "2.5s", top: "75%", right: "10%" },
    { code: "});", color: "#38bdf8", delay: "3s", top: "85%", left: "4%" },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {codeLines.map((line, index) => (
        <div
          key={index}
          className="absolute font-mono text-xs sm:text-sm opacity-20 animate-float-slow whitespace-nowrap"
          style={{
            color: line.color,
            animationDelay: line.delay,
            top: line.top,
            left: line.left,
            right: line.right,
          }}
        >
          {line.code}
        </div>
      ))}
    </div>
  )
}

// Matrix Rain Effect
function MatrixRain() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute text-[#e63946] font-mono text-xs animate-matrix-fall"
          style={{
            left: `${i * 5}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          {[...Array(20)].map((_, j) => (
            <div key={j} className="opacity-50">
              {String.fromCharCode(33 + Math.random() * 93)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Scroll animation refs
  const featuresAnim = useScrollAnimation()
  const statsAnim = useScrollAnimation()
  const coursesAnim = useScrollAnimation()
  const ctaAnim = useScrollAnimation()

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch("/api/courses")
        if (response.ok) {
          const data = await response.json()
          setCourses(data)
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const features = [
    {
      icon: Shield,
      title: "Cybersecurity Training",
      description: "Learn to protect and secure digital systems with hands-on labs and real-world scenarios",
      gradient: "from-[#e63946] to-[#ff6b6b]",
      pattern: "🔐",
    },
    {
      icon: Code,
      title: "Hands-On Coding",
      description: "Build real projects from day one with our interactive coding environment",
      gradient: "from-[#22d3ee] to-[#06b6d4]",
      pattern: "</>",
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and milestone achievements",
      gradient: "from-[#4ade80] to-[#22c55e]",
      pattern: "📊",
    },
    {
      icon: Users,
      title: "1-on-1 Mentoring",
      description: "Get personalized guidance from industry experts who care about your success",
      gradient: "from-[#a78bfa] to-[#8b5cf6]",
      pattern: "👨‍🏫",
    },
    {
      icon: Monitor,
      title: "Live Sessions",
      description: "Attend interactive live classes with Q&A sessions and collaborative learning",
      gradient: "from-[#fb7185] to-[#e63946]",
      pattern: "🎥",
    },
    {
      icon: GraduationCap,
      title: "Certified Learning",
      description: "Earn recognized certificates that boost your career opportunities",
      gradient: "from-[#f59e0b] to-[#d97706]",
      pattern: "🏆",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.4; }
        }
        @keyframes matrix-fall {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(230, 57, 70, 0.3); }
          50% { box-shadow: 0 0 40px rgba(230, 57, 70, 0.6); }
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink {
          0%, 50% { border-color: #e63946; }
          51%, 100% { border-color: transparent; }
        }
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-matrix-fall { animation: matrix-fall 4s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-gradient-shift { 
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite; 
        }
        .scroll-fade-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .scroll-fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .stagger-1 { transition-delay: 0.1s; }
        .stagger-2 { transition-delay: 0.2s; }
        .stagger-3 { transition-delay: 0.3s; }
        .stagger-4 { transition-delay: 0.4s; }
        .stagger-5 { transition-delay: 0.5s; }
        .stagger-6 { transition-delay: 0.6s; }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(230, 57, 70, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(230, 57, 70, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Floating Code Lines */}
          <FloatingCodeLines />

          {/* Matrix Rain Effect */}
          <MatrixRain />

          {/* Glowing Orbs */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
            style={{
              background: "radial-gradient(circle, #e63946 0%, transparent 70%)",
              left: `calc(${mousePosition.x * 0.02}px - 300px)`,
              top: `calc(${mousePosition.y * 0.02}px - 300px)`,
              transition: "left 0.3s ease, top 0.3s ease",
            }}
          />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1e3a5f]/50 rounded-full blur-[100px]" />

          {/* Scan Line Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#e63946]/30 to-transparent"
              style={{ animation: "scan-line 4s linear infinite" }}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Logo and Badge */}
            <div className="flex flex-col items-center mb-10">
              <div className="mb-6 relative">
                <div className="absolute inset-0 blur-2xl bg-[#e63946]/20 rounded-full scale-150" />
                <img
                  src="/images/white-logo.png"
                  alt="Markano"
                  className="h-16 md:h-20 relative z-10 drop-shadow-2xl"
                />
              </div>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#e63946]/10 backdrop-blur-sm rounded-full border border-[#e63946]/30">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse" />
                  <span className="text-[#4ade80] text-xs font-medium">LIVE</span>
                </div>
                <span className="text-white/80 text-sm font-medium">Somalia's #1 Tech Education Platform</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="text-center mb-10">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.95] tracking-tight">
                <span className="text-white">Empowering</span>
                <br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] via-[#ff6b6b] to-[#e63946] animate-gradient-shift">
                    Teachers
                  </span>
                  <span className="text-white"> & </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] via-[#06b6d4] to-[#22d3ee] animate-gradient-shift">
                    Students
                  </span>
                </span>
              </h1>

              {/* Typing Effect Subtitle */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <Terminal className="w-5 h-5 text-[#e63946]" />
                <div className="font-mono text-lg md:text-xl text-gray-400">
                  <span className="text-[#4ade80]">const</span> <span className="text-[#22d3ee]">future</span>{" "}
                  <span className="text-white">=</span> <span className="text-[#f59e0b]">await</span>{" "}
                  <span className="text-[#a78bfa]">markano</span>
                  <span className="text-white">.</span>
                  <span className="text-[#fb7185]">learn</span>
                  <span className="text-white">();</span>
                </div>
              </div>

              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                Transform your teaching and learning experience with our cutting-edge platform.
                <span className="text-white font-medium"> Cybersecurity</span>,
                <span className="text-white font-medium"> Web Development</span>,
                <span className="text-white font-medium"> Programming</span> — all with
                <span className="text-[#e63946] font-semibold"> hands-on mentoring</span> and
                <span className="text-[#22d3ee] font-semibold"> progress tracking</span>.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                size="lg"
                className="group relative bg-[#e63946] hover:bg-[#d62839] text-white text-lg px-8 h-14 rounded-full font-bold shadow-xl shadow-[#e63946]/25 overflow-hidden"
                asChild
              >
                <a href="/register">
                  <span className="relative z-10 flex items-center">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e63946] to-[#ff6b6b] opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group bg-transparent border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 text-lg px-8 h-14 rounded-full font-semibold backdrop-blur-sm"
                asChild
              >
                <a href="/videos" className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Tutorials
                </a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                <span>Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                <span>Expert Mentors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                <span>Certificate Included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-[#e63946] rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsAnim.ref}
        className={`py-16 bg-gradient-to-b from-[#0f172a] to-[#1e293b] scroll-fade-up ${statsAnim.isVisible ? "visible" : ""}`}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: BookOpen, value: 50, suffix: "+", label: "Expert Courses", color: "#e63946" },
              { icon: Users, value: 2500, suffix: "+", label: "Active Students", color: "#22d3ee" },
              { icon: Award, value: 98, suffix: "%", label: "Success Rate", color: "#4ade80" },
              { icon: TrendingUp, value: 4.8, suffix: "/5", label: "Avg Rating", color: "#f59e0b" },
            ].map((stat, index) => (
              <div
                key={index}
                className={`group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 scroll-fade-up stagger-${index + 1} ${statsAnim.isVisible ? "visible" : ""}`}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, ${stat.color}10, transparent)` }}
                />
                <stat.icon
                  className="h-8 w-8 mb-3 transition-all duration-300 group-hover:scale-110"
                  style={{ color: stat.color }}
                />
                <div className="text-3xl md:text-4xl font-black text-white mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresAnim.ref} className="py-24 bg-[#1e293b] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23e63946' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 scroll-fade-up ${featuresAnim.isVisible ? "visible" : ""}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e63946]/10 rounded-full mb-6 border border-[#e63946]/20">
              <Zap className="h-4 w-4 text-[#e63946]" />
              <span className="text-sm font-bold text-[#e63946] uppercase tracking-wider">Why Choose Markano</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] to-[#22d3ee]">
                Succeed in Tech
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              From beginner to expert, our comprehensive platform provides all the tools and support you need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl bg-[#0f172a]/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 scroll-fade-up stagger-${index + 1} ${featuresAnim.isVisible ? "visible" : ""}`}
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                {/* Pattern Badge */}
                <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
                  {feature.pattern}
                </div>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#e63946] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                {/* Learn More Link */}
                <div className="mt-6 flex items-center text-sm font-semibold text-[#e63946] opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#e63946] to-[#22d3ee] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <Input
                  type="search"
                  placeholder="What do you want to learn today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-16 h-16 text-lg bg-[#0f172a] text-white placeholder:text-gray-500 border-white/10 rounded-2xl focus-visible:ring-[#e63946] focus-visible:border-[#e63946]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section ref={coursesAnim.ref} className="py-24 bg-[#0f172a]" id="courses">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className={`text-center mb-16 scroll-fade-up ${coursesAnim.isVisible ? "visible" : ""}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e63946]/10 rounded-full mb-6 border border-[#e63946]/20">
                <BookOpen className="h-4 w-4 text-[#e63946]" />
                <span className="text-sm font-bold text-[#e63946] uppercase tracking-wider">Popular Courses</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                Start Your Learning
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] to-[#ff6b6b]">
                  Journey Today
                </span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Browse our most popular courses and transform your career with practical skills
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#e63946] border-r-transparent"></div>
                <p className="text-gray-400 mt-6 text-lg">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-xl">
                  {searchQuery ? `No courses found matching "${searchQuery}"` : "No courses available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className={`scroll-fade-up stagger-${(index % 6) + 1} ${coursesAnim.isVisible ? "visible" : ""}`}
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaAnim.ref}
        className="relative py-32 overflow-hidden bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b]"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
            <div className="absolute inset-0 bg-[#e63946]/20 rounded-full blur-[150px] animate-pulse" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #e63946 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className={`container mx-auto px-4 relative z-10 scroll-fade-up ${ctaAnim.isVisible ? "visible" : ""}`}>
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-8">
              <img src="/images/white-logo.png" alt="Markano" className="h-12 mx-auto opacity-80" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Ready to Transform
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] to-[#ff6b6b]">
                Your Future?
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of students and teachers already using Markano. Start your journey to becoming a tech
              professional today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="group relative bg-[#e63946] hover:bg-[#d62839] text-white text-lg px-10 h-16 rounded-full font-bold shadow-2xl shadow-[#e63946]/30 animate-pulse-glow"
                asChild
              >
                <a href="/register">
                  Start Learning Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white/20 text-white hover:bg-white/10 text-lg px-10 h-16 rounded-full font-semibold"
                asChild
              >
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white pt-20 pb-10 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <img src="/images/white-logo.png" alt="Markano" className="h-10 mb-6" />
              <p className="text-gray-400 leading-relaxed">
                Empowering teachers and students across Somalia with world-class tech education and hands-on mentoring.
              </p>
              <div className="flex gap-4 mt-6">
                {[Globe, Lock, Cpu, Layers].map((Icon, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#e63946]/20 transition-colors cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-gray-400 hover:text-[#e63946]" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Learn</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    Web Development
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    Cybersecurity
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    Programming
                  </a>
                </li>
                <li>
                  <a href="/bootcamp" className="hover:text-[#e63946] transition-colors">
                    Bootcamp Program
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Platform</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    For Teachers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    For Students
                  </a>
                </li>
                <li>
                  <a href="/videos" className="hover:text-[#e63946] transition-colors">
                    Video Library
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    Progress Tracking
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#e63946] transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-10 text-center">
            <p className="text-gray-500">&copy; 2025 Markano. Empowering Tech Education in Somalia.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
