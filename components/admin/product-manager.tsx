"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  sale_price?: number | null
  image_url: string | null
  images?: string[]
  colors?: string[]
  category_id: string | null
  in_stock: boolean
  featured: boolean
  categories: { name: string }
}

interface Category {
  id: string
  name: string
}

interface ProductManagerProps {
  products: Product[]
  categories: Category[]
}

export function ProductManager({ products: initialProducts, categories }: ProductManagerProps) {
  const [products, setProducts] = useState(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    sale_price: null as number | null,
    image_url: "",
    images: [] as string[],
    colors: [] as string[],
    category_id: "" as string | null,
    in_stock: true,
    featured: false,
  })
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [colorInput, setColorInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 0,
      sale_price: null,
      image_url: "",
      images: [],
      colors: [],
      category_id: categories[0]?.id || null,
      in_stock: true,
      featured: false,
    })
    setMainImageFile(null)
    setGalleryFiles([])
    setColorInput("")
    setEditingProduct(null)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        sale_price: product.sale_price || null,
        image_url: product.image_url || "",
        images: Array.from(new Set(product.images || [])),
        colors: Array.from(new Set(product.colors || [])),
        category_id: product.category_id,
        in_stock: product.in_stock,
        featured: product.featured,
      })
      setMainImageFile(null)
      setGalleryFiles([])
      setColorInput("")
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: editingProduct ? formData.slug : generateSlug(name),
    })
  }

  const uploadImages = async (files: File[]) => {
    const fd = new FormData()
    for (const f of files) fd.append("files", f)
    if (editingProduct?.id) fd.set("productId", editingProduct.id)
    if (formData.slug) fd.set("slug", formData.slug)

    const res = await fetch("/api/admin/uploads/product-images", {
      method: "POST",
      body: fd,
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(json?.error || "Upload failed")
    }

    return (json?.urls as string[]) || []
  }

  const normalizeColor = (value: string) => value.trim().replace(/\s+/g, " ")

  const addColor = (value: string) => {
    const c = normalizeColor(value)
    if (!c) return
    const next = Array.from(new Set([...(formData.colors || []), c]))
    setFormData({ ...formData, colors: next })
    setColorInput("")
  }

  const removeAtIndex = <T,>(arr: T[], index: number) => arr.filter((_, i) => i !== index)

  const moveIndex = <T,>(arr: T[], from: number, to: number) => {
    if (to < 0 || to >= arr.length) return arr
    const copy = [...arr]
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    return copy
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()

    try {
      let uploadedMainUrl: string | null = null
      if (mainImageFile) {
        const urls = await uploadImages([mainImageFile])
        uploadedMainUrl = urls[0] || null
      }

      let uploadedGalleryUrls: string[] = []
      if (galleryFiles.length > 0) {
        uploadedGalleryUrls = await uploadImages(galleryFiles)
      }

      const payload = {
        ...formData,
        image_url: (uploadedMainUrl ?? formData.image_url).trim() || null,
        images: Array.from(new Set([...(formData.images || []), ...uploadedGalleryUrls])).filter(Boolean),
        colors: Array.from(new Set([...(formData.colors || [])])).filter(Boolean),
        category_id: formData.category_id || null,
      }

      if (editingProduct) {
        const { data, error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id)
          .select("*, categories(name)")
          .single()

        if (error) throw new Error(error.message)

        if (data) {
          setProducts(products.map((p) => (p.id === editingProduct.id ? data : p)))
        }
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("*, categories(name)")
          .single()

        if (error) throw new Error(error.message)

        if (data) {
          setProducts([data, ...products])
        }
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      alert(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const supabase = createBrowserSupabaseClient()
    await supabase.from("products").delete().eq("id", id)
    setProducts(products.filter((p) => p.id !== id))
    router.refresh()
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="slug" className="text-foreground">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-foreground">
                  Description
                </Label>
                <p className="text-xs text-muted-foreground mt-1">Supports Markdown (e.g. # Heading, ## Subheading, lists).</p>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="text-foreground">
                    Original Price ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="sale_price" className="text-foreground">
                    Sale Price ($) <span className="text-sm text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sale_price || ""}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value ? Number(e.target.value) : null })}
                    className="bg-background border-border"
                  />
                  {formData.sale_price && formData.price > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      {Math.round(((formData.price - formData.sale_price) / formData.price) * 100)}% off
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category" className="text-foreground">
                    Category
                  </Label>
                  <Select
                    value={formData.category_id ?? ""}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <div className="mt-3 grid gap-3">
                  <div>
                    <Label htmlFor="main_image" className="text-foreground">
                      Main Image
                    </Label>
                    {formData.image_url ? (
                      <div className="mt-2 flex items-center gap-2">
                        <a
                          href={formData.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline"
                        >
                          view current
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({ ...formData, image_url: "" })}
                        >
                          Clear
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">No main image set.</p>
                    )}
                    <Input
                      id="main_image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setMainImageFile(e.target.files?.[0] ?? null)}
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploading happens when you save.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="colors" className="text-foreground">
                      Available Colors
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Type a color and press Enter (e.g. Lavender, Rose, Black).</p>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="colors"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addColor(colorInput)
                          }
                        }}
                        placeholder="Add a color"
                        className="bg-background border-border"
                      />
                      <Button type="button" variant="secondary" onClick={() => addColor(colorInput)}>
                        Add
                      </Button>
                    </div>

                    {formData.colors?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.colors.map((c) => (
                          <Badge key={c} variant="secondary" className="flex items-center gap-2">
                            {c}
                            <button
                              type="button"
                              className="text-xs opacity-70 hover:opacity-100"
                              onClick={() => setFormData({ ...formData, colors: (formData.colors || []).filter((x) => x !== c) })}
                              aria-label={`Remove ${c}`}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gallery_images" className="text-foreground">
                      Upload Gallery Images (optional)
                    </Label>
                    <Input
                      id="gallery_images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
                      className="bg-background border-border"
                    />
                  </div>

                  {formData.images?.length > 0 && (
                    <div>
                      <p className="text-sm text-foreground mb-2">Gallery ({formData.images.length})</p>
                      <div className="grid gap-2">
                        {formData.images.map((url, index) => (
                          <div
                            key={`${url}::${index}`}
                            className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-2"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={url} alt="" className="h-12 w-12 rounded-md object-cover border border-border" />
                              <div className="min-w-0">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary underline break-all"
                                >
                                  {url}
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    image_url: url,
                                    images: removeAtIndex(formData.images || [], index),
                                  })
                                }}
                              >
                                Set as main
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={index === 0}
                                onClick={() => setFormData({ ...formData, images: moveIndex(formData.images || [], index, index - 1) })}
                              >
                                Up
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={index === (formData.images?.length || 0) - 1}
                                onClick={() => setFormData({ ...formData, images: moveIndex(formData.images || [], index, index + 1) })}
                              >
                                Down
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setFormData({ ...formData, images: removeAtIndex(formData.images || [], index) })}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="in_stock" className="text-foreground">
                  In Stock
                </Label>
                <Switch
                  id="in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="text-foreground">
                  Featured
                </Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No products yet</p>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <img
                src={product.image_url || product.images?.[0] || "/placeholder.svg?height=80&width=80&query=product"}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground">{product.name}</h3>
                  {product.featured && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">Featured</span>
                  )}
                  {!product.in_stock && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">Out of Stock</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{product.categories?.name}</p>
              </div>
              <div className="text-right">
                {product.sale_price ? (
                  <div>
                    <p className="font-medium text-green-600">${product.sale_price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-green-600">
                      {Math.round(((product.price - product.sale_price) / product.price) * 100)}% off
                    </p>
                  </div>
                ) : (
                  <p className="font-medium text-foreground">${product.price.toFixed(2)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(product)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
