"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Heart, Check, Truck, Shield, RotateCcw, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore, calculatePointsEarned } from "@/lib/cart-store"
import { toast } from "sonner"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Markdown } from "@/components/markdown"
import type { Product, Category } from "@/lib/types"

interface ProductDetailProps {
  product: Product & { category: Category | null }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addItem, setIsOpen } = useCartStore()

  const images = Array.from(
    new Set([product.image_url ?? "", ...(product.images ?? [])].filter((v): v is string => typeof v === "string" && v.length > 0)),
  )
  const pointsEarned = calculatePointsEarned((product.sale_price || product.price) * quantity)
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        image: images[0] || "/aromatherapy-product.jpg",
      })
    }
    toast.success(`${quantity} x ${product.name} added to cart`)
    setIsOpen(true)
  }

  return (
    <section className="py-8 lg:py-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <ScrollReveal>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <ScrollReveal>
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
                <Image
                  src={images[selectedImage] || "/placeholder.svg?height=600&width=600&query=aromatherapy product"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {discount && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square w-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Product Info */}
          <ScrollReveal delay={100}>
            <div className="space-y-6">
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  {product.category.name}
                </Link>
              )}

              <h1 className="font-serif text-3xl lg:text-4xl font-bold">{product.name}</h1>

              <div className="flex items-baseline gap-3">
                {product.sale_price ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">${product.sale_price.toFixed(2)}</span>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {discount}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                )}
              </div>

              {/* Points Preview */}
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <span className="text-sm text-primary font-medium">Earn Auroma Points (awarded after delivery):</span>
                <span className="text-primary font-bold">+{pointsEarned} pts</span>
                <span className="text-xs text-muted-foreground">(with account)</span>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-secondary transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-3 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-secondary transition-colors"
                  >
                    +
                  </button>
                </div>

                <Button
                  size="lg"
                  className="flex-1 text-lg py-6"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {product.in_stock ? "Add to Cart" : "Out of Stock"}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="py-6 bg-transparent"
                  onClick={() => toast.info("Wishlist coming soon!")}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Stock Status */}
              {product.in_stock ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">In Stock</span>
                  {product.stock_quantity <= 10 && (
                    <span className="text-sm text-muted-foreground">(Only {product.stock_quantity} left!)</span>
                  )}
                </div>
              ) : (
                <div className="text-destructive font-medium">Currently Out of Stock</div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Free Delivery</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Easy Returns</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Product Details */}
        <ScrollReveal>
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Description</h2>
            {product.description ? (
              <Markdown className="space-y-4" content={product.description} />
            ) : (
              <p className="text-muted-foreground">No description provided for this product.</p>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
