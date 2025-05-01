"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { format, subDays, addDays } from "date-fns"

export function PreviousWordsOfTheDay() {
  const [words, setWords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const fetchPreviousWords = async () => {
      try {
        setLoading(true)
        // Calculate the start date (7 days before the current date)
        const startDate = format(subDays(currentDate, 6), "yyyy-MM-dd")

        const response = await fetch(`/api/words/word-of-the-day/history?days=7&startDate=${startDate}`)

        if (!response.ok) {
          throw new Error("Failed to fetch previous words")
        }

        const data = await response.json()
        setWords(data.words || [])
        setError(null)
      } catch (err) {
        setError("Could not load previous words")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPreviousWords()
  }, [currentDate])

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => subDays(prev, 7))
  }

  const handleNextWeek = () => {
    const nextDate = addDays(currentDate, 7)
    if (nextDate <= new Date()) {
      setCurrentDate(nextDate)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded"></div>
                <div className="h-4 w-32 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted rounded mb-2"></div>
                <div className="h-4 w-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  if (error || words.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || "No previous words found"}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setCurrentDate(new Date())}>Try Again</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePreviousWeek}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous Week
        </Button>
        <p className="text-muted-foreground">
          {format(subDays(currentDate, 6), "MMM d")} - {format(currentDate, "MMM d, yyyy")}
        </p>
        <Button variant="outline" onClick={handleNextWeek} disabled={addDays(currentDate, 7) > new Date()}>
          Next Week
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {words.map((word) => (
          <Card key={word._id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {format(new Date(word.date), "EEEE, MMMM d, yyyy")}
                </CardTitle>
              </div>
              <CardDescription>Word of the Day</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{word.balti}</h3>
                <p className="text-muted-foreground">{word.english}</p>
                {word.phonetic && <p className="text-sm text-muted-foreground italic">/{word.phonetic}/</p>}

                {word.categories && word.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {word.categories.map((category: string) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-3">
              <Link href={`/words/${word._id}`} passHref>
                <Button size="sm">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
