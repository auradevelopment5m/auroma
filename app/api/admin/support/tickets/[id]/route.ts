import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/support/server-auth"

const updateSchema = z
  .object({
    status: z.enum(["open", "pending", "closed"]).optional(),
    label: z.string().min(1).max(40).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No updates" })

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { admin } = await requireAdmin()
    const { id } = await context.params

    const json = await req.json().catch(() => null)
    const parsed = updateSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

    const { error } = await admin.from("support_tickets").update(parsed.data).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN"
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { admin } = await requireAdmin()
    const { id } = await context.params

    const { data: attachments } = await admin
      .from("support_attachments")
      .select("storage_bucket,storage_path")
      .eq("ticket_id", id)

    const byBucket = new Map<string, string[]>()
    for (const att of attachments ?? []) {
      const list = byBucket.get(att.storage_bucket) ?? []
      list.push(att.storage_path)
      byBucket.set(att.storage_bucket, list)
    }

    for (const [bucket, paths] of byBucket) {
      if (paths.length) {
        await admin.storage.from(bucket).remove(paths)
      }
    }

    const { error } = await admin.from("support_tickets").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN"
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
