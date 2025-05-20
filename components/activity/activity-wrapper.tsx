"use client"

import { useEffect, useState } from "react"
import { ActivityLogList } from "./activity-log-list"
import { Skeleton } from "@/components/ui/skeleton"

interface ActivityWrapperProps {
  limit?: number
}

export default function ActivityWrapper({ limit = 10 }: ActivityWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return <ActivityLogList limit={limit} />
}
