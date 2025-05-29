"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={`p-12 text-center ${className}`}>
      <div className="flex flex-col items-center justify-center gap-6">
        {icon && <div className="text-6xl opacity-20">{icon}</div>}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  )
}
