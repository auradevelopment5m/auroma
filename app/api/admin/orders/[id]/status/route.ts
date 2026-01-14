import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/support/server-auth"

const bodySchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
})

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { admin } = await requireAdmin()
    const { id } = await ctx.params

    const json = await req.json().catch(() => null)
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const newStatus = parsed.data.status

    const { error: updateError } = await admin.from("orders").update({ status: newStatus }).eq("id", id)
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Award points only when delivered, and only once.
    if (newStatus === "delivered") {
      const { data: order, error: orderError } = await admin
        .from("orders")
        .select("id,user_id,points_earned")
        .eq("id", id)
        .single()

      if (orderError) {
        return NextResponse.json({ error: orderError.message }, { status: 500 })
      }

      if (order?.user_id && (order.points_earned || 0) > 0) {
        // Idempotency: if we've already created an earned transaction for this order, do nothing.
        const { data: existing } = await admin
          .from("points_transactions")
          .select("id")
          .eq("order_id", id)
          .eq("type", "earned")
          .limit(1)

        if (!existing || existing.length === 0) {
          const pointsToAward = Number(order.points_earned) || 0

          const { data: profile, error: profileError } = await admin
            .from("profiles")
            .select("points")
            .eq("id", order.user_id)
            .single()

          if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 500 })
          }

          const { error: txError } = await admin.from("points_transactions").insert({
            user_id: order.user_id,
            order_id: id,
            points: pointsToAward,
            type: "earned",
            description: `Awarded after delivery for order #${String(id).slice(0, 8)}`,
          })

          if (txError) {
            return NextResponse.json({ error: txError.message }, { status: 500 })
          }

          const currentPoints = Number(profile?.points || 0)
          const { error: pointsError } = await admin
            .from("profiles")
            .update({ points: currentPoints + pointsToAward })
            .eq("id", order.user_id)

          if (pointsError) {
            return NextResponse.json({ error: pointsError.message }, { status: 500 })
          }
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN"
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
