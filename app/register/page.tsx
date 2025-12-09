"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addStudent, getCourses } from "@/lib/data"
import { CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    course: "",
    startDate: "",
  })

  const courses = getCourses()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.course || !formData.startDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    // Save to localStorage
    addStudent(formData)

    setSubmitted(true)
    toast({
      title: "Success!",
      description: "Your registration has been submitted successfully.",
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Welcome to Markano! We've received your registration for{" "}
              <strong>{courses.find((c) => c.id === formData.course)?.title}</strong>.
            </p>
            <p className="text-gray-600 mb-6">
              You'll receive an email confirmation shortly with details about accessing your course.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => (window.location.href = `/course/${formData.course}`)}
                className="w-full bg-[#ef4444] hover:bg-[#dc2626]"
              >
                Start Learning
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Start Your Learning Journey</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Register now and get access to world-class courses taught by industry experts
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">Student Registration</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="course">Select Course *</Label>
                <Select value={formData.course} onValueChange={(value) => handleChange("course", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Preferred Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white text-lg py-6">
                Complete Registration
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  )
}
