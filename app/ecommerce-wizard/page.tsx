"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, ShoppingBag, TrendingUp, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function EcommerceWizardLanding() {
  const [groupId, setGroupId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleStart = async () => {
    if (!groupId.trim()) {
      setError("Fadlan geli Group ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Validate group ID
      const response = await fetch(`/api/groups/${groupId}`)
      if (!response.ok) {
        setError("Group ID lama helin. Fadlan hubi oo isku day mar kale.")
        setLoading(false)
        return
      }

      // Redirect to wizard
      router.push(`/ecommerce-wizard/builder?groupId=${groupId}`)
    } catch (err) {
      setError("Khalad ayaa dhacay. Fadlan isku day mar kale.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d4041] via-[#2a5a5c] to-[#1d4041]">
      {/* Header with Logo */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Image src="/markano-logo.png" alt="Markano" width={150} height={50} className="h-12 w-auto" />
            <div className="text-white font-semibold">E-commerce Wizard</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9ed674]/20 border border-[#9ed674]/30 mb-6">
            <ShoppingBag className="w-5 h-5 text-[#9ed674]" />
            <span className="text-[#9ed674] font-medium">Build Your E-commerce Store</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">E-commerce Implementation Wizard</h1>

          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Deji qorshe dhameystiran oo ganacsigaaga online ku samaysan 8 tallaabo oo sahlan
          </p>

          {/* Group ID Input */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-left">
                  <label className="text-white font-medium mb-2 block">Group ID</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Geli Group ID-kaaga..."
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleStart()}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                    />
                  </div>
                </div>

                {error && <div className="text-red-400 text-sm text-left bg-red-500/10 px-3 py-2 rounded">{error}</div>}

                <Button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full h-12 bg-[#9ed674] hover:bg-[#8bc662] text-[#1d4041] font-semibold"
                >
                  {loading ? "Checking..." : "Start Building Your Store"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#9ed674]/20 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-[#9ed674]" />
              </div>
              <h3 className="text-white font-semibold mb-2">8 Easy Steps</h3>
              <p className="text-white/70 text-sm">Qorshe dhameystiran oo ku hagaya tallaabo kasta</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#9ed674]/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-[#9ed674]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Market Research</h3>
              <p className="text-white/70 text-sm">Falanqee suuqaaga iyo tartamahaaga</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#9ed674]/20 flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-[#9ed674]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Product Sourcing</h3>
              <p className="text-white/70 text-sm">Hel alaabta iyo alaabqeybiyayaasha ugu fiican</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
