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
  Palette,
  PenTool,
  Table,
  BarChart3,
} from "lucide-react"
import { getImageSrc } from "@/lib/utils"

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


// Fallback static cards when API has no courses
const FALLBACK_HOT_COURSES: Array<{ id: string; title: string; description: string; href: string; tag: string; tagStyle: "hot" | "trending"; icon: typeof Cpu }> = [
  { id: "tech", title: "Tech & Programming", description: "Web development, React, Node.js, and in-demand tech skills.", href: "/learning/courses", tag: "Hot pick", tagStyle: "hot", icon: Cpu },
  { id: "skills", title: "Skills for Everyone", description: "Excel, design, data — learn at your pace. Build real skills.", href: "/self-learning", tag: "Trending now", tagStyle: "trending", icon: Zap },
]

function CoursesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/learning/courses")
      .then((res) => res.ok ? res.json() : [])
      .then((data: CourseItem[] | { courses?: CourseItem[] }) => {
        const list = Array.isArray(data) ? data : (data as { courses?: CourseItem[] }).courses ?? []
        setCourses((list as CourseItem[]).slice(0, 2))
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  const showRealCourses = !loading && courses.length >= 2

  return (
    <section
      ref={ref}
      className="relative pt-8 pb-20 md:pt-12 md:pb-24 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fafbfc 0%, #ffffff 50%, #f8fafb 100%)" }}
    >
      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[#2596be] text-sm font-semibold uppercase tracking-[0.2em] mb-3">
            2026 · Featured
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0f172a] mb-4 tracking-tight leading-[1.1]">
            Hot Courses
          </h2>
          <p className="text-[#64748b] max-w-xl mx-auto text-base md:text-lg leading-relaxed">
            Most popular and trending. Start learning today.
          </p>
        </div>

        {/* Category cards – compact, beautiful, amazing */}
        <div className="mb-12 md:mb-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: TrendingUp, label: "Free Courses", href: "/learning/courses", color: "from-[#2596be] to-[#3c62b3]" },
              { icon: Globe, label: "AI Tools", href: "/self-learning", color: "from-[#1e7a9e] to-[#3c62b3]" },
              { icon: Zap, label: "Skills & Tools", href: "/self-learning", color: "from-[#3c62b3] to-[#2596be]" },
              { icon: BookOpen, label: "All Courses", href: "/learning/courses", color: "from-[#2596be] via-[#2a8bb5] to-[#3c62b3]" },
            ].map((cat, i) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                >
                  <Link
                    href={cat.href}
                    className="block h-full rounded-2xl bg-white border-2 border-[#2596be]/12 shadow-[0_10px_30px_rgba(37,150,190,0.08),0_0_0_1px_rgba(37,150,190,0.04)] hover:shadow-[0_20px_50px_rgba(37,150,190,0.15),0_0_0_1px_rgba(37,150,190,0.1)] hover:border-[#2596be]/25 transition-all duration-300 overflow-hidden group/cat"
                  >
                    <div className="p-5 sm:p-6 transition-all duration-300" style={{ background: "linear-gradient(135deg, rgba(37,150,190,0.06), rgba(60,98,179,0.06))" }}>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 border border-white/90 group-hover/cat:scale-110 group-hover/cat:shadow-xl transition-all duration-300">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#2596be]" />
                      </div>
                      <p className="text-[#0f172a] text-base font-bold leading-tight line-clamp-2 group-hover/cat:text-[#2596be] transition-colors">
                        {cat.label}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-3xl bg-white overflow-hidden h-[420px] animate-pulse border border-[#e2e8f0] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
                <div className="h-56 bg-[#e2e8f0]" />
                <div className="p-6 md:p-8 space-y-4">
                  <div className="h-7 w-4/5 rounded-lg bg-[#e2e8f0]" />
                  <div className="h-4 w-full rounded bg-[#e2e8f0]" />
                  <div className="h-4 w-2/3 rounded bg-[#e2e8f0]" />
                </div>
              </div>
            ))}
          </div>
        ) : showRealCourses ? (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">
            {courses.map((course, index) => {
              const priceInfo = formatPrice(course.price)
              const thumbSrc = getImageSrc(course.thumbnail_url) || course.thumbnail_url
              const isFirst = index === 0
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group"
                >
                  <Link href={`/learning/courses/${course.id}`} className="block h-full">
                    <article className="relative h-full flex flex-col rounded-3xl bg-white overflow-hidden border border-[#e2e8f0] transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_64px_-12px_rgba(37,150,190,0.15),0_0_0_1px_rgba(37,150,190,0.08)] hover:border-[#2596be]/20 group/card">
                      {/* Image block — 2026 style */}
                      <div className="relative aspect-[16/10] bg-[#f1f5f9] overflow-hidden">
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover/card:scale-[1.06] transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2596be]/8 via-[#f8fafc] to-[#3c62b3]/8">
                            <BookOpen className="w-20 h-20 text-[#2596be]/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        {/* Badges — glass / refined */}
                        <div className="absolute top-5 left-5 z-10 flex flex-wrap gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm"
                            style={{
                              background: isFirst ? `linear-gradient(135deg, ${BRAND}, #1e7a9e)` : "linear-gradient(135deg, #3c62b3, #2d4a8a)",
                              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                            }}
                          >
                            {isFirst ? "🔥 Hot pick" : "↑ Trending now"}
                          </span>
                          {course.is_featured && (
                            <span className="inline-flex py-2 px-3.5 rounded-full bg-white/95 backdrop-blur-sm text-[#2596be] text-xs font-bold shadow-md border border-white/50">
                              Bestseller
                            </span>
                          )}
                        </div>
                        <span className="absolute top-5 right-5 z-10 py-2 px-3.5 rounded-full bg-white/95 backdrop-blur-sm text-[#475569] text-xs font-semibold shadow-md border border-white/60">
                          {course.difficulty_level || "All levels"}
                        </span>
                      </div>
                      {/* Content — 2026 typography & spacing */}
                      <div className="flex-1 flex flex-col p-6 md:p-8">
                        <h3 className="text-xl md:text-2xl font-bold text-[#0f172a] line-clamp-2 mb-3 leading-tight tracking-tight group-hover/card:text-[#2596be] transition-colors duration-300">
                          {course.title}
                        </h3>
                        <p className="text-[#64748b] text-sm md:text-base line-clamp-2 mb-6 flex-1 leading-relaxed">
                          {course.description || "Short lessons, real projects. Build in-demand skills."}
                        </p>
                        <div className="flex items-center justify-between gap-4 pt-5 border-t border-[#f1f5f9]">
                          <div>
                            <span className="text-2xl font-bold text-[#0f172a]">{priceInfo.main}</span>
                            {priceInfo.sub && <span className="text-sm font-medium text-[#64748b] ml-1.5">{priceInfo.sub}</span>}
                          </div>
                          <span
                            className="inline-flex items-center gap-2 py-3 px-5 rounded-full text-sm font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: BRAND, boxShadow: "0 4px 14px rgba(37,150,190,0.4)" }}
                          >
                            View course
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">
            {FALLBACK_HOT_COURSES.map((card, index) => {
              const Icon = card.icon
              const isFirst = index === 0
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Link href={card.href} className="block h-full">
                    <article className="relative h-full flex flex-col rounded-3xl bg-white overflow-hidden border border-[#e2e8f0] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_64px_-12px_rgba(37,150,190,0.15)] hover:border-[#2596be]/20 transition-all duration-500 group/card">
                      <div className="relative aspect-[16/10] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2596be]/10 via-[#f8fafc] to-[#3c62b3]/10">
                        <div className="absolute top-5 left-5 z-10 flex flex-wrap gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg"
                            style={{
                              background: card.tagStyle === "hot" ? `linear-gradient(135deg, ${BRAND}, #1e7a9e)` : "linear-gradient(135deg, #3c62b3, #2d4a8a)",
                              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                            }}
                          >
                            {card.tagStyle === "hot" ? "🔥 Hot pick" : "↑ Trending now"}
                          </span>
                        </div>
                        <div className="w-28 h-28 rounded-3xl bg-white/90 backdrop-blur flex items-center justify-center shadow-xl border border-white/70">
                          <Icon className="w-14 h-14 text-[#2596be]" />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col p-6 md:p-8">
                        <h3 className="text-xl md:text-2xl font-bold text-[#0f172a] line-clamp-2 mb-3 leading-tight tracking-tight group-hover/card:text-[#2596be] transition-colors">{card.title}</h3>
                        <p className="text-[#64748b] text-sm md:text-base line-clamp-2 mb-6 flex-1 leading-relaxed">{card.description}</p>
                        <div className="flex items-center justify-between gap-4 pt-5 border-t border-[#f1f5f9]">
                          <span className="text-2xl font-bold text-[#0f172a]">Free</span>
                          <span
                            className="inline-flex items-center gap-2 py-3 px-5 rounded-full text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            style={{ backgroundColor: BRAND, boxShadow: "0 4px 14px rgba(37,150,190,0.4)" }}
                          >
                            View course <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35 }}
        >
          <Link
            href="/learning/courses"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: "#3c62b3" }}
          >
            See all courses
            <ChevronRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// Student Reviews – from API (approved only), fallback static
const FALLBACK_REVIEWS = [
  { id: 1, reviewer_name: "Amina Hassan", company: "Web Development", message: "Markano changed how I learn. Short lessons and real projects — I landed my first dev job in 6 months.", rating: 5, avatar_url: null },
  { id: 2, reviewer_name: "Omar Ahmed", company: "Cybersecurity", message: "Best platform for hands-on learning. The microlearning approach made it easy to stay consistent.", rating: 5, avatar_url: null },
  { id: 3, reviewer_name: "Fatima Ali", company: "Data Science", message: "Clear progress, great support. I completed three courses and got certified. Highly recommend.", rating: 5, avatar_url: null },
]

function StudentReviewsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [reviews, setReviews] = useState<Array<{ id: number; reviewer_name: string; company?: string | null; message: string; rating: number; avatar_url?: string | null }>>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.ok ? res.json() : [])
      .then((data: typeof reviews) => {
        setReviews(Array.isArray(data) && data.length > 0 ? data : FALLBACK_REVIEWS)
      })
      .catch(() => setReviews(FALLBACK_REVIEWS))
      .finally(() => setLoaded(true))
  }, [])

  const list = loaded && reviews.length > 0 ? reviews : FALLBACK_REVIEWS

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#f8faf9] relative overflow-hidden border-t border-[#e8f0ef]">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-3 break-words px-1">Student Reviews</h2>
          <p className="text-[#333333]/80 max-w-2xl mx-auto text-lg">
            What our learners say about Markano. Real stories, real progress.
          </p>
          <Link
            href="/review"
            className="inline-flex items-center gap-2 mt-4 text-[#2596be] font-semibold hover:underline"
          >
            <Star className="w-4 h-4 fill-[#2596be]" />
            Submit your review
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {list.slice(0, 3).map((review, index) => {
            const initial = (review.reviewer_name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
            const avatarUrl = review.avatar_url ? (getImageSrc(review.avatar_url) || review.avatar_url) : null
            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 36, scale: 0.97 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
                className="group relative"
              >
                <div
                  className="relative h-full rounded-2xl border-2 border-[#e8f0ef] bg-white p-6 md:p-8 transition-all duration-500 ease-out"
                  style={{ boxShadow: "0 8px 32px rgba(37,150,190,0.06), 0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: "inset 0 0 0 2px rgba(37,150,190,0.12), 0 16px 40px rgba(37,150,190,0.1)" }} />
                  <Quote className="absolute top-5 right-5 w-8 h-8 text-[#2596be]/15 group-hover:text-[#2596be]/25 transition-colors" />
                  <p className="relative text-[#333333]/90 leading-relaxed mb-6 pr-8 text-base">&ldquo;{review.message}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-[#e5e7eb]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#1a1a1a] font-bold text-sm flex-shrink-0 border border-[#e5e7eb]">{initial}</div>
                    )}
                    <div>
                      <p className="font-bold text-[#1a1a1a]">{review.reviewer_name}</p>
                      <p className="text-sm text-[#333333]/70">{review.company || "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 flex-shrink-0 ${i < (review.rating || 5) ? "text-[#2596be] fill-[#2596be]" : "text-[#e8f0ef]"}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Microlearning Section - labada midab home (orange + yellow)
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
              Learn with Microlearning — Educational Tools That Help You Succeed.
            </motion.h2>
            <motion.p
              variants={item}
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: BRAND, opacity: 0.85 }}
            >
              In microlearning you learn through short videos and focused lessons. All the educational tools that support your learning — video lessons, clear explanations, and progress tracking — are available here in one place.
            </motion.p>
            <motion.ul variants={container} className="space-y-4 pt-2">
              {[
                { icon: PlayCircle, text: "5–10 minute video lessons — learn at your pace" },
                { icon: FileText, text: "Clear text explanations — educational tools you can use" },
                { icon: TrendingUp, text: "Progress you can see — stay on track" },
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
                        style={{ backgroundColor: "rgba(255,153,0,0.2)", color: BRAND }}
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

// Features Data - brand palette only (#2596be / #3c62b3)
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
        @keyframes hero-pattern-drift {
          0% { background-position: 0 0, 0 0, 0 0, 0 0; }
          100% { background-position: 60px 0, 0 60px, 120px 0, 0 120px; }
        }
        .animate-hero-pattern {
          animation: hero-pattern-drift 50s linear infinite;
        }
        .animate-hero-pattern-slow {
          animation: hero-pattern-drift 75s linear infinite reverse;
        }
        @keyframes hero-rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hero-rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .hero-ring-rotate {
          animation: hero-rotate-slow 25s linear infinite;
        }
        .hero-ring-rotate-reverse {
          animation: hero-rotate-reverse 30s linear infinite;
        }
        @keyframes hero-orbit-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .hero-skill-orbit-item {
          animation: hero-orbit-float 3s ease-in-out infinite;
        }
        .hero-orbit-counter-22 { animation: hero-rotate-reverse 22s linear infinite; }
        .hero-orbit-counter-26 { animation: hero-rotate-reverse 26s linear infinite; }
        @keyframes hero-cta-pulse {
          0%, 100% { box-shadow: 0 10px 40px rgba(37,150,190,0.3), 0 0 0 0 rgba(37,150,190,0.2); }
          50% { box-shadow: 0 14px 48px rgba(37,150,190,0.4), 0 0 0 8px rgba(37,150,190,0); }
        }
        .hero-cta-glow {
          animation: hero-cta-pulse 2.5s ease-in-out infinite;
        }
      `}</style>

      <Navbar />

      {/* Hero Section - mobile app style: rounded bottom on mobile; desktop: clean, bold */}
      <section className="relative overflow-hidden bg-[#fafafa] min-h-[78vh] sm:min-h-[82vh] flex flex-col border-b border-[#e5e7eb] rounded-b-3xl lg:rounded-b-none">
        {/* Subtle grid - Amazon-like minimal tech feel */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
          <div
            className="absolute inset-0 opacity-[0.06] animate-hero-pattern"
            style={{
              backgroundImage: `
                linear-gradient(rgba(37,150,190,0.6) 1px, transparent 1px),
                linear-gradient(90deg, rgba(37,150,190,0.6) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,250,250,0.5) 50%, transparent 100%)",
            }}
          />

          {/* Skill icons oo dhaqdhaqaya (orbit) - amazing, si fican loo arko */}
          {(() => {
            const skillIcons = [
              { Icon: Code2, color: "#2596be", label: "Node" },
              { Icon: Layers, color: "#3c62b3", label: "React" },
              { Icon: Palette, color: "#2596be", label: "Ps" },
              { Icon: PenTool, color: "#3c62b3", label: "Ai" },
              { Icon: Table, color: "#2596be", label: "Excel" },
              { Icon: BarChart3, color: "#3c62b3", label: "SPSS" },
            ]
            const r = 56
            return (
              <>
                <div className="absolute top-[10%] right-[6%] w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 pointer-events-none z-[1] hero-ring-rotate" aria-hidden style={{ animationDuration: "22s" }}>
                  {skillIcons.map(({ Icon, color }, i) => {
                    const deg = i * 60
                    const x = 50 + r * Math.cos((deg * Math.PI) / 180)
                    const y = 50 + r * Math.sin((deg * Math.PI) / 180)
                    return (
                      <div
                        key={i}
                        className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/90 shadow-lg border border-[#2596be]/20 flex items-center justify-center hero-orbit-counter-22"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
                      </div>
                    )
                  })}
                </div>
                <div className="absolute bottom-[22%] left-[4%] w-28 h-28 sm:w-32 sm:h-32 pointer-events-none z-[1] hero-ring-rotate-reverse" aria-hidden style={{ animationDuration: "26s" }}>
                  {skillIcons.slice(0, 5).map(({ Icon, color }, i) => {
                    const deg = i * 72
                    const r2 = 44
                    const x = 50 + r2 * Math.cos((deg * Math.PI) / 180)
                    const y = 50 + r2 * Math.sin((deg * Math.PI) / 180)
                    return (
                      <div
                        key={i}
                        className="absolute w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/90 shadow-md border border-[#3c62b3]/20 flex items-center justify-center hero-orbit-counter-26"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color }} />
                      </div>
                    )
                  })}
                </div>
              </>
            )
          })()}
        </div>

        <div className="w-full max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-10 sm:pb-12 lg:pb-16 md:pt-16 md:pb-24 relative z-10 flex-1 flex flex-col justify-center">
          <div className="text-center w-full max-w-7xl mx-auto relative px-0 sm:px-2">
            {/* Content glow - premium, so beautiful */}
            <div
              className="absolute inset-0 -mx-4 sm:-mx-6 md:-mx-8 rounded-3xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                filter: "blur(20px)",
              }}
            />
            <div className="relative">
            {/* Headline - amazing, qurxoon, so jiidahso */}
            <motion.p
              className="text-xs sm:text-sm font-semibold text-[#2596be]/80 uppercase tracking-[0.2em] mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Start your journey
            </motion.p>
            <motion.h1
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#3c62b3] mb-3 sm:mb-4 leading-[1.2] sm:leading-[1.15] px-1 tracking-tight max-w-4xl mx-auto"
              style={{ textShadow: "0 2px 24px rgba(37,150,190,0.12)" }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="block">
                <motion.span
                  className="inline-block text-[#2596be]"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  Everything you need to learn
                </motion.span>
              </span>
              <span className="block mt-1 sm:mt-2 text-[#3c62b3] font-extrabold">
                all in one place.
              </span>
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base md:text-lg text-[#3c62b3]/90 max-w-2xl mx-auto mb-6 sm:mb-7 px-2 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Powerful learning tools and courses, accessible on computers and smartphones.
            </motion.p>
            {/* Primary CTA - simple, amazing first action when people land */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link href="/gold" className="touch-target inline-flex">
                <Button
                  size="lg"
                  className="hero-cta-glow bg-[#2596be] hover:bg-[#1e7a9e] text-white font-bold shadow-xl shadow-[#2596be]/30 hover:shadow-2xl hover:shadow-[#2596be]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 px-8 py-6 sm:px-10 sm:py-7 text-base sm:text-lg rounded-2xl border-0 min-h-[48px]"
                >
                  Start learning free
                </Button>
              </Link>
              <span className="text-sm text-[#3c62b3]/80 font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#2596be]/70 animate-pulse" />
                Quality Skills & Tools
              </span>
            </motion.div>

            {/* Amazon-style trust strip */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-[#232f3e]/90 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#067d62]" />
                Quality Skills & Tools
              </span>
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#2596be]" />
                Certificate
              </span>
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#2596be]" />
                Real Projects
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#2596be]" />
                Learn at your pace
              </span>
            </motion.div>
            </div>

            {/* Skills you’ll master */}
            <p className="text-center text-xs font-semibold text-[#2596be]/70 uppercase tracking-widest mb-4 sm:mb-5 mt-2 sm:mt-4">
              Skills you’ll master
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 px-2">
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

          </div>
        </div>
      </section>

      {/* Koorsoyinka - bandhig koorsaska si cajiib ah */}
      <CoursesSection />

      {/* Microlearning Section */}
      <MicrolearningSection />

      {/* Student Reviews - amazing, qurxoon, cajiib */}
      <StudentReviewsSection />

      {/* Footer */}
      <footer className="bg-[#3c62b3] text-white pt-12 sm:pt-16 pb-6 sm:pb-8 border-t-2 border-[#2596be]/40 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">
            <div className="sm:col-span-2 md:col-span-1">
              <img src="/footer-logo.png" alt="Markano" className="h-9 sm:h-10 mb-4 sm:mb-5 max-w-full object-contain" />
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
