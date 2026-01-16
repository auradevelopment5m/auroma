import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { SupportChatWidget } from "@/components/support-chat-widget"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "Auroma | Premium Diffusers & Essential Oils",
  description:
    "Transform your space with Auroma's premium diffusers and therapeutic essential oils. Home diffusers, car diffusers, and pure essential oil blends for wellness and relaxation.",
  keywords: ["diffuser", "essential oils", "aromatherapy", "home fragrance", "car diffuser", "wellness"],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <SupportChatWidget />
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
