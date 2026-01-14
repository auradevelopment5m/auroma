"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { stripMarkdownToText } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, setIsOpen } = useCartStore()

  const primaryImage = product.image_url || product.images?.[0] || "/aromatherapy-product.jpg"

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: primaryImage,
    })
    toast.success(`${product.name} added to cart`)
    setIsOpen(true)
  }

  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : null

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary mb-4">
        <Image
          src={primaryImage || "/placeholder.svg?height=400&width=400&query=aromatherapy product"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && <Badge className="bg-destructive text-destructive-foreground">-{discount}%</Badge>}
          {!product.in_stock && <Badge variant="secondary">Out of Stock</Badge>}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full shadow-lg"
            onClick={(e) => {
              e.preventDefault()
              toast.info("Wishlist coming soon!")
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <Button className="w-full shadow-lg" onClick={handleAddToCart} disabled={!product.in_stock}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
          {stripMarkdownToText(product.description || "")}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {product.sale_price ? (
            <>
              <span className="font-semibold text-lg text-green-600">${product.sale_price.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="font-semibold text-lg">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
