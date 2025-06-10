"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WordFeedback } from "./word-feedback"
import { WordComments } from "./word-comments"
import { WordEtymology } from "./word-etymology"
import { WordShare } from "./word-share"
import { Heart, Volume2, BookOpen, MessageSquare, History, Edit, Plus, Clock, User, MapPin, Star } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface WordDetailProps {
  wordId: string
}

interface WordData {
  _id: string
  balti: string
  english: string
  phonetic?: string
  categories?: string[]
  dialect?: string
  difficultyLevel?: string
  usageNotes?: string
  examples?: Array<{
    balti: string
    english: string
  }>
  relatedWords?: string[]
  etymology?: {
    origin: string
    historicalForms: Array<{
      period: string
      form: string
    }>
    relatedLanguages: Array<{
      language: string
      word: string
      meaning: string
    }>
    culturalContext: string
    sources: string[]
    verificationStatus: string
  }
  feedbackStats?: {
    useful: number
    trusted: number
    needsReview: number
  }
  createdBy?: {
    name: string
    image?: string
  }
  createdAt: string
  updatedAt: string
}

function WordDetail({ wordId }: WordDetailProps) {
  const { data: session } = useSession()
  const [word, setWord] = useState<WordData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWordDetails()
    if (session?.user) {
      checkFavoriteStatus()
    }
  }, [wordId, session])

  const fetchWordDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/words/${wordId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch word details")
      }

      const result = await response.json()
      if (result.success) {
        setWord(result.data)
      } else {
        throw new Error(result.error || "Failed to load word")
      }
    } catch (error) {
      console.error("Error fetching word:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites?wordId=${wordId}`)
      if (response.ok) {
        const result = await response.json()
        setIsFavorited(result.isFavorited)
      }
    } catch (error) {
      console.error("Error checking favorite status:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error("Please sign in to add favorites")
      return
    }

    try {
      const method = isFavorited ? "DELETE" : "POST"
      const response = await fetch(`/api/favorites/${wordId}`, {
        method,
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
        toast.success(isFavorited ? "Removed from favorites" : "Added to favorites")
      } else {
        throw new Error("Failed to update favorite")
      }
    } catch (error) {
      toast.error("Failed to update favorite")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="flex gap-2">
            <div className="h-6 bg-muted rounded w-16" />
            <div className="h-6 bg-muted rounded w-20" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !word) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{error || "Word not found"}</p>
          <Button asChild className="mt-4">
            <Link href="/words">Browse Words</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Word Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl text-primary">{word.balti}</CardTitle>
                <Button variant="ghost" size="icon">
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription className="text-xl">{word.english}</CardDescription>
              {word.phonetic && <p className="text-sm text-muted-foreground font-mono">/{word.phonetic}/</p>}
            </div>

            <div className="flex gap-2">
              <Button variant={isFavorited ? "default" : "outline"} size="icon" onClick={toggleFavorite}>
                <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
              </Button>
              <WordShare word={word} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            {word.difficultyLevel && (
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                {word.difficultyLevel}
              </Badge>
            )}
            {word.dialect && (
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                {word.dialect}
              </Badge>
            )}
            {word.categories?.map((category, index) => (
              <Badge key={index} variant="outline">
                {category}
              </Badge>
            ))}
          </div>

          {/* Usage Notes */}
          {word.usageNotes && (
            <div>
              <h3 className="font-semibold mb-2">Usage Notes</h3>
              <p className="text-muted-foreground">{word.usageNotes}</p>
            </div>
          )}

          {/* Examples */}
          {word.examples && word.examples.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Examples</h3>
              <div className="space-y-3">
                {word.examples.map((example, index) => (
                  <div key={index} className="border-l-2 border-primary/20 pl-4">
                    <p className="font-medium text-primary">{example.balti}</p>
                    <p className="text-muted-foreground">{example.english}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Words */}
          {word.relatedWords && word.relatedWords.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Related Words</h3>
              <div className="flex flex-wrap gap-2">
                {word.relatedWords.map((relatedWord, index) => (
                  <Badge key={index} variant="outline" className="cursor-pointer">
                    {relatedWord}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <Separator />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {word.createdBy && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Added by {word.createdBy.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(word.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/words/${wordId}/history`}>
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
              </Button>
              {session?.user && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/words/${wordId}/etymology`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Etymology
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Additional Content */}
      <Tabs defaultValue="etymology" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="etymology">
            <BookOpen className="h-4 w-4 mr-2" />
            Etymology
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="etymology" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Etymology & History</CardTitle>
                {session?.user && !word.etymology && (
                  <Button asChild size="sm">
                    <Link href={`/words/${wordId}/etymology`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Etymology
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <WordEtymology wordId={wordId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <WordFeedback wordId={wordId} />
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <WordComments wordId={wordId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WordDetail
export { WordDetail }
