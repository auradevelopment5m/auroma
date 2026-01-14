"use client"

import { useState } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Phone, MapPin, FileText, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Order {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string
  address: string
  notes: string | null
  status: string
  subtotal: number
  discount: number
  store_credit_used: number
  total: number
  points_earned: number
  creator_code_used: string | null
  created_at: string
  order_items: Array<{
    id: string
    quantity: number
    price: number
    products: {
      name: string
      image_url: string
    }
  }>
}

interface OrdersTableProps {
  orders: Order[]
}

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"]

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order? This cannot be undone.")) return;
    setIsDeleting(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Failed to delete order");
      }
      setOrders(orders.filter((o) => o.id !== orderId));
      toast.success("Order deleted");
      setSelectedOrder(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete order";
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || "Failed to update status")
      }

      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      toast.success(`Order marked as ${newStatus}`)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update status"
      toast.error(message)
    } finally {
      setIsUpdating(null)
    }
  }

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

  if (orders.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">No orders yet</p>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Phone</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-4 px-4">
                  <span className="font-mono text-sm text-foreground">#{order.id.slice(0, 8)}</span>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {order.first_name} {order.last_name}
                    </p>
                    {order.email && <p className="text-sm text-muted-foreground">{order.email}</p>}
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground">{order.phone}</td>
                <td className="py-4 px-4 font-medium text-foreground">${Number(order.total).toFixed(2)}</td>
                <td className="py-4 px-4">
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateStatus(order.id, value)}
                    disabled={isUpdating === order.id}
                  >
                    <SelectTrigger className={`w-32 h-8 text-xs ${getStatusColor(order.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-4 px-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="py-4 px-4 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteOrder(order.id)}
                    disabled={isDeleting === order.id}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Order #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer</h4>
                  <p className="font-medium text-foreground">
                    {selectedOrder.first_name} {selectedOrder.last_name}
                  </p>
                  {selectedOrder.email && <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>}
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone
                  </h4>
                  <p className="font-medium text-foreground">{selectedOrder.phone}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Delivery Address
                </h4>
                <p className="text-foreground">{selectedOrder.address}</p>
              </div>

              {selectedOrder.notes && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notes
                  </h4>
                  <p className="text-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <img
                        src={item.products.image_url || "/placeholder.svg?height=60&width=60&query=product"}
                        alt={item.products.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.products.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-foreground">${Number(item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Discount {selectedOrder.creator_code_used && `(${selectedOrder.creator_code_used})`}
                    </span>
                    <span className="text-green-400">-${Number(selectedOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.store_credit_used > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Store Credit</span>
                    <span className="text-green-400">-${Number(selectedOrder.store_credit_used).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-primary">
                  <span>Points (awarded after delivery)</span>
                  <span>+{selectedOrder.points_earned} pts</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
