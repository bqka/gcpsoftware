"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, User, AlertCircle } from "lucide-react"
import { useUsername } from "./AppContexts"

export default function LoginLandingPage() {
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUsername } = useUsername()

  const handleStart = async () => {
    if (!name.trim()) {
      setError("Please enter your name to continue")
      return
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Store the user's name (you can use localStorage, context, or your preferred state management)
      localStorage.setItem("userName", name.trim())

      // Simulate a brief loading state
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Navigate to the main application
      setUsername(name)
      navigate("/select-item")
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStart()
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-50 mb-2">Wire Testing Software</h1>
          <p className="text-gray-300">Wire Harness Color Sequence Verification Software</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-gray-200 bg-black/80 border-2 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-50">Welcome</CardTitle>
            <p className="text-sm text-gray-300 mt-2">Enter your name to get started with wire testing</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                Your Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your full name"
                  className="pl-10 h-12 text-base bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStart}
              disabled={isLoading || !name.trim()}
              className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-black shadow-lg shadow-gray-700/25"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Testing
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Additional Info */}
            <div className="text-center pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">By continuing, you agree to use this application responsibly</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© Developed by LIMSTIR-SRDTU.</p>
        </div>
      </div>
    </div>
  )
}