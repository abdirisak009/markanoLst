"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MessageCircle,
  Plus,
  Search,
  User,
  Pin,
  Lock,
  CheckCircle2,
  Code,
  FileCode,
  Terminal,
  Database,
  Shield,
  Briefcase,
  Folder,
  Component,
} from "lucide-react"

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
  const router = useRouter()
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([])
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([])
  const [forumLoading, setForumLoading] = useState(false)
  const [forumActiveTab, setForumActiveTab] = useState<"latest" | "hot" | "categories">("latest")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const check = () => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("gold_student") : null
        setIsLoggedIn(!!stored)
      } catch {
        setIsLoggedIn(false)
      }
    }
    check()
    window.addEventListener("storage", check)
    return () => window.removeEventListener("storage", check)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setForumLoading(true)
      try {
        const [categoriesRes, topicsRes] = await Promise.all([
          fetch("/api/forum/categories"),
          fetch(`/api/forum/topics?tab=${forumActiveTab}&category=${selectedCategory}`),
        ])
        if (cancelled) return
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json()
          setForumCategories(catData)
        }
        if (topicsRes.ok) {
          const topicsData = await topicsRes.json()
          setForumTopics(topicsData)
        }
      } catch (err) {
        if (!cancelled) console.error("Error fetching forum data:", err)
      } finally {
        if (!cancelled) setForumLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [forumActiveTab, selectedCategory])

  const filteredTopics = useMemo(
    () =>
      forumTopics.filter((topic) =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [forumTopics, searchQuery]
  )

  const forumStats = useMemo(
    () => ({
      totalTopics: forumTopics.length,
      totalReplies: forumTopics.reduce((acc, t) => acc + t.replies_count, 0),
      totalViews: forumTopics.reduce((acc, t) => acc + t.views, 0),
      activeUsers: new Set(forumTopics.map((t) => t.author_id)).size,
    }),
    [forumTopics]
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f8fafc] pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="space-y-4 md:space-y-6">
            {/* Header – mobile app style */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0f172a] mb-1 bg-gradient-to-r from-[#0f172a] via-[#2596be] to-[#3c62b3] bg-clip-text text-transparent md:bg-none md:text-[#0f172a]">
                  Community
                </h1>
                <p className="text-sm sm:text-base text-gray-600">Connect with students and get help</p>
              </div>
              {isLoggedIn ? (
                <Button className="w-full sm:w-auto bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-semibold shadow-lg shadow-[#2596be]/25 rounded-xl h-11 px-5 touch-target">
                  <Plus className="h-4 w-4 mr-2" />
                  New Topic
                </Button>
              ) : (
                <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-[#2596be] to-[#3c62b3] hover:from-[#3c62b3] hover:to-[#2d4d8a] text-white font-semibold shadow-lg shadow-[#2596be]/25 rounded-xl h-11 px-5 touch-target">
                  <Link href="/student-login?redirect=/forum">
                    <Plus className="h-4 w-4 mr-2 inline" />
                    New Topic
                  </Link>
                </Button>
              )}
            </div>

            {/* Stats – horizontal scroll on mobile */}
            <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-1 snap-x snap-mandatory touch-pan-x">
              <div className="flex-shrink-0 w-[140px] md:w-auto snap-center">
                <Card className="bg-white border-2 border-[#2596be]/15 shadow-sm rounded-2xl overflow-hidden h-full">
                  <CardContent className="p-4">
                    <p className="text-gray-500 text-xs mb-0.5">Topics</p>
                    <p className="text-xl md:text-2xl font-bold text-[#2596be]">{forumStats.totalTopics}</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex-shrink-0 w-[140px] md:w-auto snap-center">
                <Card className="bg-white border-2 border-[#2596be]/15 shadow-sm rounded-2xl overflow-hidden h-full">
                  <CardContent className="p-4">
                    <p className="text-gray-500 text-xs mb-0.5">Replies</p>
                    <p className="text-xl md:text-2xl font-bold text-[#2596be]">{forumStats.totalReplies}</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex-shrink-0 w-[140px] md:w-auto snap-center">
                <Card className="bg-white border-2 border-[#2596be]/15 shadow-sm rounded-2xl overflow-hidden h-full">
                  <CardContent className="p-4">
                    <p className="text-gray-500 text-xs mb-0.5">Views</p>
                    <p className="text-xl md:text-2xl font-bold text-[#2596be]">{formatViews(forumStats.totalViews)}</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex-shrink-0 w-[140px] md:w-auto snap-center">
                <Card className="bg-white border-2 border-[#3c62b3]/20 shadow-sm rounded-2xl overflow-hidden h-full">
                  <CardContent className="p-4">
                    <p className="text-gray-500 text-xs mb-0.5">Active</p>
                    <p className="text-xl md:text-2xl font-bold text-[#3c62b3]">{forumStats.activeUsers}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-2 border-[#2596be]/20 focus:border-[#2596be] bg-white text-[#0f172a] placeholder:text-gray-400"
              />
            </div>

            {/* Tabs */}
            <div className="flex rounded-2xl md:rounded-none bg-[#f1f5f9] md:bg-transparent p-1 md:p-0 gap-0 md:gap-2 md:border-b md:border-gray-200">
              <button
                onClick={() => setForumActiveTab("latest")}
                className={`flex-1 md:flex-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-none text-sm font-medium transition-all touch-target md:border-b-2 ${
                  forumActiveTab === "latest"
                    ? "bg-white md:bg-transparent text-[#2596be] shadow-sm md:shadow-none md:border-[#2596be]"
                    : "text-gray-600 hover:text-[#0f172a] md:border-transparent"
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setForumActiveTab("hot")}
                className={`flex-1 md:flex-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-none text-sm font-medium transition-all touch-target md:border-b-2 ${
                  forumActiveTab === "hot"
                    ? "bg-white md:bg-transparent text-[#2596be] shadow-sm md:shadow-none md:border-[#2596be]"
                    : "text-gray-600 hover:text-[#0f172a] md:border-transparent"
                }`}
              >
                Hot
              </button>
              <button
                onClick={() => setForumActiveTab("categories")}
                className={`flex-1 md:flex-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-none text-sm font-medium transition-all touch-target md:border-b-2 ${
                  forumActiveTab === "categories"
                    ? "bg-white md:bg-transparent text-[#2596be] shadow-sm md:shadow-none md:border-[#2596be]"
                    : "text-gray-600 hover:text-[#0f172a] md:border-transparent"
                }`}
              >
                Categories
              </button>
            </div>

            {forumLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[#2596be]/30 border-t-[#2596be] mb-4" />
                <p className="text-gray-500 text-sm">Loading community...</p>
              </div>
            ) : forumActiveTab === "categories" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {forumCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="bg-white border-2 border-[#2596be]/15 hover:border-[#2596be]/40 rounded-2xl shadow-lg shadow-[#2596be]/5 hover:shadow-xl hover:shadow-[#2596be]/10 transition-all cursor-pointer active:scale-[0.98] overflow-hidden"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20 border border-[#2596be]/25 flex items-center justify-center flex-shrink-0">
                          {iconMap[category.icon] || <MessageCircle className="w-6 h-6 text-[#2596be]" />}
                        </div>
                        <h3 className="text-[#0f172a] font-bold text-lg">{category.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{category.topics_count} topics</span>
                        <span>{category.posts_count} posts</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {filteredTopics.length === 0 ? (
                  <Card className="bg-white border-2 border-[#2596be]/15 rounded-2xl overflow-hidden">
                    <CardContent className="p-8 md:p-12 text-center">
                      <div className="inline-flex p-4 rounded-2xl bg-[#2596be]/10 mb-4">
                        <MessageCircle className="h-12 w-12 text-[#2596be]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#0f172a] mb-2">No topics yet</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {searchQuery ? "No topics match your search." : "Be the first to start a conversation."}
                      </p>
                      {!searchQuery && !isLoggedIn && (
                        <Button asChild className="bg-[#2596be] hover:bg-[#3c62b3] text-white rounded-xl">
                          <Link href="/student-login?redirect=/forum">
                            <Plus className="h-4 w-4 mr-2 inline" />
                            New Topic
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredTopics.map((topic) => (
                    <Card
                      key={topic.id}
                      className="bg-white border-2 border-[#2596be]/15 hover:border-[#2596be]/40 rounded-2xl shadow-lg shadow-[#2596be]/5 hover:shadow-xl transition-all cursor-pointer active:scale-[0.99] overflow-hidden touch-target"
                      onClick={() => router.push(`/forum/topic/${topic.id}`)}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#2596be]/20 to-[#3c62b3]/20 border-2 border-[#2596be]/30 flex items-center justify-center">
                            <User className="h-5 w-5 text-[#2596be]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              {topic.is_pinned && <Pin className="h-4 w-4 text-[#2596be] flex-shrink-0" />}
                              {topic.is_locked && <Lock className="h-4 w-4 text-gray-500 flex-shrink-0" />}
                              {topic.is_solved && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                              <h3 className="text-[#0f172a] font-bold text-base md:text-lg line-clamp-2">{topic.title}</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{topic.content}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                              <span>by {topic.author_name}</span>
                              <span>{formatTimeAgo(topic.created_at)}</span>
                              <span>{formatViews(topic.views)} views</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="inline-flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-xl bg-[#2596be]/10 border border-[#2596be]/20">
                              <span className="text-[#2596be] font-bold text-lg">{topic.replies_count}</span>
                              <span className="text-gray-500 text-xs">replies</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </>
  )
}
