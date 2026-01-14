import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const subscribeSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = subscribeSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()

  const supabase = await createClient()
  const { error } = await supabase.from("email_subscribers").insert({ email })

  if (error) {
    // Unique constraint violation (already subscribed)
    if (error.code === "23505") {
      return NextResponse.json({ status: "already_subscribed" }, { status: 409 })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: "subscribed" }, { status: 200 })
}
