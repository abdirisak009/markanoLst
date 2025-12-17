"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  MessageCircle,
  Eye,
  Clock,
  Pin,
  Lock,
  CheckCircle2,
  ChevronDown,
  Flame,
  Grid3X3,
  Search,
  Plus,
  Filter,
  Code,
  FileCode,
  Terminal,
  Database,
  Shield,
  Briefcase,
  Folder,
  Component,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import Navbar from "@/components/navbar"

interface ForumCategory {
  id: number
  name: string
  slug: string
  description: string
  color: string
  icon: string
  topics_count: number
  posts_count: number
}

interface ForumTopic {
  id: number
  category_id: number
  category_name: string
  category_slug: string
  category_color: string
  author_id: string
  author_name: string
  author_type: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  is_solved: boolean
  views: number
  replies_count: number
  last_reply_at: string
  created_at: string
  participants: { id: string; name: string; avatar?: string }[]
}

const iconMap: { [key: string]: React.ReactNode } = {
  "message-circle": <MessageCircle className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  "file-code": <FileCode className="w-5 h-5" />,
  component: <Component className="w-5 h-5" />,
  terminal: <Terminal className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
  folder: <Folder className="w-5 h-5" />,
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`
  return views.toString()
}

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"latest" | "hot" | "categories">("latest")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchForumData()
  }, [activeTab, selectedCategory])

  async function fetchForumData() {
    try {
      setLoading(true)
      const [categoriesRes, topicsRes] = await Promise.all([
        fetch("/api/forum/categories"),
        fetch(`/api/forum/topics?tab=${activeTab}&category=${selectedCategory}`),
      ])

      if (categoriesRes.ok) {
        const catData = await categoriesRes.json()
        setCategories(catData)
      }

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json()
        setTopics(topicsData)
      }
    } catch (error) {
      console.error("Error fetching forum data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTopics = topics.filter((topic) => topic.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const stats = {
    totalTopics: topics.length,
    totalReplies: topics.reduce((acc, t) => acc + t.replies_count, 0),
    totalViews: topics.reduce((acc, t) => acc + t.views, 0),
    activeUsers: new Set(topics.map((t) => t.author_id)).size,
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] to-[#0f172a]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#e63946]/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Floating Code Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["{ }", "</>", "( )", "[ ]", "&&", "||"].map((code, i) => (
            <div
              key={i}
              className="absolute text-white/5 font-mono text-4xl animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`,
              }}
            >
              {code}
            </div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e63946]/10 border border-[#e63946]/30 mb-6">
              <Users className="w-4 h-4 text-[#e63946]" />
              <span className="text-[#e63946] text-sm font-medium">Community Forum</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Markano <span className="text-[#e63946]">Forum</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Ask questions, share knowledge, and connect with fellow learners. Our community is here to help you
              succeed.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              {[
                { label: "Topics", value: stats.totalTopics, icon: MessageCircle },
                { label: "Replies", value: stats.totalReplies, icon: MessageCircle },
                { label: "Views", value: formatViews(stats.totalViews), icon: Eye },
                { label: "Members", value: stats.activeUsers, icon: Users },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <stat.icon className="w-5 h-5 text-[#e63946]" />
                  <div className="text-left">
                    <div className="text-white font-bold">{stat.value}</div>
                    <div className="text-gray-500 text-xs">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* New Topic Button */}
            <Link
              href="/forum/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#e63946]/25 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Start New Discussion
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Filters Bar */}
        <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left Side - Category & Tabs */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] rounded-xl border border-white/10 text-white hover:border-[#e63946]/50 transition-all"
                >
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {selectedCategory === "all"
                      ? "All Categories"
                      : categories.find((c) => c.slug === selectedCategory)?.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#1e293b] rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedCategory("all")
                        setShowCategoryDropdown(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${selectedCategory === "all" ? "bg-[#e63946]/10 text-[#e63946]" : "text-white"}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      <span className="text-sm">All Categories</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.slug)
                          setShowCategoryDropdown(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${selectedCategory === cat.slug ? "bg-[#e63946]/10 text-[#e63946]" : "text-white"}`}
                      >
                        <span style={{ color: cat.color }}>{iconMap[cat.icon] || <Folder className="w-4 h-4" />}</span>
                        <span className="text-sm">{cat.name}</span>
                        <span className="ml-auto text-xs text-gray-500">{cat.topics_count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center bg-[#0f172a] rounded-xl p-1 border border-white/10">
                {[
                  { id: "latest", label: "Latest", icon: Clock },
                  { id: "hot", label: "Hot", icon: Flame },
                  { id: "categories", label: "Categories", icon: Grid3X3 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-[#e63946] text-white shadow-lg shadow-[#e63946]/25"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Search */}
            <div className="relative w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-72 pl-10 pr-4 py-2.5 bg-[#0f172a] rounded-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#e63946]/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Categories View */}
        {activeTab === "categories" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/forum?category=${cat.slug}`}
                onClick={(e) => {
                  e.preventDefault()
                  setSelectedCategory(cat.slug)
                  setActiveTab("latest")
                }}
                className="group relative bg-[#1e293b]/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Glow Effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `radial-gradient(circle at center, ${cat.color}, transparent 70%)` }}
                />

                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    {iconMap[cat.icon] || <Folder className="w-6 h-6" />}
                  </div>

                  <h3 className="text-white font-semibold mb-1 group-hover:text-[#e63946] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{cat.description}</p>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-400">
                      <span className="text-white font-medium">{cat.topics_count}</span> topics
                    </span>
                    <span className="text-gray-400">
                      <span className="text-white font-medium">{cat.posts_count}</span> posts
                    </span>
                  </div>
                </div>

                <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-gray-600 group-hover:text-[#e63946] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        ) : (
          /* Topics List */
          <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-gray-400 text-sm font-medium">
              <div className="col-span-7">Topic</div>
              <div className="col-span-2 text-center">Replies</div>
              <div className="col-span-2 text-center">Views</div>
              <div className="col-span-1 text-right">Activity</div>
            </div>

            {/* Topics */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading topics...</p>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No topics found</h3>
                <p className="text-gray-400 mb-4">Be the first to start a discussion!</p>
                <Link
                  href="/forum/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#e63946] text-white rounded-lg hover:bg-[#d63036] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Topic
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredTopics.map((topic, i) => (
                  <Link
                    key={topic.id}
                    href={`/forum/topic/${topic.id}`}
                    className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-white/5 transition-all duration-200"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Topic Info */}
                    <div className="col-span-7 flex gap-4">
                      {/* Status Icons */}
                      <div className="flex flex-col items-center gap-1 pt-1">
                        {topic.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                        {topic.is_locked && <Lock className="w-4 h-4 text-gray-500" />}
                        {topic.is_solved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {!topic.is_pinned && !topic.is_locked && !topic.is_solved && (
                          <MessageCircle className="w-4 h-4 text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium group-hover:text-[#e63946] transition-colors line-clamp-1 mb-1">
                          {topic.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-1 mb-2">{topic.content}</p>

                        {/* Category Tag & Author */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: `${topic.category_color}20`, color: topic.category_color }}
                          >
                            {topic.category_name}
                          </span>
                          <span className="text-gray-500 text-xs">
                            by <span className="text-gray-400">{topic.author_name}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Participants & Replies */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      {/* Participant Avatars */}
                      <div className="flex -space-x-2 mr-2">
                        {topic.participants?.slice(0, 3).map((p, pi) => (
                          <div
                            key={pi}
                            className="w-7 h-7 rounded-full border-2 border-[#1e293b] flex items-center justify-center text-xs font-medium text-white"
                            style={{
                              backgroundColor: ["#e63946", "#22c55e", "#6366f1", "#f59e0b", "#ec4899"][pi % 5],
                              zIndex: 3 - pi,
                            }}
                          >
                            {p.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        ))}
                      </div>
                      <span className="text-white font-medium">{topic.replies_count}</span>
                    </div>

                    {/* Views */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className={`font-medium ${topic.views >= 1000 ? "text-[#e63946]" : "text-gray-400"}`}>
                        {formatViews(topic.views)}
                      </span>
                    </div>

                    {/* Activity */}
                    <div className="col-span-1 flex items-center justify-end">
                      <span className="text-gray-400 text-sm">{formatTimeAgo(topic.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Float Animation Style */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
