"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SetOwnerPage() {
  const [email, setEmail] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
  } | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/direct-set-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, secretKey }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          router.push("/profile")
        }, 3000)
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Set Owner Account</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300 text-sm">
        This page allows you to designate your account as the owner and founder of OpenBalti.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Your Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            required
            placeholder="Enter your account email"
          />
        </div>

        <div>
          <label htmlFor="secretKey" className="block text-sm font-medium mb-1">
            Secret Key
          </label>
          <input
            type="password"
            id="secretKey"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            required
            placeholder="Enter your secret key"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use the OWNER_SECRET_KEY value from your environment variables
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition-colors"
        >
          {loading ? "Processing..." : "Set as Owner"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 p-3 rounded-md ${
            result.success
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          }`}
        >
          <p>{result.message}</p>
          {result.success && <p className="text-sm mt-2">Redirecting to your profile...</p>}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Return to home page
        </Link>
      </div>
    </div>
  )
}
