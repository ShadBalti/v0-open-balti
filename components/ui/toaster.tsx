"use client"

import { ToastContainer, toast as reactToastify } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useEffect, useRef } from "react"

export function Toaster() {
  const announcerRef = useRef<HTMLDivElement>(null)

  // Function to announce messages to screen readers
  const announce = (message: string, type: string) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = `${type}: ${message}`
    }
  }

  // Override the default toast functions to include screen reader announcements
  useEffect(() => {
    const originalSuccess = reactToastify.success
    const originalError = reactToastify.error
    const originalInfo = reactToastify.info
    const originalWarning = reactToastify.warning

    reactToastify.success = (message, options) => {
      announce(message as string, "Success")
      return originalSuccess(message, options)
    }

    reactToastify.error = (message, options) => {
      announce(message as string, "Error")
      return originalError(message, options)
    }

    reactToastify.info = (message, options) => {
      announce(message as string, "Information")
      return originalInfo(message, options)
    }

    reactToastify.warning = (message, options) => {
      announce(message as string, "Warning")
      return originalWarning(message, options)
    }

    return () => {
      reactToastify.success = originalSuccess
      reactToastify.error = originalError
      reactToastify.info = originalInfo
      reactToastify.warning = originalWarning
    }
  }, [])

  return (
    <>
      <div ref={announcerRef} className="sr-only" aria-live="polite" aria-atomic="true" />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  )
}
