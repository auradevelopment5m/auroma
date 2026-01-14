"use client"

import { ProductCard } from "@/components/product-card"
import { ScrollReveal } from "@/components/scroll-reveal"
import type { Product } from "@/lib/types"
import { PackageOpen } from "lucide-react"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <PackageOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-2">No products found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ScrollReveal key={product.id} delay={index * 50}>
          <ProductCard product={product} />
        </ScrollReveal>
      ))}
    </div>
  )
}
