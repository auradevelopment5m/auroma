"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, CheckCircle, AlertTriangle } from "lucide-react"

interface EmailCampaignManagerProps {
  subscriberCount: number
}

export function EmailCampaignManager({ subscriberCount }: EmailCampaignManagerProps) {
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [testTo, setTestTo] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (subscriberCount === 0) {
      alert("No subscribers to send to!")
      return
    }

    setIsSending(true)

    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          html: content.replace(/\n/g, "<br />"),
          testTo: testTo.trim() || undefined,
        }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(json?.error || "Failed to send email")
        return
      }

      setIsSent(true)
      setSubject("")
      setContent("")
      setTestTo("")
      setTimeout(() => setIsSent(false), 3000)
    } catch {
      setError("Failed to send email")
    } finally {
      setIsSending(false)
    }
  }

  if (isSent) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">Email Sent!</h3>
        <p className="text-muted-foreground">Your email has been queued to send to {subscriberCount} subscribers.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSend} className="space-y-6">
      <div>
        <Label htmlFor="subject" className="text-foreground">
          Subject Line
        </Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Exclusive 20% Off - This Weekend Only!"
          required
          className="bg-background border-border"
        />
      </div>

      <div>
        <Label htmlFor="testTo" className="text-foreground">
          Test Send (optional)
        </Label>
        <Input
          id="testTo"
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
          placeholder="email@domain.com"
          className="bg-background border-border"
        />
        <p className="text-sm text-muted-foreground mt-2">
          If set, sends only to this address (recommended first).
        </p>
      </div>

      <div>
        <Label htmlFor="content" className="text-foreground">
          Email Content
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your email content here..."
          rows={10}
          required
          className="bg-background border-border"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Tip: Include a clear call-to-action and any discount codes.
        </p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div>
          <p className="font-medium text-foreground">Recipients</p>
          <p className="text-sm text-muted-foreground">{subscriberCount} subscribers</p>
        </div>
        <Button type="submit" disabled={isSending || subscriberCount === 0} className="bg-primary hover:bg-primary/90">
          {isSending ? (
            "Sending..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div>
            <p className="font-medium">Send failed</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}
    </form>
  )
}
