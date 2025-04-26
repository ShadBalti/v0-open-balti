"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { IWord } from "@/models/Word"

interface WordFormProps {
  initialData: IWord | null
  onSubmit: (data: { balti: string; english: string }) => void
  onCancel?: () => void
}

export default function WordForm({ initialData, onSubmit, onCancel }: WordFormProps) {
  const [balti, setBalti] = useState("")
  const [english, setEnglish] = useState("")

  useEffect(() => {
    if (initialData) {
      setBalti(initialData.balti)
      setEnglish(initialData.english)
    } else {
      setBalti("")
      setEnglish("")
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!balti.trim() || !english.trim()) {
      return
    }

    onSubmit({ balti, english })

    if (!initialData) {
      // Clear form after submission only if adding a new word
      setBalti("")
      setEnglish("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="balti">Balti Word</Label>
          <Input
            id="balti"
            value={balti}
            onChange={(e) => setBalti(e.target.value)}
            placeholder="Enter Balti word"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="english">English Translation</Label>
          <Input
            id="english"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="Enter English translation"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{initialData ? "Update Word" : "Add Word"}</Button>
      </div>
    </form>
  )
}
