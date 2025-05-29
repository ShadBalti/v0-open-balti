"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Loader2, RotateCw, ArrowLeftRight, Filter, Plus, X, Sparkles, BookOpen } from "lucide-react"
import WordList from "@/components/word-list"
import WordForm from "@/components/word-form"
import SearchBar from "@/components/search-bar"
import DialectBrowser from "@/components/dialect-browser"
import DifficultyBrowser from "@/components/difficulty-browser"
import FeedbackFilter from "@/components/feedback-filter"
import type { IWord } from "@/models/Word"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OnboardingTour } from "@/components/ui/onboarding-tour"
import { QuickStats } from "@/components/ui/quick-stats"
import { WordOfTheDay } from "@/components/ui/word-of-the-day"

export default function WordsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [words, setWords] = useState<IWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingWord, setEditingWord] = useState<IWord | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [wordToDelete, setWordToDelete] = useState<string | null>(null)
  const [direction, setDirection] = useState<"balti-to-english" | "english-to-balti">("balti-to-english")
  const [activeTab, setActiveTab] = useState<"browse" | "add">("browse")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDialect, setSelectedDialect] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null)
  const [showFiltersSheet, setShowFiltersSheet] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        searchInput?.focus()
      }

      // Ctrl/Cmd + N for new word (if logged in)
      if ((e.ctrlKey || e.metaKey) && e.key === "n" && session) {
        e.preventDefault()
        setActiveTab("add")
      }

      // Escape to clear search
      if (e.key === "Escape" && searchTerm) {
        setSearchTerm("")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [session, searchTerm, setSearchTerm])

  // Initialize state from URL parameters
  useEffect(() => {
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category")
    const dialect = searchParams.get("dialect")
    const difficulty = searchParams.get("difficulty")
    const feedback = searchParams.get("feedback")
    const tab = searchParams.get("tab")

    setSearchTerm(search)
    setSelectedCategory(category)
    setSelectedDialect(dialect)
    setSelectedDifficulty(difficulty)
    setSelectedFeedback(feedback)

    if (tab === "add" && session) {
      setActiveTab("add")
    }

    fetchWords(search, category, dialect, difficulty, feedback)

    // Count active filters
    let count = 0
    if (category) count++
    if (dialect) count++
    if (difficulty) count++
    if (feedback) count++
    setActiveFiltersCount(count)
  }, [searchParams, session])

  const fetchWords = async (
    search = searchTerm,
    category = selectedCategory,
    dialect = selectedDialect,
    difficulty = selectedDifficulty,
    feedback = selectedFeedback,
  ) => {
    try {
      setIsLoading(true)

      // Build query string
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category) params.append("category", category)
      if (dialect) params.append("dialect", dialect)
      if (difficulty) params.append("difficulty", difficulty)
      if (feedback) params.append("feedback", feedback)

      const response = await fetch(`/api/words?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setWords(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch words",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching words:", error)
      toast({
        title: "Error",
        description: "Failed to fetch words",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateUrl = (
    search = searchTerm,
    category = selectedCategory,
    dialect = selectedDialect,
    difficulty = selectedDifficulty,
    feedback = selectedFeedback,
    tab = activeTab,
  ) => {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (category) params.append("category", category)
    if (dialect) params.append("dialect", dialect)
    if (difficulty) params.append("difficulty", difficulty)
    if (feedback) params.append("feedback", feedback)
    if (tab !== "browse") params.append("tab", tab)

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : "/")
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    updateUrl(term, selectedCategory, selectedDialect, selectedDifficulty, selectedFeedback)
  }

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    updateUrl(searchTerm, category, selectedDialect, selectedDifficulty, selectedFeedback)
  }

  const handleDialectChange = (dialect: string | null) => {
    setSelectedDialect(dialect)
    updateUrl(searchTerm, selectedCategory, dialect, selectedDifficulty, selectedFeedback)
  }

  const handleDifficultyChange = (difficulty: string | null) => {
    setSelectedDifficulty(difficulty)
    updateUrl(searchTerm, selectedCategory, selectedDialect, difficulty, selectedFeedback)
  }

  const handleFeedbackChange = (feedback: string | null) => {
    setSelectedFeedback(feedback)
    updateUrl(searchTerm, selectedCategory, selectedDialect, selectedDifficulty, feedback)
  }

  const clearAllFilters = () => {
    setSelectedCategory(null)
    setSelectedDialect(null)
    setSelectedDifficulty(null)
    setSelectedFeedback(null)
    setActiveFiltersCount(0)
    updateUrl(searchTerm, null, null, null, null)
    setShowFiltersSheet(false)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "browse" | "add")
    updateUrl(
      searchTerm,
      selectedCategory,
      selectedDialect,
      selectedDifficulty,
      selectedFeedback,
      tab as "browse" | "add",
    )
  }

  const handleAddWord = async (wordData: any) => {
    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wordData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Word added successfully! 🎉",
        })
        setActiveTab("browse")
        fetchWords() // Refresh the word list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add word",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding word:", error)
      toast({
        title: "Error",
        description: "Failed to add word",
        variant: "destructive",
      })
    }
  }

  const handleEditWord = (word: IWord) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to edit words",
        variant: "destructive",
      })
      return
    }
    setEditingWord(word)
    setActiveTab("add")
  }

  const handleUpdateWord = async (wordData: any) => {
    if (!editingWord) return

    try {
      const response = await fetch(`/api/words/${editingWord._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wordData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Word updated successfully! ✨",
        })
        setActiveTab("browse")
        setEditingWord(null)
        fetchWords() // Refresh the word list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update word",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating word:", error)
      toast({
        title: "Error",
        description: "Failed to update word",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (id: string) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to delete words",
        variant: "destructive",
      })
      return
    }
    setWordToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteWord = async () => {
    if (!wordToDelete) return

    try {
      const response = await fetch(`/api/words/${wordToDelete}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Word deleted successfully",
        })
        fetchWords() // Refresh the word list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete word",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting word:", error)
      toast({
        title: "Error",
        description: "Failed to delete word",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setWordToDelete(null)
    }
  }

  const toggleDirection = () => {
    setDirection((prev) => (prev === "balti-to-english" ? "english-to-balti" : "balti-to-english"))
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Balti Dictionary</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the beauty of the Balti language. Search, learn, and contribute to preserving this ancient Tibetic
          dialect.
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Search Section */}
      <div className="flex flex-col items-center space-y-6">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={handleSearchChange}
          placeholder="Search for Balti or English words... (Ctrl+K)"
          className="w-full max-w-2xl"
        />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex gap-2" id="filters-button">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Dictionary</SheetTitle>
                <SheetDescription>
                  Filter words by category, dialect, difficulty, and community feedback.
                </SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-6">
                <DialectBrowser selectedDialect={selectedDialect} onDialectChange={handleDialectChange} inline />
                <DifficultyBrowser
                  selectedDifficulty={selectedDifficulty}
                  onDifficultyChange={handleDifficultyChange}
                  inline
                />
                <FeedbackFilter selectedFeedback={selectedFeedback} onFeedbackChange={handleFeedbackChange} inline />
              </div>

              <SheetFooter>
                <div className="flex justify-between w-full">
                  <Button variant="outline" onClick={clearAllFilters} disabled={activeFiltersCount === 0}>
                    Clear all
                  </Button>
                  <SheetClose asChild>
                    <Button>Apply filters</Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Button
            onClick={toggleDirection}
            variant="outline"
            className="flex gap-2"
            aria-label={`Toggle direction to ${direction === "balti-to-english" ? "English to Balti" : "Balti to English"}`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">
              {direction === "balti-to-english" ? "Balti → English" : "English → Balti"}
            </span>
          </Button>

          <Button onClick={() => fetchWords()} variant="outline" className="flex gap-2">
            <RotateCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {session && (
            <Button onClick={() => setActiveTab("add")} className="flex gap-2" id="add-word-button">
              <Plus className="h-4 w-4" />
              <span>Add Word</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Active filters:</span>
            {selectedCategory && (
              <Badge variant="outline" className="flex items-center gap-1">
                Category: {selectedCategory}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleCategoryChange(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedDialect && (
              <Badge variant="outline" className="flex items-center gap-1">
                Dialect: {selectedDialect}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleDialectChange(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedDifficulty && (
              <Badge variant="outline" className="flex items-center gap-1">
                Difficulty: {selectedDifficulty}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleDifficultyChange(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedFeedback && (
              <Badge variant="outline" className="flex items-center gap-1">
                Feedback: {selectedFeedback}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFeedbackChange(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Dictionary
              </TabsTrigger>
              {session ? (
                <TabsTrigger value="add" className="flex items-center gap-2">
                  {editingWord ? (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Edit Word
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add New Word
                    </>
                  )}
                </TabsTrigger>
              ) : (
                <TabsTrigger value="add" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Word (Login Required)
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="browse" className="focus:outline-none">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="text-lg font-medium">Loading dictionary...</p>
                      <p className="text-sm text-muted-foreground">Fetching the latest words</p>
                    </div>
                  </div>
                </div>
              ) : words.length > 0 ? (
                <WordList
                  words={words}
                  direction={direction}
                  onEdit={handleEditWord}
                  onDelete={confirmDelete}
                  showActions={!!session}
                />
              ) : (
                <Card className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-6">
                    <div className="text-6xl opacity-20">🔍</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No words found</h3>
                      <p className="text-muted-foreground max-w-md">
                        {searchTerm || activeFiltersCount > 0
                          ? "Try adjusting your search terms or filters to find what you're looking for."
                          : "The dictionary is empty. Be the first to add a word!"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {searchTerm || activeFiltersCount > 0 ? (
                        <Button variant="outline" onClick={clearAllFilters}>
                          Clear all filters
                        </Button>
                      ) : session ? (
                        <Button onClick={() => setActiveTab("add")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add your first word
                        </Button>
                      ) : (
                        <Button asChild>
                          <Link href="/auth/signin">Sign in to add words</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="add" className="focus:outline-none">
              {session ? (
                <WordForm
                  initialData={editingWord}
                  onSubmit={editingWord ? handleUpdateWord : handleAddWord}
                  onCancel={() => {
                    setEditingWord(null)
                    setActiveTab("browse")
                  }}
                />
              ) : (
                <Card className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-6">
                    <div className="text-6xl opacity-20">🔐</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Authentication Required</h3>
                      <p className="text-muted-foreground max-w-md">
                        You need to be logged in to add or edit words in the dictionary.
                      </p>
                    </div>
                    <Button asChild size="lg">
                      <Link href="/auth/signin?callbackUrl=/">Sign In to Continue</Link>
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <WordOfTheDay />

          {/* Quick tips card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">💡 Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5">
                  Ctrl+K
                </Badge>
                <span>Quick search</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5">
                  Ctrl+N
                </Badge>
                <span>Add new word</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5">
                  ESC
                </Badge>
                <span>Clear search</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the word and all associated data from the
              dictionary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWord}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  )
}
