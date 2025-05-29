"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  placeholder?: string
  className?: string
}

interface SearchSuggestion {
  id: string
  text: string
  balti: string
  english: string
  type: "recent" | "popular" | "suggestion"
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  placeholder = "Search words...",
  className,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(searchTerm)
  const [debouncedValue, setDebouncedValue] = useState(searchTerm)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Update input value when searchTerm prop changes
  useEffect(() => {
    setInputValue(searchTerm)
  }, [searchTerm])

  // Debounce input value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue)
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [inputValue])

  // Update search term when debounced value changes
  useEffect(() => {
    setSearchTerm(debouncedValue)
  }, [debouncedValue, setSearchTerm])

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (query: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/words/suggestions?q=${encodeURIComponent(query)}&limit=8`)

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions")
      }

      const result = await response.json()

      if (result.success) {
        setSuggestions(result.data)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input focus
  const handleFocus = () => {
    setShowSuggestions(true)
    // Load initial suggestions (popular and recent)
    if (suggestions.length === 0) {
      fetchSuggestions("")
    }
  }

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
      }
    }, 150)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Fetch suggestions based on input
    fetchSuggestions(value)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setInputValue(suggestion.balti)
    setSearchTerm(suggestion.balti)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(inputValue)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    setInputValue("")
    setSearchTerm("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-12 pl-12 pr-12 text-base border-2 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {inputValue && (
            <Button
              type="button"
              onClick={clearSearch}
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (
        <Card
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 p-2 z-50 max-h-80 overflow-y-auto shadow-lg border-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-1">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="ghost"
                  className="w-full justify-start h-auto py-3 px-3 text-left hover:bg-accent/50"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {suggestion.type === "recent" && <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    {suggestion.type === "popular" && (
                      <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    {suggestion.type === "suggestion" && (
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{suggestion.balti}</div>
                      <div className="text-sm text-muted-foreground">{suggestion.english}</div>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{suggestion.type}</span>
                  </div>
                </Button>
              ))}
            </div>
          ) : inputValue ? (
            <div className="py-4 text-center text-muted-foreground">
              <p className="text-sm">No suggestions found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              <p className="text-sm">Start typing to see suggestions</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
