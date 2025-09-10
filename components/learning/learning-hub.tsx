"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Brain, Trophy, Target, Play, RotateCcw, Star } from "lucide-react"
import FlashcardSession from "./flashcard-session"
import QuizSession from "./quiz-session"
import LearningProgress from "./learning-progress"

interface LearningStats {
  wordsLearned: number
  streakDays: number
  totalSessions: number
  averageScore: number
  weakWords: string[]
  strongWords: string[]
}

interface LearningHubProps {
  user?: any
}

export default function LearningHub({ user }: LearningHubProps) {
  const { toast } = useToast()
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [activeSession, setActiveSession] = useState<"flashcards" | "quiz" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchLearningStats()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchLearningStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/learning/stats")
      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch learning statistics")
      }
    } catch (error) {
      console.error("Error fetching learning stats:", error)
      toast({
        title: "Error",
        description: "Failed to load learning statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startFlashcardSession = () => {
    setActiveSession("flashcards")
  }

  const startQuizSession = () => {
    setActiveSession("quiz")
  }

  const endSession = () => {
    setActiveSession(null)
    if (user) {
      fetchLearningStats() // Refresh stats after session
    }
  }

  if (activeSession === "flashcards") {
    return <FlashcardSession onEnd={endSession} />
  }

  if (activeSession === "quiz") {
    return <QuizSession onEnd={endSession} />
  }

  if (!user) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Sign In to Start Learning</CardTitle>
          <CardDescription>
            Create an account to track your progress and access personalized learning features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/auth/signin?callbackUrl=/learn">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Learning Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.wordsLearned || 0}</div>
            <p className="text-xs text-muted-foreground">Keep going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.streakDays || 0} days</div>
            <p className="text-xs text-muted-foreground">Daily learning streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Learning sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
            <p className="text-xs text-muted-foreground">Quiz performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Activities */}
      <Tabs defaultValue="practice" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Flashcards
                </CardTitle>
                <CardDescription>Review vocabulary with spaced repetition learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Due for review</span>
                    <Badge variant="outline">12 cards</Badge>
                  </div>
                  <Button onClick={startFlashcardSession} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Flashcards
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Quiz Mode
                </CardTitle>
                <CardDescription>Test your knowledge with interactive quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Available questions</span>
                    <Badge variant="outline">25 questions</Badge>
                  </div>
                  <Button onClick={startQuizSession} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <LearningProgress stats={stats} />
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  First Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Complete your first learning session</p>
                <Badge className="mt-2" variant={stats?.totalSessions ? "default" : "outline"}>
                  {stats?.totalSessions ? "Unlocked" : "Locked"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Streak Master
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Maintain a 7-day learning streak</p>
                <Badge className="mt-2" variant={(stats?.streakDays || 0) >= 7 ? "default" : "outline"}>
                  {(stats?.streakDays || 0) >= 7 ? "Unlocked" : `${stats?.streakDays || 0}/7 days`}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-green-500" />
                  Vocabulary Master
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Learn 100 words</p>
                <Badge className="mt-2" variant={(stats?.wordsLearned || 0) >= 100 ? "default" : "outline"}>
                  {(stats?.wordsLearned || 0) >= 100 ? "Unlocked" : `${stats?.wordsLearned || 0}/100 words`}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
