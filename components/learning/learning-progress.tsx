"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Target, TrendingUp, BookOpen, Brain } from "lucide-react"

interface LearningStats {
  totalSessions: number
  totalWords: number
  averageAccuracy: number
  streak: number
  weeklyGoal: number
  weeklyProgress: number
  recentSessions: Array<{
    date: string
    type: "flashcard" | "quiz"
    score: number
    wordsStudied: number
  }>
  achievements: Array<{
    id: string
    name: string
    description: string
    earned: boolean
    earnedAt?: string
  }>
}

export default function LearningProgress() {
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLearningStats()
  }, [])

  const fetchLearningStats = async () => {
    try {
      const response = await fetch("/api/learning/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching learning stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading progress...</div>
  }

  if (!stats) {
    return (
      <div className="text-center p-6">
        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Start Learning</h3>
        <p className="text-muted-foreground">Complete your first session to see your progress here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Learning Progress</h2>
        <p className="text-muted-foreground">Track your Balti language learning journey</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Learning sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Studied</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWords}</div>
            <p className="text-xs text-muted-foreground">Unique words practiced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
            <p className="text-xs text-muted-foreground">Across all sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Goal
          </CardTitle>
          <CardDescription>
            {stats.weeklyProgress} of {stats.weeklyGoal} sessions this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(stats.weeklyProgress / stats.weeklyGoal) * 100} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{stats.weeklyProgress} completed</span>
            <span>{stats.weeklyGoal - stats.weeklyProgress} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your latest learning activity</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent sessions</p>
          ) : (
            <div className="space-y-3">
              {stats.recentSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        session.type === "flashcard" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                      }`}
                    >
                      {session.type === "flashcard" ? <BookOpen className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{session.type} Session</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()} • {session.wordsStudied} words
                      </div>
                    </div>
                  </div>
                  <Badge variant={session.score >= 80 ? "default" : session.score >= 60 ? "secondary" : "destructive"}>
                    {session.score}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Milestones you've unlocked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {stats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border ${
                  achievement.earned ? "bg-yellow-50 border-yellow-200" : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className={`h-4 w-4 ${achievement.earned ? "text-yellow-600" : "text-muted-foreground"}`} />
                  <span className={`font-medium ${achievement.earned ? "text-yellow-800" : "text-muted-foreground"}`}>
                    {achievement.name}
                  </span>
                </div>
                <p className={`text-sm ${achievement.earned ? "text-yellow-700" : "text-muted-foreground"}`}>
                  {achievement.description}
                </p>
                {achievement.earned && achievement.earnedAt && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
