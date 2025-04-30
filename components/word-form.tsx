"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, X, PlusCircle, MinusCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { IWord } from "@/models/Word"

interface WordFormProps {
  initialData: IWord | null
  onSubmit: (data: {
    balti: string
    english: string
    phonetic?: string
    categories?: string[]
    examples?: { balti: string; english: string }[]
  }) => void
  onCancel?: () => void
}

export default function WordForm({ initialData, onSubmit, onCancel }: WordFormProps) {
  const [balti, setBalti] = useState("")
  const [english, setEnglish] = useState("")
  const [phonetic, setPhonetic] = useState("")
  const [categoryInput, setCategoryInput] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [examples, setExamples] = useState<{ balti: string; english: string }[]>([])
  const [errors, setErrors] = useState({ balti: "", english: "" })

  useEffect(() => {
    if (initialData) {
      setBalti(initialData.balti)
      setEnglish(initialData.english)
      setPhonetic(initialData.phonetic || "")
      setCategories(initialData.categories || [])
      setExamples(initialData.examples || [])
      setErrors({ balti: "", english: "" })
    } else {
      setBalti("")
      setEnglish("")
      setPhonetic("")
      setCategories([])
      setExamples([])
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

    onSubmit({
      balti: balti.trim(),
      english: english.trim(),
      phonetic: phonetic.trim() || undefined,
      categories: categories.length > 0 ? categories : undefined,
      examples: examples.length > 0 ? examples : undefined,
    })

    if (!initialData) {
      // Clear form after submission only if adding a new word
      setBalti("")
      setEnglish("")
      setPhonetic("")
      setCategories([])
      setExamples([])
    }
  }

  const addCategory = () => {
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      setCategories([...categories, categoryInput.trim()])
      setCategoryInput("")
    }
  }

  const removeCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category))
  }

  const addExample = () => {
    setExamples([...examples, { balti: "", english: "" }])
  }

  const updateExample = (index: number, field: "balti" | "english", value: string) => {
    const updatedExamples = [...examples]
    updatedExamples[index][field] = value
    setExamples(updatedExamples)
  }

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && categoryInput.trim()) {
      e.preventDefault()
      addCategory()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Word" : "Add New Word"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="phonetic">Pronunciation Guide (Phonetic)</Label>
            <Input
              id="phonetic"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="How to pronounce this word (e.g., bahl-tee)"
            />
            <p className="text-xs text-muted-foreground">Add a phonetic spelling to help with pronunciation</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories / Tags</Label>
            <div className="flex gap-2">
              <Input
                id="categories"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a category (e.g., Food, Family, Nature)"
              />
              <Button type="button" onClick={addCategory} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Example Sentences</Label>
              <Button
                type="button"
                onClick={addExample}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Example
              </Button>
            </div>

            {examples.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add example sentences to show how this word is used in context
              </p>
            )}

            {examples.map((example, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md relative">
                <Button
                  type="button"
                  onClick={() => removeExample(index)}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>

                <div className="space-y-2">
                  <Label htmlFor={`example-balti-${index}`}>Balti Example</Label>
                  <Textarea
                    id={`example-balti-${index}`}
                    value={example.balti}
                    onChange={(e) => updateExample(index, "balti", e.target.value)}
                    placeholder="Example sentence in Balti"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`example-english-${index}`}>English Translation</Label>
                  <Textarea
                    id={`example-english-${index}`}
                    value={example.english}
                    onChange={(e) => updateExample(index, "english", e.target.value)}
                    placeholder="Translation in English"
                    rows={2}
                  />
                </div>
              </div>
            ))}
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
