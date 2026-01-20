"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Flame,
  Clock,
  Eye,
  Pin,
  Lock,
  CheckCircle2,
  MessageCircle,
} from "lucide-react"
import { toast } from "sonner"

interface ForumTopic {
  id: number
  category_id: number
  category_name: string
  category_slug: string
  category_color: string
  author_id: string
  author_name: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  is_solved: boolean
  views: number
  replies_count: number
  last_reply_at: string
  created_at: string
  participants: Array<{ id: string; name: string }>
}

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

export default function GoldForumPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"latest" | "hot">("latest")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const storedStudent = localStorage.getItem("gold_student")
    if (!storedStudent) {
      router.push("/gold")
      return
    }
    fetchForumData()
  }, [router, activeTab, selectedCategory])

  const fetchForumData = async () => {
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
      toast.error("Failed to load forum data")
    } finally {
      setLoading(false)
    }
  }

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forum</h1>
          <p className="text-gray-600">Connect, learn, and share with fellow students</p>
        </div>
        <Link href="/forum/new">
          <Button className="bg-[#ff1b4a] hover:bg-[#d9143f] text-white shadow-md hover:shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            New Topic
          </Button>
        </Link>
      </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "latest" ? "default" : "outline"}
                  onClick={() => setActiveTab("latest")}
                  className={activeTab === "latest" ? "bg-[#013565] hover:bg-[#024a8c] text-white" : "border-gray-300 text-gray-700"}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Latest
                </Button>
                <Button
                  variant={activeTab === "hot" ? "default" : "outline"}
                  onClick={() => setActiveTab("hot")}
                  className={activeTab === "hot" ? "bg-[#ff1b4a] hover:bg-[#d9143f] text-white" : "border-gray-300 text-gray-700"}
                >
                  <Flame className="h-4 w-4 mr-2" />
                  Hot
                </Button>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "bg-[#013565] text-white border-0" : "border-gray-300 text-gray-700"}
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.slug ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={selectedCategory === cat.slug ? "text-white border-0" : "border-gray-300 text-gray-700"}
                    style={selectedCategory === cat.slug ? { backgroundColor: cat.color } : {}}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            )}

            {/* Topics List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#013565]"></div>
                <p className="text-gray-600 mt-4">Loading topics...</p>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-12 rounded-xl bg-white border border-gray-200 shadow-sm">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No topics found</h3>
                <p className="text-gray-600 mb-4">Be the first to start a discussion!</p>
                <Link href="/forum/new">
                  <Button className="bg-[#ff1b4a] hover:bg-[#d9143f] text-white shadow-md hover:shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Topic
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/forum/topic/${topic.id}`}
                    className="block p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-[#013565]/30"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: topic.category_color + "15", border: `2px solid ${topic.category_color}30` }}
                      >
                        <MessageCircle className="h-6 w-6" style={{ color: topic.category_color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {topic.is_pinned && (
                                <Pin className="h-4 w-4 text-[#ff1b4a]" />
                              )}
                              {topic.is_locked && (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                              {topic.is_solved && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-[#013565] transition-colors">
                                {topic.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                              <Badge
                                className="text-xs border-0"
                                style={{
                                  backgroundColor: topic.category_color + "15",
                                  color: topic.category_color,
                                  border: `1px solid ${topic.category_color}30`,
                                }}
                              >
                                {topic.category_name}
                              </Badge>
                              <span>by {topic.author_name}</span>
                              <span>•</span>
                              <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{topic.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{topic.replies_count} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{topic.views} views</span>
                          </div>
                          {topic.participants && topic.participants.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {topic.participants.slice(0, 3).map((p, idx) => (
                                  <div
                                    key={p.id}
                                    className="w-6 h-6 rounded-full bg-[#013565] border-2 border-white flex items-center justify-center text-xs text-white shadow-sm"
                                    style={{ zIndex: 10 - idx }}
                                  >
                                    {p.name.charAt(0).toUpperCase()}
                                  </div>
                                ))}
                              </div>
                              {topic.participants.length > 3 && (
                                <span className="text-xs">+{topic.participants.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
    </div>
  )
}
