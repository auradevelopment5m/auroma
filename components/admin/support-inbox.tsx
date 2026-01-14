"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search, Send, Paperclip, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Ticket = {
  id: string
  customer_name: string | null
  customer_email: string | null
  subject: string
  status: "open" | "pending" | "closed"
  label: string
  last_message_at: string
  created_at: string
}

type Attachment = {
  id: string
  public_url: string | null
  mime_type: string | null
}

type Message = {
  id: string
  sender_role: "customer" | "admin"
  body: string | null
  created_at: string
  attachments: Attachment[]
}

export function SupportInbox() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [query, setQuery] = useState("")

  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const selectedTicket = useMemo(() => tickets.find((t) => t.id === selectedId) ?? null, [tickets, selectedId])

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tickets
    return tickets.filter((t) => {
      return (
        t.subject.toLowerCase().includes(q) ||
        (t.customer_name ?? "").toLowerCase().includes(q) ||
        (t.customer_email ?? "").toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      )
    })
  }, [tickets, query])

  const loadTickets = async () => {
    const res = await fetch("/api/admin/support/tickets", { cache: "no-store" })
    if (!res.ok) return
    const json = await res.json().catch(() => ({ tickets: [] }))
    const next = (json.tickets ?? []) as Ticket[]
    setTickets(next)
    if (!selectedId && next.length) setSelectedId(next[0].id)
    if (selectedId && !next.some((t) => t.id === selectedId)) setSelectedId(next[0]?.id ?? null)
  }

  const loadMessages = async (ticketId: string) => {
    const res = await fetch(`/api/admin/support/tickets/${ticketId}/messages`, { cache: "no-store" })
    if (!res.ok) return
    const json = await res.json().catch(() => ({ messages: [] }))
    setMessages(json.messages ?? [])
  }

  useEffect(() => {
    loadTickets().catch(() => {})
    const interval = window.setInterval(() => loadTickets().catch(() => {}), 4000)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }

    loadMessages(selectedId).catch(() => {})
    const interval = window.setInterval(() => loadMessages(selectedId).catch(() => {}), 2500)
    return () => window.clearInterval(interval)
  }, [selectedId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, selectedId])

  const updateTicket = async (patch: Partial<Pick<Ticket, "status" | "label">>) => {
    if (!selectedId) return
    const res = await fetch(`/api/admin/support/tickets/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (!res.ok) return
    await loadTickets()
  }

  const deleteTicket = async () => {
    if (!selectedId) return
    const ok = window.confirm("Delete this conversation? This will remove all messages and attachments.")
    if (!ok) return

    const res = await fetch(`/api/admin/support/tickets/${selectedId}`, { method: "DELETE" })
    if (!res.ok) return
    setSelectedId(null)
    setMessages([])
    await loadTickets()
  }

  const sendMessage = async () => {
    if (!selectedId) return
    if (!draft.trim() && files.length === 0) return

    setSending(true)
    try {
      const form = new FormData()
      form.set("body", draft)
      for (const f of files) form.append("files", f)

      const res = await fetch(`/api/admin/support/tickets/${selectedId}/messages`, {
        method: "POST",
        body: form,
      })

      if (!res.ok) return

      setDraft("")
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ""

      await loadTickets()
      await loadMessages(selectedId)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-[calc(100vh-0px)] flex">
      {/* Left: ticket list */}
      <aside className="w-[360px] border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="font-serif text-xl font-bold text-foreground">Support Inbox</p>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tickets…"
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredTickets.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No tickets yet.</p>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    "w-full text-left rounded-xl border px-3 py-3 transition-colors",
                    t.id === selectedId ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground truncate">{t.customer_name || "Customer"}</p>
                    <span className={cn(
                      "text-[11px] px-2 py-0.5 rounded-full border capitalize",
                      t.status === "open" && "border-emerald-500/30 text-emerald-600",
                      t.status === "pending" && "border-amber-500/30 text-amber-600",
                      t.status === "closed" && "border-muted-foreground/30 text-muted-foreground",
                    )}>{t.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">{t.subject}</p>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                    <span className="truncate">{t.label}</span>
                    <span>{new Date(t.last_message_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Right: conversation */}
      <section className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          {selectedTicket ? (
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{selectedTicket.customer_name || "Customer"}</p>
              <p className="text-xs text-muted-foreground truncate">{selectedTicket.customer_email}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a ticket</p>
          )}

          {selectedTicket && (
            <div className="flex items-center gap-2">
              <Select value={selectedTicket.status} onValueChange={(v) => updateTicket({ status: v as Ticket["status"] })}>
                <SelectTrigger className="w-[130px] rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={selectedTicket.label}
                onChange={(e) => {
                  const val = e.target.value
                  setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? { ...t, label: val } : t)))
                }}
                onBlur={() => updateTicket({ label: selectedTicket.label })}
                className="w-[160px] rounded-lg"
                placeholder="Label"
              />

              <Button variant="outline" size="icon" className="rounded-lg" onClick={deleteTicket} aria-label="Delete ticket">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          {!selectedTicket ? null : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 border",
                    m.sender_role === "admin"
                      ? "ml-auto bg-primary text-primary-foreground border-primary/20"
                      : "mr-auto bg-card text-foreground border-border",
                  )}
                >
                  {m.body && <p className="text-sm whitespace-pre-wrap">{m.body}</p>}
                  {m.attachments?.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {m.attachments.map((a) => {
                        const url = a.public_url ?? ""
                        const isImage = (a.mime_type ?? "").startsWith("image/")
                        if (isImage) {
                          return (
                            <a key={a.id} href={url} target="_blank" rel="noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="attachment" className="h-20 w-full object-cover rounded-lg border border-black/10" />
                            </a>
                          )
                        }
                        return (
                          <a key={a.id} href={url} target="_blank" rel="noreferrer" className="text-xs underline opacity-90">
                            Attachment
                          </a>
                        )
                      })}
                    </div>
                  )}
                  <p className={cn("mt-1 text-[10px] opacity-80", m.sender_role === "admin" && "text-primary-foreground/80")}>
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {selectedTicket && (
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
                placeholder="Reply as support…"
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
      </section>
    </div>
  )
}
