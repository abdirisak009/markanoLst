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
} from "lucide-react"

const MICRO_PRIMARY = "#10453f"
const MICRO_ACCENT = "#66cc9a"

// Packages / Pricing section - amazing pricing cards (not courses)
const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect to begin your learning journey.",
    price: "Free",
    period: "forever",
    features: ["Access to 3 courses", "Community support", "Basic certificates", "5 lessons per week"],
    cta: "Get Started",
    href: "/learning/courses",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Most popular for serious learners.",
    price: "$19",
    period: "/month",
    features: ["Unlimited courses", "1-on-1 mentor sessions", "All certificates", "Priority support", "Offline access"],
    cta: "Choose Pro",
    href: "/learning/courses",
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Full access for teams and institutions.",
    price: "$49",
    period: "/month",
    features: ["Everything in Pro", "Team dashboard", "Custom learning paths", "API access", "Dedicated success manager"],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
]

function PackagesPricingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="py-16 md:py-24 bg-[#f8faf9] border-t border-[#e8f0ef]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#016b62] mb-3">Learning Packages</h2>
          <p className="text-[#333333]/80 max-w-2xl mx-auto text-lg">
            Choose a package that fits your goals. Beautiful pricing, amazing value.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
          {PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                delay: index * 0.12,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                y: -12,
                scale: 1.03,
                transition: { duration: 0.3 },
              }}
              className="group relative"
            >
              <div
                className={`relative h-full flex flex-col rounded-3xl overflow-hidden border-2 transition-all duration-500 ease-out ${
                  pkg.highlighted
                    ? "border-[#016b62] bg-white shadow-xl"
                    : "border-[#e0ebe9] bg-white hover:border-[#016b62]/40"
                }`}
                style={{
                  boxShadow: pkg.highlighted
                    ? "0 20px 50px rgba(1,107,98,0.15), 0 8px 24px rgba(0,0,0,0.06)"
                    : "0 8px 30px rgba(1,107,98,0.06), 0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 0 2px rgba(1,107,98,0.12), 0 24px 56px rgba(1,107,98,0.1)",
                  }}
                />
                {/* Popular badge */}
                {pkg.highlighted && (
                  <div className="absolute top-0 left-0 right-0 py-2 bg-[#016b62] text-white text-center text-sm font-bold tracking-wide z-10">
                    Most Popular
                  </div>
                )}
                <div className={`flex-1 flex flex-col p-6 md:p-8 ${pkg.highlighted ? "pt-12" : ""}`}>
                  <h3 className="text-xl font-bold text-[#016b62] mb-2">{pkg.name}</h3>
                  <p className="text-sm text-[#333333]/75 mb-6">{pkg.description}</p>
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl md:text-5xl font-black text-[#016b62]">{pkg.price}</span>
                    <span className="text-[#016b62]/70 font-medium">{pkg.period}</span>
                  </div>
                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[#333333]/85">
                        <span className="w-5 h-5 rounded-full bg-[#016b62]/15 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-[#016b62]" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {/* CTA */}
                  <Link href={pkg.href} className="block mt-auto">
                    <motion.span
                      className={`inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 ${
                        pkg.highlighted
                          ? "bg-[#016b62] text-white shadow-lg shadow-[#016b62]/25 group-hover:shadow-[#016b62]/35 group-hover:bg-[#01554e]"
                          : "bg-[#fcad21] text-[#1a1a1a] shadow-md group-hover:bg-[#e69d1e]"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {pkg.cta}
                      <ChevronRight className="w-4 h-4" />
                    </motion.span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
          <h2 className="text-3xl md:text-5xl font-bold text-[#016b62] mb-3">Student Reviews</h2>
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
                  boxShadow: "0 8px 32px rgba(1,107,98,0.06), 0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 0 2px rgba(1,107,98,0.12), 0 16px 40px rgba(1,107,98,0.1)",
                  }}
                />
                <Quote className="absolute top-5 right-5 w-8 h-8 text-[#016b62]/15 group-hover:text-[#016b62]/25 transition-colors" />
                <p className="relative text-[#333333]/90 leading-relaxed mb-6 pr-8 text-base">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#016b62] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {review.initial}
                  </div>
                  <div>
                    <p className="font-bold text-[#016b62]">{review.name}</p>
                    <p className="text-sm text-[#333333]/70">{review.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 flex-shrink-0 ${i < review.rating ? "text-[#fcad21] fill-[#fcad21]" : "text-[#e8f0ef]"}`}
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

// Microlearning Section - branding #10453f (primary) + #66cc9a (accent) only
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
              style={{ backgroundColor: "rgba(16,69,63,0.08)", borderColor: "rgba(16,69,63,0.2)" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: MICRO_PRIMARY }} />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: MICRO_PRIMARY }}>
                Microlearning
              </span>
            </motion.div>
            <motion.h2
              variants={item}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight"
              style={{ color: MICRO_PRIMARY }}
            >
              Microlearning, Designed for 2026.
            </motion.h2>
            <motion.p
              variants={item}
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: MICRO_PRIMARY, opacity: 0.85 }}
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
                    style={{ backgroundColor: "rgba(102,204,154,0.2)" }}
                  >
                    <row.icon className="w-5 h-5" style={{ color: MICRO_ACCENT }} />
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
                borderColor: "rgba(16,69,63,0.12)",
                boxShadow: "0 20px 60px rgba(16,69,63,0.08)",
              }}
            >
              <div className="space-y-2 mb-6">
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "rgba(16,69,63,0.15)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: MICRO_ACCENT }}
                    initial={{ width: "0%" }}
                    animate={isInView ? { width: `${progress}%` } : {}}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: MICRO_PRIMARY }}>
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
                      backgroundColor: lesson.done ? "rgba(102,204,154,0.08)" : "rgba(16,69,63,0.03)",
                      borderColor: lesson.done ? "rgba(102,204,154,0.35)" : "rgba(16,69,63,0.1)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: lesson.done ? "rgba(102,204,154,0.25)" : "rgba(16,69,63,0.08)" }}
                    >
                      {lesson.done ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: MICRO_ACCENT }} />
                      ) : (
                        <PlayCircle className="w-5 h-5" style={{ color: MICRO_PRIMARY }} />
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
                        style={{ backgroundColor: "rgba(102,204,154,0.2)", color: MICRO_PRIMARY }}
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
                style={{ color: MICRO_ACCENT }}
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
    { code: '<div class="hero">', color: "#31827a", delay: "0s", top: "10%", left: "5%" },
    { code: "function learn() {", color: "#31827a", delay: "0.5s", top: "20%", right: "8%" },
    { code: "  return success;", color: "#31827a", delay: "1s", top: "35%", left: "3%" },
    { code: "@keyframes grow {", color: "#31827a", delay: "1.5s", top: "50%", right: "5%" },
    { code: "const future = await", color: "#31827a", delay: "2s", top: "65%", left: "7%" },
    { code: "  skills.map(s =>", color: "#31827a", delay: "2.5s", top: "75%", right: "10%" },
    { code: "});", color: "#31827a", delay: "3s", top: "85%", left: "4%" },
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
          className="absolute top-0 text-[#31827a] font-mono text-xs animate-matrix-fall"
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

// Features Data - brand palette only (#31827a / #31827a)
const features = [
  {
    icon: Shield,
    title: "Cybersecurity Training",
    description: "Learn ethical hacking, network security, and protect digital assets with hands-on labs.",
    gradient: "#31827a",
    pattern: "🛡️",
  },
  {
    icon: Code,
    title: "Hands-On Coding",
    description: "Build real projects with HTML, CSS, JavaScript, Python and more modern technologies.",
    gradient: "#31827a",
    pattern: "</>",
  },
  {
    icon: Target,
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed analytics and achievement badges.",
    gradient: "from-[#31827a] to-[#6ef01a]",
    pattern: "📊",
  },
  {
    icon: Users,
    title: "1-on-1 Mentoring",
    description: "Get personalized guidance from industry experts who care about your success.",
    gradient: "#31827a",
    pattern: "👨‍🏫",
  },
  {
    icon: Monitor,
    title: "Live Sessions",
    description: "Join interactive live classes and workshops with real-time Q&A support.",
    gradient: "#31827a",
    pattern: "🎥",
  },
  {
    icon: GraduationCap,
    title: "Certified Learning",
    description: "Earn recognized certificates upon completion to boost your career prospects.",
    gradient: "from-[#31827a] to-[#6ef01a]",
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
      <div className="relative rounded-2xl overflow-hidden border border-[#31827a]/20 shadow-2xl shadow-[#31827a]/15 bg-[#000000]">
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
                        : '<span class="inline-block w-2 h-4 md:h-5 bg-[#31827a] ml-0.5 animate-pulse rounded-sm"></span>'),
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
              <div className={`w-2 h-2 rounded-full ${isComplete ? "bg-[#31827a]" : "bg-[#31827a] animate-pulse"}`} />
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
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#31827a] rounded-full opacity-25 blur-2xl animate-pulse pointer-events-none" />
      <div
        className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#31827a] rounded-full opacity-20 blur-2xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 -right-8 w-16 h-16 bg-[#31827a] rounded-full opacity-15 blur-xl animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}
      />
    </div>
  )
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
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

  return (
    <div className="min-h-screen bg-[#f8faff]">
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
      `}</style>

      <Navbar />

      {/* Hero Section - animated background: skills + AI, smooth effects */}
      <section className="relative overflow-hidden bg-[#fcf6f0]">
        {/* Animated background layer - skills embedded with AI, smooth smoothing */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
          {/* Smooth drifting gradient mesh */}
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 20% 40%, rgba(49,130,122,0.08) 0%, transparent 50%),
                radial-gradient(ellipse 60% 70% at 80% 60%, rgba(247,140,107,0.06) 0%, transparent 50%),
                radial-gradient(ellipse 70% 40% at 50% 80%, rgba(1,107,98,0.05) 0%, transparent 45%),
                linear-gradient(135deg, #fcf6f0 0%, #f8f2ec 50%, #fcf6f0 100%)
              `,
              backgroundSize: "200% 200%",
              animation: "hero-gradient-drift 18s ease-in-out infinite",
            }}
          />
          {/* Soft orbs - AI / skills glow */}
          <div
            className="absolute w-[320px] h-[320px] rounded-full blur-[80px]"
            style={{
              left: "10%",
              top: "20%",
              background: "rgba(49,130,122,0.2)",
              animation: "hero-orb-float-1 12s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[280px] h-[280px] rounded-full blur-[70px]"
            style={{
              right: "15%",
              top: "30%",
              background: "rgba(247,140,107,0.15)",
              animation: "hero-orb-float-2 14s ease-in-out infinite 1s",
            }}
          />
          <div
            className="absolute w-[240px] h-[240px] rounded-full blur-[60px]"
            style={{
              left: "50%",
              bottom: "15%",
              background: "rgba(1,107,98,0.12)",
              transform: "translateX(-50%)",
              animation: "hero-orb-float-3 16s ease-in-out infinite 0.5s",
            }}
          />
          {/* Subtle grid - skills / AI network feel */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(49,130,122,0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(49,130,122,0.4) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
              animation: "hero-grid-pulse 8s ease-in-out infinite",
            }}
          />
          {/* Tech pattern - wax soconayo, aan culseen, aan sifican u muqan */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 27px,
                rgba(49,130,122,0.035) 27px,
                rgba(49,130,122,0.035) 28px
              )`,
              backgroundSize: "100% 56px",
              animation: "hero-tech-lines-flow 24s linear infinite",
              opacity: 0.85,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(1,107,98,0.12) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
              animation: "hero-tech-dots-fade 10s ease-in-out infinite",
            }}
          />
          {/* Pattern gadaal ku warego - moving background pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(105deg, transparent, transparent 28px, rgba(49,130,122,0.5) 28px, rgba(49,130,122,0.5) 29px),
                repeating-linear-gradient(75deg, transparent, transparent 28px, rgba(1,107,98,0.35) 28px, rgba(1,107,98,0.35) 29px)
              `,
              backgroundSize: "60px 120px",
              animation: "hero-pattern-wareg 30s linear infinite",
            }}
          />
          {/* Smooth shine sweep - cajiib effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute inset-y-0 w-[60%] bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                filter: "blur(50px)",
                animation: "hero-shine-sweep 20s ease-in-out infinite 2s",
              }}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 pt-12 pb-8 md:pt-16 md:pb-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Headline - English only, no circle shape */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#31827a] mb-4 leading-tight">
              Microlearning. Easy Learning —{" "}
              <span className="text-[#f78c6b]">amazing</span> results.
            </h1>
            <p className="text-base md:text-lg text-[#31827a] mb-6 max-w-2xl mx-auto">
              Short lessons, easy learning. Build real skills step by step — amazing progress.
            </p>
            <p className="text-sm font-medium text-[#f78c6b] mb-8 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#f78c6b]" />
              30 Days free trial
            </p>

            {/* Search Bar - light beige bg, teal button */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-14">
              <Input
                type="search"
                placeholder="Search Here"
                className="flex-1 h-14 px-6 rounded-2xl border-2 border-[#fcf6f0] bg-white text-[#333333] placeholder:text-[#4A4A4A] text-base focus:border-[#31827a] focus:ring-[rgba(49,130,122,0.2)] focus:bg-white"
              />
              <Button
                size="lg"
                className="h-14 px-8 rounded-2xl bg-[#fcad21] text-[#1a1a1a] font-semibold text-base hover:bg-[#e69d1e] shadow-md"
                asChild
              >
                <a href="/videos" className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search
                </a>
              </Button>
            </div>

            {/* 2 cards: 3D Microlearning + Quick Skill - mouse + scroll */}
            <div
              ref={heroCardsRef}
              className="flex flex-col sm:flex-row justify-center items-center gap-8 md:gap-12 mb-14 min-h-[300px]"
              style={{ perspective: "1400px" }}
            >
              {/* Card 1: Microlearning - 3D teal */}
              <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 15, scale: 0.95 }}
                animate={
                  heroCardsInView
                    ? {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        scale: 1,
                        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                      }
                    : {}
                }
                whileHover={{
                  y: -16,
                  scale: 1.02,
                  z: 24,
                  transition: { duration: 0.25 },
                }}
                style={{
                  rotateY: (mousePosition.x - 960) * 0.028,
                  rotateX: (mousePosition.y - 400) * -0.02,
                  y: Math.min(scrollY * 0.07, 20),
                  transformStyle: "preserve-3d",
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.07), 0 12px 24px rgba(53,128,121,0.25), 0 24px 48px rgba(53,128,121,0.2), 0 0 0 1px rgba(0,0,0,0.03)",
                }}
                className="group relative flex-1 min-w-0 max-w-[380px] rounded-2xl bg-[#358079] border border-[#2d6d66]/80 p-6 md:p-8 text-left overflow-visible"
              >
                {/* 3D bottom edge - card thickness */}
                <div
                  className="absolute left-2 right-2 bottom-0 h-3 rounded-b-2xl"
                  style={{
                    background: "linear-gradient(180deg, #2a6962 0%, #1f4d48 100%)",
                    transform: "translateY(100%) translateZ(-12px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  aria-hidden
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-white/10 rounded-2xl" style={{ transform: "translateZ(1px)" }} />
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={heroCardsInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                  className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center mb-5 text-white shadow-lg"
                  style={{ transform: "translateZ(8px)" }}
                >
                  <PlayCircle className="w-8 h-8" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight" style={{ transform: "translateZ(6px)" }}>Microlearning</h3>
                <p className="text-sm text-white/95 leading-relaxed" style={{ transform: "translateZ(4px)" }}>
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

              {/* Card 2: Quick Skill - 3D light */}
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
                  y: -16,
                  scale: 1.02,
                  z: 24,
                  transition: { duration: 0.25 },
                }}
                style={{
                  rotateY: (mousePosition.x - 960) * -0.028,
                  rotateX: (mousePosition.y - 400) * 0.02,
                  y: Math.min(scrollY * 0.05, 16),
                  transformStyle: "preserve-3d",
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.05), 0 12px 28px rgba(0,0,0,0.08), 0 24px 56px rgba(53,128,121,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
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
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[rgba(53,128,121,0.06)] rounded-2xl" style={{ transform: "translateZ(1px)" }} />
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={heroCardsInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.32, type: "spring", stiffness: 220 }}
                  className="w-16 h-16 rounded-2xl bg-[rgba(53,128,121,0.15)] flex items-center justify-center mb-5 text-[#358079]"
                  style={{ transform: "translateZ(8px)" }}
                >
                  <Zap className="w-8 h-8" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#358079] mb-3 tracking-tight" style={{ transform: "translateZ(6px)" }}>Quick Skill</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed" style={{ transform: "translateZ(4px)" }}>
                  Build real skills in 5–10 minutes. Focused topics, clear progress, no overload.
                </p>
                <motion.span
                  className="inline-flex items-center gap-1 mt-5 text-xs font-semibold text-[#358079]/90 tracking-wide"
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

      {/* Packages / Pricing - amazing pricing cards */}
      <PackagesPricingSection />

      {/* Microlearning Section - Primary #10453f, Accent #66cc9a */}
      <MicrolearningSection />

      {/* Student Reviews - amazing, qurxoon, cajiib */}
      <StudentReviewsSection />

      {/* Footer */}
      <footer className="bg-[#31827a] text-white pt-20 pb-10 border-t border-white/10">
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
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#31827a]/30 transition-colors cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-white/60 hover:text-[#31827a]" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Learn</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
                    Web Development
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
                    Cybersecurity
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
                    Programming
                  </a>
                </li>
                <li>
                  <a href="/bootcamp" className="hover:text-[#31827a] transition-colors">
                    Bootcamp Program
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Platform</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
                    For Teachers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
                    For Students
                  </a>
                </li>
                <li>
                  <a href="/videos" className="hover:text-[#31827a] transition-colors">
                    Video Library
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
                    Progress Tracking
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#31827a] transition-colors">
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
