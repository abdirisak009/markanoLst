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
  User,
  AlertCircle,
  CheckCircle2,
  Shield,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

interface Group {
  id: number
  name: string
  class_name: string
}

export default function EcommerceWizardLanding() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState("")
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

  useEffect(() => {
    setIsVerified(false)
    setVerificationError("")
    setLeaderId("")
  }, [selectedGroupId])

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

  const verifyLeader = async () => {
    if (!selectedGroupId || !leaderId.trim()) {
      setVerificationError("Fadlan geli Student ID-gaaga")
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
        setVerificationError(data.message || "Maaha leader-ka group-kan. Kaliya leader-ku ayaa buuxin kara wizard-kan.")
        setIsVerified(false)
      }
    } catch (error) {
      setVerificationError("Khalad ayaa dhacay. Fadlan isku day mar kale.")
      setIsVerified(false)
    } finally {
      setVerifying(false)
    }
  }

  const handleStart = async () => {
    if (!selectedGroupId || !isVerified) return
    setStarting(true)
    router.push(`/ecommerce-wizard/wizard/${selectedGroupId}?leader=${leaderId}`)
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e3a5f]" />
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#e63946 1px, transparent 1px), linear-gradient(90deg, #e63946 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#e63946]/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-[#013565]/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e63946]/10 border border-[#e63946]/20">
                <Sparkles className="w-4 h-4 text-[#e63946]" />
                <span className="text-[#e63946] text-sm font-medium">Business Development Tool</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                E-commerce
                <span className="block text-[#e63946]">Implementation Wizard</span>
              </h1>

              <p className="text-lg text-gray-400 max-w-lg">
                Build your complete ecommerce business plan step-by-step. From goals and strategy to product sourcing
                and marketing - we guide you through every stage.
              </p>

              {/* Stats */}
              <div className="flex gap-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-white">8</div>
                  <div className="text-sm text-gray-500">Guided Steps</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-[#e63946]">100%</div>
                  <div className="text-sm text-gray-500">Comprehensive</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-white">Pro</div>
                  <div className="text-sm text-gray-500">Business Plan</div>
                </div>
              </div>
            </div>

            {/* Right - Group Selection Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/20 to-[#013565]/20 rounded-3xl blur-xl" />
              <div className="relative bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl border border-[#e63946]/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#e63946]/20 rounded-xl">
                    <Users className="w-6 h-6 text-[#e63946]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Select Your Group</h2>
                    <p className="text-sm text-gray-400">Choose your group to start building</p>
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
                    className="w-full pl-12 pr-4 py-3 bg-white border border-[#e63946]/20 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#e63946]/50 transition-colors"
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
                        onClick={() => setSelectedGroupId(group.id.toString())}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          selectedGroupId === group.id.toString()
                            ? "bg-[#e63946]/20 border-[#e63946] text-white"
                            : "bg-[#0f172a]/50 border-[#e63946]/10 text-gray-300 hover:border-[#e63946]/30 hover:bg-[#1e293b]/30"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedGroupId === group.id.toString() ? "bg-[#e63946]" : "bg-[#1e293b]"
                          }`}
                        >
                          <Store
                            className={`w-5 h-5 ${selectedGroupId === group.id.toString() ? "text-white" : "text-[#e63946]"}`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-gray-500">{group.class_name}</div>
                        </div>
                        {selectedGroupId === group.id.toString() && (
                          <div className="w-6 h-6 bg-[#e63946] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {selectedGroupId && (
                  <div className="mb-6 p-4 bg-[#0f172a]/50 rounded-xl border border-[#e63946]/20 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-[#e63946]" />
                      <span className="text-white font-medium">Leader Verification</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Kaliya leader-ka group-ka ayaa buuxin kara wizard-kan. Geli Student ID-gaaga.
                    </p>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Student ID (e.g., STU001)"
                          value={leaderId}
                          onChange={(e) => {
                            setLeaderId(e.target.value)
                            setVerificationError("")
                            setIsVerified(false)
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-[#1e293b] border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${
                            isVerified
                              ? "border-green-500"
                              : verificationError
                                ? "border-red-500"
                                : "border-[#e63946]/30 focus:border-[#e63946]"
                          }`}
                        />
                        {isVerified && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <button
                        onClick={verifyLeader}
                        disabled={verifying || !leaderId.trim()}
                        className="px-4 py-3 bg-[#e63946] text-white font-medium rounded-xl hover:bg-[#c1121f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {verifying ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>

                    {/* Verification Status Messages */}
                    {verificationError && (
                      <div className="mt-3 flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{verificationError}</span>
                      </div>
                    )}
                    {isVerified && (
                      <div className="mt-3 flex items-center gap-2 text-green-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Waad ku guulaysatay! Waxaad tahay leader-ka group-kan.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Start Button - Updated to require verification */}
                <button
                  onClick={handleStart}
                  disabled={!selectedGroupId || !isVerified || starting}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#e63946] to-[#c1121f] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#e63946]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {starting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Start Building Your Store</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Helper text */}
                {!isVerified && selectedGroupId && (
                  <p className="text-center text-gray-500 text-sm mt-3">Verify your leader status to continue</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">What You'll Build</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Complete your ecommerce business plan in 8 comprehensive steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, title: "Goals & Vision", desc: "Define your business objectives", step: 1 },
            { icon: Search, title: "Market Research", desc: "Analyze your target market", step: 2 },
            { icon: Store, title: "Platform Setup", desc: "Choose and configure platform", step: 3 },
            { icon: Package, title: "Product Sourcing", desc: "Find suppliers and products", step: 4 },
          ].map((item) => (
            <div key={item.step} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#e63946]/10 to-[#013565]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6 bg-[#1e293b]/50 border border-[#e63946]/10 rounded-2xl hover:border-[#e63946]/30 transition-colors">
                <div className="w-12 h-12 bg-[#e63946]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-[#e63946]" />
                </div>
                <div className="text-xs text-[#e63946] font-medium mb-2">Step {item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
