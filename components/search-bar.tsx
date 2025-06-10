"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchResult {
  _id: string
  balti: string
  english: string
  pronunciation?: string
}

interface SearchBarProps {
  className?: string
  placeholder?: string
  showResults?: boolean
}

export function SearchBar({
  className = "",
  placeholder = "Search words in Balti or English...",
  showResults = true,
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2 && showResults) {
      searchWords(debouncedQuery)
    } else {
      setResults([])
      setShowDropdown(false)
    }
  }, [debouncedQuery, showResults])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchWords = async (searchQuery: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/words?search=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await response.json()

      if (data.success) {
        setResults(data.words)
        setShowDropdown(true)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/words?search=${encodeURIComponent(query.trim())}`)
      setShowDropdown(false)
    }
  }

  const handleResultClick = (wordId: string) => {
    router.push(`/words/${wordId}`)
    setShowDropdown(false)
    setQuery("")
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setShowDropdown(false)
  }

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-20 h-12 text-base"
            onFocus={() => {
              if (results.length > 0) {
                setShowDropdown(true)
              }
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {query && (
              <Button type="button" variant="ghost" size="sm" onClick={clearSearch} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" size="sm" className="h-8">
              Search
            </Button>
          </div>
        </div>
      </form>

      {showDropdown && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result._id}
                  onClick={() => handleResultClick(result._id)}
                  className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{result.balti}</div>
                      <div className="text-sm text-muted-foreground">{result.english}</div>
                    </div>
                    {result.pronunciation && (
                      <div className="text-xs text-muted-foreground italic">/{result.pronunciation}/</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {results.length === 5 && (
              <div className="p-3 border-t bg-muted/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/words?search=${encodeURIComponent(query)}`)}
                  className="w-full"
                >
                  View all results for "{query}"
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Also export as default for backward compatibility
export default SearchBar
