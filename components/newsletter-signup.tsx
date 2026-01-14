"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Sparkles, Gift, Bell, CheckCircle } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.status === 409) {
        setError("You're already subscribed!")
        return
      }

      if (!res.ok) {
        setError("Something went wrong. Please try again.")
        return
      }

      setIsSuccess(true)
      setEmail("")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    { icon: Gift, text: "Exclusive discounts" },
    { icon: Bell, text: "New product alerts" },
    { icon: Sparkles, text: "Wellness tips" },
  ]

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-foreground mb-3">Welcome to the Auroma Family!</h3>
        <p className="text-muted-foreground">
          Thank you for subscribing. Watch your inbox for exclusive offers and wellness inspiration.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
        <Mail className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-2xl font-serif font-bold text-foreground mb-3">Join the Auroma Community</h3>
      <p className="text-muted-foreground mb-6">
        Subscribe for exclusive discounts, new product launches, and aromatherapy tips delivered to your inbox.
      </p>

      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {benefits.map((benefit) => (
          <div key={benefit.text} className="flex items-center gap-2 text-sm text-muted-foreground">
            <benefit.icon className="w-4 h-4 text-primary" />
            {benefit.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-background border-border"
        />
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <p className="mt-4 text-xs text-muted-foreground">We respect your privacy. Unsubscribe at any time.</p>
    </div>
  )
}
