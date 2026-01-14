import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/support/server-auth"

const BUCKET = "support-uploads"
const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25MB per file

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireUser()
    const admin = createAdminSupabaseClient()
    const { id: ticketId } = await context.params

    const { data: ticket } = await admin.from("support_tickets").select("user_id").eq("id", ticketId).single()
    if (!ticket || ticket.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { data: messages, error } = await admin
      .from("support_messages")
      .select("id,ticket_id,sender_role,sender_user_id,body,created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const messageIds = (messages ?? []).map((m) => m.id)
    const { data: attachments } = messageIds.length
      ? await admin.from("support_attachments").select("*").in("message_id", messageIds)
      : { data: [] as any[] }

    const attachmentsByMessage = new Map<string, any[]>()
    for (const att of attachments ?? []) {
      const list = attachmentsByMessage.get(att.message_id) ?? []
      list.push(att)
      attachmentsByMessage.set(att.message_id, list)
    }

    const hydrated = (messages ?? []).map((m) => ({ ...m, attachments: attachmentsByMessage.get(m.id) ?? [] }))

    return NextResponse.json({ messages: hydrated })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN"
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireUser()
    const admin = createAdminSupabaseClient()
    const { id: ticketId } = await context.params

    const { data: ticket } = await admin.from("support_tickets").select("user_id").eq("id", ticketId).single()
    if (!ticket || ticket.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const form = await req.formData()
    const body = String(form.get("body") ?? "").trim()
    const files = form.getAll("files").filter((v): v is File => v instanceof File)

    if (!body && files.length === 0) {
      return NextResponse.json({ error: "Message is empty" }, { status: 400 })
    }

    const { data: message, error: messageError } = await admin
      .from("support_messages")
      .insert({
        ticket_id: ticketId,
        sender_role: "customer",
        sender_user_id: user.id,
        body: body || null,
      })
      .select("id,ticket_id,sender_role,sender_user_id,body,created_at")
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: messageError?.message ?? "Failed to send" }, { status: 500 })
    }

    const attachments: any[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 413 })
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const objectPath = `support/${ticketId}/${message.id}/${crypto.randomUUID()}-${safeName}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await admin.storage.from(BUCKET).upload(objectPath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(objectPath)

      const { data: attachment, error: attachmentError } = await admin
        .from("support_attachments")
        .insert({
          ticket_id: ticketId,
          message_id: message.id,
          storage_bucket: BUCKET,
          storage_path: objectPath,
          public_url: publicUrlData.publicUrl,
          mime_type: file.type,
          size_bytes: file.size,
        })
        .select("*")
        .single()

      if (attachmentError) {
        return NextResponse.json({ error: attachmentError.message }, { status: 500 })
      }

      attachments.push(attachment)
    }

    await admin.from("support_tickets").update({ last_message_at: new Date().toISOString() }).eq("id", ticketId)

    return NextResponse.json({ message: { ...message, attachments } }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN"
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
