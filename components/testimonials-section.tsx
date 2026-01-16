"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/scroll-reveal"

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "Beirut",
    image: "/placeholdercontact.png",
    rating: 5,
    text: "The Auroma Flame FX-Luxe has completely transformed my bedroom. I fall asleep faster and wake up feeling refreshed. The quality is exceptional!",
    product: "Auroma Flame FX-Luxe",
  },
  {
    id: 2,
    name: "Ahmad K.",
    location: "Tripoli",
    image: "/placeholdercontact.png",
    rating: 5,
    text: "I was skeptical about car diffusers, but the FX-Pine changed my mind. My commute is now my favorite part of the day. Highly recommend!",
    product: "Auroma Flame FX-Pine",
  },
  {
    id: 3,
    name: "Maya R.",
    location: "Jounieh",
    image: "/placeholdercontact.png",
    rating: 5,
    text: "The Lavender Dreams oil is simply divine. It's become an essential part of my evening routine. Pure, natural, and incredibly soothing.",
    product: "Lavender Dreams",
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((c) => (c + 1) % testimonials.length)
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 lg:py-32 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of satisfied customers who have transformed their spaces with Auroma.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-background rounded-2xl p-8 lg:p-12 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-20 w-20 rounded-full overflow-hidden mb-6">
                <Image
                  src={testimonials[current].image || "/placeholder.svg"}
                  alt={testimonials[current].name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              <blockquote className="text-lg lg:text-xl text-foreground mb-6 max-w-2xl leading-relaxed">
                "{testimonials[current].text}"
              </blockquote>

              <div>
                <p className="font-semibold">{testimonials[current].name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonials[current].location} • {testimonials[current].product}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="outline" size="icon" onClick={prev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <Button variant="outline" size="icon" onClick={next}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
