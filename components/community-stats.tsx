"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ThumbsUp, MessageSquare, Loader2 } from "lucide-react"

export default function CommunityStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFeedback: 0,
    totalComments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/stats/community")
      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error("Error fetching community stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community Contributions
        </CardTitle>
        <CardDescription>See how the community is helping improve the dictionary</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <Users className="h-6 w-6 text-primary mb-2" />
            <span className="text-2xl font-bold">{stats.totalUsers}</span>
            <span className="text-xs text-muted-foreground">Contributors</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <ThumbsUp className="h-6 w-6 text-green-500 mb-2" />
            <span className="text-2xl font-bold">{stats.totalFeedback}</span>
            <span className="text-xs text-muted-foreground">Feedback</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-md">
            <MessageSquare className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-2xl font-bold">{stats.totalComments}</span>
            <span className="text-xs text-muted-foreground">Comments</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
