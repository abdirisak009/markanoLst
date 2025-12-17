"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  ShoppingBag,
  Users,
  ArrowRight,
  Sparkles,
  Store,
  TrendingUp,
  Package,
  Target,
  Globe,
  Megaphone,
  Calendar,
  CheckCircle2,
  Shield,
  AlertCircle,
  Loader2,
  ShoppingCart,
  CreditCard,
  Truck,
  BarChart3,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import Image from "next/image"

interface Group {
  id: number
  name: string
  class_name: string
  leader_student_id: string
}

export default function EcommerceWizardLanding() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  const [leaderId, setLeaderId] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups")
      if (res.ok) {
        const data = await res.json()
        setGroups(data)
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.class_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId)
    const group = groups.find((g) => g.id.toString() === groupId)
    setSelectedGroup(group || null)
    // Reset verification when group changes
    setIsVerified(false)
    setVerificationError("")
    setLeaderId("")
  }

  const handleVerifyLeader = async () => {
    if (!leaderId.trim()) {
      setVerificationError("Please enter your Student ID")
      return
    }

    if (!selectedGroup) {
      setVerificationError("Please select a group first")
      return
    }

    setVerifying(true)
    setVerificationError("")

    try {
      const res = await fetch("/api/ecommerce-wizard/verify-leader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroupId,
          studentId: leaderId.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok && data.isLeader) {
        setIsVerified(true)
        setVerificationError("")
      } else {
        setVerificationError(data.message || "You are not authorized. Only the group leader can access this wizard.")
        setIsVerified(false)
      }
    } catch (error) {
      setVerificationError("Verification failed. Please try again.")
      setIsVerified(false)
    } finally {
      setVerifying(false)
    }
  }

  const handleStart = async () => {
    if (!selectedGroupId || !isVerified) return
    setStarting(true)
    // Pass leader ID to wizard page
    router.push(`/ecommerce-wizard/wizard/${selectedGroupId}?leaderId=${encodeURIComponent(leaderId)}`)
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#013565]" />

          {/* E-commerce Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="ecommerce-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="100" height="100" fill="none" />
                  <path d="M25 10 L35 10 L35 30 L25 30 Z" stroke="#e63946" strokeWidth="1" fill="none" />
                  <circle cx="30" cy="35" r="3" stroke="#e63946" strokeWidth="1" fill="none" />
                  <path d="M65 15 L75 15 L80 25 L60 25 Z" stroke="#e63946" strokeWidth="1" fill="none" />
                  <path d="M15 60 L25 50 L35 60 L25 70 Z" stroke="#e63946" strokeWidth="1" fill="none" />
                  <rect x="60" y="55" width="20" height="15" rx="2" stroke="#e63946" strokeWidth="1" fill="none" />
                  <circle cx="65" cy="75" r="5" stroke="#e63946" strokeWidth="1" fill="none" />
                  <circle cx="75" cy="75" r="5" stroke="#e63946" strokeWidth="1" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ecommerce-pattern)" />
            </svg>
          </div>

          {/* Animated Floating Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-[#013565]/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e63946]/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />

          {/* Floating Icons */}
          <div className="absolute top-32 right-[20%] animate-bounce" style={{ animationDuration: "3s" }}>
            <div className="w-12 h-12 bg-[#e63946]/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-[#e63946]/20">
              <ShoppingCart className="w-6 h-6 text-[#e63946]" />
            </div>
          </div>
          <div
            className="absolute bottom-32 left-[15%] animate-bounce"
            style={{ animationDuration: "4s", animationDelay: "0.5s" }}
          >
            <div className="w-12 h-12 bg-[#e63946]/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-[#e63946]/20">
              <CreditCard className="w-6 h-6 text-[#e63946]" />
            </div>
          </div>
          <div
            className="absolute top-1/2 right-[10%] animate-bounce"
            style={{ animationDuration: "3.5s", animationDelay: "1s" }}
          >
            <div className="w-12 h-12 bg-[#e63946]/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-[#e63946]/20">
              <Truck className="w-6 h-6 text-[#e63946]" />
            </div>
          </div>
          <div
            className="absolute bottom-1/3 left-[8%] animate-bounce"
            style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}
          >
            <div className="w-12 h-12 bg-[#e63946]/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-[#e63946]/20">
              <BarChart3 className="w-6 h-6 text-[#e63946]" />
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Markano Logo */}
              <div className="flex items-center gap-3">
                <Image src="/images/markano-logo.png" alt="Markano" width={50} height={50} className="object-contain" />
                <span className="text-white font-bold text-xl">Markano</span>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e63946]/10 border border-[#e63946]/20 animate-pulse">
                <Sparkles className="w-4 h-4 text-[#e63946]" />
                <span className="text-[#e63946] text-sm font-medium">Business Development Tool</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                E-commerce
                <span className="block text-[#e63946] relative">
                  Implementation
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="8"
                    viewBox="0 0 200 8"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 4 Q50 8 100 4 T200 4"
                      stroke="#e63946"
                      strokeWidth="3"
                      fill="none"
                      className="animate-pulse"
                    />
                  </svg>
                </span>
                <span className="text-[#e63946]">Wizard</span>
              </h1>

              <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                Build your complete ecommerce business plan step-by-step. From goals and strategy to product sourcing
                and marketing - we guide you through every stage with{" "}
                <span className="text-[#e63946] font-semibold">Markano's</span> expert methodology.
              </p>

              {/* Stats */}
              <div className="flex gap-8">
                <div className="space-y-1 group">
                  <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">8</div>
                  <div className="text-sm text-gray-500">Guided Steps</div>
                </div>
                <div className="space-y-1 group">
                  <div className="text-3xl font-bold text-[#e63946] group-hover:scale-110 transition-transform">
                    100%
                  </div>
                  <div className="text-sm text-gray-500">Comprehensive</div>
                </div>
                <div className="space-y-1 group">
                  <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">Pro</div>
                  <div className="text-sm text-gray-500">Business Plan</div>
                </div>
              </div>

              {/* Powered by Markano */}
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>Powered by</span>
                <span className="text-[#e63946] font-semibold">Markano</span>
                <span>Learning Platform</span>
              </div>
            </div>

            {/* Right - Group Selection & Leader Verification Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/20 to-[#013565]/20 rounded-3xl blur-xl animate-pulse" />
              <div className="relative bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl border border-[#e63946]/20 p-8 transition-all duration-500 hover:border-[#e63946]/40">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#e63946]/20 rounded-xl">
                    <Users className="w-6 h-6 text-[#e63946]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Select Your Group</h2>
                    <p className="text-sm text-gray-400">Choose your group and verify as leader</p>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-[#e63946]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#e63946]/50 transition-all duration-300"
                  />
                </div>

                {/* Group List */}
                <div className="max-h-48 overflow-y-auto space-y-2 mb-6 scrollbar-thin scrollbar-thumb-[#e63946]/20 scrollbar-track-transparent">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredGroups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No groups found</div>
                  ) : (
                    filteredGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupSelect(group.id.toString())}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] ${
                          selectedGroupId === group.id.toString()
                            ? "bg-[#e63946]/20 border-[#e63946] text-white shadow-lg shadow-[#e63946]/10"
                            : "bg-[#0f172a]/50 border-[#e63946]/10 text-gray-300 hover:border-[#e63946]/30 hover:bg-[#1e293b]/30"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            selectedGroupId === group.id.toString() ? "bg-[#e63946]" : "bg-[#1e293b]"
                          }`}
                        >
                          <Store
                            className={`w-5 h-5 transition-colors ${selectedGroupId === group.id.toString() ? "text-white" : "text-[#e63946]"}`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-gray-500">{group.class_name}</div>
                        </div>
                        {selectedGroupId === group.id.toString() && (
                          <div className="w-6 h-6 bg-[#e63946] rounded-full flex items-center justify-center animate-scale-in">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Leader Verification Section - Only show when group is selected */}
                {selectedGroupId && (
                  <div
                    className={`mb-6 p-4 rounded-xl border transition-all duration-500 ${
                      isVerified
                        ? "bg-green-500/10 border-green-500/30"
                        : verificationError
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-[#0f172a]/50 border-[#e63946]/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className={`w-5 h-5 ${isVerified ? "text-green-500" : "text-[#e63946]"}`} />
                      <span className="text-white font-medium">Leader Verification</span>
                      {isVerified && (
                        <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full animate-pulse">
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 mb-3">
                      Only group leaders can access this wizard. Enter your Student ID to verify.
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter your Student ID..."
                        value={leaderId}
                        onChange={(e) => {
                          setLeaderId(e.target.value)
                          setVerificationError("")
                        }}
                        disabled={isVerified}
                        className={`flex-1 px-4 py-3 bg-[#0f172a] border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                          isVerified
                            ? "border-green-500/30 opacity-50"
                            : verificationError
                              ? "border-red-500/50"
                              : "border-[#e63946]/20 focus:border-[#e63946]/50"
                        }`}
                      />
                      {!isVerified && (
                        <button
                          onClick={handleVerifyLeader}
                          disabled={verifying || !leaderId.trim()}
                          className="px-4 py-3 bg-[#e63946] text-white font-medium rounded-xl flex items-center gap-2 hover:bg-[#c1121f] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verifying ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5" />
                          )}
                          <span className="hidden sm:inline">Verify</span>
                        </button>
                      )}
                    </div>

                    {verificationError && (
                      <div className="flex items-center gap-2 mt-3 text-red-400 text-sm animate-shake">
                        <AlertCircle className="w-4 h-4" />
                        <span>{verificationError}</span>
                      </div>
                    )}

                    {isVerified && (
                      <div className="flex items-center gap-2 mt-3 text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>You are verified as the group leader. You can now proceed.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Start Button */}
                <button
                  onClick={handleStart}
                  disabled={!selectedGroupId || !isVerified || starting}
                  className={`w-full py-4 px-6 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group ${
                    !selectedGroupId || !isVerified
                      ? "bg-gray-600 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-[#e63946] to-[#c1121f] hover:shadow-lg hover:shadow-[#e63946]/25 hover:scale-[1.02]"
                  }`}
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Starting Wizard...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Start Building Your Store</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {!selectedGroupId && (
                  <p className="text-center text-gray-500 text-sm mt-3">Select a group to continue</p>
                )}
                {selectedGroupId && !isVerified && (
                  <p className="text-center text-gray-500 text-sm mt-3">Verify your leader status to continue</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Wizard Steps Preview */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e63946]/10 border border-[#e63946]/20 mb-4">
            <Sparkles className="w-4 h-4 text-[#e63946]" />
            <span className="text-[#e63946] text-sm font-medium">8-Step Process</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">What You'll Build</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Complete your ecommerce business plan with Markano's comprehensive 8-step wizard
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Target,
              title: "Goals & Vision",
              desc: "Define your business objectives and success metrics",
              step: 1,
              color: "from-[#e63946] to-[#c1121f]",
            },
            {
              icon: TrendingUp,
              title: "Strategy & Market",
              desc: "Analyze competition and market positioning",
              step: 2,
              color: "from-[#e63946] to-[#c1121f]",
            },
            {
              icon: Globe,
              title: "Platform Setup",
              desc: "Choose and configure your e-commerce platform",
              step: 3,
              color: "from-[#e63946] to-[#c1121f]",
            },
            {
              icon: Package,
              title: "Product Sourcing",
              desc: "Find reliable suppliers and quality products",
              step: 4,
              color: "from-[#e63946] to-[#c1121f]",
            },
            {
              icon: CheckCircle2,
              title: "Implementation",
              desc: "Execute your business launch steps",
              step: 5,
              color: "from-[#e63946] to-[#c1121f]",
            },
            {
              icon: Calendar,
              title: "Timeline",
              desc: "Set milestones and track progress",
              step: 6,
              color: "from-[#e63946] to-[#c1121f]",
            },
            {
              icon: Megaphone,
              title: "Marketing",
              desc: "Plan your marketing and sales channels",
              step: 7,
              color: "from-[#e63946] to-[#c1121f]",
            },
            {
              icon: Sparkles,
              title: "Review & Submit",
              desc: "Finalize and submit your business plan",
              step: 8,
              color: "from-[#e63946] to-[#c1121f]",
            },
          ].map((item, index) => (
            <div key={item.step} className="group relative" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/10 to-[#013565]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative p-6 bg-[#1e293b]/50 border border-[#e63946]/10 rounded-2xl hover:border-[#e63946]/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-[#e63946]/10">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs text-[#e63946] font-medium mb-2">Step {item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#e63946] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e63946]/10 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/images/markano-logo.png" alt="Markano" width={32} height={32} className="object-contain" />
            <span className="text-gray-400 text-sm">Powered by Markano Learning Platform</span>
          </div>
          <div className="text-gray-500 text-sm">© 2025 Markano. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}
