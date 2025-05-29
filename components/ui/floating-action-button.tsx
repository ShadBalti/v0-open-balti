"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

interface FloatingActionButtonProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
  className?: string
  variant?: "default" | "secondary"
}

export function FloatingActionButton({
  onClick,
  icon = <Plus className="h-5 w-5" />,
  label = "Add",
  className,
  variant = "default",
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40",
        "hover:scale-105 active:scale-95",
        variant === "default" && "bg-primary hover:bg-primary/90",
        className,
      )}
      size="icon"
      aria-label={label}
    >
      {icon}
    </Button>
  )
}
