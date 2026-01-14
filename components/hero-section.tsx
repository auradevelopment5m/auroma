"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-auroma-dark">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/luxury-aromatherapy-diffuser-with-mist-soft-lighti.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-auroma-dark/70 via-auroma-dark/50 to-auroma-dark/90" />
      </div>

      {/* Animated Mist Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-auroma-blue/20 blur-3xl animate-mist ${
            mounted ? "opacity-100" : "opacity-0"
          } transition-opacity duration-1000`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-auroma-deep/20 blur-3xl animate-mist ${
            mounted ? "opacity-100" : "opacity-0"
          } transition-opacity duration-1000 delay-500`}
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <div className={`max-w-4xl mx-auto ${mounted ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm text-foreground/90 text-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Premium Aromatherapy Experience</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 text-balance">
            Transform Your Space with <span className="text-primary">Pure Essence</span>
          </h1>

          <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed text-pretty">
            Discover our collection of premium diffusers and therapeutic essential oils, crafted to elevate your home,
            car, and lifestyle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6 animate-pulse-glow">
              <Link href="/products">
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-primary/10 border-border text-foreground hover:bg-primary/15"
            >
              <Link href="/about">Our Story</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-12 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-8 text-foreground/60 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">5000+</span>
                <span>Happy Customers</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">100%</span>
                <span>Pure Essential Oils</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">COD</span>
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/40 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-primary/60" />
        </div>
      </div>
    </section>
  )
}
