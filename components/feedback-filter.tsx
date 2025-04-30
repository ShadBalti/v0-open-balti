"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThumbsUp, Shield, Flag, Users } from "lucide-react"

interface FeedbackFilterProps {
  onFilterChange: (filter: string) => void
}

export default function FeedbackFilter({ onFilterChange }: FeedbackFilterProps) {
  const [filter, setFilter] = useState("all")

  const handleFilterChange = (value: string) => {
    setFilter(value)
    onFilterChange(value)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community Feedback
        </CardTitle>
        <CardDescription>Filter words by community feedback</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by feedback" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Words</SelectItem>
            <SelectItem value="useful">
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />
                Most Useful
              </div>
            </SelectItem>
            <SelectItem value="trusted">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-blue-500 mr-2" />
                Most Trusted
              </div>
            </SelectItem>
            <SelectItem value="needsReview">
              <div className="flex items-center">
                <Flag className="h-4 w-4 text-amber-500 mr-2" />
                Needs Review
              </div>
            </SelectItem>
            <SelectItem value="mostFeedback">Most Feedback</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
