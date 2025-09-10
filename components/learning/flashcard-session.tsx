"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RotateCcw, CheckCircle, XCircle, Eye } from "lucide-react"

interface Word {
  _id: string
  balti: string
  english: string
  phonetic?: string
}

interface FlashcardSessionProps {
  words: Word[]
  onComplete: (results: { correct: number; total: number }) => void
}

export default function FlashcardSession({ words, onComplete }: FlashcardSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [sessionComplete, setSessionComplete] = useState(false)

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100

  const handleAnswer = (correct: boolean) => {
    const newResults = [...results, correct]
    setResults(newResults)

    if (currentIndex + 1 >= words.length) {
      // Session complete
      setSessionComplete(true)
      const correctCount = newResults.filter(Boolean).length
      onComplete({ correct: correctCount, total: words.length })
    } else {
      // Next card
      setCurrentIndex((prev) => prev + 1)
      setShowAnswer(false)
    }
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setResults([])
    setSessionComplete(false)
  }

  if (sessionComplete) {
    const correctCount = results.filter(Boolean).length
    const accuracy = Math.round((correctCount / words.length) * 100)

    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Session Complete!</h3>
          <p className="text-muted-foreground">Great job practicing your Balti vocabulary</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{words.length - correctCount}</div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
        </div>

        <Button onClick={resetSession} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Practice Again
        </Button>
      </div>
    )
  }

  if (!currentWord) {
    return <div className="text-center p-6">No words available for practice</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Card {currentIndex + 1} of {words.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="min-h-[300px] flex items-center justify-center">
        <CardContent className="text-center space-y-6 p-8">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold">{currentWord.balti}</h3>
            {currentWord.phonetic && <p className="text-muted-foreground">/{currentWord.phonetic}/</p>}
          </div>

          {showAnswer ? (
            <div className="space-y-4">
              <div className="text-xl text-green-600 font-medium">{currentWord.english}</div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Incorrect
                </Button>
                <Button onClick={() => handleAnswer(true)} className="gap-2 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Correct
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAnswer(true)} variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Show Answer
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Think about the English translation, then reveal the answer
      </div>
    </div>
  )
}
