"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"

interface Word {
  _id: string
  balti: string
  english: string
}

interface QuizQuestion {
  word: Word
  options: string[]
  correctAnswer: string
}

interface QuizSessionProps {
  words: Word[]
  onComplete: (results: { correct: number; total: number }) => void
}

export default function QuizSession({ words, onComplete }: QuizSessionProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [sessionComplete, setSessionComplete] = useState(false)

  useEffect(() => {
    generateQuestions()
  }, [words])

  const generateQuestions = () => {
    const quizQuestions = words.slice(0, 10).map((word) => {
      // Create wrong options by selecting other words' translations
      const wrongOptions = words
        .filter((w) => w._id !== word._id)
        .map((w) => w.english)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      const allOptions = [word.english, ...wrongOptions].sort(() => Math.random() - 0.5)

      return {
        word,
        options: allOptions,
        correctAnswer: word.english,
      }
    })

    setQuestions(quizQuestions)
  }

  const handleSubmitAnswer = () => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const newResults = [...results, isCorrect]
    setResults(newResults)
    setShowResult(true)

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setSessionComplete(true)
        const correctCount = newResults.filter(Boolean).length
        onComplete({ correct: correctCount, total: questions.length })
      } else {
        setCurrentIndex((prev) => prev + 1)
        setSelectedAnswer("")
        setShowResult(false)
      }
    }, 1500)
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setSelectedAnswer("")
    setShowResult(false)
    setResults([])
    setSessionComplete(false)
    generateQuestions()
  }

  if (questions.length === 0) {
    return <div className="text-center p-6">Loading quiz...</div>
  }

  if (sessionComplete) {
    const correctCount = results.filter(Boolean).length
    const accuracy = Math.round((correctCount / questions.length) * 100)

    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Quiz Complete!</h3>
          <p className="text-muted-foreground">Here are your results</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{questions.length - correctCount}</div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
        </div>

        <Button onClick={resetSession} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Take Quiz Again
        </Button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">What is the English translation of:</CardTitle>
          <div className="text-center">
            <span className="text-3xl font-bold">{currentQuestion.word.balti}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showResult}>
            {currentQuestion.options.map((option, index) => {
              let className = "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"

              if (showResult) {
                if (option === currentQuestion.correctAnswer) {
                  className += " bg-green-50 border-green-200"
                } else if (option === selectedAnswer && !isCorrect) {
                  className += " bg-red-50 border-red-200"
                }
              }

              return (
                <div key={index} className={className}>
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  {showResult && option === currentQuestion.correctAnswer && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {showResult && option === selectedAnswer && !isCorrect && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              )
            })}
          </RadioGroup>

          {!showResult && (
            <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="w-full">
              Submit Answer
            </Button>
          )}

          {showResult && (
            <div className="text-center">
              {isCorrect ? (
                <div className="text-green-600 font-medium">Correct! Well done.</div>
              ) : (
                <div className="text-red-600 font-medium">
                  Incorrect. The correct answer is "{currentQuestion.correctAnswer}".
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
