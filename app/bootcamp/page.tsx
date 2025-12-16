"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Users,
  Code,
  Laptop,
  Trophy,
  CheckCircle2,
  Clock,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
} from "lucide-react"

export default function BootcampPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cohort: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registration submitted:", formData)
    // Handle registration
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative bg-[#253c5d] text-white min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#ee294f]/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-[#253c5d]/40 rounded-full blur-3xl animate-pulse-slow [animation-delay:2s]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-br from-[#ee294f]/5 to-[#253c5d]/5 rounded-full blur-3xl"></div>
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full mb-8 border border-white/10">
              <Sparkles className="h-4 w-4 text-[#ee294f]" />
              <span className="text-sm font-semibold">6-Month Intensive • 3 Cohorts • Certificate Included</span>
            </div>

            {/* Main heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.05] tracking-tight">
              Web Development
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ee294f] via-pink-500 to-[#ee294f]">
                Bootcamp
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Transform your career with intensive training in modern web development
            </p>

            <div className="flex items-center justify-center gap-6 mb-14">
              <div className="text-sm text-gray-500 font-medium">In partnership with</div>
            </div>
            <div className="flex items-center justify-center gap-8 mb-14">
              <div className="px-8 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <Image
                  src="/images/penn-logo.png"
                  alt="Penn Creative Lab"
                  width={140}
                  height={45}
                  className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="text-3xl text-gray-600">×</div>
              <div className="px-8 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <Image
                  src="/images/biu-logo.png"
                  alt="Banaadir Innovation Hub"
                  width={140}
                  height={45}
                  className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-slate-950 hover:bg-gray-100 text-lg px-10 h-16 rounded-full font-semibold shadow-2xl shadow-white/10 group"
                onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 text-lg px-10 h-16 rounded-full font-semibold backdrop-blur-sm"
                onClick={() => document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Curriculum
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-[#253c5d] via-slate-900 to-background relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-[#ee294f]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-72 h-72 bg-[#ee294f]/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: Calendar,
                value: "6",
                label: "Months",
                sublabel: "Intensive Training",
                gradient: "from-[#ee294f]/20 to-[#ee294f]/5",
              },
              {
                icon: Users,
                value: "3",
                label: "Cohorts",
                sublabel: "Structured Path",
                gradient: "from-purple-500/20 to-purple-500/5",
              },
              {
                icon: Code,
                value: "120+",
                label: "Hours",
                sublabel: "Learning Time",
                gradient: "from-blue-500/20 to-blue-500/5",
              },
              {
                icon: Trophy,
                value: "95%",
                label: "Success",
                sublabel: "Completion Rate",
                gradient: "from-emerald-500/20 to-emerald-500/5",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 hover:border-[#ee294f]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#ee294f]/20 hover:-translate-y-2"
              >
                {/* Animated gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  {/* Icon with animated background */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#ee294f]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-[#ee294f] to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <stat.icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Stats value */}
                  <div className="text-6xl font-black mb-3 bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-base font-bold text-white mb-2 tracking-wide">{stat.label}</div>

                  {/* Sublabel */}
                  <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {stat.sublabel}
                  </div>

                  {/* Decorative line */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-[#ee294f] to-transparent group-hover:w-3/4 transition-all duration-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Additional trust indicator */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ee294f] to-purple-500 border-2 border-[#253c5d]"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-300">
                Join <span className="text-white font-bold">500+</span> students already enrolled
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#253c5d] mb-4">Why Choose Our Bootcamp?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry-leading curriculum designed by experts from Penn Creative Lab and Banaadir Innovation Hub
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from industry professionals with years of real-world experience in web development
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Laptop className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Hands-On Projects</h3>
              <p className="text-gray-600">
                Build real-world applications and create an impressive portfolio to showcase your skills
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Career Support</h3>
              <p className="text-gray-600">
                Get career guidance, resume reviews, and job placement assistance after graduation
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Certificate of Completion</h3>
              <p className="text-gray-600">
                Earn a recognized certificate from Penn Creative Lab and Banaadir Innovation Hub
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Modern Tech Stack</h3>
              <p className="text-gray-600">
                Learn the latest technologies and frameworks used by top tech companies worldwide
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Flexible Learning</h3>
              <p className="text-gray-600">
                Balance learning with your schedule through our hybrid online and in-person sessions
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24" id="curriculum">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ee294f]/10 rounded-full mb-6">
              <Code className="h-4 w-4 text-[#ee294f]" />
              <span className="text-sm font-semibold text-[#ee294f]">CURRICULUM</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Three-phase learning path</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master web development from fundamentals to full-stack expertise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="p-8 hover:shadow-xl transition-shadow border-2 hover:border-[#ee294f] bg-white">
              <div className="h-16 w-16 rounded-2xl bg-[#ee294f]/10 flex items-center justify-center mb-6">
                <Laptop className="h-8 w-8 text-[#ee294f]" />
              </div>
              <h3 className="text-2xl font-bold text-[#253c5d] mb-3">Cohort 1: Frontend Basics</h3>
              <p className="text-gray-600 mb-6">Master the fundamentals of web development</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">HTML5 & CSS3 Fundamentals</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">JavaScript ES6+</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Responsive Design & Flexbox/Grid</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Version Control with Git</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Bootstrap & Tailwind CSS</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Months 1-2</span>
                </div>
              </div>
            </Card>

            {/* Cohort 2 */}
            <Card className="p-8 hover:shadow-xl transition-shadow border-2 hover:border-[#ee294f] bg-white">
              <div className="h-16 w-16 rounded-2xl bg-[#ee294f]/10 flex items-center justify-center mb-6">
                <Code className="h-8 w-8 text-[#ee294f]" />
              </div>
              <h3 className="text-2xl font-bold text-[#253c5d] mb-3">Cohort 2: Frontend Advanced</h3>
              <p className="text-gray-600 mb-6">Build modern, interactive web applications</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">React.js & Component Architecture</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">State Management (Redux, Context API)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Next.js & Server-Side Rendering</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">TypeScript Fundamentals</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">RESTful APIs & Fetch/Axios</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Months 3-4</span>
                </div>
              </div>
            </Card>

            {/* Cohort 3 */}
            <Card className="p-8 hover:shadow-xl transition-shadow border-2 hover:border-[#ee294f] bg-white">
              <div className="h-16 w-16 rounded-2xl bg-[#ee294f]/10 flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-[#ee294f]" />
              </div>
              <h3 className="text-2xl font-bold text-[#253c5d] mb-3">Cohort 3: Backend & Full-Stack</h3>
              <p className="text-gray-600 mb-6">Complete full-stack developer journey</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Node.js & Express.js</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Database Design (PostgreSQL/MongoDB)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Authentication & Authorization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">API Development & Testing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ee294f] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Deployment & DevOps Basics</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Months 5-6</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#253c5d] mb-4">Why Choose Our Bootcamp?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry-leading curriculum designed by experts from Penn Creative Lab and Banaadir Innovation Hub
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from industry professionals with years of real-world experience in web development
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Laptop className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Hands-On Projects</h3>
              <p className="text-gray-600">
                Build real-world applications and create an impressive portfolio to showcase your skills
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Career Support</h3>
              <p className="text-gray-600">
                Get career guidance, resume reviews, and job placement assistance after graduation
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Certificate of Completion</h3>
              <p className="text-gray-600">
                Earn a recognized certificate from Penn Creative Lab and Banaadir Innovation Hub
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Modern Tech Stack</h3>
              <p className="text-gray-600">
                Learn the latest technologies and frameworks used by top tech companies worldwide
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#ee294f]/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[#ee294f]" />
              </div>
              <h3 className="text-xl font-semibold text-[#253c5d] mb-2">Flexible Learning</h3>
              <p className="text-gray-600">
                Balance learning with your schedule through our hybrid online and in-person sessions
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50" id="registration">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-[#253c5d] mb-4">Start Your Journey Today</h2>
              <p className="text-xl text-gray-600">Fill out the form below to apply for the next bootcamp cohort</p>
            </div>

            <Card className="p-8 border-2 bg-white shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium text-[#253c5d] mb-2">Full Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-[#253c5d] mb-2">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-[#253c5d] mb-2">Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="+252 XXX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-[#253c5d] mb-2">Select Cohort</Label>
                  <select
                    value={formData.cohort}
                    onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                    required
                    className="w-full h-12 px-3 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="">Select a cohort</option>
                    <option value="cohort1">Cohort 1: Frontend Basics</option>
                    <option value="cohort2">Cohort 2: Frontend Advanced</option>
                    <option value="cohort3">Cohort 3: Backend & Full-Stack</option>
                  </select>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-[#253c5d] mb-2">
                    Why do you want to join? (Optional)
                  </Label>
                  <Textarea
                    placeholder="Tell us more about your interest"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="h-32"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#ee294f] hover:bg-[#d91d43] text-white text-lg h-14 rounded-xl font-semibold shadow-lg"
                >
                  Submit Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <section className="relative py-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ef4444]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Ready to become a developer?
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join our next bootcamp cohort and transform your career in just 6 months
            </p>
            <Button
              size="lg"
              className="bg-white text-slate-950 hover:bg-gray-100 text-lg px-10 h-16 rounded-full font-semibold shadow-2xl shadow-white/10 group"
              onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
            >
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-white pt-20 pb-10 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-3">Start Your Web Development Journey</h3>
            <p className="text-gray-400 text-lg">Join the next generation of developers</p>
          </div>
          <div className="flex items-center justify-center gap-12 mb-8 flex-wrap">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
              <GraduationCap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Penn Creative Lab</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
              <Zap className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-medium">Banaadir Innovation Hub</span>
            </div>
          </div>
          <p className="text-gray-500">&copy; 2025 Web Development Bootcamp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
