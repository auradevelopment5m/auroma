import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/support/server-auth"

export async function GET() {
  try {
    const { admin } = await requireAdmin()

    const { data, error } = await admin
      .from("support_tickets")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(200)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ tickets: data ?? [] })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN"
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
