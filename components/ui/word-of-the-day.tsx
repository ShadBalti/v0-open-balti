"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Volume2, BookOpen, RefreshCw } from "lucide-react"

interface WordOfDayData {
  _id: string
  balti: string
  english: string
  phonetic?: string
  categories?: string[]
  dialect?: string
  difficultyLevel?: string
  usageNotes?: string
  relatedWords?: string[]
  feedbackStats?: {
    useful: number
    trusted: number
    needsReview: number
  }
}

export function WordOfTheDay() {
  const [word, setWord] = useState<WordOfDayData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWordOfTheDay = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/words/word-of-day", {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch word of the day")
      }

      const result = await response.json()

      if (result.success) {
        setWord(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch word")
      }
    } catch (error) {
      console.error("Failed to fetch word of the day:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWordOfTheDay()
  }, [])

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted rounded" />
            <div className="h-6 bg-muted rounded w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-8 bg-muted rounded" />
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-5 bg-muted rounded w-16" />
            <div className="h-5 bg-muted rounded w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !word) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-2">{error || "Unable to load word of the day"}</p>
          <Button variant="outline" size="sm" onClick={fetchWordOfTheDay}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Word of the Day</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchWordOfTheDay}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Expand your Balti vocabulary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-primary">{word.balti}</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-lg text-muted-foreground">{word.english}</p>
          {word.phonetic && <p className="text-sm text-muted-foreground font-mono">/{word.phonetic}/</p>}
        </div>

        {word.usageNotes && <p className="text-sm leading-relaxed">{word.usageNotes}</p>}

        <div className="flex flex-wrap gap-2">
          {word.difficultyLevel && (
            <Badge variant="secondary" className="text-xs">
              {word.difficultyLevel}
            </Badge>
          )}
          {word.dialect && (
            <Badge variant="outline" className="text-xs">
              {word.dialect}
            </Badge>
          )}
          {word.categories?.slice(0, 2).map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>

        {word.feedbackStats && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>👍 {word.feedbackStats.useful}</span>
            <span>✅ {word.feedbackStats.trusted}</span>
          </div>
        )}

        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full">
            <BookOpen className="h-4 w-4 mr-2" />
            Learn More About This Word
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
