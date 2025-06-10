"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Edit, X, CheckCircle, AlertCircle, History, Plus, Eye, EyeOff } from "lucide-react"
import { EtymologyForm } from "@/components/etymology-form"
import { WordEtymology } from "@/components/word-etymology"
import { useToast } from "@/hooks/use-toast"
import type { IWord } from "@/models/Word"
import type { IWordEtymology } from "@/models/WordEtymology"

interface EtymologyManagementProps {
  word: IWord
  existingEtymology: IWordEtymology | null
  userId: string
}

export function EtymologyManagement({ word, existingEtymology, userId }: EtymologyManagementProps) {
  const { toast } = useToast()
  const [etymology, setEtymology] = useState<IWordEtymology | null>(existingEtymology)
  const [isEditing, setIsEditing] = useState(!existingEtymology)
  const [isPreview, setIsPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canEdit = !etymology || etymology.createdBy?._id === userId

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const method = etymology ? "PUT" : "POST"
      const response = await fetch(`/api/words/${word._id}/etymology`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setEtymology(result.data)
        setIsEditing(false)
        setIsPreview(false)
        toast({
          title: etymology ? "Etymology Updated" : "Etymology Added",
          description: `Etymology for "${word.balti}" has been successfully ${etymology ? "updated" : "added"}.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${etymology ? "update" : "add"} etymology`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred while ${etymology ? "updating" : "adding"} etymology`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsPreview(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {etymology ? "Edit Etymology" : "Add Etymology"}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  {etymology
                    ? `Update the etymology information for "${word.balti}"`
                    : `Add historical and linguistic information for "${word.balti}"`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsPreview(!isPreview)} disabled={isSubmitting}>
                  {isPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {isPreview ? "Hide Preview" : "Preview"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Preview */}
        {isPreview && etymology && (
          <div className="border-2 border-dashed border-muted rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </h3>
            <WordEtymology wordId={word._id} wordBalti={word.balti} />
          </div>
        )}

        {/* Form */}
        <EtymologyForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={etymology}
          isSubmitting={isSubmitting}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Etymology Information
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Historical origins and linguistic evolution of "{word.balti}"
              </p>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                {etymology ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Etymology
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Etymology
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Status Alert */}
      {etymology && (
        <Alert>
          <div className="flex items-center gap-2">
            {etymology.isVerified ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  This etymology has been verified by experts and is considered accurate.
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  This etymology is pending expert review. Information may be subject to changes.
                </AlertDescription>
              </>
            )}
          </div>
        </Alert>
      )}

      {/* Etymology Content */}
      {etymology ? (
        <WordEtymology wordId={word._id} wordBalti={word.balti} />
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Etymology Available</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                The historical origins and linguistic evolution of "{word.balti}" haven't been documented yet. Help
                preserve this knowledge by adding etymology information.
              </p>
              {canEdit && (
                <Button onClick={() => setIsEditing(true)} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Etymology
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Etymology Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">What to Include</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Historical word forms and meanings</li>
                <li>• Related words in other languages</li>
                <li>• Cultural and social context</li>
                <li>• Linguistic evolution over time</li>
                <li>• Reliable sources and references</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quality Standards</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use academic or traditional sources</li>
                <li>• Provide clear, factual information</li>
                <li>• Avoid speculation without evidence</li>
                <li>• Include multiple perspectives when available</li>
                <li>• Respect cultural sensitivity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
