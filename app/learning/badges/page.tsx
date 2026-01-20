"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Trophy, Sparkles, Flame, Zap } from "lucide-react"

interface UserBadge {
  badge_key: string
  badge_name: string
  badge_icon: string
  description: string
  badge_type: string
  xp_reward: number
  earned_at: string
  earned: boolean
}

export default function BadgesPage() {
  const router = useRouter()
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("gold_student") || localStorage.getItem("verified_student_id")
    if (!storedUser) {
      router.push("/student-login")
      return
    }

    const user = typeof storedUser === "string" ? JSON.parse(storedUser) : { id: storedUser }
    setUserId(user.id || user)
    fetchBadges(user.id || user)
  }, [router])

  const fetchBadges = async (userId: number) => {
    try {
      const res = await fetch(`/api/learning/gamification/badges?userId=${userId}`)
      const data = await res.json()
      setBadges(data.all_badges || [])
    } catch (error) {
      console.error("Error fetching badges:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return Trophy
      case "streak":
        return Flame
      case "achievement":
        return Zap
      default:
        return Award
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading badges...</p>
        </div>
      </div>
    )
  }

  const earnedBadges = badges.filter((b) => b.earned)
  const availableBadges = badges.filter((b) => !b.earned)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Badges</h1>
          <p className="text-gray-600">Track your achievements and milestones</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{earnedBadges.length}</p>
                  <p className="text-sm text-gray-600">Badges Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Trophy className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {earnedBadges.filter((b) => b.badge_type === "milestone").length}
                  </p>
                  <p className="text-sm text-gray-600">Milestones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Flame className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {earnedBadges.filter((b) => b.badge_type === "streak").length}
                  </p>
                  <p className="text-sm text-gray-600">Streaks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Earned Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => {
                const Icon = getBadgeIcon(badge.badge_type)
                return (
                  <Card key={badge.badge_key} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-4">{badge.badge_icon}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{badge.badge_name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Icon className="h-3 w-3 mr-1" />
                          {badge.badge_type}
                        </Badge>
                        {badge.xp_reward > 0 && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            +{badge.xp_reward} XP
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Available Badges */}
        {availableBadges.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBadges.map((badge) => {
                const Icon = getBadgeIcon(badge.badge_type)
                return (
                  <Card key={badge.badge_key} className="opacity-60">
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-4 grayscale">{badge.badge_icon}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{badge.badge_name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline">
                          <Icon className="h-3 w-3 mr-1" />
                          {badge.badge_type}
                        </Badge>
                        {badge.xp_reward > 0 && (
                          <Badge variant="outline">
                            +{badge.xp_reward} XP
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
