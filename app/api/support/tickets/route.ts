import { NextResponse } from "next/server"
import { z } from "zod"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/support/server-auth"

const createTicketSchema = z.object({
  subject: z.string().min(1).max(120).optional(),
  message: z.string().min(1).max(4000),
})

export async function GET() {
  try {
    const { user } = await requireUser()
    const admin = createAdminSupabaseClient()

    const { data, error } = await admin
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tickets: data ?? [] })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNAUTHENTICATED"
    return NextResponse.json({ error: "Unauthorized" }, { status: message === "UNAUTHENTICATED" ? 401 : 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requireUser()
    const admin = createAdminSupabaseClient()

    const json = await req.json().catch(() => null)
    const parsed = createTicketSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Reuse an existing open/pending ticket if present
    const { data: existing } = await admin
      .from("support_tickets")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["open", "pending"])
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const ticketId = existing?.id

    if (!ticketId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("first_name,last_name,email")
        .eq("id", user.id)
        .single()

      const customerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Customer"

      const { data: ticket, error: ticketError } = await admin
        .from("support_tickets")
        .insert({
          user_id: user.id,
          customer_name: customerName,
          customer_email: profile?.email ?? user.email,
          subject: parsed.data.subject ?? "Support",
          status: "open",
          label: "general",
        })
        .select("id")
        .single()

      if (ticketError || !ticket?.id) {
        return NextResponse.json({ error: ticketError?.message ?? "Failed to create ticket" }, { status: 500 })
      }

      const { error: messageError } = await admin.from("support_messages").insert({
        ticket_id: ticket.id,
        sender_role: "customer",
        sender_user_id: user.id,
        body: parsed.data.message,
      })

      if (messageError) {
        return NextResponse.json({ error: messageError.message }, { status: 500 })
      }

      await admin.from("support_tickets").update({ last_message_at: new Date().toISOString() }).eq("id", ticket.id)

      return NextResponse.json({ ticketId: ticket.id }, { status: 201 })
    }

    // Add message to existing ticket
    const { error: messageError } = await admin.from("support_messages").insert({
      ticket_id: ticketId,
      sender_role: "customer",
      sender_user_id: user.id,
      body: parsed.data.message,
    })

    if (messageError) return NextResponse.json({ error: messageError.message }, { status: 500 })

    await admin.from("support_tickets").update({ last_message_at: new Date().toISOString() }).eq("id", ticketId)

    return NextResponse.json({ ticketId }, { status: 200 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN"
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
