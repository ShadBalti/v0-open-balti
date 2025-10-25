"use client"

import { Facebook, Twitter, Linkedin, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SocialShareProps {
  title: string
  url: string
  description?: string
}

export function SocialShare({ title, url, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share:</span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.twitter, "_blank")}
          title="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.facebook, "_blank")}
          title="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.linkedin, "_blank")}
          title="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyLink} title="Copy link">
          <Copy className="h-4 w-4" />
          {copied && <span className="ml-1 text-xs">Copied!</span>}
        </Button>
      </div>
    </div>
  )
}
