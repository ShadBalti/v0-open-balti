"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  initialValue?: string
  onSearch: (term: string) => void
  placeholder?: string
}

export default function SearchBar({ initialValue = "", onSearch, placeholder = "Search..." }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      onSearch(term)
    }, 300),
    [onSearch],
  )

  useEffect(() => {
    setSearchTerm(initialValue)
  }, [initialValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder={placeholder} value={searchTerm} onChange={handleChange} className="pl-8" />
      </div>
      <Button type="submit">Search</Button>
    </form>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
