"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, TrendingUp, Globe } from "lucide-react"

interface Stats {
  totalWords: number
  totalContributors: number
  recentlyAdded: number
  dialects: number
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalWords: 0,
    totalContributors: 0,
    recentlyAdded: 0,
    dialects: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/stats/quick", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }

        const result = await response.json()

        if (result.success) {
          setStats(result.data)
        } else {
          throw new Error(result.error || "Failed to fetch stats")
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statItems = [
    {
      label: "Total Words",
      value: stats.totalWords,
      icon: <BookOpen className="h-4 w-4" />,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Contributors",
      value: stats.totalContributors,
      icon: <Users className="h-4 w-4" />,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Added This Week",
      value: stats.recentlyAdded,
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Dialects",
      value: stats.dialects,
      icon: <Globe className="h-4 w-4" />,
      color: "text-purple-600 dark:text-purple-400",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-6 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <Card key={index} className="transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={item.color}>{item.icon}</div>
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
              </div>
              <div className="text-lg text-muted-foreground">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={item.color}>{item.icon}</div>
              <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
            </div>
            <div className="text-2xl font-bold">{item.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
