"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Upload, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AudioRecorderProps {
  onAudioSaved: (audioUrl: string) => void
  existingAudioUrl?: string
  wordId: string
}

export default function AudioRecorder({ onAudioSaved, existingAudioUrl, wordId }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element for playback
    audioRef.current = new Audio(existingAudioUrl)

    audioRef.current.addEventListener("ended", () => {
      setIsPlaying(false)
    })

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [existingAudioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)

        // Create URL for preview
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob)
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to record pronunciation.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const uploadAudio = async () => {
    if (!audioBlob) return

    setIsUploading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("audio", audioBlob, `pronunciation-${wordId}.wav`)

      // Upload to your API endpoint
      const response = await fetch(`/api/words/${wordId}/audio`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Pronunciation audio uploaded successfully",
        })
        onAudioSaved(result.audioUrl)
      } else {
        throw new Error(result.error || "Failed to upload audio")
      }
    } catch (error) {
      console.error("Error uploading audio:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload pronunciation audio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <Button
            type="button"
            onClick={startRecording}
            variant="outline"
            size="sm"
            className="bg-red-50 hover:bg-red-100 text-red-600"
          >
            <Mic className="h-4 w-4 mr-1" />
            Record Pronunciation
          </Button>
        ) : (
          <Button
            type="button"
            onClick={stopRecording}
            variant="outline"
            size="sm"
            className="bg-red-100 text-red-600 animate-pulse"
          >
            <Square className="h-4 w-4 mr-1" />
            Stop Recording
          </Button>
        )}

        {(audioBlob || existingAudioUrl) && !isRecording && (
          <Button type="button" onClick={playAudio} variant="ghost" size="sm" disabled={isPlaying}>
            <Play className="h-4 w-4 mr-1" />
            {isPlaying ? "Playing..." : "Play"}
          </Button>
        )}
      </div>

      {audioBlob && !isRecording && (
        <Button type="button" onClick={uploadAudio} variant="secondary" size="sm" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Save Pronunciation
            </>
          )}
        </Button>
      )}
    </div>
  )
}
