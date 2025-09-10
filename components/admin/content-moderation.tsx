"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react"

interface PendingWord {
  _id: string
  balti: string
  english: string
  submittedBy: {
    name: string
    email: string
  }
  createdAt: string
  status: string
}

export default function ContentModeration() {
  const [pendingWords, setPendingWords] = useState<PendingWord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingWords()
  }, [])

  const fetchPendingWords = async () => {
    try {
      const response = await fetch("/api/admin/pending-words")
      if (response.ok) {
        const data = await response.json()
        setPendingWords(data.words || [])
      }
    } catch (error) {
      console.error("Error fetching pending words:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWordAction = async (wordId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/admin/words/${wordId}/${action}`, {
        method: "POST",
      })
      if (response.ok) {
        setPendingWords((prev) => prev.filter((word) => word._id !== wordId))
      }
    } catch (error) {
      console.error(`Error ${action}ing word:`, error)
    }
  }

  if (loading) {
    return <div className="p-6">Loading moderation queue...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Moderation</h2>
        <p className="text-muted-foreground">Review and moderate user-submitted content</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Words ({pendingWords.length})</TabsTrigger>
          <TabsTrigger value="reported">Reported Content</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Users</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingWords.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">No pending words to review</p>
                <p className="text-muted-foreground">All submissions have been processed</p>
              </CardContent>
            </Card>
          ) : (
            pendingWords.map((word) => (
              <Card key={word._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {word.balti} → {word.english}
                      </CardTitle>
                      <CardDescription>
                        Submitted by {word.submittedBy.name} on {new Date(word.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleWordAction(word._id, "approve")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleWordAction(word._id, "reject")}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reported">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No reported content at this time</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No flagged users at this time</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
