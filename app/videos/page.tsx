"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Play, Sparkles, Code2, Database, Layers, Terminal, Globe, Braces } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"

interface CategoryData {
  category: string
  video_count: number
}

export default function VideosPublicPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [showVerification, setShowVerification] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/videos/categories")
      const data = await response.json()
      const filteredCategories = data.filter((cat: CategoryData) => cat.category.toLowerCase() !== "other")
      setCategories(filteredCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setShowVerification(true)
    setStudentId("")
    setVerificationError("")
  }

  const verifyStudent = async () => {
    setVerificationError("")
    setVerifying(true)
    try {
      const response = await fetch("/api/videos/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      })

      const data = await response.json()

      if (data.verified) {
        toast({
          title: "Guul!",
          description: `Soo dhawaw, ${data.student.full_name}`,
        })
        setShowVerification(false)
        if (selectedCategory) {
          router.push(
            `/videos/category/${encodeURIComponent(selectedCategory)}?student_id=${studentId}&student_name=${encodeURIComponent(data.student.full_name)}&class_name=${encodeURIComponent(data.student.class_name || "")}`,
          )
        }
        setStudentId("")
        setSelectedCategory(null)
        setVerificationError("")
      } else {
        setVerificationError(data.message || "Student ID-gan lama helin. Fadlan hubi oo mar kale isku day.")
      }
    } catch (error) {
      console.error("[v0] Error during verification:", error)
      setVerificationError("Cilad ayaa dhacday. Fadlan mar kale isku day.")
    } finally {
      setVerifying(false)
    }
  }

  const getCategoryConfig = (category: string, index: number) => {
    const lower = category.toLowerCase()

    const configs = [
      {
        icon: Code2,
        gradient: "from-[#ff1b4a] to-[#ff6b8a]",
        pattern: "html",
        codeSnippet: '<div class="hero">\n  <h1>Hello</h1>\n</div>',
        accentColor: "#ff1b4a",
      },
      {
        icon: Braces,
        gradient: "from-[#013565] to-[#0284c7]",
        pattern: "css",
        codeSnippet: ".container {\n  display: flex;\n  gap: 1rem;\n}",
        accentColor: "#0284c7",
      },
      {
        icon: Terminal,
        gradient: "from-[#7c3aed] to-[#a78bfa]",
        pattern: "js",
        codeSnippet: "const app = () => {\n  return data;\n}",
        accentColor: "#7c3aed",
      },
      {
        icon: Database,
        gradient: "from-[#059669] to-[#34d399]",
        pattern: "db",
        codeSnippet: "SELECT * FROM\n  users WHERE\n  active = true",
        accentColor: "#059669",
      },
      {
        icon: Layers,
        gradient: "from-[#ea580c] to-[#fb923c]",
        pattern: "react",
        codeSnippet: "function App() {\n  return <Card/>\n}",
        accentColor: "#ea580c",
      },
      {
        icon: Globe,
        gradient: "from-[#0891b2] to-[#22d3ee]",
        pattern: "web",
        codeSnippet: "fetch('/api')\n  .then(res =>\n    res.json())",
        accentColor: "#0891b2",
      },
    ]

    // Match by category name
    if (lower.includes("html") || lower.includes("css")) return configs[0]
    if (lower.includes("javascript") || lower.includes("js")) return configs[2]
    if (lower.includes("python") || lower.includes("database") || lower.includes("sql")) return configs[3]
    if (lower.includes("react") || lower.includes("next")) return configs[4]

    return configs[index % configs.length]
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />

      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a] text-white py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid pattern - updated colors */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(230,57,70,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(230,57,70,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          {/* Floating code snippets - updated colors */}
          <div className="absolute top-20 left-10 text-[#e63946]/20 font-mono text-xs animate-pulse hidden md:block">
            {'<div className="hero">'}
          </div>
          <div className="absolute top-40 right-20 text-[#1e3a5f]/40 font-mono text-xs animate-pulse delay-500 hidden md:block">
            {"function learn() {}"}
          </div>
          <div className="absolute bottom-32 left-1/4 text-[#e63946]/15 font-mono text-xs animate-pulse delay-1000 hidden md:block">
            {"const skills = [];"}
          </div>

          {/* Glowing orbs - updated colors */}
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#e63946] rounded-full blur-[150px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#1e3a5f] rounded-full blur-[150px] opacity-40"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated logo - updated colors */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-[#e63946] rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#ff6b7a] flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Code2 className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                Maktabada
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e63946] to-[#ff6b7a]">
                Muuqaalada
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-10 text-pretty max-w-2xl mx-auto">
              Baro xawli aad rabto oo leh nuxur muuqaal ah oo la soo koobay
            </p>

            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
              <div className="flex -space-x-1">
                <div className="w-2 h-2 rounded-full bg-[#e63946] animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-[#1e3a5f] animate-pulse delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-300"></div>
              </div>
              <span className="text-sm font-medium text-gray-300">Dooro qaybta aad rabto inaad ka bilowdo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative bg-[#0f172a]">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e63946]/10 rounded-full mb-4">
                <Sparkles className="h-4 w-4 text-[#e63946]" />
                <span className="text-[#e63946] text-sm font-medium">Qaybaha Waxbarashada</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Dooro Qaybta</h2>
              <p className="text-gray-400 text-lg">Raadi qaybta aad wax ka baran rabto</p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#e63946]/10 animate-pulse mb-4">
                  <Code2 className="h-10 w-10 text-[#e63946]" />
                </div>
                <p className="text-gray-400">Waa la soo dejinayaa qaybo...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat, index) => {
                  const config = getCategoryConfig(cat.category, index)
                  const Icon = config.icon

                  return (
                    <div
                      key={cat.category}
                      onClick={() => handleCategoryClick(cat.category)}
                      className="group cursor-pointer perspective-1000"
                    >
                      <Card className="relative border-0 bg-gradient-to-br from-[#1e293b] to-[#1e3a5f] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(230,57,70,0.3)]">
                        {/* Animated border gradient */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div
                            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${config.gradient} opacity-20`}
                          ></div>
                        </div>

                        {/* Glow effect on hover */}
                        <div
                          className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                        ></div>

                        <CardContent className="relative p-0">
                          {/* Header with code pattern */}
                          <div className={`relative h-48 bg-gradient-to-br ${config.gradient} overflow-hidden`}>
                            {/* Code pattern background */}
                            <div className="absolute inset-0 bg-[#0f172a]/30"></div>
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                            {/* Animated code snippet */}
                            <div className="absolute top-4 left-4 right-4">
                              <div className="bg-[#0f172a]/60 backdrop-blur-sm rounded-lg p-3 border border-white/10 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#e63946]"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                  <span className="text-[10px] text-gray-400 ml-2 font-mono">
                                    {cat.category.toLowerCase()}.code
                                  </span>
                                </div>
                                <pre className="text-[10px] font-mono text-gray-300 leading-relaxed overflow-hidden">
                                  <code>{config.codeSnippet}</code>
                                </pre>
                              </div>
                            </div>

                            {/* Floating icon */}
                            <div className="absolute bottom-4 right-4">
                              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-white/20">
                                <Icon className="h-8 w-8 text-white" />
                              </div>
                            </div>

                            {/* Video count badge */}
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-white rounded-full text-sm font-bold text-[#0f172a] shadow-lg transform group-hover:scale-105 transition-transform">
                              {cat.video_count} muuqaal
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 relative">
                            {/* Decorative line */}
                            <div
                              className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${config.gradient} transform -translate-y-1/2 opacity-50`}
                            ></div>

                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#e63946] transition-colors duration-300">
                              {cat.category}
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">
                              {cat.video_count} muuqaal oo ku saabsan {cat.category.toLowerCase()}
                            </p>

                            {/* CTA Button */}
                            <Button
                              className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white font-semibold py-6 rounded-xl shadow-lg transform group-hover:scale-[1.02] transition-all duration-300 relative overflow-hidden`}
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                <Play className="h-5 w-5" />
                                Bilow Daawashada
                              </span>
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            )}

            {!loading && categories.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-[#1e3a5f] mb-6">
                  <Code2 className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-400 text-xl">Qaybo lama helin</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#1e293b] to-[#1e3a5f] text-white border border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e63946] to-[#ff6b7a] flex items-center justify-center shadow-xl">
                <Terminal className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="block">Geli Student ID</span>
                <span className="text-sm font-normal text-gray-400">Xaqiiji aqoonsigaaga</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="p-4 bg-[#e63946]/10 rounded-xl border border-[#e63946]/20">
              <p className="text-gray-300 text-sm leading-relaxed">
                Si aad u daawato <span className="font-bold text-[#e63946]">{selectedCategory}</span>, fadlan geli
                Student ID-kaaga.
              </p>
            </div>
            <div>
              <Label className="text-gray-300 font-semibold mb-3 block text-sm">Student ID</Label>
              <Input
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value)
                  setVerificationError("")
                }}
                placeholder="Tusaale: 123456"
                onKeyPress={(e) => e.key === "Enter" && !verifying && studentId && verifyStudent()}
                className="bg-[#0f172a] text-white border-white/10 placeholder:text-gray-600 focus:ring-2 focus:ring-[#e63946] focus:border-[#e63946] h-14 text-lg font-mono"
              />
              {verificationError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400 leading-relaxed">{verificationError}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVerification(false)
                  setVerificationError("")
                  setStudentId("")
                  setSelectedCategory(null)
                }}
                className="bg-transparent hover:bg-white/5 text-gray-300 border-white/20 hover:border-white/40 px-6"
              >
                Jooji
              </Button>
              <Button
                onClick={verifyStudent}
                disabled={!studentId || verifying}
                className="bg-gradient-to-r from-[#e63946] to-[#ff6b7a] hover:from-[#d32f3f] hover:to-[#e65a6a] text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed px-8"
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Waa la xaqiijinayaa...
                  </span>
                ) : (
                  "Xaqiiji & Sii Wad"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
