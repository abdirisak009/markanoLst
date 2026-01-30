"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
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
  Code2,
  Search,
  FileText,
  Sparkles,
  Clock,
  Star,
  Quote,
  Loader2,
  Briefcase,
  Heart,
  Palette,
  PenTool,
  Table,
  BarChart3,
} from "lucide-react"

const BRAND = "#2596be"

// Course type from API
type CourseItem = {
  id: number
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  instructor_name: string | null
  estimated_duration_minutes: number | null
  difficulty_level: string
  price: number | null
  is_featured: boolean
  modules_count?: string | number
  lessons_count?: string | number
}

function formatPrice(price: number | string | null | undefined): { main: string; sub?: string; label: string } {
  const num = typeof price === "string" ? Number(price) : price
  if (num == null || Number.isNaN(num) || num === 0) return { main: "Free", sub: "forever", label: "Free forever" }
  if (num >= 100) return { main: `$${Math.round(num)}`, sub: "one-time", label: `$${Math.round(num)} one-time` }
  const formatted = Number.isInteger(num) ? String(num) : num.toFixed(2)
  return { main: `$${formatted}`, sub: "/course", label: `$${formatted} / course` }
}

const COURSE_CATEGORIES = [
  {
    id: "business",
    title: "Business & Economics",
    description: "Finance, management, entrepreneurship, and economics. Build skills for the modern marketplace.",
    icon: Briefcase,
    href: "/learning/courses",
    gradient: "from-[#2596be] via-[#3c62b3] to-[#2d4d8a]",
    iconBg: "bg-white/20",
    iconRing: "ring-[#2596be]/50",
    glow: "shadow-[#2596be]/40",
    featured: false,
  },
  {
    id: "technology",
    title: "Technology",
    description: "Programming, web development, cybersecurity, and IT. Learn in-demand tech skills.",
    icon: Cpu,
    href: "/learning/courses",
    gradient: "from-[#2596be] via-[#3c62b3] to-[#2d4d8a]",
    iconBg: "bg-white/20",
    iconRing: "ring-[#2596be]",
    glow: "shadow-[#2596be]/30",
    featured: true,
  },
  {
    id: "health",
    title: "Health Science",
    description: "Healthcare, public health, and life sciences. Courses that prepare you for care and research.",
    icon: Heart,
    href: "/learning/courses",
    gradient: "from-[#2596be] via-[#3c62b3] to-[#2d4d8a]",
    iconBg: "bg-white/20",
    iconRing: "ring-[#2596be]/40",
    glow: "shadow-[#2596be]/35",
    featured: false,
  },
]

function CoursesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-28 bg-gradient-to-br from-[#f8faf9] via-[#fcf6f0] to-[#e8f4f3] border-t border-[#2596be]/10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#2596be/5%,transparent_45%),linear-gradient(225deg,#2596be/8%,transparent_50%)]" aria-hidden />
      <div className="absolute top-1/4 right-0 w-[28rem] h-[28rem] bg-[#2596be]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#2596be]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" aria-hidden />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14 md:mb-18">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-4 tracking-tight break-words px-1">
            Choose the best courses
          </h2>
          <p className="text-[#374151] max-w-2xl mx-auto text-lg md:text-xl">
            Affordable price, quality education. Explore by category.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
          {COURSE_CATEGORIES.map((cat, index) => {
            const Icon = cat.icon
            const isFeatured = cat.featured
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 56, scale: 0.94 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  delay: Math.min(index * 0.12, 0.45),
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -16,
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
                className="group relative"
              >
                <Link href={cat.href} className="block h-full">
                  <div
                    className={`relative h-full flex flex-col rounded-3xl overflow-hidden transition-all duration-400 ${
                      isFeatured
                        ? "bg-white border-2 border-[#3c62b3] shadow-2xl shadow-[#3c62b3]/25 ring-4 ring-[#3c62b3]/40"
                        : "bg-white border border-[#e0ebe9] shadow-xl shadow-[#3c62b3]/15 hover:border-[#3c62b3]/40 hover:shadow-2xl hover:shadow-[#3c62b3]/25"
                    }`}
                  >
                    {/* Card header with gradient + icon */}
                    <div
                      className={`relative min-h-[8rem] sm:min-h-[10rem] bg-gradient-to-br ${cat.gradient} flex items-center justify-center overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(255,255,255,0.35),transparent_60%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(0,0,0,0.08),transparent_40%)]" />
                      <div className="absolute top-3 right-3 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 blur-xl" />
                      <div className="absolute bottom-2 left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10" />
                      <div
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl ${cat.iconBg} backdrop-blur-sm flex items-center justify-center shadow-2xl ring-4 ${cat.iconRing} group-hover:scale-110 group-hover:rotate-3 transition-all duration-400 ${isFeatured ? "ring-[#3c62b3]" : ""}`}
                      >
                        <Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white drop-shadow-lg" />
                      </div>
                      {isFeatured && (
                        <div className="absolute top-4 left-0 right-0 text-center">
                          <span className="inline-block px-4 py-1.5 rounded-full bg-[#3c62b3] text-white text-xs font-bold tracking-wide shadow-lg">
                            Most popular
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Card body */}
                    <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 lg:p-7 bg-gradient-to-b from-white to-[#f8faf9]/50">
                      <div className="mb-3 h-1 w-12 rounded-full bg-[#e5e7eb] group-hover:bg-[#3c62b3]/60 transition-colors" />
                      <h3 className="text-xl lg:text-2xl font-bold text-[#1a1a1a] mb-3 group-hover:text-[#3c62b3] transition-colors leading-tight">
                        {cat.title}
                      </h3>
                      <p className="text-sm text-[#333333]/80 line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {cat.description}
                      </p>
                      <span className="inline-flex items-center justify-center gap-2 w-full py-4 px-5 rounded-2xl font-bold text-sm bg-[#3c62b3] text-white shadow-lg shadow-[#3c62b3]/30 group-hover:bg-[#2d4d8a] group-hover:shadow-xl group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                        Explore courses
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/learning/courses"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-[#1a1a1a] bg-white border-2 border-[#e5e7eb] shadow-lg hover:bg-[#f9fafb] hover:border-[#3c62b3]/40 hover:text-[#3c62b3] transition-all duration-300 hover:scale-105 active:scale-100"
          >
            All courses
            <ChevronRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// Student Reviews - amazing, qurxoon, cajiib
const STUDENT_REVIEWS = [
  {
    id: 1,
    name: "Amina Hassan",
    role: "Web Development",
    quote: "Markano changed how I learn. Short lessons and real projects — I landed my first dev job in 6 months.",
    rating: 5,
    initial: "AH",
  },
  {
    id: 2,
    name: "Omar Ahmed",
    role: "Cybersecurity",
    quote: "Best platform for hands-on learning. The microlearning approach made it easy to stay consistent.",
    rating: 5,
    initial: "OA",
  },
  {
    id: 3,
    name: "Fatima Ali",
    role: "Data Science",
    quote: "Clear progress, great support. I completed three courses and got certified. Highly recommend.",
    rating: 5,
    initial: "FA",
  },
]

function StudentReviewsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#f8faf9] relative overflow-hidden border-t border-[#e8f0ef]">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-3 break-words px-1">Student Reviews</h2>
          <p className="text-[#333333]/80 max-w-2xl mx-auto text-lg">
            What our learners say about Markano. Real stories, real progress.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {STUDENT_REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 36, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                delay: index * 0.12,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
              className="group relative"
            >
              <div
                className="relative h-full rounded-2xl border-2 border-[#e8f0ef] bg-white p-6 md:p-8 transition-all duration-500 ease-out"
                style={{
                  boxShadow: "0 8px 32px rgba(37,150,190,0.06), 0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 0 2px rgba(37,150,190,0.12), 0 16px 40px rgba(37,150,190,0.1)",
                  }}
                />
                <Quote className="absolute top-5 right-5 w-8 h-8 text-[#3c62b3]/15 group-hover:text-[#3c62b3]/25 transition-colors" />
                <p className="relative text-[#333333]/90 leading-relaxed mb-6 pr-8 text-base">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#1a1a1a] font-bold text-sm flex-shrink-0 border border-[#e5e7eb]">
                    {review.initial}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">{review.name}</p>
                    <p className="text-sm text-[#333333]/70">{review.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 flex-shrink-0 ${i < review.rating ? "text-[#3c62b3] fill-[#3c62b3]" : "text-[#e8f0ef]"}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Microlearning Section - branding #2596be only
function MicrolearningSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const t = setTimeout(() => setProgress(100), 600)
    return () => clearTimeout(t)
  }, [isInView])

  const lessons = [
    { title: "Introduction", done: true },
    { title: "Core Concepts", done: true },
    { title: "Hands-On Practice", done: true },
    { title: "Real-World Example", done: true },
    { title: "Summary & Next Steps", done: true },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #f0f9f7 0%, #ffffff 100%)" }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT: Headline + sub-headline + 3 benefit bullets */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="space-y-6"
          >
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
              style={{ backgroundColor: "rgba(37,150,190,0.08)", borderColor: "rgba(37,150,190,0.2)" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: BRAND }} />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND }}>
                Microlearning
              </span>
            </motion.div>
            <motion.h2
              variants={item}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight break-words"
              style={{ color: BRAND }}
            >
              Microlearning, Designed for 2026.
            </motion.h2>
            <motion.p
              variants={item}
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: BRAND, opacity: 0.85 }}
            >
              Short videos and focused lessons that help you learn faster, remember more, and build real skills step by
              step.
            </motion.p>
            <motion.ul variants={container} className="space-y-4 pt-2">
              {[
                { icon: PlayCircle, text: "5–10 minute video lessons" },
                { icon: FileText, text: "Clear text explanations" },
                { icon: TrendingUp, text: "Progress you can see" },
              ].map((row, i) => (
                <motion.li key={i} variants={item} className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(37,150,190,0.2)" }}
                  >
                    <row.icon className="w-5 h-5" style={{ color: BRAND }} />
                  </div>
                  <span className="font-medium text-[#1a1a1a]" style={{ fontSize: "1.05rem" }}>
                    {row.text}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* RIGHT: Learning path – 5 lesson cards + progress bar */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div
              className="relative w-full max-w-sm rounded-3xl p-6 shadow-xl border"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "rgba(37,150,190,0.12)",
                boxShadow: "0 20px 60px rgba(37,150,190,0.08)",
              }}
            >
              <div className="space-y-2 mb-6">
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "rgba(37,150,190,0.15)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: BRAND }}
                    initial={{ width: "0%" }}
                    animate={isInView ? { width: `${progress}%` } : {}}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: BRAND }}>
                  {progress}% complete
                </span>
              </div>
              <div className="space-y-3">
                {lessons.map((lesson, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.15 * i + 0.3, duration: 0.35 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="flex items-center gap-4 p-3 rounded-xl border transition-shadow duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: lesson.done ? "rgba(37,150,190,0.08)" : "rgba(37,150,190,0.03)",
                      borderColor: lesson.done ? "rgba(37,150,190,0.35)" : "rgba(37,150,190,0.1)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: lesson.done ? "rgba(37,150,190,0.25)" : "rgba(37,150,190,0.08)" }}
                    >
                      {lesson.done ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND }} />
                      ) : (
                        <PlayCircle className="w-5 h-5" style={{ color: BRAND }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-[#1a1a1a]">{lesson.title}</span>
                    </div>
                    {lesson.done && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ delay: 0.2 * i + 0.5, type: "spring", stiffness: 300 }}
                        className="text-xs font-bold px-2 py-1 rounded-md"
                        style={{ backgroundColor: "rgba(37,150,190,0.2)", color: BRAND }}
                      >
                        Done
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView && progress >= 100 ? { opacity: 1 } : {}}
                transition={{ delay: 1.4 }}
                className="mt-4 flex items-center gap-2 text-sm font-medium"
                style={{ color: BRAND }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Course complete – ready for the next skill.</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
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

// Floating Code Lines Component - brand colors only
function FloatingCodeLines() {
  const codeLines = [
    { code: '<div class="hero">', color: "#2596be", delay: "0s", top: "10%", left: "5%" },
    { code: "function learn() {", color: "#2596be", delay: "0.5s", top: "20%", right: "8%" },
    { code: "  return success;", color: "#2596be", delay: "1s", top: "35%", left: "3%" },
    { code: "@keyframes grow {", color: "#2596be", delay: "1.5s", top: "50%", right: "5%" },
    { code: "const future = await", color: "#2596be", delay: "2s", top: "65%", left: "7%" },
    { code: "  skills.map(s =>", color: "#2596be", delay: "2.5s", top: "75%", right: "10%" },
    { code: "});", color: "#2596be", delay: "3s", top: "85%", left: "4%" },
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 text-[#2596be] font-mono text-xs animate-matrix-fall"
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

// Features Data - brand palette only (#2596be / #2596be)
const features = [
  {
    icon: Shield,
    title: "Cybersecurity Training",
    description: "Learn ethical hacking, network security, and protect digital assets with hands-on labs.",
    gradient: "#2596be",
    pattern: "🛡️",
  },
  {
    icon: Code,
    title: "Hands-On Coding",
    description: "Build real projects with HTML, CSS, JavaScript, Python and more modern technologies.",
    gradient: "#2596be",
    pattern: "</>",
  },
  {
    icon: Target,
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed analytics and achievement badges.",
    gradient: "from-[#2596be] to-[#2596be]",
    pattern: "📊",
  },
  {
    icon: Users,
    title: "1-on-1 Mentoring",
    description: "Get personalized guidance from industry experts who care about your success.",
    gradient: "#2596be",
    pattern: "👨‍🏫",
  },
  {
    icon: Monitor,
    title: "Live Sessions",
    description: "Join interactive live classes and workshops with real-time Q&A support.",
    gradient: "#2596be",
    pattern: "🎥",
  },
  {
    icon: GraduationCap,
    title: "Certified Learning",
    description: "Earn recognized certificates upon completion to boost your career prospects.",
    gradient: "from-[#2596be] to-[#2596be]",
    pattern: "🎓",
  },
]

// TypewriterCode Component for animated code typing effect
function TypewriterCode() {
  const [displayedCode, setDisplayedCode] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const hasStartedRef = useRef(false)

  // Full code as a single string for simpler typing
  const fullCode = `import { Markano } from "markano";

const student = new Markano.Student({
  name: "Your Name",
  goal: "Become a Developer",
  passion: "Technology"
});

async function startJourney() {
  await student.learn("HTML & CSS");
  await student.learn("JavaScript");
  await student.learn("React");
  await student.master("Web Development");

  return student.transform("Expert");
}

startJourney().then(success => {
  console.log("🚀 Welcome to Markano!");
  console.log("Your future starts here...");
});`

  // Observe visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedRef.current) {
          setIsVisible(true)
          hasStartedRef.current = true
        }
      },
      { threshold: 0.2 },
    )
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [])

  // Typing animation
  useEffect(() => {
    if (!isVisible || isComplete) return

    if (currentIndex < fullCode.length) {
      const timeout = setTimeout(
        () => {
          setDisplayedCode(fullCode.slice(0, currentIndex + 1))
          setCurrentIndex((prev) => prev + 1)
        },
        20 + Math.random() * 25,
      )
      return () => clearTimeout(timeout)
    } else {
      setIsComplete(true)
      // Restart after 5 seconds
      setTimeout(() => {
        setDisplayedCode("")
        setCurrentIndex(0)
        setIsComplete(false)
      }, 5000)
    }
  }, [isVisible, currentIndex, isComplete, fullCode])

  // Syntax highlighting function
  const highlightCode = (code: string) => {
    return code
      .replace(/(import|from|const|new|async|function|await|return|then)/g, '<span class="text-purple-400">$1</span>')
      .replace(/(".*?")/g, '<span class="text-green-400">$1</span>')
      .replace(
        /(Markano|Student|learn|master|transform|startJourney|console|log)/g,
        '<span class="text-cyan-400">$1</span>',
      )
      .replace(/(\{|\}|$$|$$|\[|\])/g, '<span class="text-yellow-400">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
  }

  const lines = displayedCode.split("\n")

  return (
    <div ref={containerRef} className="relative">
      {/* Terminal Window - brand accent glow */}
      <div className="relative rounded-2xl overflow-hidden border border-[#2596be]/20 shadow-2xl shadow-[#2596be]/15 bg-[#000000]">
        {/* Terminal Header */}
        <div className="bg-[#000000] px-4 py-3 flex items-center gap-3 border-b border-white/10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-lg shadow-[#ff5f57]/50 hover:scale-110 transition-transform cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-lg shadow-[#ffbd2e]/50 hover:scale-110 transition-transform cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#28ca42] shadow-lg shadow-[#28ca42]/50 hover:scale-110 transition-transform cursor-pointer" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-400 font-mono bg-black/30 px-3 py-1 rounded-full">
              markano-learning.js
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Code2 className="w-4 h-4" />
          </div>
        </div>

        {/* Code Area */}
        <div className="p-4 md:p-6 font-mono text-xs md:text-sm min-h-[350px] md:min-h-[420px] overflow-hidden relative">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(230,57,70,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,70,0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Line Numbers + Code */}
          <div className="flex relative z-10">
            <div className="pr-4 text-right select-none border-r border-white/10 mr-4 text-gray-600">
              {lines.map((_, index) => (
                <div key={index} className="leading-6 md:leading-7">
                  {index + 1}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              <pre className="leading-6 md:leading-7 whitespace-pre-wrap">
                <code
                  dangerouslySetInnerHTML={{
                    __html:
                      highlightCode(displayedCode) +
                      (isComplete
                        ? ""
                        : '<span class="inline-block w-2 h-4 md:h-5 bg-[#2596be] ml-0.5 animate-pulse rounded-sm"></span>'),
                  }}
                />
              </pre>
            </div>
          </div>

          {/* Typing Speed Indicator */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-gray-500">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span>{Math.round((currentIndex / fullCode.length) * 100)}%</span>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-black px-4 py-2 flex items-center justify-between border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isComplete ? "bg-[#2596be]" : "bg-[#2596be] animate-pulse"}`} />
              <span className="text-xs text-gray-400">{isComplete ? "Complete" : "Typing..."}</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-xs text-gray-500">{lines.length} lines</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="hidden sm:inline">JavaScript</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>

      {/* Floating Glow Effects */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#2596be] rounded-full opacity-25 blur-2xl animate-pulse pointer-events-none" />
      <div
        className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#2596be] rounded-full opacity-20 blur-2xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 -right-8 w-16 h-16 bg-[#2596be] rounded-full opacity-15 blur-xl animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}
      />
    </div>
  )
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [viewportCenter, setViewportCenter] = useState({ x: 512, y: 384 })
  const heroCardsRef = useRef<HTMLDivElement>(null)
  const heroCardsInView = useInView(heroCardsRef, { once: false, margin: "-80px" })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const updateViewport = () => {
      setViewportCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
      setIsLargeScreen(window.innerWidth >= 768)
    }
    updateViewport()
    window.addEventListener("resize", updateViewport)
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8faff] overflow-x-hidden">
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.4; }
        }
        @keyframes matrix-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes scan-line {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(89, 212, 4, 0.3); }
          50% { box-shadow: 0 0 40px rgba(89, 212, 4, 0.5); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-matrix-fall { animation: matrix-fall 4s linear infinite; }
        .animate-scan-line { animation: scan-line 3s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .scroll-fade-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
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
        @keyframes hero-skill-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <Navbar />

      {/* Hero Section - white background + animated bottom pattern */}
      <section className="relative overflow-hidden bg-white">
        {/* Very subtle top glow only - keep hero clean white */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(37,150,190,0.03) 0%, transparent 40%, transparent 100%)",
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-2 md:pt-14 md:pb-4 relative z-10 max-w-full">
          <div className="text-center max-w-4xl mx-auto">
            {/* Headline - responsive text size */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-[#3c62b3] mb-2 sm:mb-3 leading-tight px-1 break-words">
              <span className="text-[#2596be]">Microlearning.</span> Easy Learning —{" "}
              <span className="text-[#2596be]">amazing</span> results.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#3c62b3]/90 max-w-2xl mx-auto mb-4 sm:mb-5 px-2">
              Short lessons, easy learning. Build real skills step by step — amazing progress.
            </p>
            <p className="text-xs sm:text-sm font-medium text-[#3c62b3] mb-4 sm:mb-6 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3c62b3]/70" />
              30 Days free trial
            </p>

            {/* Search Bar - full width on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6 sm:mb-8 w-full sm:w-auto px-1">
              <Input
                type="search"
                placeholder="Search Here"
                className="w-full flex-1 h-12 sm:h-14 px-4 sm:px-6 rounded-2xl border-2 border-[#e8f4f3] bg-white text-[#333333] placeholder:text-[#4A4A4A] text-sm sm:text-base focus:border-[#2596be] focus:ring-[rgba(37,150,190,0.2)] focus:bg-white shadow-sm"
              />
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-2xl bg-[#2596be] text-white font-semibold text-sm sm:text-base hover:bg-[#3c62b3] shadow-lg shadow-[#2596be]/25 flex-shrink-0"
                asChild
              >
                <a href="/videos" className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search
                </a>
              </Button>
            </div>

            {/* Skills you’ll master */}
            <p className="text-center text-xs font-semibold text-[#2596be]/70 uppercase tracking-widest mb-3 mt-0">
              Skills you’ll master
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2">
              {[
                { name: "Node.js", icon: Code2, color: "#2596be", delay: 0 },
                { name: "React", icon: Layers, color: "#3c62b3", delay: 0.05 },
                { name: "Photoshop", icon: Palette, color: "#2596be", delay: 0.1 },
                { name: "Illustrator", icon: PenTool, color: "#3c62b3", delay: 0.15 },
                { name: "Excel", icon: Table, color: "#2596be", delay: 0.2 },
                { name: "SPSS", icon: BarChart3, color: "#3c62b3", delay: 0.25 },
              ].map((skill, i) => {
                const Icon = skill.icon
                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + skill.delay, duration: 0.35 }}
                    whileHover={{ scale: 1.06, y: -2 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#2596be]/12 shadow-sm hover:shadow-md hover:border-[#2596be]/25 transition-all duration-300"
                    style={{
                      animation: "hero-skill-float 4s ease-in-out infinite",
                      animationDelay: `${i * 0.4}s`,
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${skill.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: skill.color }} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold whitespace-nowrap" style={{ color: skill.color }}>
                      {skill.name}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            <div className="w-20 h-0.5 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-r from-transparent via-[#2596be]/25 to-transparent" />

            {/* 2 cards: stack on mobile, side-by-side on sm+ */}
            <div
              ref={heroCardsRef}
              className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-5 sm:gap-6 md:gap-8 mb-4 sm:mb-6 min-h-0 w-full max-w-4xl mx-auto px-1"
              style={{ perspective: "1400px" }}
            >
              {/* Card 1: Microlearning */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={
                  heroCardsInView
                    ? {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                      }
                    : {}
                }
                whileHover={{
                  y: -12,
                  scale: 1.02,
                  transition: { duration: 0.25 },
                }}
                style={{
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.07), 0 12px 24px rgba(37,150,190,0.25), 0 24px 48px rgba(37,150,190,0.2), 0 0 0 1px rgba(0,0,0,0.03)",
                }}
                className="group relative flex-1 min-w-0 w-full sm:max-w-[380px] rounded-2xl bg-[#3c62b3] border border-[#2d4d8a]/80 p-5 sm:p-6 md:p-8 text-left overflow-hidden"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={heroCardsInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/25 flex items-center justify-center mb-4 sm:mb-5 text-white shadow-lg"
                >
                  <PlayCircle className="w-7 h-7 sm:w-8 sm:h-8" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 tracking-tight">Microlearning</h3>
                <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                  Short lessons in small bites. Videos + text – learn more by learning less, better.
                </p>
                <motion.span
                  className="inline-flex items-center gap-1 mt-5 text-xs font-semibold text-white/90 tracking-wide"
                  initial={{ opacity: 0, x: -8 }}
                  animate={heroCardsInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.45 }}
                  style={{ transform: "translateZ(2px)" }}
                >
                  Scroll to explore
                  <ChevronRight className="w-4 h-4 opacity-80" />
                </motion.span>
              </motion.div>

              {/* Card 2: Quick Skill - 3D only on md+ screens */}
              <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 15, scale: 0.95 }}
                animate={
                  heroCardsInView
                    ? {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        scale: 1,
                        transition: { duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] },
                      }
                    : {}
                }
                whileHover={{
                  y: isLargeScreen ? -16 : -8,
                  scale: 1.02,
                  z: isLargeScreen ? 24 : 0,
                  transition: { duration: 0.25 },
                }}
                style={{
                  rotateY: isLargeScreen ? (mousePosition.x - viewportCenter.x) * -0.028 : 0,
                  rotateX: isLargeScreen ? (mousePosition.y - viewportCenter.y) * 0.02 : 0,
                  y: Math.min(scrollY * 0.05, 16),
                  transformStyle: "preserve-3d",
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.05), 0 12px 28px rgba(0,0,0,0.08), 0 24px 56px rgba(37,150,190,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                }}
                className="group relative flex-1 min-w-0 max-w-[380px] rounded-2xl bg-white border border-[#e0ebe9] p-6 md:p-8 text-left overflow-visible"
              >
                {/* 3D bottom edge - card thickness */}
                <div
                  className="absolute left-2 right-2 bottom-0 h-3 rounded-b-2xl"
                  style={{
                    background: "linear-gradient(180deg, #e8eeec 0%, #dce4e2 100%)",
                    transform: "translateY(100%) translateZ(-12px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[rgba(37,150,190,0.06)] rounded-2xl" style={{ transform: "translateZ(1px)" }} />
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={heroCardsInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.32, type: "spring", stiffness: 220 }}
                  className="w-16 h-16 rounded-2xl bg-[#3c62b3]/15 flex items-center justify-center mb-5 text-[#3c62b3]"
                  style={{ transform: "translateZ(8px)" }}
                >
                  <Zap className="w-8 h-8" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#3c62b3] mb-3 tracking-tight" style={{ transform: "translateZ(6px)" }}>Quick Skill</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ transform: "translateZ(4px)" }}>
                  Build real skills in 5–10 minutes. Focused topics, clear progress, no overload.
                </p>
                <motion.span
                  className="inline-flex items-center gap-1 mt-5 text-xs font-semibold text-[#3c62b3]/90 tracking-wide"
                  initial={{ opacity: 0, x: -8 }}
                  animate={heroCardsInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 }}
                  style={{ transform: "translateZ(2px)" }}
                >
                  Track progress
                  <ChevronRight className="w-4 h-4 opacity-80" />
                </motion.span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Koorsoyinka - bandhig koorsaska si cajiib ah */}
      <CoursesSection />

      {/* Microlearning Section - #2596be */}
      <MicrolearningSection />

      {/* Student Reviews - amazing, qurxoon, cajiib */}
      <StudentReviewsSection />

      {/* Footer - #3c62b3 bg, #2596be accent, hagaajin */}
      <footer className="bg-[#3c62b3] text-white pt-12 sm:pt-16 pb-6 sm:pb-8 border-t-2 border-[#2596be]/40 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">
            <div className="sm:col-span-2 md:col-span-1">
              <img src="/images/white-logo.png" alt="Markano" className="h-9 sm:h-10 mb-4 sm:mb-5 max-w-full" />
              <p className="text-white/80 text-sm leading-relaxed mb-4 sm:mb-5 max-w-md">
                Empowering teachers and students across Somalia with world-class tech education and hands-on mentoring.
              </p>
              <div className="flex gap-3">
                {[Globe, Lock, Cpu, Layers].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2596be] hover:text-white transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base mb-4 text-white tracking-tight">Learn</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Web Development</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Cybersecurity</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Programming</a></li>
                <li><a href="/bootcamp" className="text-white/80 hover:text-white transition-colors">Bootcamp Program</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-base mb-4 text-white tracking-tight">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">For Teachers</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">For Students</a></li>
                <li><a href="/videos" className="text-white/80 hover:text-white transition-colors">Video Library</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Progress Tracking</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-base mb-4 text-white tracking-tight">Support</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/70 text-sm">&copy; 2025 Markano. Empowering Tech Education in Somalia.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
