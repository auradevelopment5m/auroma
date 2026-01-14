import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, Ticket } from "lucide-react"
import Link from "next/link"

async function getStats() {
  const supabase = await createServerSupabaseClient()

  // Get total revenue
  const { data: orders } = await supabase.from("orders").select("total")
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  // Get order counts
  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Get customer count
  const { count: totalCustomers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Get email subscribers
  const { count: emailSubscribers } = await supabase
    .from("email_subscribers")
    .select("*", { count: "exact", head: true })

  // Get creator code usage
  const { count: codeUsage } = await supabase.from("creator_code_usage").select("*", { count: "exact", head: true })

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*, profiles(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    totalRevenue,
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    totalCustomers: totalCustomers || 0,
    emailSubscribers: emailSubscribers || 0,
    codeUsage: codeUsage || 0,
    recentOrders: recentOrders || [],
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Package,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Email Subscribers",
      value: stats.emailSubscribers,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Creator Code Uses",
      value: stats.codeUsage,
      icon: Ticket,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400"
      case "processing":
        return "bg-blue-500/20 text-blue-400"
      case "shipped":
        return "bg-purple-500/20 text-purple-400"
      case "delivered":
        return "bg-green-500/20 text-green-400"
      case "cancelled":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Auroma admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {order.first_name} {order.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="font-medium text-foreground">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
