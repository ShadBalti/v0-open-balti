"use client"

import { Button } from "@/components/ui/button"
import { Share2, Copy } from "lucide-react"
import { useMobilePWA } from "./mobile-pwa-provider"
import { useToast } from "@/hooks/use-toast"

interface MobileShareButtonProps {
  title?: string
  text?: string
  url?: string
  className?: string
}

export function MobileShareButton({ title, text, url, className }: MobileShareButtonProps) {
  const { shareContent, deviceType } = useMobilePWA()
  const { toast } = useToast()

  const handleShare = async () => {
    const shareData: ShareData = {
      title: title || "OpenBalti Dictionary",
      text: text || "Check out this Balti language dictionary",
      url: url || window.location.href,
    }

    try {
      await shareContent(shareData)
      toast({
        title: "Shared successfully",
        description: "Content has been shared",
      })
    } catch (error) {
      // Fallback to copying URL
      if (navigator.clipboard && shareData.url) {
        await navigator.clipboard.writeText(shareData.url)
        toast({
          title: "Link copied",
          description: "Link has been copied to clipboard",
        })
      }
    }
  }

  // Only show on mobile devices
  if (deviceType === "desktop") {
    return null
  }

  return (
    <Button onClick={handleShare} variant="outline" size="sm" className={className}>
      {navigator.share ? <Share2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
      Share
    </Button>
  )
}
