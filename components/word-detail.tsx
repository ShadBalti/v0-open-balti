"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Heart, Volume2, History, MessageSquare, Flag, Edit, Share2 } from "lucide-react"
import { WordFeedback } from "./word-feedback"
import { WordComments } from "./word-comments"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { WordEntryStructuredData, BreadcrumbStructuredData } from "./structured-data"

interface WordDetailProps {
  word: {
    _id: string
    balti: string
    english: string
    pronunciation?: string
    partOfSpeech?: string
    dialect?: string
    difficulty?: string
    etymology?: string
    examples?: Array<{ balti: string; english: string }>
    culturalContext?: string
    audioUrl?: string
    createdAt: string
    updatedAt: string
    createdBy?: {
      name: string
      _id: string
    }
    tags?: string[]
    relatedWords?: Array<{ _id: string; balti: string; english: string }>
  }
  onEdit?: () => void
  onFavorite?: () => void
  isFavorited?: boolean
}

export function WordDetail({ word, onEdit, onFavorite, isFavorited }: WordDetailProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [showFeedback, setShowFeedback] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Dictionary", url: "/" },
    { name: word.balti, url: `/words/${word._id}` },
  ]

  const playAudio = () => {
    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl)
      audio.play().catch(() => {
        toast({
          title: "Audio Error",
          description: "Could not play audio pronunciation",
          variant: "destructive",
        })
      })
    } else {
      toast({
        title: "No Audio Available",
        description: "Audio pronunciation is not available for this word",
        variant: "destructive",
      })
    }
  }

  const shareWord = async () => {
    const url = `${window.location.origin}/words/${word._id}`
    const text = `Check out this Balti word: ${word.balti} (${word.english}) on OpenBalti Dictionary`

    if (navigator.share) {
      try {
        await navigator.share({ title: `${word.balti} - OpenBalti Dictionary`, text, url })
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
        toast({
          title: "Link Copied",
          description: "Word link copied to clipboard",
        })
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link Copied",
        description: "Word link copied to clipboard",
      })
    }
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">{word.balti}</CardTitle>
                <p className="text-xl text-muted-foreground">{word.english}</p>
                {word.pronunciation && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/{word.pronunciation}/</span>
                    <Button variant="ghost" size="sm" onClick={playAudio} className="h-8 w-8 p-0">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {session && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onFavorite}
                      className={isFavorited ? "text-red-500" : ""}
                    >
                      <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={shareWord}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={onEdit}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {word.partOfSpeech && <Badge variant="secondary">{word.partOfSpeech}</Badge>}
              {word.dialect && <Badge variant="outline">{word.dialect}</Badge>}
              {word.difficulty && (
                <Badge
                  variant={
                    word.difficulty === "Easy" ? "default" : word.difficulty === "Medium" ? "secondary" : "destructive"
                  }
                >
                  {word.difficulty}
                </Badge>
              )}
              {word.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {word.etymology && (
              <div>
                <h3 className="font-semibold mb-2">Etymology</h3>
                <p className="text-sm text-muted-foreground">{word.etymology}</p>
              </div>
            )}

            {word.culturalContext && (
              <div>
                <h3 className="font-semibold mb-2">Cultural Context</h3>
                <p className="text-sm text-muted-foreground">{word.culturalContext}</p>
              </div>
            )}

            {word.examples && word.examples.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Examples</h3>
                <div className="space-y-2">
                  {word.examples.map((example, index) => (
                    <div key={index} className="border-l-2 border-muted pl-4">
                      <p className="font-medium">{example.balti}</p>
                      <p className="text-sm text-muted-foreground">{example.english}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {word.relatedWords && word.relatedWords.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Related Words</h3>
                <div className="flex flex-wrap gap-2">
                  {word.relatedWords.map((relatedWord) => (
                    <Badge key={relatedWord._id} variant="outline" className="cursor-pointer">
                      {relatedWord.balti} ({relatedWord.english})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>{word.createdBy && <span>Added by {word.createdBy.name}</span>}</div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Comments
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowFeedback(!showFeedback)}>
                  <Flag className="h-4 w-4 mr-1" />
                  Feedback
                </Button>
                <Button variant="ghost" size="sm">
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {showFeedback && <WordFeedback wordId={word._id} onClose={() => setShowFeedback(false)} />}

        {showComments && <WordComments wordId={word._id} onClose={() => setShowComments(false)} />}
      </div>

      <WordEntryStructuredData
        word={{
          id: word._id,
          balti: word.balti,
          english: word.english,
          pronunciation: word.pronunciation,
          partOfSpeech: word.partOfSpeech,
          dialect: word.dialect,
          difficulty: word.difficulty,
          etymology: word.etymology,
          examples: word.examples,
          culturalContext: word.culturalContext,
          dateAdded: word.createdAt,
          lastModified: word.updatedAt,
        }}
      />
      <BreadcrumbStructuredData items={breadcrumbItems} />
    </>
  )
}
