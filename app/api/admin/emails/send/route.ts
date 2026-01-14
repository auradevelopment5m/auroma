import { NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { requireAdmin } from "@/lib/support/server-auth"

const sendSchema = z.object({
  subject: z.string().min(1).max(140),
  html: z.string().min(1).max(200_000),
  // optional overrides
  from: z.string().email().optional(),
  testTo: z.string().email().optional(),
})

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY_MISSING")
  }
  return new Resend(apiKey)
}

export async function POST(req: Request) {
  try {
    const { admin } = await requireAdmin()

    const json = await req.json().catch(() => null)
    const parsed = sendSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const resend = getResendClient()

    const from =
      parsed.data.from ||
      process.env.RESEND_FROM ||
      process.env.RESEND_FROM_EMAIL ||
      "onboarding@resend.dev"

    // If testTo is set, only send to that one address.
    let emails: string[] = []

    if (parsed.data.testTo) {
      emails = [parsed.data.testTo]
    } else {
      const { data, error } = await admin
        .from("email_subscribers")
        .select("email")
        .eq("is_active", true)
        .order("subscribed_at", { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      emails = (data ?? []).map((r: any) => String(r.email || "").trim()).filter(Boolean)
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: "No recipients" }, { status: 400 })
    }

    // Send in small batches to avoid provider throttling
    const BATCH_SIZE = 25
    let sent = 0
    let failed = 0

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)

      const results = await Promise.allSettled(
        batch.map((to: string) =>
          resend.emails.send({
            from,
            to,
            subject: parsed.data.subject,
            html: parsed.data.html,
          }),
        ),
      )

      for (const r of results) {
        if (r.status === "fulfilled") sent += 1
        else failed += 1
      }
    }

    return NextResponse.json({ ok: true, sent, failed, recipients: emails.length })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN"
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (message === "RESEND_API_KEY_MISSING") {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
