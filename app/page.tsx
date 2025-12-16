"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { CourseCard } from "@/components/course-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Users, Award, TrendingUp, ArrowRight, Sparkles, PlayCircle } from "lucide-react"

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

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

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

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative bg-[#253c5d] text-white min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#ee294f]/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 -right-48 w-[600px] h-[600px] bg-[#253c5d]/40 rounded-full blur-3xl animate-pulse-slow [animation-delay:1.5s]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#ee294f]/5 to-[#253c5d]/5 rounded-full blur-3xl"></div>
        </div>

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <Sparkles className="h-4 w-4 text-[#ee294f]" />
                <span className="text-sm font-medium">Somalia's Leading Online Learning Platform</span>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-center leading-[1.1] tracking-tight">
              Master the web.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                Build your future.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 text-center max-w-3xl mx-auto leading-relaxed">
              Transform your career with industry-leading courses in web development, programming, and design. Learn
              from experts and build real-world projects.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                size="lg"
                className="bg-white text-slate-950 hover:bg-gray-100 text-lg px-8 h-14 rounded-full font-semibold group shadow-xl shadow-white/10"
                asChild
              >
                <a href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 text-lg px-8 h-14 rounded-full font-semibold backdrop-blur-sm"
                asChild
              >
                <a href="#courses" className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Explore Courses
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: BookOpen, value: courses.length || "50+", label: "Expert Courses" },
                { icon: Users, value: "2,500+", label: "Active Students" },
                { icon: Award, value: "98%", label: "Success Rate" },
                { icon: TrendingUp, value: "4.8/5", label: "Avg Rating" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <stat.icon className="h-8 w-8 mb-3 text-[#ee294f] group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-[#253c5d] via-slate-900 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <Input
                type="search"
                placeholder="What do you want to learn today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-16 h-16 text-lg bg-white/10 backdrop-blur-sm text-white placeholder:text-gray-400 border-white/20 rounded-2xl shadow-2xl shadow-black/20 focus-visible:ring-[#ee294f]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20" id="courses">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ee294f]/10 rounded-full mb-4">
                <BookOpen className="h-4 w-4 text-[#ee294f]" />
                <span className="text-sm font-semibold text-[#ee294f]">POPULAR COURSES</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Start learning today</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Browse our most popular courses and start your learning journey
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ee294f] border-r-transparent"></div>
                <p className="text-muted-foreground mt-6 text-lg">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-xl">
                  {searchQuery ? `No courses found matching "${searchQuery}"` : "No courses available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-32 overflow-hidden bg-[#253c5d]">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ee294f]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#253c5d]/40 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Ready to start your journey?
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of students already learning on Markano. Register today and unlock your potential.
            </p>
            <Button
              size="lg"
              className="bg-[#ee294f] hover:bg-[#d91d43] text-white text-lg px-10 h-16 rounded-full font-semibold shadow-2xl shadow-[#ee294f]/20 group"
              asChild
            >
              <a href="/register">
                Start Learning Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-[#253c5d] text-white pt-20 pb-10 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <img src="/images/white-logo.png" alt="Markano" className="h-10 mb-6" />
              <p className="text-gray-400 leading-relaxed">
                Empowering learners across Somalia with world-class education and skills development.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Learn</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Web Development
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Programming
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Design
                  </a>
                </li>
                <li>
                  <a href="/bootcamp" className="hover:text-white transition-colors">
                    Bootcamp Program
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Company</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/hybrid-learning" className="hover:text-white transition-colors">
                    Hybrid Learning
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-10 text-center">
            <p className="text-gray-500">&copy; 2025 Markano. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
