"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Share2, Volume2, Calendar } from "lucide-react"
import { FeedbackBadges } from "@/components/feedback-badges"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface WordOfTheDayProps {
  className?: string
}

export function WordOfTheDay({ className }: WordOfTheDayProps) {
  const [word, setWord] = useState<any>(null)
  const [date, setDate] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/words/word-of-the-day")

        if (!response.ok) {
          throw new Error("Failed to fetch word of the day")
        }

        const data = await response.json()
        setWord(data.word)
        setDate(data.date)
        setError(null)
      } catch (err) {
        setError("Could not load word of the day")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchWordOfTheDay()
  }, [])

  const handleShare = async () => {
    if (!word) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `OpenBalti Dictionary - Word of the Day: ${word.balti}`,
          text: `Today's Balti word is "${word.balti}" which means "${word.english}" in English.`,
          url: `${window.location.origin}/words/${word._id}`,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(
        `OpenBalti Dictionary - Word of the Day: ${word.balti} (${word.english}) ${window.location.origin}/words/${word._id}`,
      )
      toast({
        title: "Link copied!",
        description: "Word of the day link copied to clipboard",
      })
    }
  }

  if (loading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <Skeleton className="h-7 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-5 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-3 flex justify-between">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </CardFooter>
      </Card>
    )
  }

  if (error || !word) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Word of the Day
          </CardTitle>
          <CardDescription>Discover a new Balti word every day</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            {error || "No word available today. Please check back later."}
          </div>
        </CardContent>
        <CardFooter className="pt-3">
          <Button variant="outline" onClick={() => router.refresh()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Word of the Day
          </CardTitle>
          <Badge variant="outline">
            {new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </Badge>
        </div>
        <CardDescription className="flex items-center justify-between">
          <span>Discover a new Balti word every day</span>
          <Link href="/word-of-the-day" className="text-xs text-primary hover:underline">
            View previous words
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{word.balti}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Listen to pronunciation">
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-lg text-muted-foreground">{word.english}</p>
            {word.phonetic && <p className="text-sm text-muted-foreground italic">/{word.phonetic}/</p>}
          </div>

          {word.categories && word.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {word.categories.map((category: string) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {word.feedbackStats && (
            <div className="pt-2">
              <FeedbackBadges feedbackStats={word.feedbackStats} />
            </div>
          )}

          {word.createdBy && (
            <p className="text-xs text-muted-foreground">
              Added {formatDistanceToNow(new Date(word.createdAt), { addSuffix: true })} by {word.createdBy.name}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Link href={`/words/${word._id}`} passHref>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
