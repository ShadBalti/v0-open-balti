"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Trash2, Volume2, Bookmark, BookmarkCheck, ExternalLink, GraduationCap, MapPin, Hash } from "lucide-react"
import type { IWord } from "@/models/Word"
import WordDetail from "@/components/word-detail"
import { cn } from "@/lib/utils"

interface WordListProps {
  words: IWord[]
  direction: "balti-to-english" | "english-to-balti"
  onEdit?: (word: IWord) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}

export default function WordList({ words, direction, onEdit, onDelete, showActions = false }: WordListProps) {
  const [selectedWord, setSelectedWord] = useState<IWord | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (wordId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(wordId)) {
        newFavorites.delete(wordId)
      } else {
        newFavorites.add(wordId)
      }
      return newFavorites
    })
  }

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-4 text-6xl opacity-20">📚</div>
          <h3 className="text-lg font-semibold mb-2">No words found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <Button variant="outline">Clear all filters</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {words.length} word{words.length !== 1 ? "s" : ""}
        </p>
        <Badge variant="outline" className="text-xs">
          {direction === "balti-to-english" ? "Balti → English" : "English → Balti"}
        </Badge>
      </div>

      {/* Word grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {words.map((word) => (
          <Card
            key={word._id}
            className="group hover-lift transition-all duration-200 hover:border-primary/50 cursor-pointer"
          >
            <CardContent className="p-6">
              {/* Main word content */}
              <div className="space-y-4">
                {/* Primary and secondary text */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {direction === "balti-to-english" ? word.balti : word.english}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(word._id)
                        }}
                      >
                        {favorites.has(word._id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      {word.phonetic && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-lg text-muted-foreground">
                    {direction === "balti-to-english" ? word.english : word.balti}
                  </p>

                  {word.phonetic && <p className="text-sm text-muted-foreground font-mono">/{word.phonetic}/</p>}
                </div>

                {/* Metadata badges */}
                <div className="flex flex-wrap gap-2">
                  {word.difficultyLevel && (
                    <Badge variant="secondary" className={cn("text-xs", getDifficultyColor(word.difficultyLevel))}>
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {word.difficultyLevel}
                    </Badge>
                  )}

                  {word.dialect && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {word.dialect}
                    </Badge>
                  )}

                  {word.categories && word.categories.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Hash className="h-3 w-3 mr-1" />
                      {word.categories[0]}
                      {word.categories.length > 1 && ` +${word.categories.length - 1}`}
                    </Badge>
                  )}
                </div>

                {/* Usage notes preview */}
                {word.usageNotes && <p className="text-sm text-muted-foreground line-clamp-2">{word.usageNotes}</p>}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setSelectedWord(word)}
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      {selectedWord && <WordDetail word={selectedWord} onClose={() => setSelectedWord(null)} />}
                    </DialogContent>
                  </Dialog>

                  {showActions && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit?.(word)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete?.(word._id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
