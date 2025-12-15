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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8c] to-[#1e3a5f] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#ef4444] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Master New Skills with <span className="text-[#ef4444]">Markano</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 text-pretty">
              Learn web development, programming, and design from industry experts. Build your future with our
              comprehensive online courses.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-12">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="What do you want to learn today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-white text-gray-900 border-0 shadow-xl"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <BookOpen className="h-10 w-10 mx-auto mb-2 text-[#ef4444]" />
                <div className="text-3xl font-bold">{courses.length}</div>
                <div className="text-sm text-gray-300">Courses</div>
              </div>
              <div className="text-center">
                <Users className="h-10 w-10 mx-auto mb-2 text-[#ef4444]" />
                <div className="text-3xl font-bold">2,500+</div>
                <div className="text-sm text-gray-300">Students</div>
              </div>
              <div className="text-center">
                <Award className="h-10 w-10 mx-auto mb-2 text-[#ef4444]" />
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-gray-300">Success Rate</div>
              </div>
              <div className="text-center">
                <TrendingUp className="h-10 w-10 mx-auto mb-2 text-[#ef4444]" />
                <div className="text-3xl font-bold">4.8</div>
                <div className="text-sm text-gray-300">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1e3a5f] mb-4">Popular Courses</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose from our most popular courses and start your learning journey today
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ef4444] border-r-transparent"></div>
              <p className="text-gray-500 mt-4">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
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
      </section>

      {/* CTA Section */}
      <section className="bg-[#1e3a5f] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning on Markano. Register today and get started!
          </p>
          <Button size="lg" className="bg-[#ef4444] hover:bg-[#dc2626] text-white text-lg px-8" asChild>
            <a href="/register">Register Now</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/images/white-logo.png" alt="Markano" className="h-8 mb-4" />
              <p className="text-gray-400">Empowering learners worldwide with quality education.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Courses</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Web Development
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Programming
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Design
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/hybrid-learning" className="hover:text-white">
                    Hybrid Learning
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Markano. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
