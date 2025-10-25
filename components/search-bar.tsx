"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export default function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(searchTerm)
  const [debouncedValue, setDebouncedValue] = useState(searchTerm)

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(inputValue)
  }

  const clearSearch = () => {
    setInputValue("")
    setSearchTerm("")
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search words..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-10 pr-10"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  )
}
