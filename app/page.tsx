"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { CourseCard } from "@/components/course-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Users, Award, TrendingUp } from "lucide-react"

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="relative bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8c] to-[#1e3a5f] text-white py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#ef4444] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo Showcase */}
            <div className="mb-8 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
                <img
                  src="/images/white-logo.png"
                  alt="Markano Online Learning"
                  className="h-16 md:h-20 w-auto mx-auto"
                />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
              Master New Skills with <br />
              <span className="text-[#ef4444] inline-block mt-2">Markano Online Learning</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 text-pretty max-w-3xl mx-auto leading-relaxed">
              Transform your future with world-class courses in web development, programming, and design. Learn from
              industry experts and build real-world projects.
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ef4444] to-[#dc2626] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="What do you want to learn today?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 pr-6 h-16 text-lg bg-white text-gray-900 border-0 shadow-2xl rounded-2xl focus:ring-2 focus:ring-[#ef4444]"
                  />
                </div>
              </div>
            </div>

            {/* Stats with Icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <div className="group hover:scale-105 transition-transform">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-[#ef4444] group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold">{courses.length}</div>
                  <div className="text-sm text-gray-300 mt-1">Courses</div>
                </div>
              </div>
              <div className="group hover:scale-105 transition-transform">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Users className="h-12 w-12 mx-auto mb-3 text-[#ef4444] group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold">2,500+</div>
                  <div className="text-sm text-gray-300 mt-1">Students</div>
                </div>
              </div>
              <div className="group hover:scale-105 transition-transform">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Award className="h-12 w-12 mx-auto mb-3 text-[#ef4444] group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold">98%</div>
                  <div className="text-sm text-gray-300 mt-1">Success Rate</div>
                </div>
              </div>
              <div className="group hover:scale-105 transition-transform">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-[#ef4444] group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold">4.8</div>
                  <div className="text-sm text-gray-300 mt-1">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#ef4444]/10 px-4 py-2 rounded-full mb-4">
              <BookOpen className="h-5 w-5 text-[#ef4444]" />
              <span className="text-[#ef4444] font-semibold">Our Courses</span>
            </div>
            <h2 className="text-5xl font-bold text-[#1e3a5f] mb-6 text-balance">Explore Our Popular Courses</h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto text-pretty">
              Choose from our most popular courses and start your learning journey today. Each course is designed by
              experts to help you succeed.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ef4444] border-r-transparent"></div>
              <p className="text-gray-500 mt-6 text-lg">Loading amazing courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl">
                {searchQuery ? `No courses found matching "${searchQuery}"` : "No courses available"}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ef4444] rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 inline-block mb-6">
              <img src="/images/white-logo.png" alt="Markano" className="h-12 w-auto" />
            </div>
            <h2 className="text-5xl font-bold mb-6 text-balance">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto text-pretty leading-relaxed">
              Join thousands of students already transforming their careers with Markano. Register today and unlock your
              potential!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white text-lg px-10 py-6 rounded-xl shadow-2xl hover:shadow-[#ef4444]/50 transition-all hover:scale-105"
                asChild
              >
                <a href="/register">Register Now</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white text-lg px-10 py-6 rounded-xl backdrop-blur-sm"
                asChild
              >
                <a href="/hybrid-learning">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <img src="/images/white-logo.png" alt="Markano" className="h-10 mb-6" />
              <p className="text-gray-400 leading-relaxed">
                Empowering learners worldwide with quality education and industry-relevant skills.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Courses</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    Web Development
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    Programming
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    Design
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    Data Science
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/hybrid-learning" className="hover:text-[#ef4444] transition-colors">
                    Hybrid Learning
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ef4444] transition-colors">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 Markano Online Learning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
