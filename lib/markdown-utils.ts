import { marked } from "marked"

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^### (.*?)$/gim, "$1")
    .replace(/^## (.*?)$/gim, "$1")
    .replace(/^# (.*?)$/gim, "$1")
    .replace(/\*\*(.*?)\*\*/gim, "$1")
    .replace(/\*(.*?)\*/gim, "$1")
    .replace(/!\[(.*?)\]$$(.*?)$$/gim, "")
    .replace(/\[(.*?)\]$$(.*?)$$/gim, "$1")
    .replace(/`(.*?)`/gim, "$1")
    .replace(/```[\s\S]*?```/gim, "")
    .trim()
}

export async function renderMarkdown(markdown: string): Promise<string> {
  try {
    const html = await marked(markdown)
    return html
  } catch (error) {
    console.error("Error rendering markdown:", error)
    return markdown
  }
}

export function generateExcerpt(content: string, length = 150): string {
  const plainText = stripMarkdown(content)
  return plainText.substring(0, length) + (plainText.length > length ? "..." : "")
}

export function generateSeoDescription(content: string): string {
  return generateExcerpt(content, 160)
}
