"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Share2, Copy, Twitter, Facebook, MessageCircle, Mail, Link2, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { IWord } from "@/models/Word"

interface WordShareProps {
  word: IWord
}

export function WordShare({ word }: WordShareProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [customMessage, setCustomMessage] = useState("")

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const wordUrl = `${baseUrl}/words/${word._id}`

  const defaultMessage = `Check out this Balti word: ${word.balti} (${word.english}) on OpenBalti Dictionary`
  const shareMessage = customMessage || defaultMessage

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(wordUrl)}&hashtags=BaltiLanguage,OpenBalti,LanguagePreservation`
    window.open(twitterUrl, "_blank", "width=550,height=420")
  }

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wordUrl)}&quote=${encodeURIComponent(shareMessage)}`
    window.open(facebookUrl, "_blank", "width=550,height=420")
  }

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${wordUrl}`)}`
    window.open(whatsappUrl, "_blank")
  }

  const shareViaEmail = () => {
    const subject = `Balti Word: ${word.balti}`
    const body = `${shareMessage}\n\nLearn more: ${wordUrl}`
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl)
  }

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Balti Word: ${word.balti}`,
          text: shareMessage,
          url: wordUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Word</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Word Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">{word.balti}</h3>
              <p className="text-lg text-muted-foreground">{word.english}</p>
              {word.phonetic && <p className="text-sm text-muted-foreground font-mono">/{word.phonetic}/</p>}
              <div className="flex justify-center gap-2 flex-wrap">
                {word.categories?.slice(0, 2).map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={defaultMessage}
              rows={3}
            />
          </div>

          {/* Share URL */}
          <div className="space-y-2">
            <Label htmlFor="url">Share URL</Label>
            <div className="flex gap-2">
              <Input id="url" value={wordUrl} readOnly className="flex-1" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(wordUrl)} className="flex-shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-3">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={shareToTwitter} className="justify-start">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" onClick={shareToFacebook} className="justify-start">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button variant="outline" onClick={shareToWhatsApp} className="justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" onClick={shareViaEmail} className="justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Native Share (if available) */}
          {navigator.share && (
            <Button onClick={nativeShare} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share via Device
            </Button>
          )}

          {/* Copy Full Message */}
          <Button variant="outline" onClick={() => copyToClipboard(`${shareMessage} ${wordUrl}`)} className="w-full">
            <Link2 className="h-4 w-4 mr-2" />
            Copy Message & Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
