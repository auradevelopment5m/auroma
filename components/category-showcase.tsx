import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import type { Category } from "@/lib/types"

interface CategoryShowcaseProps {
  categories: Category[]
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section className="py-20 lg:py-32 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">
              Explore our curated collections designed for every aspect of your aromatherapy journey.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <ScrollReveal key={category.id} delay={index * 100}>
              <Link
                href={`/products?category=${category.slug}`}
                className="group relative block aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <Image
                  src={category.image_url || "/placeholder.svg?height=600&width=480&query=aromatherapy products"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-auroma-dark/90 via-auroma-dark/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-2">{category.name}</h3>
                  <p className="text-foreground/80 text-sm mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <span>Shop Now</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
