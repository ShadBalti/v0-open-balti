"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, X } from "lucide-react"
import type { IWord } from "@/models/Word"

interface WordFormProps {
  initialData: IWord | null
  onSubmit: (data: { balti: string; english: string }) => void
  onCancel?: () => void
}

export default function WordForm({ initialData, onSubmit, onCancel }: WordFormProps) {
  const [balti, setBalti] = useState("")
  const [english, setEnglish] = useState("")
  const [errors, setErrors] = useState({ balti: "", english: "" })

  useEffect(() => {
    if (initialData) {
      setBalti(initialData.balti)
      setEnglish(initialData.english)
      setErrors({ balti: "", english: "" })
    } else {
      setBalti("")
      setEnglish("")
      setErrors({ balti: "", english: "" })
    }
  }, [initialData])

  const validate = () => {
    const newErrors = { balti: "", english: "" }
    let isValid = true

    if (!balti.trim()) {
      newErrors.balti = "Balti word is required"
      isValid = false
    }

    if (!english.trim()) {
      newErrors.english = "English translation is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    onSubmit({ balti: balti.trim(), english: english.trim() })

    if (!initialData) {
      // Clear form after submission only if adding a new word
      setBalti("")
      setEnglish("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Word" : "Add New Word"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="balti" className={errors.balti ? "text-destructive" : ""}>
                Balti Word
              </Label>
              <Input
                id="balti"
                value={balti}
                onChange={(e) => {
                  setBalti(e.target.value)
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, balti: "" }))
                  }
                }}
                placeholder="Enter Balti word"
                className={errors.balti ? "border-destructive" : ""}
              />
              {errors.balti && <p className="text-xs text-destructive mt-1">{errors.balti}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="english" className={errors.english ? "text-destructive" : ""}>
                English Translation
              </Label>
              <Input
                id="english"
                value={english}
                onChange={(e) => {
                  setEnglish(e.target.value)
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, english: "" }))
                  }
                }}
                placeholder="Enter English translation"
                className={errors.english ? "border-destructive" : ""}
              />
              {errors.english && <p className="text-xs text-destructive mt-1">{errors.english}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          ) : (
            <div></div>
          )}
          <Button type="submit">
            {initialData ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Word
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Word
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
