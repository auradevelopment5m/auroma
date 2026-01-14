"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreatorCode {
  id: string
  code: string
  discount_percent: number
  creator_name: string
  is_active: boolean
  created_at: string
}

interface UsageStats {
  uses: number
  totalDiscount: number
  totalRevenue: number
}

interface CreatorCodesManagerProps {
  codes: CreatorCode[]
  usageStats: Record<string, UsageStats>
}

export function CreatorCodesManager({ codes: initialCodes, usageStats }: CreatorCodesManagerProps) {
  const [codes, setCodes] = useState(initialCodes)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<CreatorCode | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    discount_percent: 10,
    creator_name: "",
    is_active: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const resetForm = () => {
    setFormData({ code: "", discount_percent: 10, creator_name: "", is_active: true })
    setEditingCode(null)
  }

  const handleOpenDialog = (code?: CreatorCode) => {
    if (code) {
      setEditingCode(code)
      setFormData({
        code: code.code,
        discount_percent: code.discount_percent,
        creator_name: code.creator_name,
        is_active: code.is_active,
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()

    if (editingCode) {
      const { data } = await supabase.from("creator_codes").update(formData).eq("id", editingCode.id).select().single()

      if (data) {
        setCodes(codes.map((c) => (c.id === editingCode.id ? data : c)))
      }
    } else {
      const { data } = await supabase.from("creator_codes").insert(formData).select().single()

      if (data) {
        setCodes([data, ...codes])
      }
    }

    setIsLoading(false)
    setIsDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this code?")) return

    const supabase = createBrowserSupabaseClient()
    await supabase.from("creator_codes").delete().eq("id", id)
    setCodes(codes.filter((c) => c.id !== id))
    router.refresh()
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const supabase = createBrowserSupabaseClient()
    await supabase.from("creator_codes").update({ is_active: isActive }).eq("id", id)
    setCodes(codes.map((c) => (c.id === id ? { ...c, is_active: isActive } : c)))
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Creator Code
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingCode ? "Edit Creator Code" : "Add Creator Code"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code" className="text-foreground">
                  Code
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., JOHN20"
                  required
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="creator_name" className="text-foreground">
                  Creator Name
                </Label>
                <Input
                  id="creator_name"
                  value={formData.creator_name}
                  onChange={(e) => setFormData({ ...formData, creator_name: e.target.value })}
                  placeholder="e.g., John Doe"
                  required
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="discount_percent" className="text-foreground">
                  Discount Percentage
                </Label>
                <Input
                  id="discount_percent"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: Number(e.target.value) })}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active" className="text-foreground">
                  Active
                </Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? "Saving..." : editingCode ? "Update Code" : "Create Code"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {codes.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No creator codes yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Code</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Creator</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Discount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Uses</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => {
                const stats = usageStats[code.id] || { uses: 0, totalDiscount: 0, totalRevenue: 0 }
                return (
                  <tr key={code.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-medium text-primary">{code.code}</span>
                    </td>
                    <td className="py-4 px-4 text-foreground">{code.creator_name}</td>
                    <td className="py-4 px-4 text-foreground">{code.discount_percent}%</td>
                    <td className="py-4 px-4 text-foreground">{stats.uses}</td>
                    <td className="py-4 px-4 text-foreground">${stats.totalRevenue.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <Switch checked={code.is_active} onCheckedChange={(checked) => toggleActive(code.id, checked)} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(code)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(code.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
