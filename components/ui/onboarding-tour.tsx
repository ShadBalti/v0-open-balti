"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ArrowRight, ArrowLeft, BookOpen, Search, Plus, Filter } from "lucide-react"
import { useSession } from "next-auth/react"

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  target?: string
  position?: "top" | "bottom" | "left" | "right"
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to OpenBalti! 🎉",
    description: "Discover the beauty of the Balti language. Let's take a quick tour to get you started.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    id: "search",
    title: "Search the Dictionary",
    description: "Use the search bar to find Balti or English words. Try typing 'water' or use Ctrl+K as a shortcut.",
    icon: <Search className="h-5 w-5" />,
    target: "search-bar",
  },
  {
    id: "filters",
    title: "Filter Your Results",
    description: "Use filters to narrow down words by dialect, difficulty level, or community feedback.",
    icon: <Filter className="h-5 w-5" />,
    target: "filters-button",
  },
  {
    id: "contribute",
    title: "Contribute to the Dictionary",
    description: "Help grow the dictionary by adding new words. Sign in to start contributing!",
    icon: <Plus className="h-5 w-5" />,
    target: "add-word-button",
  },
]

export function OnboardingTour() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem("openbalti-tour-completed")
    if (!hasSeenTour) {
      // Delay showing the tour to let the page load
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    try {
      localStorage.setItem("openbalti-tour-completed", "true")
    } catch (error) {
      console.error("Error saving tour state to localStorage:", error)
    }
    setIsOpen(false)
    setCurrentStep(0)
  }

  const handleSkip = () => {
    try {
      localStorage.setItem("openbalti-tour-completed", "true")
    } catch (error) {
      console.error("Error saving tour state to localStorage:", error)
    }
    setIsOpen(false)
    setCurrentStep(0)
  }

  if (!isOpen) return null

  const currentTourStep = tourSteps[currentStep]
  const isLastStep = currentStep === tourSteps.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentTourStep.icon}
              <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Step {currentStep + 1} of {tourSteps.length}
            </Badge>
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    index <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <CardDescription className="text-base leading-relaxed">{currentTourStep.description}</CardDescription>

          {/* Special content for specific steps */}
          {currentStep === 3 && !session && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Sign in with Google or GitHub to start adding words to the dictionary and help
                preserve the Balti language!
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="flex gap-2">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
              <Button onClick={handleNext} className="flex gap-2">
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
