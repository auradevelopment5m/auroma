import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


export async function DELETE(request: Request, context: { params: any }) {
  const supabase = await createServerSupabaseClient();
  let id = context?.params?.id;

  // Fallback: try to extract id from URL if not present
  if (!id && request.url) {
    try {
      const url = new URL(request.url);
      const parts = url.pathname.split("/");
      id = parts[parts.length - 1] || parts[parts.length - 2];
    } catch {}
  }

  // Log for debugging
  console.log("Order DELETE: id=", id, "params=", context?.params, "url=", request.url);

  // Validate id is present and a valid UUID
  if (!id || typeof id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json({ error: "Invalid or missing order ID." }, { status: 400 });
  }

  // Delete order items first (to satisfy FK constraint)
  const { error: orderItemsError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", id);

  if (orderItemsError) {
    return NextResponse.json({ error: orderItemsError.message }, { status: 500 });
  }

  // Delete the order itself
  const { error: orderError } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
