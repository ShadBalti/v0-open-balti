"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Save, Loader2 } from "lucide-react"
import type { IWordEtymology } from "@/models/WordEtymology"

interface EtymologyFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  initialData?: IWordEtymology | null
  isSubmitting?: boolean
}

export function EtymologyForm({ onSubmit, onCancel, initialData, isSubmitting = false }: EtymologyFormProps) {
  const [origin, setOrigin] = useState("")
  const [linguisticFamily, setLinguisticFamily] = useState("Sino-Tibetan")
  const [culturalContext, setCulturalContext] = useState("")
  const [evolution, setEvolution] = useState("")
  const [firstRecorded, setFirstRecorded] = useState("")

  const [historicalForms, setHistoricalForms] = useState([{ period: "", form: "", meaning: "", script: "" }])
  const [relatedLanguages, setRelatedLanguages] = useState([{ language: "", word: "", meaning: "" }])
  const [sources, setSources] = useState([{ title: "", author: "", year: "", type: "book" as const }])

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setOrigin(initialData.origin || "")
      setLinguisticFamily(initialData.linguisticFamily || "Sino-Tibetan")
      setCulturalContext(initialData.culturalContext || "")
      setEvolution(initialData.evolution || "")
      setFirstRecorded(initialData.firstRecorded || "")

      if (initialData.historicalForms && initialData.historicalForms.length > 0) {
        setHistoricalForms(initialData.historicalForms)
      }

      if (initialData.relatedLanguages && initialData.relatedLanguages.length > 0) {
        setRelatedLanguages(initialData.relatedLanguages)
      }

      if (initialData.sources && initialData.sources.length > 0) {
        setSources(initialData.sources)
      }
    }
  }, [initialData])

  const addHistoricalForm = () => {
    setHistoricalForms([...historicalForms, { period: "", form: "", meaning: "", script: "" }])
  }

  const removeHistoricalForm = (index: number) => {
    setHistoricalForms(historicalForms.filter((_, i) => i !== index))
  }

  const updateHistoricalForm = (index: number, field: string, value: string) => {
    const updated = [...historicalForms]
    updated[index] = { ...updated[index], [field]: value }
    setHistoricalForms(updated)
  }

  const addRelatedLanguage = () => {
    setRelatedLanguages([...relatedLanguages, { language: "", word: "", meaning: "" }])
  }

  const removeRelatedLanguage = (index: number) => {
    setRelatedLanguages(relatedLanguages.filter((_, i) => i !== index))
  }

  const updateRelatedLanguage = (index: number, field: string, value: string) => {
    const updated = [...relatedLanguages]
    updated[index] = { ...updated[index], [field]: value }
    setRelatedLanguages(updated)
  }

  const addSource = () => {
    setSources([...sources, { title: "", author: "", year: "", type: "book" }])
  }

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index))
  }

  const updateSource = (index: number, field: string, value: string) => {
    const updated = [...sources]
    updated[index] = { ...updated[index], [field]: value }
    setSources(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      origin,
      linguisticFamily,
      culturalContext,
      evolution,
      firstRecorded: firstRecorded || undefined,
      historicalForms: historicalForms.filter((form) => form.period && form.form && form.meaning),
      relatedLanguages: relatedLanguages.filter((lang) => lang.language && lang.word && lang.meaning),
      sources: sources.filter((source) => source.title),
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Etymology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="origin">Origin *</Label>
            <Textarea
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Describe the historical origin of this word..."
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linguisticFamily">Linguistic Family</Label>
              <Select value={linguisticFamily} onValueChange={setLinguisticFamily} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sino-Tibetan">Sino-Tibetan</SelectItem>
                  <SelectItem value="Tibeto-Burman">Tibeto-Burman</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="firstRecorded">First Recorded</Label>
              <Input
                id="firstRecorded"
                value={firstRecorded}
                onChange={(e) => setFirstRecorded(e.target.value)}
                placeholder="e.g., 8th century, 1200 CE"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="culturalContext">Cultural Context *</Label>
            <Textarea
              id="culturalContext"
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              placeholder="Describe the cultural and social context of this word..."
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="evolution">Linguistic Evolution *</Label>
            <Textarea
              id="evolution"
              value={evolution}
              onChange={(e) => setEvolution(e.target.value)}
              placeholder="Describe how this word has evolved over time..."
              required
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Historical Forms */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historical Forms</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addHistoricalForm} disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              Add Form
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {historicalForms.map((form, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Form {index + 1}</Badge>
                {historicalForms.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHistoricalForm(index)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Period</Label>
                  <Input
                    value={form.period}
                    onChange={(e) => updateHistoricalForm(index, "period", e.target.value)}
                    placeholder="e.g., Classical Tibetan, 12th century"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Script</Label>
                  <Input
                    value={form.script}
                    onChange={(e) => updateHistoricalForm(index, "script", e.target.value)}
                    placeholder="e.g., Tibetan script, Yige"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <Label>Historical Form</Label>
                <Input
                  value={form.form}
                  onChange={(e) => updateHistoricalForm(index, "form", e.target.value)}
                  placeholder="The word in its historical form"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label>Meaning</Label>
                <Input
                  value={form.meaning}
                  onChange={(e) => updateHistoricalForm(index, "meaning", e.target.value)}
                  placeholder="What it meant in that period"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Related Languages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Related Languages</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRelatedLanguage} disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {relatedLanguages.map((lang, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Language {index + 1}</Badge>
                {relatedLanguages.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRelatedLanguage(index)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Language</Label>
                  <Input
                    value={lang.language}
                    onChange={(e) => updateRelatedLanguage(index, "language", e.target.value)}
                    placeholder="e.g., Tibetan, Ladakhi"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Word</Label>
                  <Input
                    value={lang.word}
                    onChange={(e) => updateRelatedLanguage(index, "word", e.target.value)}
                    placeholder="Related word"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Meaning</Label>
                  <Input
                    value={lang.meaning}
                    onChange={(e) => updateRelatedLanguage(index, "meaning", e.target.value)}
                    placeholder="Meaning in that language"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sources</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addSource} disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sources.map((source, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Source {index + 1}</Badge>
                {sources.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSource(index)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={source.title}
                    onChange={(e) => updateSource(index, "title", e.target.value)}
                    placeholder="Title of the source"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Author</Label>
                  <Input
                    value={source.author}
                    onChange={(e) => updateSource(index, "author", e.target.value)}
                    placeholder="Author name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    value={source.year}
                    onChange={(e) => updateSource(index, "year", e.target.value)}
                    placeholder="Publication year"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={source.type}
                    onValueChange={(value) => updateSource(index, "type", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="paper">Academic Paper</SelectItem>
                      <SelectItem value="oral">Oral Tradition</SelectItem>
                      <SelectItem value="manuscript">Manuscript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Etymology
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
