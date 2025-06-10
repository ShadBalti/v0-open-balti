"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Clock, Globe, Users, Plus, CheckCircle, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EtymologyForm } from "./etymology-form"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import type { IWordEtymology } from "@/models/WordEtymology"

interface WordEtymologyProps {
  wordId: string
  wordBalti: string
}

export function WordEtymology({ wordId, wordBalti }: WordEtymologyProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [etymology, setEtymology] = useState<IWordEtymology | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchEtymology()
  }, [wordId])

  const fetchEtymology = async () => {
    try {
      const response = await fetch(`/api/words/${wordId}/etymology`)
      const result = await response.json()

      if (result.success) {
        setEtymology(result.data)
      }
    } catch (error) {
      console.error("Error fetching etymology:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEtymologySubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/words/${wordId}/etymology`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setEtymology(result.data)
        setShowForm(false)
        toast({
          title: "Etymology Added",
          description: "Word etymology has been successfully added.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add etymology",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding etymology",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Etymology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!etymology) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Etymology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Etymology Available</h3>
            <p className="text-muted-foreground mb-4">
              The historical origins of "{wordBalti}" haven't been documented yet.
            </p>
            {session && (
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Etymology
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Etymology for "{wordBalti}"</DialogTitle>
                  </DialogHeader>
                  <EtymologyForm onSubmit={handleEtymologySubmit} onCancel={() => setShowForm(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Etymology
          </CardTitle>
          <div className="flex items-center gap-2">
            {etymology.isVerified ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending Review
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Origin */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Origin
          </h3>
          <p className="text-muted-foreground">{etymology.origin}</p>
        </div>

        <Separator />

        {/* Historical Forms */}
        {etymology.historicalForms && etymology.historicalForms.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historical Evolution
            </h3>
            <div className="space-y-3">
              {etymology.historicalForms.map((form, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {form.period}
                    </Badge>
                    {form.script && (
                      <Badge variant="secondary" className="text-xs">
                        {form.script}
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium">{form.form}</p>
                  <p className="text-sm text-muted-foreground">{form.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Related Languages */}
        {etymology.relatedLanguages && etymology.relatedLanguages.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Related Languages
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {etymology.relatedLanguages.map((related, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {related.language}
                    </Badge>
                  </div>
                  <p className="font-medium">{related.word}</p>
                  <p className="text-sm text-muted-foreground">{related.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Cultural Context */}
        <div>
          <h3 className="font-semibold mb-2">Cultural Context</h3>
          <p className="text-muted-foreground">{etymology.culturalContext}</p>
        </div>

        {/* Evolution */}
        <div>
          <h3 className="font-semibold mb-2">Linguistic Evolution</h3>
          <p className="text-muted-foreground">{etymology.evolution}</p>
        </div>

        {/* Sources */}
        {etymology.sources && etymology.sources.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Sources</h3>
            <div className="space-y-2">
              {etymology.sources.map((source, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{source.title}</span>
                  {source.author && <span className="text-muted-foreground"> by {source.author}</span>}
                  {source.year && <span className="text-muted-foreground"> ({source.year})</span>}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {source.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>Linguistic Family: {etymology.linguisticFamily}</p>
          {etymology.firstRecorded && <p>First Recorded: {etymology.firstRecorded}</p>}
          <p>Added: {new Date(etymology.createdAt).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
