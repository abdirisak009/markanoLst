"use client"

import { useEffect, useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

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
          className="absolute top-0 text-[#e63946] font-mono text-xs animate-matrix-fall"
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

// Features Data
const features = [
  {
    icon: Shield,
    title: "Cybersecurity Training",
    description: "Learn ethical hacking, network security, and protect digital assets with hands-on labs.",
    gradient: "from-red-500 to-orange-500",
    pattern: "🛡️",
  },
  {
    icon: Code,
    title: "Hands-On Coding",
    description: "Build real projects with HTML, CSS, JavaScript, Python and more modern technologies.",
    gradient: "from-blue-500 to-cyan-500",
    pattern: "</>",
  },
  {
    icon: Target,
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed analytics and achievement badges.",
    gradient: "from-green-500 to-emerald-500",
    pattern: "📊",
  },
  {
    icon: Users,
    title: "1-on-1 Mentoring",
    description: "Get personalized guidance from industry experts who care about your success.",
    gradient: "from-purple-500 to-pink-500",
    pattern: "👨‍🏫",
  },
  {
    icon: Monitor,
    title: "Live Sessions",
    description: "Join interactive live classes and workshops with real-time Q&A support.",
    gradient: "from-yellow-500 to-orange-500",
    pattern: "🎥",
  },
  {
    icon: GraduationCap,
    title: "Certified Learning",
    description: "Earn recognized certificates upon completion to boost your career prospects.",
    gradient: "from-indigo-500 to-purple-500",
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
      {/* Terminal Window */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-[#e63946]/20 bg-[#0a0a0f]">
        {/* Terminal Header */}
        <div className="bg-[#0a0a0f] px-4 py-3 flex items-center gap-3 border-b border-white/10">
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
                        : '<span class="inline-block w-2 h-4 md:h-5 bg-[#e63946] ml-0.5 animate-pulse rounded-sm"></span>'),
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
        <div className="bg-gradient-to-r from-[#1a1f2e] to-[#252d3d] px-4 py-2 flex items-center justify-between border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isComplete ? "bg-[#28ca42]" : "bg-[#e63946] animate-pulse"}`} />
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
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#e63946] to-[#ff6b6b] rounded-full opacity-20 blur-2xl animate-pulse pointer-events-none" />
      <div
        className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full opacity-20 blur-2xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-15 blur-xl animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}
      />
    </div>
  )
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Scroll animation refs
  const statsAnim = useScrollAnimation()
  const featuresAnim = useScrollAnimation()
  const ctaAnim = useScrollAnimation()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
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
          0%, 100% { box-shadow: 0 0 20px rgba(230, 57, 70, 0.3); }
          50% { box-shadow: 0 0 40px rgba(230, 57, 70, 0.6); }
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f]">
        {/* Animated Background Elements */}
        <FloatingCodeLines />
        <MatrixRain />

        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#e63946]/30 to-transparent animate-scan-line" />
        </div>

        {/* Glowing Orb that follows mouse */}
        <div
          className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-1000 ease-out"
          style={{
            background: "radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%)",
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            filter: "blur(40px)",
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#e63946 1px, transparent 1px), linear-gradient(90deg, #e63946 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full mb-8 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-white/80 font-medium">Somalia's #1 Tech Education Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Empowering
              <span className="relative inline-block mx-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] to-[#ff6b6b]">
                  Teachers
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#e63946] to-[#ff6b6b] rounded-full" />
              </span>
              <br className="hidden md:block" />
              <span className="text-white">&</span>
              <span className="relative inline-block mx-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] to-[#06b6d4]">
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

            {/* CTA Buttons - Removed Start Learning button, kept only Watch Tutorials */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
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
      <section ref={statsAnim.ref} className="py-20 bg-[#0a0a0f] relative">
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

      {/* Interactive Code Learning Section */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0f] to-[#0f1419] relative overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(230, 57, 70, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(230, 57, 70, 0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Floating Code Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["<div>", "</>", "{...}", "()", "=>", "const", "async", "[]"].map((text, i) => (
            <div
              key={i}
              className="absolute text-[#e63946]/10 font-mono text-2xl md:text-4xl font-bold animate-float"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`,
              }}
            >
              {text}
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e63946]/10 rounded-full border border-[#e63946]/20">
                <Code className="w-4 h-4 text-[#e63946]" />
                <span className="text-sm font-bold text-[#e63946] uppercase tracking-wider">Learn by Coding</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                Code Along
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] to-[#22d3ee]">
                  Build Real Projects
                </span>
              </h2>

              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Our interactive lessons let you write real code from day one. Watch your progress as you build amazing
                projects and master programming skills.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Terminal, text: "Interactive code editor", desc: "Write and run code instantly" },
                  { icon: Layers, text: "Step-by-step guidance", desc: "Learn at your own pace" },
                  { icon: Zap, text: "Instant feedback", desc: "See results immediately" },
                  { icon: Award, text: "Earn certificates", desc: "Showcase your skills" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-[#e63946]/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-[#e63946]/20">
                      <item.icon className="w-5 h-5 text-[#e63946]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold group-hover:text-[#e63946] transition-colors">
                        {item.text}
                      </h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-[#e63946]/25 hover:shadow-[#e63946]/40 transition-all hover:scale-105">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Coding Now
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-xl bg-transparent"
                >
                  View Curriculum
                </Button>
              </div>
            </div>

            {/* Right - Code Editor */}
            <div className="relative">
              <TypewriterCode />

              {/* Stats Badges */}
              <div className="absolute -bottom-6 -left-6 bg-[#0a0a0f] rounded-xl px-4 py-3 border border-white/10 shadow-xl hidden md:flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">2,500+</div>
                  <div className="text-gray-500 text-xs">Students Learning</div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-[#1e293b] rounded-xl px-4 py-3 border border-white/10 shadow-xl hidden md:flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">50+</div>
                  <div className="text-gray-500 text-xs">Coding Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresAnim.ref} className="py-24 bg-[#0a0a0f] relative overflow-hidden">
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
                className={`group relative p-8 rounded-3xl bg-[#0a0a0f] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 scroll-fade-up stagger-${index + 1} ${featuresAnim.isVisible ? "visible" : ""}`}
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

      {/* CTA Section */}
      <section
        ref={ctaAnim.ref}
        className="relative py-32 overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f]"
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
      <footer className="bg-[#0a0a0f] text-white pt-20 pb-10 border-t border-white/10">
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
