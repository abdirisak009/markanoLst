"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  student_id: string
  student_name: string
  class_name: string
  total_score: number
  submission_count: number
  last_submission: string
}

export default function LeaderboardPage() {
  const params = useParams()
  const challengeId = params.id
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [challengeId])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/leaderboard`)
      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error("[v0] Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />
    return <span className="text-lg font-bold text-gray-600">{rank}</span>
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300"
    if (rank === 2) return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"
    if (rank === 3) return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300"
    return "bg-white border-gray-200"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-gray-600 mt-2">Top performers in this challenge</p>
      </div>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Wali ma jirin submissions</h3>
            <p className="text-gray-500">Leaderboard will appear when students submit</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry) => (
            <Card key={entry.student_id} className={`border-2 ${getRankBg(entry.rank)} transition-all hover:shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">{getRankIcon(entry.rank)}</div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{entry.student_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600">ID: {entry.student_id}</span>
                      <Badge variant="outline">{entry.class_name}</Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {entry.total_score}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                    <div className="text-xs text-gray-400 mt-1">{entry.submission_count} submissions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {leaderboard.length > 0 && leaderboard[0] && (
        <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Trophy className="w-6 h-6" />
              Winner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{leaderboard[0].student_name}</div>
              <div className="text-lg text-gray-600 mt-1">{leaderboard[0].total_score} points</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
