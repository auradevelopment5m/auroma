import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersTable } from "@/components/admin/orders-table"

async function getOrders() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_url))")
    .order("created_at", { ascending: false })
  return data || []
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage and track all customer orders</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  )
}
