import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toasters } from "@/components/toasters"
import "./globals.css"

export const metadata: Metadata = {
  title: "Markano - Online Learning Platform",
  description: "Master new skills with Markano. Learn web development, programming, and design from industry experts.",
  generator: "v0.app",
  keywords: ["online learning", "web development", "programming courses", "coding education", "hybrid learning"],
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#2596be",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="min-h-full">
      <body className="font-sans antialiased min-h-full min-h-dvh">
        {children}
        <Toasters />
        <Analytics />
      </body>
    </html>
  )
}
