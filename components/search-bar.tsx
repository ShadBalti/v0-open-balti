"use client"

import type React from "react"
import { useState, useEffect, useCallback, memo } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  placeholder?: string
  debounceDelay?: number
}

function SearchBar({
  searchTerm,
  setSearchTerm,
  placeholder = "Search words...",
  debounceDelay = 300,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(searchTerm)

  const debouncedValue = useDebounce(inputValue, debounceDelay)

  // Update input value when searchTerm prop changes
  useEffect(() => {
    setInputValue(searchTerm)
  }, [searchTerm])

  // Update search term when debounced value changes
  useEffect(() => {
    setSearchTerm(debouncedValue)
  }, [debouncedValue, setSearchTerm])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setSearchTerm(inputValue)
    },
    [inputValue, setSearchTerm],
  )

  const clearSearch = useCallback(() => {
    setInputValue("")
    setSearchTerm("")
  }, [setSearchTerm])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
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

export default memo(SearchBar)
