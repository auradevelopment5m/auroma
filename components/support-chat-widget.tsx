"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, Send, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type SupportAttachment = {
  id: string
  public_url: string | null
  mime_type: string | null
  storage_path: string
}

type SupportMessage = {
  id: string
  sender_role: "customer" | "admin"
  body: string | null
  created_at: string
  attachments: SupportAttachment[]
}

type SupportTicket = {
  id: string
  status: "open" | "pending" | "closed"
  label: string
  subject: string
  last_message_at: string
}

export function SupportChatWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [authRequired, setAuthRequired] = useState(false)
  const [isBooting, setIsBooting] = useState(false)

  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])

  const [subject, setSubject] = useState("Support")
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const shouldHide = useMemo(() => pathname.startsWith("/admin") || pathname.startsWith("/auth"), [pathname])

  const scrollToBottomRef = useRef<HTMLDivElement | null>(null)

  const loadTicketAndMessages = async (ticketId?: string) => {
    const resTickets = await fetch("/api/support/tickets", { cache: "no-store" })
    if (resTickets.status === 401) {
      setAuthRequired(true)
      setTicket(null)
      setMessages([])
      return
    }

    const ticketsJson = await resTickets.json().catch(() => ({ tickets: [] }))
    const first = (ticketsJson.tickets as SupportTicket[] | undefined)?.[0] ?? null
    const active = ticketId ? (ticketsJson.tickets as SupportTicket[]).find((t) => t.id === ticketId) ?? first : first

    setAuthRequired(false)
    setTicket(active)

    if (active) {
      const resMsgs = await fetch(`/api/support/tickets/${active.id}/messages`, { cache: "no-store" })
      if (resMsgs.ok) {
        const msgJson = await resMsgs.json().catch(() => ({ messages: [] }))
        setMessages(msgJson.messages ?? [])
      }
    } else {
      setMessages([])
    }
  }

  useEffect(() => {
    if (shouldHide) return
    if (!open) return

    let cancelled = false
    setIsBooting(true)
    loadTicketAndMessages()
      .catch(() => {
        if (!cancelled) {
          setAuthRequired(true)
        }
      })
      .finally(() => {
        if (!cancelled) setIsBooting(false)
      })

    // Poll for new messages while open (simple, robust realtime)
    const interval = window.setInterval(() => {
      if (!ticket) return
      loadTicketAndMessages(ticket.id).catch(() => {})
    }, 4000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shouldHide])

  useEffect(() => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, open])

  if (shouldHide) return null

  const sendMessage = async () => {
    if (!ticket) return
    if (!draft.trim() && files.length === 0) return

    setSending(true)
    try {
      const form = new FormData()
      form.set("body", draft)
      for (const f of files) form.append("files", f)

      const res = await fetch(`/api/support/tickets/${ticket.id}/messages`, {
        method: "POST",
        body: form,
      })

      if (!res.ok) {
        return
      }

      setDraft("")
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ""

      await loadTicketAndMessages(ticket.id)
    } finally {
      setSending(false)
    }
  }

  const createTicket = async () => {
    if (!draft.trim()) return

    setSending(true)
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message: draft }),
      })

      if (res.status === 401) {
        setAuthRequired(true)
        return
      }

      if (!res.ok) return

      const json = await res.json().catch(() => null)
      const ticketId = json?.ticketId as string | undefined
      setDraft("")
      if (ticketId) {
        await loadTicketAndMessages(ticketId)
      } else {
        await loadTicketAndMessages()
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center",
          open && "hidden",
        )}
        aria-label="Chat with support"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(420px,calc(100vw-2.5rem))] h-[min(620px,calc(100vh-2.5rem))] rounded-2xl border border-border bg-background shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div>
              <p className="font-medium text-foreground">Customer Support</p>
              <p className="text-xs text-muted-foreground">Typically replies within minutes</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {authRequired ? (
            <div className="flex-1 p-5 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-sm text-muted-foreground">Please sign in to chat with support.</p>
              <Button asChild className="rounded-lg">
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                {isBooting ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : !ticket ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Start a support ticket and we’ll reply here.
                    </p>
                    <div className="space-y-2">
                      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
                      <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Tell us what you need help with…"
                      />
                      <Button className="w-full rounded-lg" onClick={createTicket} disabled={sending || !draft.trim()}>
                        {sending ? "Sending…" : "Create ticket"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Ticket: <span className="text-foreground">{ticket.subject}</span>
                      </span>
                      <span className="capitalize">{ticket.status}</span>
                    </div>

                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 border",
                          m.sender_role === "customer"
                            ? "ml-auto bg-primary text-primary-foreground border-primary/20"
                            : "mr-auto bg-card text-foreground border-border",
                        )}
                      >
                        {m.body && <p className="text-sm whitespace-pre-wrap">{m.body}</p>}
                        {m.attachments?.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {m.attachments.map((a) => {
                              const url = a.public_url ?? ""
                              const isImage = (a.mime_type ?? "").startsWith("image/")
                              const isVideo = (a.mime_type ?? "").startsWith("video/")
                              if (isImage) {
                                return (
                                  <a key={a.id} href={url} target="_blank" rel="noreferrer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={url}
                                      alt="attachment"
                                      className="h-24 w-full object-cover rounded-lg border border-black/10"
                                    />
                                  </a>
                                )
                              }
                              if (isVideo) {
                                return (
                                  <a
                                    key={a.id}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs underline opacity-90"
                                  >
                                    Video attachment
                                  </a>
                                )
                              }
                              return (
                                <a
                                  key={a.id}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs underline opacity-90"
                                >
                                  Attachment
                                </a>
                              )
                            })}
                          </div>
                        )}
                        <p className={cn("mt-1 text-[10px] opacity-80", m.sender_role === "customer" && "text-primary-foreground/80")}>
                          {new Date(m.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}

                    <div ref={scrollToBottomRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Composer */}
              {ticket && (
                <div className="p-3 border-t border-border bg-background">
                  {files.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {files.map((f) => (
                        <span key={f.name + f.size} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-lg"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Attach files"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>

                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Write a message…"
                      className="min-h-11"
                    />

                    <Button
                      type="button"
                      className="rounded-lg shrink-0"
                      onClick={sendMessage}
                      disabled={sending || (!draft.trim() && files.length === 0)}
                      aria-label="Send"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
