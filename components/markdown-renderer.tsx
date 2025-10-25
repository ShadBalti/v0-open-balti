"use client"

import { useEffect, useState } from "react"
import { marked } from "marked"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const [html, setHtml] = useState("")

  useEffect(() => {
    const renderContent = async () => {
      try {
        const rendered = await marked(content)
        setHtml(rendered)
      } catch (error) {
        console.error("Error rendering markdown:", error)
        setHtml(content)
      }
    }

    renderContent()
  }, [content])

  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
