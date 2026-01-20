import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toasters } from "@/components/toasters"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Toasters />
        <Analytics />
      </body>
    </html>
  )
}
